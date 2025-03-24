import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useAdMob } from '@/hooks/use-admob';
import { apiRequest } from '@/lib/queryClient';

interface RewardContextType {
  rewardUnits: number;
  isLoading: boolean;
  error: string | null;
  watchAd: () => Promise<boolean>;
  useRewardUnits: (amount: number, featureName: string) => Promise<boolean>;
  refreshRewardUnits: () => Promise<void>;
}

const RewardContext = createContext<RewardContextType | undefined>(undefined);

export const RewardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, refetchProfile } = useAuth();
  const { loadRewardedAd, showRewardedAd, isAdLoaded } = useAdMob();
  
  const [rewardUnits, setRewardUnits] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update reward units when user changes
  useEffect(() => {
    if (user) {
      setRewardUnits(user.rewardUnits || 0);
    } else {
      setRewardUnits(0);
    }
  }, [user]);

  // Watch an ad to earn reward units
  const watchAd = async (): Promise<boolean> => {
    if (!isAuthenticated) {
      setError('You must be logged in to watch ads');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Load ad if not already loaded
      if (!isAdLoaded()) {
        const loaded = await loadRewardedAd();
        if (!loaded) {
          throw new Error('Failed to load ad');
        }
      }

      // Show the ad
      const result = await showRewardedAd();
      
      if (result.type === 'earned') {
        // Refresh user profile to get updated reward units
        await refetchProfile();
        return true;
      } else if (result.type === 'canceled') {
        setError('Ad viewing was canceled');
        return false;
      } else {
        throw new Error(result.error || 'Failed to earn reward');
      }
    } catch (err: any) {
      console.error('Error watching ad:', err);
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Use reward units to access premium features
  const useRewardUnits = async (amount: number, featureName: string): Promise<boolean> => {
    if (!isAuthenticated) {
      setError('You must be logged in to use reward units');
      return false;
    }

    if (rewardUnits < amount) {
      setError(`Not enough reward units. You need ${amount} units to access this feature.`);
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      await apiRequest('POST', '/api/rewards/use', { amount, featureName });
      
      // Refresh user profile to get updated reward units
      await refetchProfile();
      return true;
    } catch (err: any) {
      console.error('Error using reward units:', err);
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshRewardUnits = async () => {
    if (!isAuthenticated) return;

    try {
      // Refresh user profile to get updated reward units
      await refetchProfile();
    } catch (err: any) {
      console.error('Error refreshing reward units:', err);
      setError(err.message);
    }
  };

  return (
    <RewardContext.Provider
      value={{
        rewardUnits,
        isLoading,
        error,
        watchAd,
        useRewardUnits,
        refreshRewardUnits,
      }}
    >
      {children}
    </RewardContext.Provider>
  );
};

export const useReward = () => {
  const context = useContext(RewardContext);
  if (context === undefined) {
    throw new Error('useReward must be used within a RewardProvider');
  }
  return context;
};
