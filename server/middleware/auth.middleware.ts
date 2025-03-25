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
    // Check if user is authenticated in session
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: 'Authentication required. Please log in.' });
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
