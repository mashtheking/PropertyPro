import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { AuthProvider } from "./hooks/use-auth";
import { ThemeProvider } from "./components/ui/theme-provider";

// Pages
import Login from "./pages/login";
import Signup from "./pages/signup";
import Dashboard from "./pages/dashboard";
import Properties from "./pages/properties";
import PropertyDetail from "./pages/properties/[id]";
import AddProperty from "./pages/properties/add";
import Clients from "./pages/clients";
import ClientDetail from "./pages/clients/[id]";
import AddClient from "./pages/clients/add";
import Appointments from "./pages/appointments";
import AppointmentDetail from "./pages/appointments/[id]";
import AddAppointment from "./pages/appointments/add";
import NotFound from "./pages/not-found";
import Layout from "./components/layout/layout";
import { PremiumProvider } from "./hooks/use-premium";
import { AdRewardsProvider } from "./hooks/use-ad-rewards";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return (
    <Layout>
      {children}
    </Layout>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      
      <Route path="/">
        {() => (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        )}
      </Route>
      
      <Route path="/properties">
        {() => (
          <ProtectedRoute>
            <Properties />
          </ProtectedRoute>
        )}
      </Route>
      
      <Route path="/properties/add">
        {() => (
          <ProtectedRoute>
            <AddProperty />
          </ProtectedRoute>
        )}
      </Route>
      
      <Route path="/properties/:id">
        {(params) => (
          <ProtectedRoute>
            <PropertyDetail id={params.id} />
          </ProtectedRoute>
        )}
      </Route>
      
      <Route path="/clients">
        {() => (
          <ProtectedRoute>
            <Clients />
          </ProtectedRoute>
        )}
      </Route>
      
      <Route path="/clients/add">
        {() => (
          <ProtectedRoute>
            <AddClient />
          </ProtectedRoute>
        )}
      </Route>
      
      <Route path="/clients/:id">
        {(params) => (
          <ProtectedRoute>
            <ClientDetail id={params.id} />
          </ProtectedRoute>
        )}
      </Route>
      
      <Route path="/appointments">
        {() => (
          <ProtectedRoute>
            <Appointments />
          </ProtectedRoute>
        )}
      </Route>
      
      <Route path="/appointments/add">
        {() => (
          <ProtectedRoute>
            <AddAppointment />
          </ProtectedRoute>
        )}
      </Route>
      
      <Route path="/appointments/:id">
        {(params) => (
          <ProtectedRoute>
            <AppointmentDetail id={params.id} />
          </ProtectedRoute>
        )}
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <PremiumProvider>
            <AdRewardsProvider>
              <Router />
              <Toaster />
            </AdRewardsProvider>
          </PremiumProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
