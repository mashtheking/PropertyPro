import { Request, Response } from 'express';
import { storage } from '../storage';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import { insertUserSchema, loginSchema } from '@shared/schema';
import { SessionData } from 'express-session';
import crypto from 'crypto';
import { z } from 'zod';

// Extend the session type to include userId
declare module 'express-session' {
  interface SessionData {
    userId?: number;
  }
}

// Password reset schemas
const forgotPasswordSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
});

const resetPasswordSchema = z.object({
  token: z.string(),
  userId: z.string(),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || 'https://ewmjparrdpjurafbkklb.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3bWpwYXJyZHBqdXJhZmJra2xiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI3MDkxNDQsImV4cCI6MjA1ODI4NTE0NH0.fEDsOQkjwOQUoFJRGClWrIra40MbNygpDu37xGZJMz4';
const supabase = createClient(supabaseUrl, supabaseKey);

export const authController = {
  register: async (req: Request, res: Response) => {
    try {
      // Validate request body
      const validationResult = insertUserSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ message: 'Invalid request data', errors: validationResult.error.errors });
      }

      const { email, username, password, fullName, confirmPassword } = validationResult.data;

      // Check if passwords match
      if (password !== confirmPassword) {
        return res.status(400).json({ message: "Passwords don't match" });
      }

      // Check if user already exists
      const existingUserByEmail = await storage.getUserByEmail(email);
      if (existingUserByEmail) {
        return res.status(400).json({ message: 'Email already in use' });
      }

      const existingUserByUsername = await storage.getUserByUsername(username);
      if (existingUserByUsername) {
        return res.status(400).json({ message: 'Username already in use' });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            fullName,
          },
          // Email redirect URL should be set via environment variables in production
          emailRedirectTo: `${req.protocol}://${req.get('host')}`
        }
      });

      if (authError) {
        console.error('Supabase auth error:', authError);
        return res.status(500).json({ message: 'Authentication service error', error: authError.message });
      }

      // Create user in our database
      const user = await storage.createUser({
        email,
        username,
        password: hashedPassword, // Store hashed password
        fullName,
        confirmPassword, // Including for schema validation, though actual password is already hashed
        emailVerified: false, // Default to false, verify email later
      });

      res.status(201).json({
        message: 'User registered successfully',
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          fullName: user.fullName,
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  },

  login: async (req: Request, res: Response) => {
    try {
      // Validate request body
      const validationResult = loginSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ message: 'Invalid request data', errors: validationResult.error.errors });
      }

      const { email, password, rememberMe } = validationResult.data;

      // Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        console.error('Supabase auth error:', authError);
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Get user from our database
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }

      // Set session
      if (req.session) {
        req.session.userId = user.id;
        
        // Set cookie expiration based on rememberMe
        if (rememberMe) {
          req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
        } else {
          req.session.cookie.maxAge = 24 * 60 * 60 * 1000; // 1 day
        }
      }

      res.status(200).json({
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          fullName: user.fullName,
          isPremium: user.isPremium,
          rewardUnits: user.rewardUnits,
          subscriptionStatus: user.subscriptionStatus,
          subscriptionId: user.subscriptionId,
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  },

  logout: async (req: Request, res: Response) => {
    try {
      // Sign out from Supabase Auth
      const { error: authError } = await supabase.auth.signOut();
      if (authError) {
        console.error('Supabase auth error:', authError);
      }

      // Clear session
      if (req.session) {
        req.session.destroy((err) => {
          if (err) {
            console.error('Session destruction error:', err);
            return res.status(500).json({ message: 'Error logging out' });
          }
        });
      }

      res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  },

  getSession: async (req: Request, res: Response) => {
    try {
      // Check if user is authenticated in session
      if (!req.session || !req.session.userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      // Get user from database
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        // Clear invalid session
        req.session.destroy((err) => {
          if (err) console.error('Session destruction error:', err);
        });
        return res.status(401).json({ message: 'User not found' });
      }

      res.status(200).json({
        authenticated: true,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          fullName: user.fullName,
          isPremium: user.isPremium,
          rewardUnits: user.rewardUnits,
          subscriptionStatus: user.subscriptionStatus,
          subscriptionId: user.subscriptionId,
        }
      });
    } catch (error) {
      console.error('Session check error:', error);
      res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  },

  getProfile: async (req: Request, res: Response) => {
    try {
      // User is already authenticated via middleware
      const userId = req.user.id;

      // Get user from database
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.status(200).json({
        id: user.id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        profileImage: user.profileImage,
        isPremium: user.isPremium,
        rewardUnits: user.rewardUnits,
        emailVerified: user.emailVerified,
        subscriptionStatus: user.subscriptionStatus,
        subscriptionId: user.subscriptionId,
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  },

  updateProfile: async (req: Request, res: Response) => {
    try {
      // User is already authenticated via middleware
      const userId = req.user.id;

      // Validate request body
      const { fullName, email, username } = req.body;
      if (!fullName || !email || !username) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      // Check if email or username is already taken by another user
      if (email !== req.user.email) {
        const existingUserByEmail = await storage.getUserByEmail(email);
        if (existingUserByEmail && existingUserByEmail.id !== userId) {
          return res.status(400).json({ message: 'Email already in use' });
        }
      }

      if (username !== req.user.username) {
        const existingUserByUsername = await storage.getUserByUsername(username);
        if (existingUserByUsername && existingUserByUsername.id !== userId) {
          return res.status(400).json({ message: 'Username already in use' });
        }
      }

      // Update user in database
      const updatedUser = await storage.updateUser(userId, {
        fullName,
        email,
        username,
      });

      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.status(200).json({
        message: 'Profile updated successfully',
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          username: updatedUser.username,
          fullName: updatedUser.fullName,
          profileImage: updatedUser.profileImage,
          isPremium: updatedUser.isPremium,
          rewardUnits: updatedUser.rewardUnits,
          emailVerified: updatedUser.emailVerified,
          subscriptionStatus: updatedUser.subscriptionStatus,
          subscriptionId: updatedUser.subscriptionId,
        }
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  },

  resendVerification: async (req: Request, res: Response) => {
    try {
      // User should be authenticated to request verification email resend
      if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ message: 'Email is required' });
      }
      
      // Check if the email belongs to the authenticated user
      if (email !== req.user.email) {
        return res.status(403).json({ message: 'Unauthorized' });
      }
      
      // Send verification email through Supabase
      const { error: authError } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${req.protocol}://${req.get('host')}`
        }
      });
      
      if (authError) {
        console.error('Supabase auth error:', authError);
        return res.status(500).json({ message: 'Error sending verification email', error: authError.message });
      }
      
      return res.status(200).json({ message: 'Verification email sent successfully' });
    } catch (error) {
      console.error('Verification email error:', error);
      res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  },
  
  verifyEmail: async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const id = parseInt(userId, 10);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }
      
      // Update the user's emailVerified status
      const updatedUser = await storage.updateUser(id, {
        emailVerified: true
      });
      
      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      return res.status(200).json({ message: 'Email verified successfully' });
    } catch (error) {
      console.error('Email verification error:', error);
      res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  },
  
  changePassword: async (req: Request, res: Response) => {
    try {
      // User is already authenticated via middleware
      const userId = req.user.id;

      // Validate request body
      const { currentPassword, newPassword, confirmPassword } = req.body;
      if (!currentPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      if (newPassword !== confirmPassword) {
        return res.status(400).json({ message: "Passwords don't match" });
      }

      // Get user from database
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Verify current password
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Update password in database
      const updatedUser = await storage.updateUser(userId, {
        password: hashedPassword,
      });

      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Update password in Supabase Auth
      const { error: authError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (authError) {
        console.error('Supabase auth error:', authError);
        // Continue anyway since our database update was successful
      }

      res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  },

  forgotPassword: async (req: Request, res: Response) => {
    try {
      // Validate request data
      const validationResult = forgotPasswordSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: 'Invalid request data', 
          errors: validationResult.error.errors 
        });
      }

      const { email } = validationResult.data;

      // Check if user exists
      const user = await storage.getUserByEmail(email);
      if (!user) {
        // For security reasons, we'll still return a success message even if the user doesn't exist
        return res.status(200).json({ 
          message: 'If a user with that email exists, a password reset link has been sent.' 
        });
      }

      // Generate a reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      
      // Store the token and expiration in the user's record
      // Token expires in 30 minutes (1800 seconds)
      const tokenExpires = new Date(Date.now() + 1800000);
      
      await storage.updateUser(user.id, {
        resetToken,
        resetTokenExpires: tokenExpires,
      });

      // Send password reset email through Supabase
      const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${req.protocol}://${req.get('host')}/reset-password?token=${resetToken}&id=${user.id}`,
      });

      if (authError) {
        console.error('Supabase auth error:', authError);
        return res.status(500).json({ 
          message: 'Error sending password reset email', 
          error: authError.message 
        });
      }

      res.status(200).json({ 
        message: 'Password reset link has been sent to your email address' 
      });
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({ 
        message: 'Server error', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  },

  resetPassword: async (req: Request, res: Response) => {
    try {
      // Validate request data
      const validationResult = resetPasswordSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: 'Invalid request data', 
          errors: validationResult.error.errors 
        });
      }

      const { token, userId, password } = validationResult.data;
      const id = parseInt(userId, 10);

      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }

      // Find the user
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Verify token and check if it's expired
      if (!user.resetToken || user.resetToken !== token) {
        return res.status(400).json({ message: 'Invalid or expired reset token' });
      }

      if (!user.resetTokenExpires || new Date() > new Date(user.resetTokenExpires)) {
        return res.status(400).json({ message: 'Reset token has expired' });
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Update password and clear reset token
      const updatedUser = await storage.updateUser(id, {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpires: null,
      });

      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Update password in Supabase Auth
      const { error: authError } = await supabase.auth.updateUser({
        email: user.email,
        password: password,
      });

      if (authError) {
        console.error('Supabase auth error:', authError);
        // Continue anyway since our database update was successful
      }

      res.status(200).json({ message: 'Password has been reset successfully' });
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({ 
        message: 'Server error', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }
};
