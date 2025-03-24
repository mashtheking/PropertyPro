import { useState, useEffect } from 'react';
import { Crown, Gem } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { usePremium } from '@/hooks/useSubscription';
import SubscriptionCard from '@/components/premium/SubscriptionCard';
import { useRewardUnits } from '@/hooks/useRewardUnits';

const Subscription = () => {
  const { isPremium, expiresAt, isLoading } = usePremium();
  const { rewardUnits } = useRewardUnits();
  const { toast } = useToast();
  
  if (isLoading) {
    return (
      <div className="flex justify-center my-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-700"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Subscription</h1>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Your Subscription Status</CardTitle>
          <CardDescription>
            {isPremium 
              ? "You currently have a premium subscription." 
              : "You're using the free plan. Upgrade to premium for additional features."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-full ${isPremium ? 'bg-premium-100' : 'bg-gray-100'}`}>
              {isPremium 
                ? <Crown className="h-6 w-6 text-premium-600" /> 
                : <Gem className="h-6 w-6 text-primary-600" />}
            </div>
            <div>
              <div className="flex items-center">
                <h3 className="text-lg font-medium">
                  {isPremium ? 'Premium' : 'Free'}
                </h3>
                <Badge className={`ml-2 ${isPremium ? 'bg-premium-100 text-premium-600' : 'bg-gray-100 text-gray-600'}`}>
                  {isPremium ? 'PREMIUM' : 'FREE'}
                </Badge>
              </div>
              {isPremium && expiresAt && (
                <p className="text-sm text-gray-500">
                  Your premium subscription is active until {new Date(expiresAt).toLocaleDateString()}.
                </p>
              )}
              {!isPremium && (
                <p className="text-sm text-gray-500">
                  You have {rewardUnits} reward units. Earn more by watching ads.
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <h2 className="text-xl font-semibold mb-4">Subscription Plans</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Free Plan */}
        <SubscriptionCard
          title="Free"
          price="$0"
          description="Basic access with limited features"
          features={[
            "Unlimited property listings",
            "Unlimited client management",
            "Unlimited appointments",
            "Basic CRM functionality",
            "Use reward units to unlock premium features temporarily",
            "Email notifications for appointments"
          ]}
          isPremium={false}
          planId="free-plan"
        />

        {/* Premium Plan */}
        <SubscriptionCard
          title="Premium"
          price="$9.99"
          description="Full access to all features without ads"
          features={[
            "All features from Free plan",
            "No ads or reward unit requirements",
            "Advanced analytics dashboard",
            "Bulk import/export capabilities",
            "Custom branding options",
            "Priority email support"
          ]}
          isPremium={true}
          planId="P-5ML4271244454362WMRKQFSA"
        />
      </div>
    </div>
  );
};

export default Subscription;
