import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/auth-context';
import { useSubscription } from '@/contexts/subscription-context';
import { PremiumBadge } from '@/components/ui/premium-badge';
import { RewardUnits } from '@/components/ui/reward-units';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';

interface HeaderProps {
  toggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const [, navigate] = useLocation();
  const { user, logout } = useAuth();
  const { isPremium } = useSubscription();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      navigate('/login');
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-neutral-200 z-10">
      <div className="flex justify-between items-center px-4 py-2 lg:px-8">
        <div className="flex items-center">
          <button 
            onClick={toggleSidebar}
            className="p-2 rounded-md lg:hidden text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100"
          >
            <span className="material-icons">menu</span>
          </button>
          <a href="/" className="flex items-center space-x-2">
            <span className="material-icons text-primary-600">apartment</span>
            <span className="text-xl font-bold text-primary-800">RealCRM</span>
          </a>
        </div>
        <div className="flex items-center space-x-3">
          <div className="hidden md:flex items-center mr-2">
            {isPremium ? (
              <PremiumBadge />
            ) : (
              <RewardUnits />
            )}
          </div>
          <button className="p-1 rounded-full text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 relative">
            <span className="material-icons">notifications</span>
            <span className="absolute top-0 right-0 h-4 w-4 text-xs bg-red-500 text-white rounded-full flex items-center justify-center">
              {/* Notifications count would come from a context/API in a real app */}
              3
            </span>
          </button>
          <div className="relative">
            <button 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-2 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <Avatar className="h-8 w-8 rounded-full bg-neutral-300">
                <AvatarImage src={user?.profileImage} alt={user?.fullName} />
                <AvatarFallback>{user?.fullName ? getInitials(user.fullName) : 'U'}</AvatarFallback>
              </Avatar>
              <div className="hidden md:block text-left">
                <span className="text-neutral-700 font-medium">
                  {user?.fullName || 'User'}
                </span>
                <p className="text-xs text-neutral-500">
                  {user?.email || ''}
                </p>
              </div>
              <span className="material-icons text-neutral-400">arrow_drop_down</span>
            </button>
            
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-50">
                <a href="/profile" className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100">
                  Your Profile
                </a>
                <a href="/settings" className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100">
                  Settings
                </a>
                <a href="/subscription" className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100">
                  Billing
                </a>
                <div className="border-t border-neutral-200"></div>
                <button 
                  onClick={handleLogout} 
                  className="block w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
