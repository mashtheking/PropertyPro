import { useState, useEffect, useCallback } from 'react';

declare global {
  interface Window {
    paypal?: {
      Buttons: (config: any) => {
        render: (container: string) => void;
      };
    };
  }
}

type PayPalOptions = {
  clientId: string;
  currency?: string;
  intent?: string;
};

type SubscriptionOptions = {
  planId: string;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  onCancel?: () => void;
};

export const usePayPal = (options: PayPalOptions) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clientId = options.clientId || 'AeIDhdfwwcQ7qfBWZ936c35BHsl7jHPfe9jy5_x6nkOIB_F9KBxpp0YJYbpvjD5bv0ym-D50uHOrIwN6';
  const currency = options.currency || 'USD';

  useEffect(() => {
    // Load the PayPal SDK script
    const loadPayPalScript = () => {
      const script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=${currency}&intent=subscription`;
      script.async = true;

      script.onload = () => {
        setLoaded(true);
      };

      script.onerror = () => {
        setError('Failed to load PayPal SDK');
      };

      document.body.appendChild(script);
    };

    if (!window.paypal) {
      loadPayPalScript();
    } else {
      setLoaded(true);
    }

    return () => {
      // Cleanup if component unmounts during loading
      const script = document.querySelector('script[src*="paypal.com/sdk/js"]');
      if (script) {
        document.body.removeChild(script);
      }
    };
  }, [clientId, currency]);

  const createSubscription = useCallback(
    (containerSelector: string, subscriptionOptions: SubscriptionOptions) => {
      if (!loaded || !window.paypal) {
        console.error('PayPal SDK not loaded yet');
        return;
      }

      const { planId, onSuccess, onError, onCancel } = subscriptionOptions;

      try {
        window.paypal.Buttons({
          style: {
            layout: 'vertical',
            color: 'blue',
            shape: 'rect',
            label: 'subscribe',
          },
          createSubscription: async (data: any, actions: any) => {
            return actions.subscription.create({
              plan_id: planId,
            });
          },
          onApprove: async (data: any, actions: any) => {
            if (onSuccess) {
              // Call API to verify and update user's subscription status
              const verifyResponse = await fetch('/api/subscriptions/verify', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ subscriptionId: data.subscriptionID }),
                credentials: 'include',
              });
              
              if (verifyResponse.ok) {
                const verificationData = await verifyResponse.json();
                onSuccess({ ...data, ...verificationData });
              } else {
                if (onError) {
                  onError('Failed to verify subscription');
                }
              }
            }
          },
          onError: (err: any) => {
            console.error('PayPal error:', err);
            if (onError) {
              onError(err);
            }
          },
          onCancel: () => {
            if (onCancel) {
              onCancel();
            }
          },
        }).render(containerSelector);
      } catch (err: any) {
        console.error('Error creating PayPal buttons:', err);
        setError(err.message);
      }
    },
    [loaded]
  );

  const cancelSubscription = useCallback(async (subscriptionId: string) => {
    try {
      const response = await fetch('/api/subscriptions/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subscriptionId }),
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to cancel subscription');
      }
      
      return await response.json();
    } catch (err: any) {
      console.error('Error cancelling subscription:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  return {
    loaded,
    error,
    createSubscription,
    cancelSubscription,
  };
};
