import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { storage } from "./storage";
import { authController } from "./controllers/auth.controller";
import { propertiesController } from "./controllers/properties.controller";
import { clientsController } from "./controllers/clients.controller";
import { appointmentsController } from "./controllers/appointments.controller";
import { dashboardController } from "./controllers/dashboard.controller";
import { subscriptionController } from "./controllers/subscription.controller";
import { rewardsController } from "./controllers/rewards.controller";
import { authMiddleware } from "./middleware/auth.middleware";

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || 'https://ewmjparrdpjurafbkklb.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3bWpwYXJyZHBqdXJhZmJra2xiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI3MDkxNDQsImV4cCI6MjA1ODI4NTE0NH0.fEDsOQkjwOQUoFJRGClWrIra40MbNygpDu37xGZJMz4';
const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey);

// Session configuration
const SESSION_SECRET = process.env.SESSION_SECRET || 'realcrm-secret-key-change-in-production';

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up session middleware
  app.use(
    session({
      secret: SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      },
    })
  );

  // Make supabase client available in requests
  app.use((req: Request, res: Response, next) => {
    req.supabase = supabase;
    next();
  });

  // API Routes
  // Auth routes
  app.post('/api/auth/register', authController.register);
  app.post('/api/auth/login', authController.login);
  app.post('/api/auth/logout', authController.logout);
  app.get('/api/auth/session', authController.getSession);
  app.post('/api/auth/resend-verification', authMiddleware, authController.resendVerification);
  app.get('/api/auth/verify-email/:userId', authController.verifyEmail);
  app.post('/api/auth/forgot-password', authController.forgotPassword);
  app.post('/api/auth/reset-password', authController.resetPassword);

  // User profile routes
  app.get('/api/profile', authMiddleware, authController.getProfile);
  app.patch('/api/profile', authMiddleware, authController.updateProfile);
  app.post('/api/profile/change-password', authMiddleware, authController.changePassword);

  // Properties routes
  app.get('/api/properties', authMiddleware, propertiesController.getAll);
  app.get('/api/properties/:id', authMiddleware, propertiesController.getById);
  app.post('/api/properties', authMiddleware, propertiesController.create);
  app.patch('/api/properties/:id', authMiddleware, propertiesController.update);
  app.delete('/api/properties/:id', authMiddleware, propertiesController.delete);

  // Clients routes
  app.get('/api/clients', authMiddleware, clientsController.getAll);
  app.get('/api/clients/:id', authMiddleware, clientsController.getById);
  app.post('/api/clients', authMiddleware, clientsController.create);
  app.patch('/api/clients/:id', authMiddleware, clientsController.update);
  app.delete('/api/clients/:id', authMiddleware, clientsController.delete);

  // Appointments routes
  app.get('/api/appointments', authMiddleware, appointmentsController.getAll);
  app.get('/api/appointments/:id', authMiddleware, appointmentsController.getById);
  app.post('/api/appointments', authMiddleware, appointmentsController.create);
  app.patch('/api/appointments/:id', authMiddleware, appointmentsController.update);
  app.delete('/api/appointments/:id', authMiddleware, appointmentsController.delete);

  // Dashboard routes
  app.get('/api/dashboard/stats', authMiddleware, dashboardController.getStats);
  app.get('/api/dashboard/activities', authMiddleware, dashboardController.getActivities);
  app.get('/api/dashboard/appointments', authMiddleware, dashboardController.getUpcomingAppointments);

  // Subscription routes
  app.get('/api/subscriptions/:id', authMiddleware, subscriptionController.getById);
  app.post('/api/subscriptions/upgrade', authMiddleware, subscriptionController.upgrade);
  app.post('/api/subscriptions/cancel', authMiddleware, subscriptionController.cancel);
  app.post('/api/subscriptions/verify', authMiddleware, subscriptionController.verify);

  // Rewards routes
  app.post('/api/rewards/add', authMiddleware, rewardsController.addRewards);
  app.post('/api/rewards/use', authMiddleware, rewardsController.useRewards);

  const httpServer = createServer(app);

  return httpServer;
}
