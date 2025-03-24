import { Request, Response } from 'express';
import { storage } from '../storage';
import { insertClientSchema } from '@shared/schema';

export const clientsController = {
  getAll: async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const clients = await storage.getClients(userId);
      res.status(200).json(clients);
    } catch (error) {
      console.error('Get clients error:', error);
      res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  },

  getById: async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const clientId = parseInt(req.params.id);
      
      if (isNaN(clientId)) {
        return res.status(400).json({ message: 'Invalid client ID' });
      }

      const client = await storage.getClient(clientId, userId);
      
      if (!client) {
        return res.status(404).json({ message: 'Client not found' });
      }

      res.status(200).json(client);
    } catch (error) {
      console.error('Get client error:', error);
      res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  },

  create: async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      
      // Validate request body
      const validationResult = insertClientSchema.safeParse({ ...req.body, userId });
      if (!validationResult.success) {
        return res.status(400).json({ message: 'Invalid request data', errors: validationResult.error.errors });
      }

      // Create client
      const client = await storage.createClient(validationResult.data);
      
      res.status(201).json(client);
    } catch (error) {
      console.error('Create client error:', error);
      res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  },

  update: async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const clientId = parseInt(req.params.id);
      
      if (isNaN(clientId)) {
        return res.status(400).json({ message: 'Invalid client ID' });
      }

      // Check if client exists and belongs to user
      const existingClient = await storage.getClient(clientId, userId);
      if (!existingClient) {
        return res.status(404).json({ message: 'Client not found' });
      }

      // Validate request body (partial)
      const validationResult = insertClientSchema.partial().safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ message: 'Invalid request data', errors: validationResult.error.errors });
      }

      // Update client
      const updatedClient = await storage.updateClient(clientId, userId, validationResult.data);
      
      if (!updatedClient) {
        return res.status(404).json({ message: 'Client not found' });
      }

      res.status(200).json(updatedClient);
    } catch (error) {
      console.error('Update client error:', error);
      res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  },

  delete: async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const clientId = parseInt(req.params.id);
      
      if (isNaN(clientId)) {
        return res.status(400).json({ message: 'Invalid client ID' });
      }

      // Check if client exists and belongs to user
      const existingClient = await storage.getClient(clientId, userId);
      if (!existingClient) {
        return res.status(404).json({ message: 'Client not found' });
      }

      // Delete client
      const success = await storage.deleteClient(clientId, userId);
      
      if (!success) {
        return res.status(500).json({ message: 'Failed to delete client' });
      }

      res.status(200).json({ message: 'Client deleted successfully' });
    } catch (error) {
      console.error('Delete client error:', error);
      res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }
};
