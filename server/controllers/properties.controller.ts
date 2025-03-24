import { Request, Response } from 'express';
import { storage } from '../storage';
import { insertPropertySchema } from '@shared/schema';

export const propertiesController = {
  getAll: async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const properties = await storage.getProperties(userId);
      res.status(200).json(properties);
    } catch (error) {
      console.error('Get properties error:', error);
      res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  },

  getById: async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const propertyId = parseInt(req.params.id);
      
      if (isNaN(propertyId)) {
        return res.status(400).json({ message: 'Invalid property ID' });
      }

      const property = await storage.getProperty(propertyId, userId);
      
      if (!property) {
        return res.status(404).json({ message: 'Property not found' });
      }

      res.status(200).json(property);
    } catch (error) {
      console.error('Get property error:', error);
      res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  },

  create: async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      
      // Validate request body
      const validationResult = insertPropertySchema.safeParse({ ...req.body, userId });
      if (!validationResult.success) {
        return res.status(400).json({ message: 'Invalid request data', errors: validationResult.error.errors });
      }

      // Create property
      const property = await storage.createProperty(validationResult.data);
      
      res.status(201).json(property);
    } catch (error) {
      console.error('Create property error:', error);
      res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  },

  update: async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const propertyId = parseInt(req.params.id);
      
      if (isNaN(propertyId)) {
        return res.status(400).json({ message: 'Invalid property ID' });
      }

      // Check if property exists and belongs to user
      const existingProperty = await storage.getProperty(propertyId, userId);
      if (!existingProperty) {
        return res.status(404).json({ message: 'Property not found' });
      }

      // Validate request body (partial)
      const validationResult = insertPropertySchema.partial().safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ message: 'Invalid request data', errors: validationResult.error.errors });
      }

      // Update property
      const updatedProperty = await storage.updateProperty(propertyId, userId, validationResult.data);
      
      if (!updatedProperty) {
        return res.status(404).json({ message: 'Property not found' });
      }

      res.status(200).json(updatedProperty);
    } catch (error) {
      console.error('Update property error:', error);
      res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  },

  delete: async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const propertyId = parseInt(req.params.id);
      
      if (isNaN(propertyId)) {
        return res.status(400).json({ message: 'Invalid property ID' });
      }

      // Check if property exists and belongs to user
      const existingProperty = await storage.getProperty(propertyId, userId);
      if (!existingProperty) {
        return res.status(404).json({ message: 'Property not found' });
      }

      // Delete property
      const success = await storage.deleteProperty(propertyId, userId);
      
      if (!success) {
        return res.status(500).json({ message: 'Failed to delete property' });
      }

      res.status(200).json({ message: 'Property deleted successfully' });
    } catch (error) {
      console.error('Delete property error:', error);
      res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }
};
