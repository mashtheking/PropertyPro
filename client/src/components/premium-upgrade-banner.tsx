import { useState } from "react";
import { Button } from "@/components/ui/button";
import { usePremium } from "@/hooks/use-premium";
import { Sparkles, X } from "lucide-react";

export default function PremiumUpgradeBanner() {
  const [dismissed, setDismissed] = useState(false);
  const { isPremiumUser, openUpgradeModal } = usePremium();

  if (isPremiumUser || dismissed) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-lg">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between flex-wrap">
          <div className="w-0 flex-1 flex items-center">
            <span className="flex p-2 rounded-lg bg-blue-800">
              <Sparkles className="h-6 w-6 text-white" />
            </span>
            <p className="ml-3 font-medium text-white truncate">
              <span className="md:hidden">Upgrade to Premium!</span>
              <span className="hidden md:inline">
                Unlock all premium features with our Premium plan - No ads, advanced analytics, and more!
              </span>
            </p>
          </div>
          <div className="order-3 mt-2 flex-shrink-0 w-full sm:order-2 sm:mt-0 sm:w-auto">
            <Button
              onClick={openUpgradeModal}
              className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-blue-600 bg-white hover:bg-blue-50"
            >
              Upgrade now
            </Button>
          </div>
          <div className="order-2 flex-shrink-0 sm:order-3 sm:ml-3">
            <Button
              onClick={() => setDismissed(true)}
              variant="ghost"
              size="icon"
              className="-mr-1 flex p-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-white sm:-mr-2"
            >
              <span className="sr-only">Dismiss</span>
              <X className="h-6 w-6 text-white" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
