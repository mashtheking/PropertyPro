import { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { usePremium } from '@/hooks/useSubscription';
import { useRewardUnits } from '@/hooks/useRewardUnits';
import { 
  Building, LayoutDashboard, List, Plus, 
  Users, UserPlus, Calendar, CalendarPlus, 
  Crown, Gem, Settings, LogOut 
} from 'lucide-react';

type SidebarProps = {
  isMobile: boolean;
  isOpen: boolean;
  toggleSidebar: () => void;
};

const Sidebar = ({ isMobile, isOpen, toggleSidebar }: SidebarProps) => {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const { isPremium } = usePremium();
  const { rewardUnits } = useRewardUnits();
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = () => {
    if (!installPrompt) return;
    
    // Show the prompt
    installPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    installPrompt.userChoice.then((choiceResult: any) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      setInstallPrompt(null);
    });
  };

  const handleLogout = async () => {
    await logout();
  };

  const sidebarClass = `bg-white shadow-lg h-full z-10 w-64 md:w-72 fixed md:relative transition-all duration-300 ease-in-out ${
    isMobile && !isOpen ? '-translate-x-full' : 'translate-x-0'
  }`;

  return (
    <aside className={sidebarClass} id="sidebar">
      <div className="flex flex-col h-full">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-md flex items-center justify-center">
                <Building className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-primary-800">RealCRM</h1>
            </div>
            {isMobile && (
              <button
                className="md:hidden text-gray-500"
                onClick={toggleSidebar}
              >
                <span className="sr-only">Close sidebar</span>
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
        
        {/* User Profile Section */}
        {user && (
          <div className="p-4 border-b">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <div className="flex items-center">
                  <span className="font-medium text-sm">{user.fullName || user.username}</span>
                  {isPremium && (
                    <span className="ml-2 px-2 py-0.5 text-xs bg-premium-100 text-premium-600 rounded-full font-medium">
                      Premium
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <div className="space-y-1">
            <Link href="/">
              <a
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  location === '/'
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <LayoutDashboard className="w-5 h-5 mr-3 text-primary-500" />
                Dashboard
              </a>
            </Link>
            
            {/* Properties Section */}
            <div className="mt-4">
              <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Properties
              </h3>
              <div className="mt-2 space-y-1">
                <Link href="/properties">
                  <a
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      location === '/properties'
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <List className="w-5 h-5 mr-3 text-gray-500" />
                    All Properties
                  </a>
                </Link>
                <Link href="/properties/add">
                  <a
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      location === '/properties/add'
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Plus className="w-5 h-5 mr-3 text-gray-500" />
                    Add Property
                  </a>
                </Link>
              </div>
            </div>
            
            {/* Clients Section */}
            <div className="mt-4">
              <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Clients
              </h3>
              <div className="mt-2 space-y-1">
                <Link href="/clients">
                  <a
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      location === '/clients'
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Users className="w-5 h-5 mr-3 text-gray-500" />
                    All Clients
                  </a>
                </Link>
                <Link href="/clients/add">
                  <a
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      location === '/clients/add'
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <UserPlus className="w-5 h-5 mr-3 text-gray-500" />
                    Add Client
                  </a>
                </Link>
              </div>
            </div>
            
            {/* Appointments Section */}
            <div className="mt-4">
              <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Appointments
              </h3>
              <div className="mt-2 space-y-1">
                <Link href="/appointments/calendar">
                  <a
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      location === '/appointments/calendar'
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Calendar className="w-5 h-5 mr-3 text-gray-500" />
                    Calendar
                  </a>
                </Link>
                <Link href="/appointments/add">
                  <a
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      location === '/appointments/add'
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <CalendarPlus className="w-5 h-5 mr-3 text-gray-500" />
                    New Appointment
                  </a>
                </Link>
              </div>
            </div>
            
            {/* Settings & Account Section */}
            <div className="mt-4">
              <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Account
              </h3>
              <div className="mt-2 space-y-1">
                <Link href="/subscription">
                  <a
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      location === '/subscription'
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Crown className="w-5 h-5 mr-3 text-premium-500" />
                    Subscription
                  </a>
                </Link>
                <Link href="/reward-units">
                  <a
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      location === '/reward-units'
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Gem className="w-5 h-5 mr-3 text-primary-500" />
                    Reward Units 
                    <span className="ml-auto bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                      {rewardUnits}
                    </span>
                  </a>
                </Link>
                <Link href="/settings">
                  <a
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      location === '/settings'
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Settings className="w-5 h-5 mr-3 text-gray-500" />
                    Settings
                  </a>
                </Link>
                <a
                  onClick={handleLogout}
                  className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 cursor-pointer"
                >
                  <LogOut className="w-5 h-5 mr-3 text-gray-500" />
                  Logout
                </a>
              </div>
            </div>
          </div>
        </nav>
        
        {/* PWA Install Button */}
        {installPrompt && (
          <div className="p-4 border-t" id="pwaInstallContainer">
            <button
              className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              id="pwaInstallButton"
              onClick={handleInstall}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Install App
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
