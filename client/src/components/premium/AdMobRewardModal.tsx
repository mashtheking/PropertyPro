import { useState, useEffect } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Gem, Crown, Video } from 'lucide-react';
import { showRewardedAd, isAdAvailable } from '@/lib/admob';
import { useRewardUnits } from '@/hooks/useRewardUnits';
import { useToast } from '@/hooks/use-toast';

interface AdMobRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName: string;
  unitsRequired: number;
  onRewardEarned?: () => void;
  onUpgradeClick?: () => void;
}

const AdMobRewardModal = ({
  isOpen,
  onClose,
  featureName,
  unitsRequired,
  onRewardEarned,
  onUpgradeClick
}: AdMobRewardModalProps) => {
  const { rewardUnits, addRewardUnits, useRewardUnits } = useRewardUnits();
  const { toast } = useToast();
  const [adsAvailable, setAdsAvailable] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Check if ads are available
  useEffect(() => {
    const checkAdAvailability = async () => {
      try {
        const available = await isAdAvailable();
        setAdsAvailable(available);
      } catch (error) {
        console.error('Error checking ad availability:', error);
        setAdsAvailable(false);
      }
    };

    if (isOpen) {
      checkAdAvailability();
    }
  }, [isOpen]);

  // Calculate progress towards premium
  const progressPercentage = Math.min(100, (rewardUnits / 30) * 100);

  // Handle watching an ad
  const handleWatchAd = () => {
    setIsLoading(true);

    showRewardedAd(
      // Ad loaded callback
      () => {
        console.log('Ad loaded successfully');
      },
      // Ad failed to load callback
      (error) => {
        console.error('Ad failed to load:', error);
        setIsLoading(false);
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
        
        if (onRewardEarned) {
          onRewardEarned();
        }
      },
      // Ad closed callback
      () => {
        console.log('Ad closed');
        setIsLoading(false);
      }
    );
  };

  // Handle using reward units to unlock feature
  const handleUseRewardUnits = () => {
    if (rewardUnits >= unitsRequired) {
      useRewardUnits(featureName, unitsRequired);
      toast({
        title: 'Feature Unlocked',
        description: `You have unlocked ${featureName} for 24 hours.`,
      });
      onClose();
    } else {
      toast({
        title: 'Not Enough Reward Units',
        description: `You need ${unitsRequired - rewardUnits} more units to unlock this feature.`,
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="bg-premium-100 p-4 rounded-full">
              <Gem className="h-8 w-8 text-premium-600" />
            </div>
          </div>
          <DialogTitle className="text-xl text-center">Unlock Premium Feature</DialogTitle>
          <DialogDescription className="text-center">
            Watch a short video ad to earn reward units and unlock {featureName} for 24 hours.
          </DialogDescription>
        </DialogHeader>
        
        <div className="bg-gray-100 p-4 rounded-lg w-full mb-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Your reward units:</span>
            <span className="bg-white px-3 py-1 rounded-full text-premium-600 font-medium">
              {rewardUnits} units
            </span>
          </div>
          <div className="mt-3">
            <Progress value={progressPercentage} className="h-2" />
          </div>
          <div className="mt-2 text-xs text-gray-500 text-right">
            30 units needed to upgrade to Premium
          </div>
        </div>
        
        <div className="flex flex-col w-full space-y-4">
          <Button
            onClick={handleWatchAd}
            disabled={isLoading || !adsAvailable}
            className="w-full bg-premium-600 hover:bg-premium-700"
          >
            {isLoading ? (
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
                Watch Ad to Earn 3 Units
              </>
            )}
          </Button>
          
          {rewardUnits >= unitsRequired ? (
            <Button
              onClick={handleUseRewardUnits}
              variant="outline"
              className="w-full text-premium-600 border-premium-600"
            >
              <Gem className="mr-2 h-4 w-4" />
              Use {unitsRequired} Units to Unlock Feature
            </Button>
          ) : null}
          
          <Button
            onClick={onUpgradeClick}
            variant="outline"
            className="w-full"
          >
            <Crown className="mr-2 h-4 w-4" />
            Upgrade to Premium ($9.99/month)
          </Button>
        </div>
        
        <DialogFooter>
          <Button
            variant="ghost"
            onClick={onClose}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AdMobRewardModal;
