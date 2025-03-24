import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "./contexts/AuthContext";
import { PremiumProvider } from "./contexts/PremiumContext";

// Layout
import Layout from "./components/layout/Layout";

// Pages
import Dashboard from "./pages/dashboard";
import Login from "./pages/login";
import Signup from "./pages/signup";
import PropertiesIndex from "./pages/properties";
import PropertyAdd from "./pages/properties/add";
import PropertyDetail from "./pages/properties/[id]";
import ClientsIndex from "./pages/clients";
import ClientAdd from "./pages/clients/add";
import ClientDetail from "./pages/clients/[id]";
import AppointmentsIndex from "./pages/appointments";
import AppointmentCalendar from "./pages/appointments/calendar";
import AppointmentAdd from "./pages/appointments/add";
import AppointmentDetail from "./pages/appointments/[id]";
import Subscription from "./pages/subscription";
import RewardUnits from "./pages/reward-units";
import Settings from "./pages/settings";
import NotFound from "@/pages/not-found";

// PWA Event handling
import { useEffect } from "react";

function App() {
  const [location] = useLocation();
  const isAuthRoute = location === "/login" || location === "/signup";

  // Handle PWA installation
  useEffect(() => {
    let deferredPrompt: any;

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later
      deferredPrompt = e;
      // Optionally, update UI to notify the user they can install the PWA
      const pwaInstallContainer = document.getElementById('pwaInstallContainer');
      if (pwaInstallContainer) {
        pwaInstallContainer.classList.remove('hidden');
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Handle install button click
    const handleInstallClick = () => {
      const pwaInstallContainer = document.getElementById('pwaInstallContainer');
      // Hide the install prompt
      if (pwaInstallContainer) {
        pwaInstallContainer.classList.add('hidden');
      }
      
      // Show the installation prompt
      if (deferredPrompt) {
        deferredPrompt.prompt();
        
        // Wait for the user to respond to the prompt
        deferredPrompt.userChoice.then((choiceResult: { outcome: string }) => {
          if (choiceResult.outcome === 'accepted') {
            console.log('User accepted the PWA installation');
          } else {
            console.log('User dismissed the PWA installation');
          }
          // Clear the saved prompt since it can only be used once
          deferredPrompt = null;
        });
      }
    };

    const installButton = document.getElementById('pwaInstallButton');
    if (installButton) {
      installButton.addEventListener('click', handleInstallClick);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      if (installButton) {
        installButton.removeEventListener('click', handleInstallClick);
      }
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <PremiumProvider>
          {isAuthRoute ? (
            <Switch>
              <Route path="/login" component={Login} />
              <Route path="/signup" component={Signup} />
              <Route component={Login} />
            </Switch>
          ) : (
            <Layout>
              <Switch>
                <Route path="/" component={Dashboard} />
                <Route path="/properties" component={PropertiesIndex} />
                <Route path="/properties/add" component={PropertyAdd} />
                <Route path="/properties/:id" component={PropertyDetail} />
                <Route path="/clients" component={ClientsIndex} />
                <Route path="/clients/add" component={ClientAdd} />
                <Route path="/clients/:id" component={ClientDetail} />
                <Route path="/appointments" component={AppointmentsIndex} />
                <Route path="/appointments/calendar" component={AppointmentCalendar} />
                <Route path="/appointments/add" component={AppointmentAdd} />
                <Route path="/appointments/:id" component={AppointmentDetail} />
                <Route path="/subscription" component={Subscription} />
                <Route path="/reward-units" component={RewardUnits} />
                <Route path="/settings" component={Settings} />
                <Route component={NotFound} />
              </Switch>
            </Layout>
          )}
          <Toaster />
        </PremiumProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
