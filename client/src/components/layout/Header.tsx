import { useState } from 'react';
import { Bell } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { usePremium } from '@/hooks/useSubscription';
import { useRewardUnits } from '@/hooks/useRewardUnits';

type HeaderProps = {
  openSidebar: () => void;
  pageTitle: string;
};

const Header = ({ openSidebar, pageTitle }: HeaderProps) => {
  const { user } = useAuth();
  const { isPremium } = usePremium();
  const { rewardUnits } = useRewardUnits();
  const [hasNotifications] = useState(true);

  return (
    <header className="bg-white shadow-sm z-10">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center">
          <button
            className="md:hidden text-gray-500 mr-3"
            onClick={openSidebar}
          >
            <span className="sr-only">Open sidebar</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <h2 className="text-lg font-medium text-gray-800" id="pageTitle">
            {pageTitle}
          </h2>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <button className="text-gray-500 focus:outline-none">
              <Bell className="h-6 w-6" />
              {hasNotifications && (
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
              )}
            </button>
          </div>
          <div className="hidden md:block">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-medium text-gray-500">Reward Units:</span>
                <span className="bg-gray-100 text-primary-600 py-0.5 px-2 rounded-full text-xs font-medium">
                  {rewardUnits}
                </span>
              </div>
              <div className="h-4 border-l border-gray-300"></div>
              <div>
                {isPremium ? (
                  <span className="px-2 py-1 text-xs bg-premium-100 text-premium-600 rounded-full font-medium">
                    Premium
                  </span>
                ) : (
                  <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full font-medium">
                    Free
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
