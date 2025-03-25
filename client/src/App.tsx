import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/auth-context";
import { SubscriptionProvider } from "@/contexts/subscription-context";
import { RewardProvider } from "@/contexts/reward-context";
import { initPWA } from "@/lib/pwa";
import { InstallBanner } from "@/components/pwa/install-banner";
import Layout from "@/components/layout/layout";
import ProtectedRoute from "@/components/auth/protected-route";

// Pages
import Dashboard from "@/pages/dashboard";
import Login from "@/pages/login";
import Register from "@/pages/register";
import ForgotPassword from "@/pages/forgot-password";
import ResetPassword from "@/pages/reset-password";
import PropertiesIndex from "@/pages/properties/index";
import PropertiesNew from "@/pages/properties/new";
import PropertiesEdit from "@/pages/properties/edit";
import ClientsIndex from "@/pages/clients/index";
import ClientsNew from "@/pages/clients/new";
import ClientsEdit from "@/pages/clients/edit";
import AppointmentsIndex from "@/pages/appointments/index";
import AppointmentsNew from "@/pages/appointments/new";
import AppointmentsEdit from "@/pages/appointments/edit";
import Settings from "@/pages/settings";
import Subscription from "@/pages/subscription";
import NotFound from "@/pages/not-found";

// Initialize PWA functionality
initPWA();

function Router() {
  return (
    <Switch>
      {/* Auth Routes */}
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/reset-password" component={ResetPassword} />
      
      {/* Protected Routes */}
      <Route path="/">
        <ProtectedRoute>
          <Layout>
            <Dashboard />
          </Layout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/properties">
        <ProtectedRoute>
          <Layout>
            <PropertiesIndex />
          </Layout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/properties/new">
        <ProtectedRoute>
          <Layout>
            <PropertiesNew />
          </Layout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/properties/edit/:id">
        {(params) => (
          <ProtectedRoute>
            <Layout>
              <PropertiesEdit id={parseInt(params.id)} />
            </Layout>
          </ProtectedRoute>
        )}
      </Route>
      
      <Route path="/clients">
        <ProtectedRoute>
          <Layout>
            <ClientsIndex />
          </Layout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/clients/new">
        <ProtectedRoute>
          <Layout>
            <ClientsNew />
          </Layout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/clients/edit/:id">
        {(params) => (
          <ProtectedRoute>
            <Layout>
              <ClientsEdit id={parseInt(params.id)} />
            </Layout>
          </ProtectedRoute>
        )}
      </Route>
      
      <Route path="/appointments">
        <ProtectedRoute>
          <Layout>
            <AppointmentsIndex />
          </Layout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/appointments/new">
        <ProtectedRoute>
          <Layout>
            <AppointmentsNew />
          </Layout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/appointments/edit/:id">
        {(params) => (
          <ProtectedRoute>
            <Layout>
              <AppointmentsEdit id={parseInt(params.id)} />
            </Layout>
          </ProtectedRoute>
        )}
      </Route>
      
      <Route path="/settings">
        <ProtectedRoute>
          <Layout>
            <Settings />
          </Layout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/subscription">
        <ProtectedRoute>
          <Layout>
            <Subscription />
          </Layout>
        </ProtectedRoute>
      </Route>
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SubscriptionProvider>
          <RewardProvider>
            <Router />
            <Toaster />
            <InstallBanner />
          </RewardProvider>
        </SubscriptionProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
