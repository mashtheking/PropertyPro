import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useSubscription } from '@/contexts/subscription-context';
import { usePayPal } from '@/hooks/use-paypal';
import { useToast } from '@/hooks/use-toast';
import { formatDate } from '@/lib/utils';

const Subscription = () => {
  const { isPremium, subscriptionStatus, subscriptionId, subscriptionDetails, cancelSubscription, refreshSubscription } = useSubscription();
  const { loaded: paypalLoaded, createSubscription } = usePayPal({
    clientId: 'AeIDhdfwwcQ7qfBWZ936c35BHsl7jHPfe9jy5_x6nkOIB_F9KBxpp0YJYbpvjD5bv0ym-D50uHOrIwN6'
  });
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const paypalButtonContainerRef = useRef<HTMLDivElement>(null);

  // Plans configuration
  const plans = [
    {
      id: 'P-123456789', // Replace with actual PayPal plan ID
      name: 'Monthly Plan',
      price: '$19.99',
      period: 'month',
      features: [
        'Unlimited properties, clients, and appointments',
        'No ads or reward units needed',
        'Advanced analytics and reporting',
        'Bulk actions and data export',
        'Custom branding',
        'Priority support'
      ]
    },
    {
      id: 'P-987654321', // Replace with actual PayPal plan ID
      name: 'Annual Plan',
      price: '$199.99',
      period: 'year',
      savePercentage: 16,
      features: [
        'Everything in the Monthly Plan',
        'Save 16% compared to monthly billing',
        'Enhanced analytics dashboard',
        'API access for custom integrations'
      ]
    }
  ];

  const [selectedPlan, setSelectedPlan] = useState(plans[0]);

  // Initialize PayPal button when component mounts
  useEffect(() => {
    if (paypalLoaded && paypalButtonContainerRef.current && !isPremium) {
      // Clear previous buttons
      paypalButtonContainerRef.current.innerHTML = '';
      
      createSubscription('#paypal-button-container', {
        planId: selectedPlan.id,
        onSuccess: (data) => {
          toast({
            title: 'Subscription successful!',
            description: `You are now subscribed to the ${selectedPlan.name}`,
          });
          refreshSubscription();
        },
        onError: (error) => {
          toast({
            variant: 'destructive',
            title: 'Subscription failed',
            description: error.message || 'An error occurred during the subscription process',
          });
        },
        onCancel: () => {
          toast({
            title: 'Subscription cancelled',
            description: 'You have cancelled the subscription process',
          });
        },
      });
    }
  }, [paypalLoaded, selectedPlan, isPremium]);

  const handleCancelSubscription = async () => {
    if (!subscriptionId) return;
    
    if (window.confirm('Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing period.')) {
      setIsLoading(true);
      try {
        await cancelSubscription();
        toast({
          title: 'Subscription cancelled',
          description: 'Your subscription has been cancelled successfully. You will have access to premium features until the end of your billing period.',
        });
      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error.message || 'An error occurred while cancelling your subscription',
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-neutral-900">Subscription</h1>
      </div>

      {isPremium ? (
        <Card>
          <CardHeader>
            <CardTitle>Current Subscription</CardTitle>
            <CardDescription>You are currently on the premium plan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-primary-50 p-4 rounded-lg mb-4">
              <div className="flex items-center">
                <span className="material-icons text-primary-600 mr-2">star</span>
                <h3 className="text-lg font-semibold text-primary-700">Premium Subscription</h3>
              </div>
              <p className="text-sm text-primary-600 mt-1">
                Enjoy all premium features without limitations
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Plan</span>
                <span className="text-sm">{subscriptionDetails?.planType || 'Premium'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Status</span>
                <span className="text-sm capitalize">{subscriptionStatus || 'Active'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Start Date</span>
                <span className="text-sm">{subscriptionDetails?.startDate ? formatDate(subscriptionDetails.startDate) : 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Next Billing Date</span>
                <span className="text-sm">{subscriptionDetails?.nextBillingDate ? formatDate(subscriptionDetails.nextBillingDate) : 'N/A'}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-4">
            <Button variant="outline" onClick={() => window.open('https://www.paypal.com/myaccount/autopay/', '_blank')}>
              Manage Payment Method
            </Button>
            <Button variant="destructive" onClick={handleCancelSubscription} disabled={isLoading}>
              {isLoading ? 'Cancelling...' : 'Cancel Subscription'}
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Upgrade to Premium</CardTitle>
              <CardDescription>Choose a subscription plan to unlock all premium features</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue={plans[0].id} onValueChange={(value) => setSelectedPlan(plans.find(plan => plan.id === value) || plans[0])}>
                <TabsList className="grid grid-cols-2 mb-6">
                  {plans.map((plan) => (
                    <TabsTrigger key={plan.id} value={plan.id}>{plan.name}</TabsTrigger>
                  ))}
                </TabsList>
                
                {plans.map((plan) => (
                  <TabsContent key={plan.id} value={plan.id} className="space-y-4">
                    <div className="bg-primary-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-bold text-primary-700">{plan.price}</h3>
                          <p className="text-sm text-primary-600">per {plan.period}</p>
                        </div>
                        {plan.savePercentage && (
                          <div className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                            Save {plan.savePercentage}%
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium">Features:</h4>
                      <ul className="space-y-1">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-center">
                            <span className="material-icons text-green-500 mr-2 text-sm">check_circle</span>
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div id="paypal-button-container" ref={paypalButtonContainerRef} className="mt-6">
                      {!paypalLoaded && (
                        <div className="text-center py-4">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"></div>
                          <p className="mt-2 text-sm text-neutral-500">Loading payment options...</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
          
          <div className="bg-neutral-100 p-4 rounded-lg text-sm">
            <h3 className="font-medium mb-2">Why upgrade to Premium?</h3>
            <ul className="space-y-1">
              <li className="flex items-start">
                <span className="material-icons text-primary-500 mr-2 text-sm">star</span>
                <span>Access all features without watching ads or spending reward units</span>
              </li>
              <li className="flex items-start">
                <span className="material-icons text-primary-500 mr-2 text-sm">insights</span>
                <span>Advanced analytics and reporting to grow your business</span>
              </li>
              <li className="flex items-start">
                <span className="material-icons text-primary-500 mr-2 text-sm">auto_awesome</span>
                <span>Custom branding and white-label options</span>
              </li>
              <li className="flex items-start">
                <span className="material-icons text-primary-500 mr-2 text-sm">support_agent</span>
                <span>Priority support for any questions or issues</span>
              </li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
};

export default Subscription;
