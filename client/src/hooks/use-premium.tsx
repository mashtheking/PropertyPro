import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "./use-auth";
import { checkSubscriptionStatus } from "@/lib/paypal";
import { supabase } from "@/lib/supabase";

interface PremiumContextType {
  isPremiumUser: boolean;
  premiumUntil: Date | null;
  isModalOpen: boolean;
  openUpgradeModal: () => void;
  closeUpgradeModal: () => void;
  refreshPremiumStatus: () => Promise<void>;
}

const PremiumContext = createContext<PremiumContextType>({
  isPremiumUser: false,
  premiumUntil: null,
  isModalOpen: false,
  openUpgradeModal: () => {},
  closeUpgradeModal: () => {},
  refreshPremiumStatus: async () => {},
});

export const PremiumProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [isPremiumUser, setIsPremiumUser] = useState(false);
  const [premiumUntil, setPremiumUntil] = useState<Date | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      // Check premium status from user data
      setIsPremiumUser(!!user.is_premium);
      setPremiumUntil(user.premium_until ? new Date(user.premium_until) : null);
      
      // Set up real-time subscription to user changes
      const subscription = supabase
        .channel('premium-status-changes')
        .on('postgres_changes', { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'users',
          filter: `id=eq.${user.id}`
        }, (payload) => {
          const updatedUser = payload.new;
          setIsPremiumUser(!!updatedUser.is_premium);
          setPremiumUntil(updatedUser.premium_until ? new Date(updatedUser.premium_until) : null);
        })
        .subscribe();

      return () => {
        supabase.removeChannel(subscription);
      };
    } else {
      setIsPremiumUser(false);
      setPremiumUntil(null);
    }
  }, [user]);

  const refreshPremiumStatus = async () => {
    if (!user) {
      setIsPremiumUser(false);
      setPremiumUntil(null);
      return;
    }

    try {
      // Get the latest subscription info
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error || !data) {
        setIsPremiumUser(false);
        setPremiumUntil(null);
        return;
      }

      // Check if the subscription is still active
      const isActive = await checkSubscriptionStatus(data.paypal_subscription_id);
      setIsPremiumUser(isActive);
      setPremiumUntil(isActive ? new Date(data.end_date) : null);

      // Update the user record if necessary
      if (isActive !== !!user.is_premium) {
        await supabase
          .from('users')
          .update({
            is_premium: isActive,
            premium_until: isActive ? data.end_date : null,
          })
          .eq('id', user.id);
      }
    } catch (error) {
      console.error('Error refreshing premium status:', error);
    }
  };

  const openUpgradeModal = () => {
    setIsModalOpen(true);
  };

  const closeUpgradeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <PremiumContext.Provider 
      value={{
        isPremiumUser,
        premiumUntil,
        isModalOpen,
        openUpgradeModal,
        closeUpgradeModal,
        refreshPremiumStatus,
      }}
    >
      {children}
    </PremiumContext.Provider>
  );
};

export const usePremium = () => useContext(PremiumContext);
