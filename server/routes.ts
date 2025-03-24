import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertUserSchema, 
  insertPropertySchema, 
  insertClientSchema, 
  insertAppointmentSchema, 
  insertSubscriptionSchema 
} from "@shared/schema";
import { sendAppointmentReminder } from "./email";
import { randomUUID } from "crypto";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // AUTH ROUTES
  app.post('/api/auth/signup', async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(validatedData);
      
      // Don't send the password in the response
      const { password, ...userWithoutPassword } = user;
      
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to create user' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }
      
      const user = await storage.authenticateUser(email, password);
      
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      // Create session
      req.session.userId = user.id;
      
      // Don't send the password in the response
      const { password: _, ...userWithoutPassword } = user;
      
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: 'Login failed' });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: 'Failed to logout' });
      }
      res.clearCookie('connect.sid');
      res.status(200).json({ message: 'Logged out successfully' });
    });
  });

  app.get('/api/auth/me', async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    try {
      const user = await storage.getUser(req.session.userId);
      
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }
      
      // Don't send the password in the response
      const { password, ...userWithoutPassword } = user;
      
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch user' });
    }
  });

  // PROPERTY ROUTES
  app.get('/api/properties', async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    try {
      const properties = await storage.getUserProperties(req.session.userId);
      res.status(200).json(properties);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch properties' });
    }
  });

  app.get('/api/properties/:id', async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    try {
      const propertyId = parseInt(req.params.id);
      const property = await storage.getProperty(propertyId);
      
      if (!property) {
        return res.status(404).json({ message: 'Property not found' });
      }
      
      // Check if user owns the property
      if (property.user_id !== req.session.userId) {
        return res.status(403).json({ message: 'Not authorized to access this property' });
      }
      
      res.status(200).json(property);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch property' });
    }
  });

  app.post('/api/properties', async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    try {
      const validatedData = insertPropertySchema.parse({
        ...req.body,
        user_id: req.session.userId,
      });
      
      const property = await storage.createProperty(validatedData);
      res.status(201).json(property);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to create property' });
    }
  });

  app.patch('/api/properties/:id', async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    try {
      const propertyId = parseInt(req.params.id);
      const property = await storage.getProperty(propertyId);
      
      if (!property) {
        return res.status(404).json({ message: 'Property not found' });
      }
      
      // Check if user owns the property
      if (property.user_id !== req.session.userId) {
        return res.status(403).json({ message: 'Not authorized to update this property' });
      }
      
      const updatedProperty = await storage.updateProperty(propertyId, req.body);
      res.status(200).json(updatedProperty);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to update property' });
    }
  });

  app.delete('/api/properties/:id', async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    try {
      const propertyId = parseInt(req.params.id);
      const property = await storage.getProperty(propertyId);
      
      if (!property) {
        return res.status(404).json({ message: 'Property not found' });
      }
      
      // Check if user owns the property
      if (property.user_id !== req.session.userId) {
        return res.status(403).json({ message: 'Not authorized to delete this property' });
      }
      
      await storage.deleteProperty(propertyId);
      res.status(200).json({ message: 'Property deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete property' });
    }
  });

  // CLIENT ROUTES
  app.get('/api/clients', async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    try {
      const clients = await storage.getUserClients(req.session.userId);
      res.status(200).json(clients);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch clients' });
    }
  });

  app.get('/api/clients/:id', async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    try {
      const clientId = parseInt(req.params.id);
      const client = await storage.getClient(clientId);
      
      if (!client) {
        return res.status(404).json({ message: 'Client not found' });
      }
      
      // Check if user owns the client
      if (client.user_id !== req.session.userId) {
        return res.status(403).json({ message: 'Not authorized to access this client' });
      }
      
      res.status(200).json(client);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch client' });
    }
  });

  app.post('/api/clients', async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    try {
      const validatedData = insertClientSchema.parse({
        ...req.body,
        user_id: req.session.userId,
      });
      
      const client = await storage.createClient(validatedData);
      res.status(201).json(client);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to create client' });
    }
  });

  app.patch('/api/clients/:id', async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    try {
      const clientId = parseInt(req.params.id);
      const client = await storage.getClient(clientId);
      
      if (!client) {
        return res.status(404).json({ message: 'Client not found' });
      }
      
      // Check if user owns the client
      if (client.user_id !== req.session.userId) {
        return res.status(403).json({ message: 'Not authorized to update this client' });
      }
      
      const updatedClient = await storage.updateClient(clientId, req.body);
      res.status(200).json(updatedClient);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to update client' });
    }
  });

  app.delete('/api/clients/:id', async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    try {
      const clientId = parseInt(req.params.id);
      const client = await storage.getClient(clientId);
      
      if (!client) {
        return res.status(404).json({ message: 'Client not found' });
      }
      
      // Check if user owns the client
      if (client.user_id !== req.session.userId) {
        return res.status(403).json({ message: 'Not authorized to delete this client' });
      }
      
      await storage.deleteClient(clientId);
      res.status(200).json({ message: 'Client deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete client' });
    }
  });

  // APPOINTMENT ROUTES
  app.get('/api/appointments', async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    try {
      const appointments = await storage.getUserAppointments(req.session.userId);
      res.status(200).json(appointments);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch appointments' });
    }
  });

  app.get('/api/appointments/:id', async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    try {
      const appointmentId = parseInt(req.params.id);
      const appointment = await storage.getAppointment(appointmentId);
      
      if (!appointment) {
        return res.status(404).json({ message: 'Appointment not found' });
      }
      
      // Check if user owns the appointment
      if (appointment.user_id !== req.session.userId) {
        return res.status(403).json({ message: 'Not authorized to access this appointment' });
      }
      
      res.status(200).json(appointment);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch appointment' });
    }
  });

  app.post('/api/appointments', async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    try {
      const validatedData = insertAppointmentSchema.parse({
        ...req.body,
        user_id: req.session.userId,
      });
      
      const appointment = await storage.createAppointment(validatedData);
      res.status(201).json(appointment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to create appointment' });
    }
  });

  app.patch('/api/appointments/:id', async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    try {
      const appointmentId = parseInt(req.params.id);
      const appointment = await storage.getAppointment(appointmentId);
      
      if (!appointment) {
        return res.status(404).json({ message: 'Appointment not found' });
      }
      
      // Check if user owns the appointment
      if (appointment.user_id !== req.session.userId) {
        return res.status(403).json({ message: 'Not authorized to update this appointment' });
      }
      
      const updatedAppointment = await storage.updateAppointment(appointmentId, req.body);
      res.status(200).json(updatedAppointment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to update appointment' });
    }
  });

  app.delete('/api/appointments/:id', async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    try {
      const appointmentId = parseInt(req.params.id);
      const appointment = await storage.getAppointment(appointmentId);
      
      if (!appointment) {
        return res.status(404).json({ message: 'Appointment not found' });
      }
      
      // Check if user owns the appointment
      if (appointment.user_id !== req.session.userId) {
        return res.status(403).json({ message: 'Not authorized to delete this appointment' });
      }
      
      await storage.deleteAppointment(appointmentId);
      res.status(200).json({ message: 'Appointment deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete appointment' });
    }
  });

  app.get('/api/clients/:id/appointments', async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    try {
      const clientId = parseInt(req.params.id);
      const client = await storage.getClient(clientId);
      
      if (!client) {
        return res.status(404).json({ message: 'Client not found' });
      }
      
      // Check if user owns the client
      if (client.user_id !== req.session.userId) {
        return res.status(403).json({ message: 'Not authorized to access this client' });
      }
      
      const appointments = await storage.getClientAppointments(clientId);
      res.status(200).json(appointments);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch client appointments' });
    }
  });

  // SUBSCRIPTION ROUTES
  app.post('/api/subscriptions', async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    try {
      const validatedData = insertSubscriptionSchema.parse({
        ...req.body,
        user_id: req.session.userId,
      });
      
      const subscription = await storage.createSubscription(validatedData);
      
      // Update user premium status
      await storage.updateUserPremiumStatus(req.session.userId, true, validatedData.end_date);
      
      res.status(201).json(subscription);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to create subscription' });
    }
  });

  app.get('/api/subscriptions/current', async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    try {
      const subscription = await storage.getCurrentSubscription(req.session.userId);
      
      if (!subscription) {
        return res.status(404).json({ message: 'No active subscription found' });
      }
      
      res.status(200).json(subscription);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch subscription' });
    }
  });

  app.post('/api/subscriptions/cancel', async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    try {
      const subscription = await storage.getCurrentSubscription(req.session.userId);
      
      if (!subscription) {
        return res.status(404).json({ message: 'No active subscription found' });
      }
      
      await storage.cancelSubscription(subscription.id);
      await storage.updateUserPremiumStatus(req.session.userId, false, null);
      
      res.status(200).json({ message: 'Subscription cancelled successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to cancel subscription' });
    }
  });

  // REWARD UNITS ROUTES
  app.post('/api/rewards/consume', async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    try {
      const { units, feature } = req.body;
      
      if (!units || units <= 0 || !feature) {
        return res.status(400).json({ message: 'Invalid request. Units and feature are required.' });
      }
      
      const user = await storage.getUser(req.session.userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      if (user.reward_units < units) {
        return res.status(400).json({ 
          message: 'Not enough reward units', 
          remainingUnits: user.reward_units 
        });
      }
      
      const remainingUnits = user.reward_units - units;
      await storage.updateUserRewardUnits(req.session.userId, remainingUnits);
      
      res.status(200).json({ 
        success: true, 
        remainingUnits,
        message: `Successfully consumed ${units} units for ${feature}`
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to consume reward units' });
    }
  });

  app.post('/api/rewards/add', async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    try {
      const { units } = req.body;
      
      if (!units || units <= 0) {
        return res.status(400).json({ message: 'Invalid request. Units must be positive.' });
      }
      
      const user = await storage.getUser(req.session.userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      const newTotal = user.reward_units + units;
      await storage.updateUserRewardUnits(req.session.userId, newTotal);
      
      res.status(200).json({ 
        success: true, 
        newTotal,
        message: `Successfully added ${units} reward units`
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to add reward units' });
    }
  });

  // Schedule task to send appointment reminders
  setInterval(async () => {
    try {
      // Get appointments that are 24 hours from now and haven't had reminders sent
      const appointments = await storage.getUpcomingAppointmentsNeedingReminders();
      
      for (const appointment of appointments) {
        // Get the user who created the appointment
        const user = await storage.getUser(appointment.user_id);
        
        if (!user) continue;
        
        // Get client info if available
        let clientName = 'Client';
        if (appointment.client_id) {
          const client = await storage.getClient(appointment.client_id);
          if (client) {
            clientName = `${client.first_name} ${client.last_name}`;
          }
        }
        
        // Send reminder email
        await sendAppointmentReminder({
          to: user.email,
          userName: `${user.first_name} ${user.last_name}`,
          appointmentTitle: appointment.title,
          appointmentDate: appointment.date,
          appointmentTime: appointment.time,
          clientName,
          location: appointment.location || 'Not specified',
          appointmentId: appointment.id,
          notes: appointment.notes || 'No additional notes',
        });
        
        // Mark reminder as sent
        await storage.markReminderSent(appointment.id);
      }
    } catch (error) {
      console.error('Error sending appointment reminders:', error);
    }
  }, 60 * 60 * 1000); // Check every hour

  return httpServer;
}
