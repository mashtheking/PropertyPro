import { User, Subscription, InsertSubscription } from '@shared/schema';
import { storage } from '../storage';
import { emailService } from './email';
import { addDays, addMonths, addYears } from 'date-fns';

const PAYPAL_API = 'https://api-m.sandbox.paypal.com';
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || 'AeIDhdfwwcQ7qfBWZ936c35BHsl7jHPfe9jy5_x6nkOIB_F9KBxpp0YJYbpvjD5bv0ym-D50uHOrIwN6';
const PAYPAL_SECRET = process.env.PAYPAL_SECRET || 'EKs5ZN1Fo-QGdbvj9_e9wcEgh_jtjj2_AUH0K_iOWDctHPfVJrhHFRBtT5o1UHYM1bf68pT_SnCqKCL5';

// Plan IDs - these would typically be defined in PayPal Developer Dashboard
const PLAN_MONTHLY = 'P-12345MONTHLY';
const PLAN_ANNUAL = 'P-12345ANNUAL';

interface PayPalAuthResponse {
  access_token: string;
  token_type: string;
  app_id: string;
  expires_in: number;
  nonce: string;
}

interface SubscriptionDetails {
  id: string;
  status: string;
  plan_id: string;
  start_time: string;
  create_time: string;
  subscriber: {
    email_address: string;
    name: {
      given_name: string;
      surname: string;
    }
  };
  billing_info: {
    next_billing_time: string;
    last_payment: {
      amount: {
        value: string;
        currency_code: string;
      };
      time: string;
    };
  };
}

export class PayPalService {
  private async getAccessToken(): Promise<string> {
    try {
      const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString('base64');
      const response = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${auth}`,
        },
        body: 'grant_type=client_credentials',
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('PayPal authentication failed:', errorData);
        throw new Error('Failed to authenticate with PayPal');
      }

      const data = await response.json() as PayPalAuthResponse;
      return data.access_token;
    } catch (error) {
      console.error('PayPal authentication error:', error);
      throw error;
    }
  }

  public async getSubscriptionDetails(subscriptionId: string): Promise<SubscriptionDetails> {
    try {
      const accessToken = await this.getAccessToken();
      const response = await fetch(`${PAYPAL_API}/v1/billing/subscriptions/${subscriptionId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('PayPal subscription details failed:', errorData);
        throw new Error('Failed to get subscription details from PayPal');
      }

      return await response.json() as SubscriptionDetails;
    } catch (error) {
      console.error('PayPal get subscription error:', error);
      throw error;
    }
  }

  public async cancelSubscription(subscriptionId: string, reason: string = 'Cancelled by user'): Promise<boolean> {
    try {
      const accessToken = await this.getAccessToken();
      const response = await fetch(`${PAYPAL_API}/v1/billing/subscriptions/${subscriptionId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('PayPal subscription cancellation failed:', errorData);
        throw new Error('Failed to cancel subscription with PayPal');
      }

      return true;
    } catch (error) {
      console.error('PayPal cancel subscription error:', error);
      throw error;
    }
  }

  public async verifyAndCreateSubscription(user: User, paypalSubscriptionId: string): Promise<Subscription> {
    try {
      // Get subscription details from PayPal
      const subscriptionDetails = await this.getSubscriptionDetails(paypalSubscriptionId);
      
      // Check if already exists in our database
      const existingSubscription = await storage.getSubscriptionByUserId(user.id);
      if (existingSubscription) {
        // Update existing subscription if it's the same one
        if (existingSubscription.paypalSubscriptionId === paypalSubscriptionId) {
          return existingSubscription;
        }
        
        // Otherwise, cancel the old one
        try {
          await this.cancelSubscription(existingSubscription.paypalSubscriptionId, 'Replaced by new subscription');
        } catch (error) {
          console.error('Failed to cancel old subscription', error);
          // Continue with new subscription anyway
        }
      }
      
      // Determine plan type
      const planType = subscriptionDetails.plan_id === PLAN_ANNUAL ? 'annual' : 'monthly';
      
      // Calculate relevant dates
      const startDate = new Date(subscriptionDetails.start_time);
      const nextBillingDate = subscriptionDetails.billing_info.next_billing_time 
        ? new Date(subscriptionDetails.billing_info.next_billing_time)
        : planType === 'annual' ? addYears(startDate, 1) : addMonths(startDate, 1);
      
      // Create new subscription record
      const newSubscription: InsertSubscription = {
        userId: user.id,
        paypalSubscriptionId,
        status: subscriptionDetails.status === 'ACTIVE' ? 'active' : subscriptionDetails.status.toLowerCase(),
        planType,
        startDate,
        nextBillingDate,
      };
      
      const subscription = await storage.createSubscription(newSubscription);
      
      // Update user's premium status
      await storage.updateUser(user.id, {
        isPremium: true,
        subscriptionStatus: 'active',
        subscriptionId: paypalSubscriptionId,
      });
      
      // Send confirmation email
      const user_updated = await storage.getUser(user.id);
      if (user_updated) {
        const planName = planType === 'annual' ? 'Annual Plan' : 'Monthly Plan';
        const amount = planType === 'annual' ? '$199.99/year' : '$19.99/month';
        emailService.sendSubscriptionConfirmation(user_updated, planName, amount, nextBillingDate);
      }
      
      return subscription;
    } catch (error) {
      console.error('Subscription verification error:', error);
      throw error;
    }
  }

  public async handleSubscriptionCancellation(user: User, subscriptionId: string): Promise<boolean> {
    try {
      // Cancel the subscription with PayPal
      await this.cancelSubscription(subscriptionId);
      
      // Get the subscription from our database
      const subscription = await storage.getSubscriptionByUserId(user.id);
      if (!subscription) {
        throw new Error('Subscription not found');
      }
      
      // Update subscription status in our database
      const endDate = subscription.nextBillingDate || addDays(new Date(), 30);
      await storage.updateSubscription(subscription.id, {
        status: 'cancelled',
        endDate,
      });
      
      // Update user's premium status at the end of the billing period
      // For now, we keep it active until the end date
      
      // Send cancellation email
      await emailService.sendSubscriptionCancellation(user, endDate);
      
      return true;
    } catch (error) {
      console.error('Subscription cancellation error:', error);
      throw error;
    }
  }
}

export const paypalService = new PayPalService();
