import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { createClient } from "@supabase/supabase-js";
import session from "express-session";
import { z } from "zod";
import { 
  insertUserSchema, 
  insertPropertySchema, 
  insertClientSchema, 
  insertAppointmentSchema, 
  insertSubscriptionSchema, 
  insertFeatureAccessSchema 
} from "@shared/schema";
import bcrypt from "bcryptjs";
import { Resend } from 'resend';

// Supabase setup
const supabaseUrl = "https://ewmjparrdpjurafbkklb.supabase.co";
const supabaseKey = process.env.SUPABASE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3bWpwYXJyZHBqdXJhZmJra2xiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI3MDkxNDQsImV4cCI6MjA1ODI4NTE0NH0.fEDsOQkjwOQUoFJRGClWrIra40MbNygpDu37xGZJMz4";
const supabase = createClient(supabaseUrl, supabaseKey);

// Resend setup
const resendKey = process.env.RESEND_KEY || "re_4RZf3gxB_84fjiaZfKdjx7bRotYqfpF3f";
const resend = new Resend(resendKey);

// PayPal config
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || "AeIDhdfwwcQ7qfBWZ936c35BHsl7jHPfe9jy5_x6nkOIB_F9KBxpp0YJYbpvjD5bv0ym-D50uHOrIwN6";
const PAYPAL_SECRET = process.env.PAYPAL_SECRET || "EKs5ZN1Fo-QGdbvj9_e9wcEgh_jtjj2_AUH0K_iOWDctHPfVJrhHFRBtT5o1UHYM1bf68pT_SnCqKCL5";

// Helper to check authentication
const isAuthenticated = (req: Request, res: Response, next: Function) => {
  if (req.session.userId) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};

// Helper to hash password
const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

// Helper to verify password
const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup session middleware
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "realcrm-secret-key",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      },
    })
  );

  // ===== AUTH ROUTES =====
  
  // Register user
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }
      
      // Hash password
      const hashedPassword = await hashPassword(userData.password);
      
      // Create user in storage
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
        isPremium: false,
        rewardUnits: 5, // Start with some reward units
      });
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      // Set session
      req.session.userId = user.id;
      
      return res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error("Registration error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      return res.status(500).json({ message: "Registration failed" });
    }
  });
  
  // Login user
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Find user
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Verify password
      const isPasswordValid = await verifyPassword(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Set session
      req.session.userId = user.id;
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      
      return res.status(200).json(userWithoutPassword);
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({ message: "Login failed" });
    }
  });
  
  // Get current user
  app.get("/api/auth/me", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId as number;
      const user = await storage.getUser(userId);
      
      if (!user) {
        req.session.destroy(() => {});
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      return res.status(200).json(userWithoutPassword);
    } catch (error) {
      console.error("Get current user error:", error);
      return res.status(500).json({ message: "Failed to get user data" });
    }
  });
  
  // Logout user
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.status(200).json({ message: "Logged out successfully" });
    });
  });
  
  // ===== PROPERTY ROUTES =====
  
  // Get all properties for user
  app.get("/api/properties", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId as number;
      const properties = await storage.getProperties(userId);
      
      return res.status(200).json(properties);
    } catch (error) {
      console.error("Get properties error:", error);
      return res.status(500).json({ message: "Failed to get properties" });
    }
  });
  
  // Get single property
  app.get("/api/properties/:id", isAuthenticated, async (req, res) => {
    try {
      const propertyId = parseInt(req.params.id);
      if (isNaN(propertyId)) {
        return res.status(400).json({ message: "Invalid property ID" });
      }
      
      const property = await storage.getProperty(propertyId);
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      
      // Ensure user owns this property
      if (property.userId !== req.session.userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      return res.status(200).json(property);
    } catch (error) {
      console.error("Get property error:", error);
      return res.status(500).json({ message: "Failed to get property" });
    }
  });
  
  // Create property
  app.post("/api/properties", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId as number;
      const propertyData = insertPropertySchema.parse({
        ...req.body,
        userId,
      });
      
      const property = await storage.createProperty(propertyData);
      
      return res.status(201).json(property);
    } catch (error) {
      console.error("Create property error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to create property" });
    }
  });
  
  // Update property
  app.put("/api/properties/:id", isAuthenticated, async (req, res) => {
    try {
      const propertyId = parseInt(req.params.id);
      if (isNaN(propertyId)) {
        return res.status(400).json({ message: "Invalid property ID" });
      }
      
      // Ensure property exists and belongs to user
      const existingProperty = await storage.getProperty(propertyId);
      if (!existingProperty) {
        return res.status(404).json({ message: "Property not found" });
      }
      
      if (existingProperty.userId !== req.session.userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      // Update property
      const updatedProperty = await storage.updateProperty(propertyId, req.body);
      
      return res.status(200).json(updatedProperty);
    } catch (error) {
      console.error("Update property error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to update property" });
    }
  });
  
  // Delete property
  app.delete("/api/properties/:id", isAuthenticated, async (req, res) => {
    try {
      const propertyId = parseInt(req.params.id);
      if (isNaN(propertyId)) {
        return res.status(400).json({ message: "Invalid property ID" });
      }
      
      // Ensure property exists and belongs to user
      const existingProperty = await storage.getProperty(propertyId);
      if (!existingProperty) {
        return res.status(404).json({ message: "Property not found" });
      }
      
      if (existingProperty.userId !== req.session.userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      // Delete property
      await storage.deleteProperty(propertyId);
      
      return res.status(200).json({ message: "Property deleted successfully" });
    } catch (error) {
      console.error("Delete property error:", error);
      return res.status(500).json({ message: "Failed to delete property" });
    }
  });
  
  // ===== CLIENT ROUTES =====
  
  // Get all clients for user
  app.get("/api/clients", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId as number;
      const clients = await storage.getClients(userId);
      
      return res.status(200).json(clients);
    } catch (error) {
      console.error("Get clients error:", error);
      return res.status(500).json({ message: "Failed to get clients" });
    }
  });
  
  // Get single client
  app.get("/api/clients/:id", isAuthenticated, async (req, res) => {
    try {
      const clientId = parseInt(req.params.id);
      if (isNaN(clientId)) {
        return res.status(400).json({ message: "Invalid client ID" });
      }
      
      const client = await storage.getClient(clientId);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      
      // Ensure user owns this client
      if (client.userId !== req.session.userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      return res.status(200).json(client);
    } catch (error) {
      console.error("Get client error:", error);
      return res.status(500).json({ message: "Failed to get client" });
    }
  });
  
  // Create client
  app.post("/api/clients", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId as number;
      const clientData = insertClientSchema.parse({
        ...req.body,
        userId,
      });
      
      const client = await storage.createClient(clientData);
      
      return res.status(201).json(client);
    } catch (error) {
      console.error("Create client error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to create client" });
    }
  });
  
  // Update client
  app.put("/api/clients/:id", isAuthenticated, async (req, res) => {
    try {
      const clientId = parseInt(req.params.id);
      if (isNaN(clientId)) {
        return res.status(400).json({ message: "Invalid client ID" });
      }
      
      // Ensure client exists and belongs to user
      const existingClient = await storage.getClient(clientId);
      if (!existingClient) {
        return res.status(404).json({ message: "Client not found" });
      }
      
      if (existingClient.userId !== req.session.userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      // Update client
      const updatedClient = await storage.updateClient(clientId, req.body);
      
      return res.status(200).json(updatedClient);
    } catch (error) {
      console.error("Update client error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to update client" });
    }
  });
  
  // Delete client
  app.delete("/api/clients/:id", isAuthenticated, async (req, res) => {
    try {
      const clientId = parseInt(req.params.id);
      if (isNaN(clientId)) {
        return res.status(400).json({ message: "Invalid client ID" });
      }
      
      // Ensure client exists and belongs to user
      const existingClient = await storage.getClient(clientId);
      if (!existingClient) {
        return res.status(404).json({ message: "Client not found" });
      }
      
      if (existingClient.userId !== req.session.userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      // Delete client
      await storage.deleteClient(clientId);
      
      return res.status(200).json({ message: "Client deleted successfully" });
    } catch (error) {
      console.error("Delete client error:", error);
      return res.status(500).json({ message: "Failed to delete client" });
    }
  });
  
  // ===== APPOINTMENT ROUTES =====
  
  // Get all appointments for user
  app.get("/api/appointments", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId as number;
      const appointments = await storage.getAppointments(userId);
      
      return res.status(200).json(appointments);
    } catch (error) {
      console.error("Get appointments error:", error);
      return res.status(500).json({ message: "Failed to get appointments" });
    }
  });
  
  // Get upcoming appointments
  app.get("/api/appointments/upcoming", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId as number;
      const appointments = await storage.getUpcomingAppointments(userId);
      
      return res.status(200).json(appointments);
    } catch (error) {
      console.error("Get upcoming appointments error:", error);
      return res.status(500).json({ message: "Failed to get upcoming appointments" });
    }
  });
  
  // Get single appointment
  app.get("/api/appointments/:id", isAuthenticated, async (req, res) => {
    try {
      const appointmentId = parseInt(req.params.id);
      if (isNaN(appointmentId)) {
        return res.status(400).json({ message: "Invalid appointment ID" });
      }
      
      const appointment = await storage.getAppointment(appointmentId);
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      
      // Ensure user owns this appointment
      if (appointment.userId !== req.session.userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      return res.status(200).json(appointment);
    } catch (error) {
      console.error("Get appointment error:", error);
      return res.status(500).json({ message: "Failed to get appointment" });
    }
  });
  
  // Create appointment
  app.post("/api/appointments", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId as number;
      const appointmentData = insertAppointmentSchema.parse({
        ...req.body,
        userId,
      });
      
      const appointment = await storage.createAppointment(appointmentData);
      
      // If reminder is enabled, we would set up a reminder here
      // In a production app, we'd use a job scheduler
      
      return res.status(201).json(appointment);
    } catch (error) {
      console.error("Create appointment error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to create appointment" });
    }
  });
  
  // Update appointment
  app.put("/api/appointments/:id", isAuthenticated, async (req, res) => {
    try {
      const appointmentId = parseInt(req.params.id);
      if (isNaN(appointmentId)) {
        return res.status(400).json({ message: "Invalid appointment ID" });
      }
      
      // Ensure appointment exists and belongs to user
      const existingAppointment = await storage.getAppointment(appointmentId);
      if (!existingAppointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      
      if (existingAppointment.userId !== req.session.userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      // Update appointment
      const updatedAppointment = await storage.updateAppointment(appointmentId, req.body);
      
      return res.status(200).json(updatedAppointment);
    } catch (error) {
      console.error("Update appointment error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to update appointment" });
    }
  });
  
  // Delete appointment
  app.delete("/api/appointments/:id", isAuthenticated, async (req, res) => {
    try {
      const appointmentId = parseInt(req.params.id);
      if (isNaN(appointmentId)) {
        return res.status(400).json({ message: "Invalid appointment ID" });
      }
      
      // Ensure appointment exists and belongs to user
      const existingAppointment = await storage.getAppointment(appointmentId);
      if (!existingAppointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      
      if (existingAppointment.userId !== req.session.userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      // Delete appointment
      await storage.deleteAppointment(appointmentId);
      
      return res.status(200).json({ message: "Appointment deleted successfully" });
    } catch (error) {
      console.error("Delete appointment error:", error);
      return res.status(500).json({ message: "Failed to delete appointment" });
    }
  });
  
  // ===== SUBSCRIPTION ROUTES =====
  
  // Get user subscription status
  app.get("/api/subscription", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId as number;
      
      // Get user to check if premium
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Get subscription details
      const subscription = await storage.getSubscription(userId);
      
      return res.status(200).json({
        isPremium: user.isPremium,
        subscription: subscription || null,
        premiumExpiresAt: user.premiumExpiresAt,
      });
    } catch (error) {
      console.error("Get subscription error:", error);
      return res.status(500).json({ message: "Failed to get subscription status" });
    }
  });
  
  // Create subscription (PayPal webhook would call this)
  app.post("/api/subscription", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId as number;
      const { paypalSubscriptionId, status, endDate } = req.body;
      
      // Create subscription
      const subscription = await storage.createSubscription({
        userId,
        paypalSubscriptionId,
        status,
        startDate: new Date(),
        endDate: endDate ? new Date(endDate) : undefined,
      });
      
      // Update user to premium
      await storage.updateUser(userId, {
        isPremium: true,
        premiumExpiresAt: endDate ? new Date(endDate) : undefined,
      });
      
      return res.status(201).json(subscription);
    } catch (error) {
      console.error("Create subscription error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to create subscription" });
    }
  });
  
  // Cancel subscription
  app.post("/api/subscription/cancel", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId as number;
      
      // Get subscription
      const subscription = await storage.getSubscription(userId);
      if (!subscription) {
        return res.status(404).json({ message: "No active subscription found" });
      }
      
      // Update subscription status
      await storage.updateSubscription(subscription.id, {
        status: "canceled",
      });
      
      // Keep user premium until expiration
      
      return res.status(200).json({ message: "Subscription canceled" });
    } catch (error) {
      console.error("Cancel subscription error:", error);
      return res.status(500).json({ message: "Failed to cancel subscription" });
    }
  });
  
  // ===== REWARD UNITS ROUTES =====
  
  // Get user reward units
  app.get("/api/reward-units", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId as number;
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      return res.status(200).json({ rewardUnits: user.rewardUnits });
    } catch (error) {
      console.error("Get reward units error:", error);
      return res.status(500).json({ message: "Failed to get reward units" });
    }
  });
  
  // Add reward units (from watching ads)
  app.post("/api/reward-units/add", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId as number;
      const { units } = req.body;
      
      if (!units || isNaN(units) || units <= 0) {
        return res.status(400).json({ message: "Invalid units amount" });
      }
      
      // Get current user
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Update reward units
      const updatedUser = await storage.updateUser(userId, {
        rewardUnits: user.rewardUnits + units,
      });
      
      return res.status(200).json({ rewardUnits: updatedUser?.rewardUnits });
    } catch (error) {
      console.error("Add reward units error:", error);
      return res.status(500).json({ message: "Failed to add reward units" });
    }
  });
  
  // Use reward units to unlock feature
  app.post("/api/reward-units/use", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId as number;
      const { featureName, units, duration } = req.body;
      
      if (!featureName || !units || isNaN(units) || units <= 0) {
        return res.status(400).json({ message: "Invalid request data" });
      }
      
      // Get current user
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Check if user has enough units
      if (user.rewardUnits < units) {
        return res.status(400).json({ message: "Not enough reward units" });
      }
      
      // Calculate expiration time (default 24 hours)
      const hoursToAdd = duration || 24;
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + hoursToAdd);
      
      // Create feature access record
      await storage.createFeatureAccess({
        userId,
        featureName,
        accessExpiresAt: expiresAt,
      });
      
      // Deduct reward units
      const updatedUser = await storage.updateUser(userId, {
        rewardUnits: user.rewardUnits - units,
      });
      
      return res.status(200).json({
        rewardUnits: updatedUser?.rewardUnits,
        featureName,
        accessExpiresAt: expiresAt,
      });
    } catch (error) {
      console.error("Use reward units error:", error);
      return res.status(500).json({ message: "Failed to use reward units" });
    }
  });
  
  // Check if user has access to a premium feature
  app.get("/api/features/:featureName/access", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId as number;
      const { featureName } = req.params;
      
      // Get user to check if premium
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // If user is premium, they have access to all features
      if (user.isPremium) {
        return res.status(200).json({
          hasAccess: true,
          reason: "premium",
          expiresAt: user.premiumExpiresAt,
        });
      }
      
      // Check for temporary feature access
      const featureAccess = await storage.getFeatureAccess(userId, featureName);
      
      if (featureAccess && new Date(featureAccess.accessExpiresAt) > new Date()) {
        return res.status(200).json({
          hasAccess: true,
          reason: "temporary",
          expiresAt: featureAccess.accessExpiresAt,
        });
      }
      
      return res.status(200).json({
        hasAccess: false,
      });
    } catch (error) {
      console.error("Check feature access error:", error);
      return res.status(500).json({ message: "Failed to check feature access" });
    }
  });
  
  // ===== EMAIL REMINDER UTILITY =====
  
  // This would typically be triggered by a cron job or scheduler
  app.post("/api/send-appointment-reminders", async (req, res) => {
    try {
      // Get all appointments that need reminders
      // In a real implementation, this would query appointments for the next 24 hours
      // that haven't had reminders sent yet
      
      // For each appointment, send email via Resend
      /* 
      const { data, error } = await resend.emails.send({
        from: 'RealCRM <appointments@realcrm.com>',
        to: [clientEmail],
        subject: 'Upcoming Appointment Reminder',
        html: `<p>You have an appointment tomorrow: ${appointment.title}</p>`,
      });
      */
      
      return res.status(200).json({ message: "Reminders processed" });
    } catch (error) {
      console.error("Send reminders error:", error);
      return res.status(500).json({ message: "Failed to send reminders" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
