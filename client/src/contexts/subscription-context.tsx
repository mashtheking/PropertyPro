import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { apiRequest } from '@/lib/queryClient';

interface SubscriptionContextType {
  isPremium: boolean;
  subscriptionStatus: string | null;
  subscriptionId: string | null;
  subscriptionDetails: any | null;
  isLoading: boolean;
  error: string | null;
  upgradeSubscription: (subscriptionId: string) => Promise<void>;
  cancelSubscription: () => Promise<void>;
  refreshSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, refetchProfile } = useAuth();
  
  const [isPremium, setIsPremium] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
  const [subscriptionDetails, setSubscriptionDetails] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update subscription state when user changes
  useEffect(() => {
    if (user) {
      setIsPremium(user.isPremium || false);
      setSubscriptionStatus(user.subscriptionStatus || null);
      setSubscriptionId(user.subscriptionId || null);
    } else {
      setIsPremium(false);
      setSubscriptionStatus(null);
      setSubscriptionId(null);
      setSubscriptionDetails(null);
    }
  }, [user]);

  // Fetch subscription details when subscription ID changes
  useEffect(() => {
    const fetchSubscriptionDetails = async () => {
      if (!isAuthenticated || !subscriptionId) {
        setSubscriptionDetails(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await apiRequest('GET', `/api/subscriptions/${subscriptionId}`, undefined);
        const data = await response.json();
        setSubscriptionDetails(data);
      } catch (err: any) {
        console.error('Error fetching subscription details:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscriptionDetails();
  }, [isAuthenticated, subscriptionId]);

  const upgradeSubscription = async (subscriptionId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await apiRequest('POST', '/api/subscriptions/upgrade', { subscriptionId });
      
      // Refresh user profile to get updated subscription status
      await refetchProfile();
    } catch (err: any) {
      console.error('Error upgrading subscription:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const cancelSubscription = async () => {
    if (!subscriptionId) {
      setError('No active subscription to cancel');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await apiRequest('POST', '/api/subscriptions/cancel', { subscriptionId });
      
      // Refresh user profile to get updated subscription status
      await refetchProfile();
    } catch (err: any) {
      console.error('Error cancelling subscription:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshSubscription = async () => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    setError(null);

    try {
      // Refresh user profile to get updated subscription status
      await refetchProfile();
      
      // If there's a subscription ID, fetch the details
      if (user?.subscriptionId) {
        const response = await apiRequest('GET', `/api/subscriptions/${user.subscriptionId}`, undefined);
        const data = await response.json();
        setSubscriptionDetails(data);
      }
    } catch (err: any) {
      console.error('Error refreshing subscription:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SubscriptionContext.Provider
      value={{
        isPremium,
        subscriptionStatus,
        subscriptionId,
        subscriptionDetails,
        isLoading,
        error,
        upgradeSubscription,
        cancelSubscription,
        refreshSubscription,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};
