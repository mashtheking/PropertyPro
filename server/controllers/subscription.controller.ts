import { Request, Response } from 'express';
import { storage } from '../storage';
import { paypalService } from '../services/paypal';

export const subscriptionController = {
  getById: async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const subscriptionId = req.params.id;
      
      // First check if the subscription belongs to the user
      const user = await storage.getUser(userId);
      if (!user || user.subscriptionId !== subscriptionId) {
        return res.status(403).json({ message: 'You are not authorized to access this subscription' });
      }
      
      // Get subscription details from PayPal
      const subscriptionDetails = await paypalService.getSubscriptionDetails(subscriptionId);
      
      // Get subscription from our database
      const subscription = await storage.getSubscriptionByUserId(userId);
      
      if (!subscription) {
        return res.status(404).json({ message: 'Subscription not found in database' });
      }
      
      // Combine the data
      const response = {
        ...subscription,
        paypalDetails: subscriptionDetails
      };
      
      res.status(200).json(response);
    } catch (error) {
      console.error('Get subscription error:', error);
      res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  },

  upgrade: async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const { subscriptionId } = req.body;
      
      if (!subscriptionId) {
        return res.status(400).json({ message: 'Subscription ID is required' });
      }
      
      // Get user
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Verify and create subscription
      const subscription = await paypalService.verifyAndCreateSubscription(user, subscriptionId);
      
      res.status(200).json({
        message: 'Subscription upgraded successfully',
        subscription
      });
    } catch (error) {
      console.error('Upgrade subscription error:', error);
      res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  },

  cancel: async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const { subscriptionId } = req.body;
      
      if (!subscriptionId) {
        return res.status(400).json({ message: 'Subscription ID is required' });
      }
      
      // Get user
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Check if subscription belongs to user
      if (user.subscriptionId !== subscriptionId) {
        return res.status(403).json({ message: 'You are not authorized to cancel this subscription' });
      }
      
      // Cancel subscription
      const success = await paypalService.handleSubscriptionCancellation(user, subscriptionId);
      
      // Update user status
      await storage.updateUser(userId, {
        subscriptionStatus: 'cancelled'
      });
      
      res.status(200).json({
        message: 'Subscription cancelled successfully'
      });
    } catch (error) {
      console.error('Cancel subscription error:', error);
      res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  },

  verify: async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const { subscriptionId } = req.body;
      
      if (!subscriptionId) {
        return res.status(400).json({ message: 'Subscription ID is required' });
      }
      
      // Get user
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Verify subscription with PayPal
      const subscriptionDetails = await paypalService.getSubscriptionDetails(subscriptionId);
      
      // Check subscription status
      if (subscriptionDetails.status !== 'ACTIVE') {
        return res.status(400).json({ message: 'Subscription is not active' });
      }
      
      // Update user information
      await storage.updateUser(userId, {
        isPremium: true,
        subscriptionStatus: 'active',
        subscriptionId
      });
      
      res.status(200).json({
        message: 'Subscription verified successfully',
        subscriptionDetails
      });
    } catch (error) {
      console.error('Verify subscription error:', error);
      res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }
};
