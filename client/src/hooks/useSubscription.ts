import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { subscriptionService } from '@/services/subscriptionService';
import { useAuth } from './useAuth';

export const useSubscription = () => {
  const queryClient = useQueryClient();
  const { user, fetchCurrentUser } = useAuth();
  const [isPremium, setIsPremium] = useState(user?.isPremium || false);
  const [expiresAt, setExpiresAt] = useState<string | null>(user?.premiumExpiresAt || null);
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);

  // Fetch subscription status
  const fetchSubscriptionStatus = useCallback(async () => {
    try {
      const data = await subscriptionService.getSubscriptionStatus();
      setIsPremium(data.isPremium);
      setExpiresAt(data.premiumExpiresAt || null);
      setSubscriptionId(data.subscription?.paypalSubscriptionId || null);
      return data;
    } catch (error) {
      console.error('Error fetching subscription status:', error);
      throw error;
    }
  }, []);

  // Use react-query to fetch subscription status
  const { isLoading, error, data } = useQuery({ 
    queryKey: ['/api/subscription'],
    queryFn: fetchSubscriptionStatus,
    enabled: false, // Disable auto-fetching
  });

  // Create subscription mutation
  const createSubscriptionMutation = useMutation({
    mutationFn: (paypalSubscriptionId: string) => {
      return subscriptionService.createSubscription(paypalSubscriptionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/subscription'] });
      fetchSubscriptionStatus(); // Refresh subscription status
      fetchCurrentUser(); // Refresh user data
    },
  });

  // Cancel subscription mutation
  const cancelSubscriptionMutation = useMutation({
    mutationFn: () => {
      return subscriptionService.cancelSubscription();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/subscription'] });
      fetchSubscriptionStatus(); // Refresh subscription status
    },
  });

  // Helper methods that use the mutations
  const subscribe = async (paypalSubscriptionId: string) => {
    return createSubscriptionMutation.mutateAsync(paypalSubscriptionId);
  };

  const cancelSubscription = async () => {
    return cancelSubscriptionMutation.mutateAsync();
  };

  // Check if a feature is accessible
  const checkFeatureAccess = useCallback(async (featureName: string) => {
    try {
      const data = await subscriptionService.checkFeatureAccess(featureName);
      return data;
    } catch (error) {
      console.error(`Error checking feature access for ${featureName}:`, error);
      throw error;
    }
  }, []);

  return {
    isPremium,
    expiresAt,
    subscriptionId,
    isLoading: isLoading || createSubscriptionMutation.isPending || cancelSubscriptionMutation.isPending,
    error,
    fetchSubscriptionStatus,
    subscribe,
    cancelSubscription,
    checkFeatureAccess,
  };
};

// Export a simple hook for checking premium status
export const usePremium = () => {
  const { 
    isPremium, 
    expiresAt, 
    isLoading, 
    subscribe, 
    cancelSubscription,
    checkFeatureAccess
  } = useSubscription();

  return { 
    isPremium, 
    expiresAt, 
    isLoading,
    subscribe,
    cancelSubscription,
    checkFeatureAccess
  };
};
