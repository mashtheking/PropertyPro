import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "./use-auth";
import { showRewardedAd, isRewardedAdAvailable, loadRewardedAd } from "@/lib/admob";
import { supabase } from "@/lib/supabase";
import { useToast } from "./use-toast";

interface AdRewardsContextType {
  adRewards: number;
  isAdAvailable: boolean;
  isAdLoading: boolean;
  showAdRewardVideo: () => Promise<void>;
  consumeRewards: (amount: number, feature: string) => Promise<boolean>;
  refreshRewards: () => Promise<void>;
}

const AdRewardsContext = createContext<AdRewardsContextType>({
  adRewards: 0,
  isAdAvailable: false,
  isAdLoading: false,
  showAdRewardVideo: async () => {},
  consumeRewards: async () => false,
  refreshRewards: async () => {},
});

export const AdRewardsProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [adRewards, setAdRewards] = useState(0);
  const [isAdAvailable, setIsAdAvailable] = useState(false);
  const [isAdLoading, setIsAdLoading] = useState(false);

  useEffect(() => {
    if (user) {
      // Initialize with user's current reward units
      setAdRewards(user.reward_units || 0);
      
      // Check ad availability
      setIsAdAvailable(isRewardedAdAvailable());
      
      // Preload an ad
      loadRewardedAd().then((available) => {
        setIsAdAvailable(available);
      });
      
      // Set up real-time subscription to user changes for reward units
      const subscription = supabase
        .channel('reward-units-changes')
        .on('postgres_changes', { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'users',
          filter: `id=eq.${user.id}`
        }, (payload) => {
          const updatedUser = payload.new;
          setAdRewards(updatedUser.reward_units || 0);
        })
        .subscribe();

      return () => {
        supabase.removeChannel(subscription);
      };
    } else {
      setAdRewards(0);
    }
  }, [user]);

  const showAdRewardVideo = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "You need to be logged in to watch reward ads.",
      });
      return;
    }

    if (!isAdAvailable) {
      toast({
        variant: "destructive",
        title: "No ads available",
        description: "There are no reward ads available right now. Please try again later.",
      });
      return;
    }

    try {
      setIsAdLoading(true);
      const newTotal = await showRewardedAd(user.id);
      setAdRewards(newTotal);
      
      toast({
        title: "Reward earned!",
        description: "You've earned 2 reward units for watching the ad.",
      });
      
      // Pre-load the next ad
      const nextAdAvailable = await loadRewardedAd();
      setIsAdAvailable(nextAdAvailable);
    } catch (error) {
      console.error('Error showing reward ad:', error);
      toast({
        variant: "destructive",
        title: "Failed to show ad",
        description: "There was an issue with the reward ad. Please try again.",
      });
    } finally {
      setIsAdLoading(false);
    }
  };

  const consumeRewards = async (amount: number, feature: string): Promise<boolean> => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "You need to be logged in to use reward units.",
      });
      return false;
    }

    if (adRewards < amount) {
      toast({
        variant: "destructive",
        title: "Not enough reward units",
        description: `You need ${amount} units to access this feature. Watch ads to earn more!`,
      });
      return false;
    }

    try {
      const response = await fetch('/api/rewards/consume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          units: amount,
          feature,
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to consume reward units');
      }

      const data = await response.json();
      setAdRewards(data.remainingUnits);
      
      toast({
        title: "Premium feature accessed",
        description: `You've used ${amount} reward units to access ${feature}.`,
      });
      
      return true;
    } catch (error) {
      console.error('Error consuming reward units:', error);
      toast({
        variant: "destructive",
        title: "Failed to use reward units",
        description: "There was an error processing your request. Please try again.",
      });
      return false;
    }
  };

  const refreshRewards = async () => {
    if (!user) {
      setAdRewards(0);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .select('reward_units')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching reward units:', error);
        return;
      }

      setAdRewards(data.reward_units || 0);
    } catch (error) {
      console.error('Error refreshing reward units:', error);
    }
  };

  return (
    <AdRewardsContext.Provider
      value={{
        adRewards,
        isAdAvailable,
        isAdLoading,
        showAdRewardVideo,
        consumeRewards,
        refreshRewards,
      }}
    >
      {children}
    </AdRewardsContext.Provider>
  );
};

export const useAdRewards = () => useContext(AdRewardsContext);
