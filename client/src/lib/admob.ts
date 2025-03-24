// This is a simulation of the Google AdMob SDK for web
// In a real application, you'd use the official Google AdMob SDK

// AdMob constants
export const AD_UNIT_ID = 'ca-app-pub-3940256099942544/1033173712'; // This is the test ad unit ID

// Initialize AdMob
export const initAdMob = () => {
  console.log('AdMob initialized');
  // In a real app, you would initialize the AdMob SDK here
};

// Load and show a rewarded ad
export const showRewardedAd = (
  onAdLoaded: () => void,
  onAdFailedToLoad: (error: string) => void,
  onRewarded: (rewardAmount: number) => void,
  onAdClosed: () => void
) => {
  console.log('Loading rewarded ad...');
  
  // Simulate ad loading
  setTimeout(() => {
    // Simulate successful ad load
    onAdLoaded();
    
    // In a real application, the ad would be shown to the user now
    console.log('Showing ad to user...');
    
    // Simulate user watching the ad and getting rewarded
    setTimeout(() => {
      // Reward the user
      onRewarded(3); // Reward 3 units
      
      // Ad closed
      onAdClosed();
    }, 2000);
  }, 1000);
};

// Check if ads are available
export const isAdAvailable = async (): Promise<boolean> => {
  // In a real app, you would check if ads are available from the AdMob SDK
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true); // Simulate ads being available
    }, 500);
  });
};

// Interface for AdMob reward tracking
export interface RewardedAdResult {
  rewarded: boolean;
  amount: number;
}
