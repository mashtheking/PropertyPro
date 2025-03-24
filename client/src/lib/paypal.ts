// PayPal configuration
export const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID || 'AeIDhdfwwcQ7qfBWZ936c35BHsl7jHPfe9jy5_x6nkOIB_F9KBxpp0YJYbpvjD5bv0ym-D50uHOrIwN6';

// Load the PayPal script
export const loadPayPalScript = (callback: () => void) => {
  // Don't load the script if it's already there
  if (document.querySelector('script[src*="paypal"]')) {
    if (window.paypal) {
      callback();
    }
    return;
  }

  const script = document.createElement('script');
  script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD&intent=subscription`;
  script.addEventListener('load', callback);
  script.setAttribute('data-namespace', 'paypalSDK');
  document.body.appendChild(script);
};

// Initialize the subscription button
export const initSubscriptionButton = (
  buttonContainerId: string,
  planId: string,
  onSuccess: (details: any) => void,
  onError: (error: any) => void
) => {
  if (!window.paypal) {
    console.error('PayPal script not loaded');
    return;
  }

  window.paypal.Buttons({
    style: {
      shape: 'rect',
      color: 'blue',
      layout: 'vertical',
      label: 'subscribe'
    },
    createSubscription: (data: any, actions: any) => {
      return actions.subscription.create({
        'plan_id': planId
      });
    },
    onApprove: (data: any, actions: any) => {
      onSuccess(data);
    },
    onError: (err: any) => {
      onError(err);
    }
  }).render(`#${buttonContainerId}`);
};

// Types for TypeScript
declare global {
  interface Window {
    paypal: any;
  }
}
