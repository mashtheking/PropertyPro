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
    // Get the session token from the Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No authorization token found' });
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error } = await req.supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    req.user = user;
    const dbUser = await storage.getUser(user.id);
    if (!dbUser) {
      return res.status(401).json({ message: 'User not found in database' });
    }

    req.session = { userId: user.id };
    next();
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