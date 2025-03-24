import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import Sidebar from './Sidebar';
import Header from './Header';
import { useMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from "@/hooks/use-toast";

type LayoutProps = {
  children: React.ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
  const isMobile = useMobile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);
  const [pageTitle, setPageTitle] = useState('Dashboard');
  const [location] = useLocation();
  const { user, isLoading } = useAuth();
  const { toast } = useToast();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      window.location.href = '/login';
    }
  }, [user, isLoading]);

  // Set page title based on location
  useEffect(() => {
    let title = 'Dashboard';
    
    if (location.startsWith('/properties')) {
      if (location === '/properties/add') {
        title = 'Add Property';
      } else if (location.match(/\/properties\/\d+/)) {
        title = 'Property Details';
      } else {
        title = 'Properties';
      }
    } else if (location.startsWith('/clients')) {
      if (location === '/clients/add') {
        title = 'Add Client';
      } else if (location.match(/\/clients\/\d+/)) {
        title = 'Client Details';
      } else {
        title = 'Clients';
      }
    } else if (location.startsWith('/appointments')) {
      if (location === '/appointments/add') {
        title = 'New Appointment';
      } else if (location === '/appointments/calendar') {
        title = 'Calendar';
      } else if (location.match(/\/appointments\/\d+/)) {
        title = 'Appointment Details';
      } else {
        title = 'Appointments';
      }
    } else if (location === '/subscription') {
      title = 'Subscription';
    } else if (location === '/reward-units') {
      title = 'Reward Units';
    } else if (location === '/settings') {
      title = 'Settings';
    }
    
    setPageTitle(title);
  }, [location]);

  // Toggle sidebar for mobile
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-700"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar 
        isMobile={isMobile} 
        isOpen={isSidebarOpen} 
        toggleSidebar={toggleSidebar} 
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          openSidebar={toggleSidebar} 
          pageTitle={pageTitle}
        />
        
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
