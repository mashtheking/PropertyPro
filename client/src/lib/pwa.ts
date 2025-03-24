// Store the install prompt event for later use
let deferredPrompt: any = null;

// Check if the app can be installed
export const isPWAInstallable = (): boolean => {
  return deferredPrompt !== null;
};

// Show the install prompt
export const showInstallPrompt = async (): Promise<boolean> => {
  if (!deferredPrompt) {
    return false;
  }

  // Show the installation prompt
  deferredPrompt.prompt();
  
  // Wait for the user to respond to the prompt
  const { outcome } = await deferredPrompt.userChoice;
  
  // Reset the deferred prompt variable
  deferredPrompt = null;
  
  return outcome === 'accepted';
};

// Initialize PWA listener
export const initPWA = () => {
  // Listen for the beforeinstallprompt event
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault();
    
    // Stash the event so it can be triggered later
    deferredPrompt = e;
    
    // Notify any listeners that the app is installable
    window.dispatchEvent(new CustomEvent('pwaInstallable'));
  });

  // Listen for app installed event
  window.addEventListener('appinstalled', () => {
    // Log app installed
    console.log('PWA was installed');
    
    // Clear the deferredPrompt
    deferredPrompt = null;
    
    // Notify any listeners that the app was installed
    window.dispatchEvent(new CustomEvent('pwaInstalled'));
  });
};
