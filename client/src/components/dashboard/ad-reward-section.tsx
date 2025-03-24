import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useReward } from '@/contexts/reward-context';
import { useToast } from '@/hooks/use-toast';

export const AdRewardSection: React.FC = () => {
  const { rewardUnits, watchAd, isLoading } = useReward();
  const { toast } = useToast();
  const [adProgress, setAdProgress] = useState<'idle' | 'loading' | 'watching' | 'completed'>('idle');

  const handleWatchAd = async () => {
    setAdProgress('loading');
    
    // Simulate ad loading
    toast({
      title: 'Loading advertisement...',
      description: 'Please wait while we prepare the ad.',
    });
    
    // Simulate a brief loading period
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setAdProgress('watching');
    
    // Simulate watching the ad
    toast({
      title: 'Watching advertisement',
      description: 'Please watch the entire ad to earn reward units.',
    });
    
    // Simulate ad duration
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const success = await watchAd();
    
    if (success) {
      setAdProgress('completed');
      toast({
        title: 'Rewards earned!',
        description: 'You earned 2 reward units. Thank you for watching!',
        variant: 'success',
      });
    } else {
      setAdProgress('idle');
      toast({
        title: 'Ad viewing failed',
        description: 'Sorry, there was an issue with the ad. Please try again later.',
        variant: 'destructive',
      });
    }
    
    // Reset state after a delay
    setTimeout(() => setAdProgress('idle'), 2000);
  };

  return (
    <Card>
      <CardHeader className="px-4 py-5 border-b border-neutral-200 sm:px-6">
        <CardTitle className="text-lg font-medium leading-6 text-neutral-900">Earn Reward Units</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="text-center md:text-left mb-4 md:mb-0">
            <p className="text-neutral-600 mb-2">
              Watch a short ad to earn reward units and unlock premium features temporarily.
            </p>
            <div className="flex items-center justify-center md:justify-start">
              <span className="material-icons text-yellow-500 mr-1">stars</span>
              <span className="text-sm font-medium">Current balance: {rewardUnits} reward {rewardUnits === 1 ? 'unit' : 'units'}</span>
            </div>
          </div>
          <Button
            onClick={handleWatchAd}
            disabled={isLoading || adProgress !== 'idle'}
            className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 px-4 rounded-md shadow-sm flex items-center"
          >
            <span className="material-icons mr-2">
              {adProgress === 'idle' ? 'play_circle' : 
               adProgress === 'loading' ? 'hourglass_top' :
               adProgress === 'watching' ? 'visibility' : 'check_circle'}
            </span>
            {adProgress === 'idle' ? 'Watch Ad (+2 Units)' : 
             adProgress === 'loading' ? 'Loading Ad...' :
             adProgress === 'watching' ? 'Watching Ad...' : 'Reward Earned!'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
