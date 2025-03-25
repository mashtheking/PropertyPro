import { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';
import { User } from '@shared/schema';
import { SupabaseClient } from '@supabase/supabase-js';

// Extend Request type to include user property
declare global {
  namespace Express {
    interface Request {
      user: User;
      supabase: SupabaseClient;
    }
  }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check if user is authenticated in session and has valid Supabase token
    if (!req.session || !req.session.userId || !req.session.supabaseToken) {
      return res.status(401).json({ message: 'Authentication required. Please log in.' });
    }

    // Verify Supabase token
    const { data: { user: supabaseUser }, error: authError } = await req.supabase.auth.getUser(req.session.supabaseToken);
    if (authError || !supabaseUser) {
      req.session.destroy((err) => {
        if (err) console.error('Session destruction error:', err);
      });
      return res.status(401).json({ message: 'Invalid or expired session. Please log in again.' });
    }

    // Get user from database
    const user = await storage.getUser(req.session.userId);
    if (!user) {
      // Clear invalid session
      req.session.destroy((err) => {
        if (err) console.error('Session destruction error:', err);
      });
      return res.status(401).json({ message: 'User not found. Please log in again.' });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};
