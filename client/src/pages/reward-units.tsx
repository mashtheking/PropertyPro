import { useState } from 'react';
import { useRewardUnits } from '@/hooks/useRewardUnits';
import { usePremium } from '@/hooks/useSubscription';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'wouter';
import { Gem, Crown, Video, Lock, CheckCircle2 } from 'lucide-react';
import AdMobRewardModal from '@/components/premium/AdMobRewardModal';
import { showRewardedAd } from '@/lib/admob';

const RewardUnits = () => {
  const { rewardUnits, addRewardUnits, isLoading } = useRewardUnits();
  const { isPremium } = usePremium();
  const { toast } = useToast();
  const [isAdModalOpen, setIsAdModalOpen] = useState(false);
  const [currentFeature, setCurrentFeature] = useState('');
  const [isWatchingAd, setIsWatchingAd] = useState(false);

  // Calculate progress towards premium
  const progressPercentage = Math.min(100, (rewardUnits / 30) * 100);

  // Premium features that can be unlocked with reward units
  const premiumFeatures = [
    {
      name: 'Advanced Analytics',
      description: 'Get detailed analytics about your properties and clients',
      icon: <CheckCircle2 className="h-6 w-6 text-green-500" />,
      unitsRequired: 5
    },
    {
      name: 'Bulk Actions',
      description: 'Perform operations on multiple listings at once',
      icon: <CheckCircle2 className="h-6 w-6 text-blue-500" />,
      unitsRequired: 8
    },
    {
      name: 'Custom Branding',
      description: 'Add your logo and brand colors to reports and emails',
      icon: <CheckCircle2 className="h-6 w-6 text-purple-500" />,
      unitsRequired: 10
    }
  ];

  const handleEarnRewardUnits = () => {
    if (isPremium) {
      toast({
        title: 'Premium User',
        description: 'As a premium user, you already have access to all features!',
      });
      return;
    }

    setIsWatchingAd(true);
    
    showRewardedAd(
      // Ad loaded callback
      () => {
        console.log('Ad loaded successfully');
      },
      // Ad failed to load callback
      (error) => {
        console.error('Ad failed to load:', error);
        setIsWatchingAd(false);
        toast({
          title: 'Ad Failed to Load',
          description: 'Please try again later.',
          variant: 'destructive',
        });
      },
      // Rewarded callback
      (rewardAmount) => {
        console.log(`User earned reward: ${rewardAmount} units`);
        // Add the reward units to the user's balance
        addRewardUnits(rewardAmount);
        
        toast({
          title: 'Reward Earned',
          description: `You earned ${rewardAmount} reward units!`,
        });
      },
      // Ad closed callback
      () => {
        console.log('Ad closed');
        setIsWatchingAd(false);
      }
    );
  };
  
  const openFeatureModal = (featureName: string) => {
    if (isPremium) {
      toast({
        title: 'Premium Feature',
        description: 'As a premium user, you already have access to this feature!',
      });
      return;
    }
    
    setCurrentFeature(featureName);
    setIsAdModalOpen(true);
  };

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
        <h1 className="text-2xl font-bold tracking-tight">Reward Units</h1>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Your Reward Units</CardTitle>
          <CardDescription>
            {isPremium 
              ? "As a premium user, you have access to all features without needing reward units." 
              : "Earn reward units by watching ads and use them to unlock premium features temporarily."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-full bg-primary-100">
                  <Gem className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium">Current Balance</h3>
                  <p className="text-2xl font-bold">{rewardUnits} units</p>
                </div>
              </div>
              
              {!isPremium && (
                <Button 
                  onClick={handleEarnRewardUnits}
                  disabled={isWatchingAd}
                >
                  {isWatchingAd ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Loading Ad...
                    </div>
                  ) : (
                    <>
                      <Video className="mr-2 h-4 w-4" />
                      Earn More Units
                    </>
                  )}
                </Button>
              )}
            </div>
            
            {!isPremium && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress to Premium</span>
                  <span>{rewardUnits}/30 units</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
                <p className="text-xs text-gray-500">
                  Collect 30 reward units to unlock a free premium upgrade!
                </p>
              </div>
            )}
          </div>
        </CardContent>
        {!isPremium && (
          <CardFooter className="bg-gray-50 px-6 py-4 flex justify-between">
            <span className="text-sm text-gray-500">Want unlimited access to all features?</span>
            <Link href="/subscription">
              <Button variant="outline" size="sm">
                <Crown className="mr-2 h-4 w-4" />
                Upgrade to Premium
              </Button>
            </Link>
          </CardFooter>
        )}
      </Card>

      <h2 className="text-xl font-semibold mb-4">Premium Features</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {premiumFeatures.map((feature) => (
          <Card key={feature.name} className="relative overflow-hidden">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex flex-col">
                  <CardTitle>{feature.name}</CardTitle>
                  <CardDescription className="mt-2">{feature.description}</CardDescription>
                </div>
                {feature.icon}
              </div>
            </CardHeader>
            <CardContent>
              {isPremium ? (
                <Badge className="bg-premium-100 text-premium-600">
                  Premium Feature - Available
                </Badge>
              ) : (
                <div className="flex items-center space-x-2">
                  <Gem className="h-4 w-4 text-primary-600" />
                  <span>{feature.unitsRequired} units required</span>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                variant={isPremium ? "default" : "outline"}
                className="w-full"
                onClick={() => openFeatureModal(feature.name)}
              >
                {isPremium ? (
                  <>Access Feature</>
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Unlock with Units
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* AdMob Reward Modal */}
      <AdMobRewardModal
        isOpen={isAdModalOpen}
        onClose={() => setIsAdModalOpen(false)}
        featureName={currentFeature}
        unitsRequired={premiumFeatures.find(f => f.name === currentFeature)?.unitsRequired || 5}
        onRewardEarned={() => {
          toast({
            title: 'Reward Earned',
            description: 'You earned reward units to unlock premium features!',
          });
        }}
        onUpgradeClick={() => {
          setIsAdModalOpen(false);
          navigate('/subscription');
        }}
      />
    </div>
  );
};

export default RewardUnits;
