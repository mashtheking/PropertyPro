import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { X, Download, Monitor } from "lucide-react";

interface PWAInstallPromptProps {
  onClose: () => void;
}

export default function PWAInstallPrompt({ onClose }: PWAInstallPromptProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const installPromptShown = useRef(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // The deferred prompt isn't available, so open instructions
      showInstallInstructions();
      return;
    }

    // Show the install prompt
    deferredPrompt.prompt();
    installPromptShown.current = true;
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    
    // We've used the prompt, and can't use it again, discard it
    setDeferredPrompt(null);
    
    if (outcome === 'accepted') {
      onClose();
    }
  };

  const showInstallInstructions = () => {
    // Show manual installation instructions based on browser
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS) {
      alert("To install this app on your iPhone/iPad: tap the Share button, then 'Add to Home Screen'.");
    } else {
      alert("To install this app, open it in Chrome, click the menu button (three dots) and select 'Install app'.");
    }
  };

  return (
    <div className="fixed bottom-0 inset-x-0 pb-2 sm:pb-5 z-50">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="p-2 rounded-lg bg-blue-600 shadow-lg sm:p-3">
          <div className="flex items-center justify-between flex-wrap">
            <div className="w-0 flex-1 flex items-center">
              <span className="flex p-2 rounded-lg bg-blue-800">
                <Monitor className="h-6 w-6 text-white" />
              </span>
              <p className="ml-3 font-medium text-white truncate">
                <span className="md:hidden">Install this app on your device!</span>
                <span className="hidden md:inline">Install RealEstate CRM on your device for offline access and a better experience!</span>
              </p>
            </div>
            <div className="order-3 mt-2 flex-shrink-0 w-full sm:order-2 sm:mt-0 sm:w-auto">
              <Button 
                onClick={handleInstallClick}
                className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-blue-600 bg-white hover:bg-blue-50"
              >
                <Download className="h-4 w-4 mr-2" />
                Install Now
              </Button>
            </div>
            <div className="order-2 flex-shrink-0 sm:order-3 sm:ml-2">
              <Button 
                onClick={onClose}
                variant="ghost"
                size="icon"
                className="flex p-2 rounded-md hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-white"
              >
                <span className="sr-only">Dismiss</span>
                <X className="h-6 w-6 text-white" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
