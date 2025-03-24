import { Request, Response } from 'express';
import { storage } from '../storage';

export const rewardsController = {
  addRewards: async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const { amount } = req.body;
      
      if (amount === undefined || isNaN(amount) || amount <= 0) {
        return res.status(400).json({ message: 'Invalid reward amount' });
      }
      
      // Update user's reward units
      const user = await storage.addRewardUnits(userId, amount);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.status(200).json({
        message: `${amount} reward units added successfully`,
        rewardUnits: user.rewardUnits
      });
    } catch (error) {
      console.error('Add rewards error:', error);
      res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  },

  useRewards: async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const { amount, featureName } = req.body;
      
      if (amount === undefined || isNaN(amount) || amount <= 0) {
        return res.status(400).json({ message: 'Invalid reward amount' });
      }
      
      if (!featureName) {
        return res.status(400).json({ message: 'Feature name is required' });
      }
      
      // Get user to check if they have enough reward units
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      if ((user.rewardUnits || 0) < amount) {
        return res.status(400).json({ message: 'Not enough reward units' });
      }
      
      // If user is premium, no need to use reward units
      if (user.isPremium) {
        return res.status(400).json({ message: 'Premium users do not need to use reward units' });
      }
      
      // Use reward units
      const updatedUser = await storage.useRewardUnits(userId, amount);
      if (!updatedUser) {
        return res.status(500).json({ message: 'Failed to use reward units' });
      }
      
      res.status(200).json({
        message: `${amount} reward units used successfully for ${featureName}`,
        rewardUnits: updatedUser.rewardUnits
      });
    } catch (error) {
      console.error('Use rewards error:', error);
      if (error instanceof Error && error.message === 'Not enough reward units') {
        return res.status(400).json({ message: 'Not enough reward units' });
      }
      res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }
};
