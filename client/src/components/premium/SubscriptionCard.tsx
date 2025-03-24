import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Crown, Check, AlertCircle } from 'lucide-react';
import { usePremium } from '@/hooks/useSubscription';
import { loadPayPalScript, initSubscriptionButton } from '@/lib/paypal';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionCardProps {
  title: string;
  price: string;
  description: string;
  features: string[];
  isPremium?: boolean;
  planId: string;
}

const SubscriptionCard = ({
  title,
  price,
  description,
  features,
  isPremium = false,
  planId
}: SubscriptionCardProps) => {
  const { isPremium: userIsPremium, subscribe, cancelSubscription } = usePremium();
  const { toast } = useToast();
  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  // Load PayPal script
  useEffect(() => {
    if (!paypalLoaded && !userIsPremium) {
      loadPayPalScript(() => {
        setPaypalLoaded(true);
      });
    }
  }, [paypalLoaded, userIsPremium]);

  // Initialize PayPal buttons
  useEffect(() => {
    if (paypalLoaded && !userIsPremium) {
      const paypalContainerId = `paypal-button-container-${planId}`;
      
      initSubscriptionButton(
        paypalContainerId,
        planId,
        // Success callback
        async (details) => {
          try {
            setIsSubscribing(true);
            // Process the subscription
            await subscribe(details.subscriptionID);
            
            toast({
              title: 'Subscription Successful',
              description: 'You are now a premium user!',
            });
          } catch (error) {
            console.error('Subscription error:', error);
            toast({
              title: 'Subscription Error',
              description: 'There was an error processing your subscription. Please try again.',
              variant: 'destructive',
            });
          } finally {
            setIsSubscribing(false);
          }
        },
        // Error callback
        (error) => {
          console.error('PayPal error:', error);
          toast({
            title: 'PayPal Error',
            description: 'There was an error with PayPal. Please try again.',
            variant: 'destructive',
          });
          setIsSubscribing(false);
        }
      );
    }
  }, [paypalLoaded, userIsPremium, planId, subscribe, toast]);

  // Handle subscription cancellation
  const handleCancelSubscription = async () => {
    if (window.confirm('Are you sure you want to cancel your subscription? You will lose premium access at the end of your billing period.')) {
      try {
        setIsCancelling(true);
        await cancelSubscription();
        toast({
          title: 'Subscription Cancelled',
          description: 'Your subscription has been cancelled. You will have premium access until the end of your billing period.',
        });
      } catch (error) {
        console.error('Cancellation error:', error);
        toast({
          title: 'Cancellation Error',
          description: 'There was an error cancelling your subscription. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsCancelling(false);
      }
    }
  };

  return (
    <Card className={`w-full ${isPremium ? 'border-premium-500 shadow-lg' : ''}`}>
      <CardHeader>
        {isPremium && (
          <Badge className="mb-2 w-fit bg-premium-600">
            PREMIUM
          </Badge>
        )}
        <CardTitle className="text-2xl font-bold">{title}</CardTitle>
        <div className="flex items-baseline">
          <span className="text-3xl font-bold">{price}</span>
          <span className="ml-1 text-gray-500">/month</span>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="flex flex-col">
        {userIsPremium ? (
          <>
            {isPremium ? (
              <>
                <Badge className="mb-4 bg-green-100 text-green-800 hover:bg-green-100">
                  Current Plan
                </Badge>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={handleCancelSubscription}
                  disabled={isCancelling}
                >
                  {isCancelling ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Cancelling...
                    </div>
                  ) : (
                    "Cancel Subscription"
                  )}
                </Button>
              </>
            ) : (
              <div className="flex items-center text-gray-500">
                <AlertCircle className="h-5 w-5 mr-2" />
                <span>You already have a premium subscription</span>
              </div>
            )}
          </>
        ) : (
          <>
            {isSubscribing ? (
              <Button disabled className="w-full mb-4">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </Button>
            ) : isPremium ? (
              <>
                <div id={`paypal-button-container-${planId}`} className="w-full mb-4"></div>
                <Button className="w-full bg-premium-600 hover:bg-premium-700">
                  <Crown className="mr-2 h-4 w-4" />
                  Subscribe Now
                </Button>
              </>
            ) : (
              <Button variant="outline" className="w-full" disabled>
                Free Plan (Current)
              </Button>
            )}
          </>
        )}
      </CardFooter>
    </Card>
  );
};

export default SubscriptionCard;
