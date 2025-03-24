import React, { useState, useEffect } from 'react';
import { isPWAInstallable, showInstallPrompt } from '@/lib/pwa';

export const InstallBanner: React.FC = () => {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Initialize the PWA installation listener
    const handleInstallable = () => {
      setIsInstallable(true);
      // Show the banner after a delay
      setTimeout(() => {
        setIsVisible(true);
      }, 3000);
    };

    // Check if the app is already installable
    if (isPWAInstallable()) {
      handleInstallable();
    }

    // Listen for the installable event
    window.addEventListener('pwaInstallable', handleInstallable);

    // Listen for the installed event
    window.addEventListener('pwaInstalled', () => {
      setIsVisible(false);
    });

    return () => {
      window.removeEventListener('pwaInstallable', handleInstallable);
      window.removeEventListener('pwaInstalled', () => {
        setIsVisible(false);
      });
    };
  }, []);

  const handleInstall = async () => {
    const installed = await showInstallPrompt();
    if (installed) {
      setIsVisible(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    // Remember the user's choice in localStorage
    localStorage.setItem('pwaInstallDismissed', 'true');
  };

  if (!isInstallable || !isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-0 inset-x-0 pb-2 sm:pb-5 z-50">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="p-2 rounded-lg bg-primary-600 shadow-lg sm:p-3">
          <div className="flex items-center justify-between flex-wrap">
            <div className="w-0 flex-1 flex items-center">
              <span className="flex p-2 rounded-lg bg-primary-800">
                <span className="material-icons text-white">install_mobile</span>
              </span>
              <p className="ml-3 font-medium text-white truncate">
                <span className="md:hidden">Install RealCRM app!</span>
                <span className="hidden md:inline">Install RealCRM as an app on your device for better experience!</span>
              </p>
            </div>
            <div className="order-3 mt-2 flex-shrink-0 w-full sm:order-2 sm:mt-0 sm:w-auto">
              <button 
                onClick={handleInstall}
                className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-600 bg-white hover:bg-primary-50"
              >
                Install Now
              </button>
            </div>
            <div className="order-2 flex-shrink-0 sm:order-3 sm:ml-2">
              <button 
                type="button" 
                onClick={handleDismiss}
                className="-mr-1 flex p-2 rounded-md hover:bg-primary-500 focus:outline-none focus:ring-2 focus:ring-white"
              >
                <span className="material-icons text-white">close</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
