import { loadScript } from "@paypal/paypal-js";
import { supabase, upgradeUserToPremium } from "./supabase";

// PayPal configuration
const PAYPAL_CLIENT_ID = 'AeIDhdfwwcQ7qfBWZ936c35BHsl7jHPfe9jy5_x6nkOIB_F9KBxpp0YJYbpvjD5bv0ym-D50uHOrIwN6';
// Use the client ID from .env if available, otherwise use the hardcoded one
const clientId = process.env.PAYPAL_CLIENT_ID || PAYPAL_CLIENT_ID;

// Set up subscription pricing and details
export const SUBSCRIPTION_PLANS = {
  MONTHLY: {
    planId: 'P-MONTHLY',
    displayName: 'Monthly Premium',
    price: '$9.99',
    period: 'month',
    description: 'Premium access to all features with monthly billing',
    durationMonths: 1,
  },
  ANNUAL: {
    planId: 'P-ANNUAL',
    displayName: 'Annual Premium',
    price: '$99.99',
    period: 'year',
    description: 'Premium access to all features with annual billing (save 17%)',
    durationMonths: 12,
  }
};

/**
 * Load the PayPal SDK
 */
export async function loadPayPalSDK() {
  try {
    return await loadScript({
      "client-id": clientId,
      currency: "USD",
      intent: "subscription",
    });
  } catch (error) {
    console.error("Failed to load PayPal SDK:", error);
    throw error;
  }
}

/**
 * Initialize PayPal subscription buttons
 */
export function initPayPalSubscription(
  buttonContainerId: string,
  planType: keyof typeof SUBSCRIPTION_PLANS,
  userId: number,
  onSuccess: (subscriptionId: string) => void,
  onError: (error: Error) => void
) {
  loadPayPalSDK()
    .then((paypal) => {
      if (!paypal?.Buttons) {
        throw new Error('PayPal Buttons not available');
      }

      const plan = SUBSCRIPTION_PLANS[planType];
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + plan.durationMonths);

      paypal.Buttons({
        style: {
          shape: 'pill',
          color: 'blue',
          layout: 'vertical',
          label: 'subscribe',
        },
        createSubscription: function(data: any, actions: any) {
          // This is a mock subscription creation for development purposes
          // In production, you would create a real subscription with the PayPal API
          return Promise.resolve(`SUB-${Date.now()}`);
        },
        onApprove: async function(data: any, actions: any) {
          try {
            // data.subscriptionID contains the subscription ID
            const subscriptionId = data.subscriptionID || `SUB-${Date.now()}`;
            
            // Update user's premium status in the database
            await upgradeUserToPremium(userId, subscriptionId, endDate);
            
            // Call the success callback
            onSuccess(subscriptionId);
          } catch (error) {
            console.error('Subscription processing error:', error);
            onError(error as Error);
          }
        },
        onError: function(err: any) {
          console.error('PayPal error:', err);
          onError(new Error('PayPal subscription failed'));
        }
      }).render(`#${buttonContainerId}`);
    })
    .catch((error) => {
      console.error('Error loading PayPal SDK:', error);
      onError(new Error('Failed to load PayPal. Please try again later.'));
    });
}

/**
 * Check if a subscription is active
 */
export async function checkSubscriptionStatus(subscriptionId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('paypal_subscription_id', subscriptionId)
      .eq('status', 'active')
      .single();

    if (error) {
      console.error('Subscription status check error:', error);
      return false;
    }

    if (!data) {
      return false;
    }

    // Check if subscription is expired
    const endDate = new Date(data.end_date);
    const now = new Date();
    return endDate > now;
  } catch (error) {
    console.error('Error checking subscription:', error);
    return false;
  }
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(subscriptionId: string, userId: number): Promise<boolean> {
  try {
    // In a real implementation, this would call the PayPal API to cancel the subscription
    // Here we'll just update our database records
    
    const { error: subError } = await supabase
      .from('subscriptions')
      .update({
        status: 'cancelled',
        end_date: new Date().toISOString(),
      })
      .eq('paypal_subscription_id', subscriptionId)
      .eq('user_id', userId);

    if (subError) {
      console.error('Subscription cancellation error:', subError);
      return false;
    }

    const { error: userError } = await supabase
      .from('users')
      .update({
        is_premium: false,
        premium_until: null,
      })
      .eq('id', userId);

    if (userError) {
      console.error('User premium status update error:', userError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    return false;
  }
}
