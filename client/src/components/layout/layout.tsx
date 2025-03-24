import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import Header from "./header";
import Sidebar from "./sidebar";
import MobileHeader from "./mobile-header";
import PWAInstallPrompt from "../pwa-install-prompt";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [_, navigate] = useLocation();
  const { user, isLoading } = useAuth();
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isLoading && !user) {
      navigate("/login");
    }
  }, [user, isLoading, navigate]);

  useEffect(() => {
    // Check for PWA installability after some time to avoid immediate prompting
    const timer = setTimeout(() => {
      const isInstalled = window.matchMedia('(display-mode: standalone)').matches 
        || (window.navigator as any).standalone === true;
      
      if (!isInstalled) {
        setShowInstallPrompt(true);
      }
    }, 120000); // Show after 2 minutes of usage

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will be redirected to login
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <MobileHeader />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto mt-16 md:mt-0 px-4 sm:px-6 lg:px-8 py-6 bg-gray-50">
          {children}
        </main>
        
        {showInstallPrompt && (
          <PWAInstallPrompt onClose={() => setShowInstallPrompt(false)} />
        )}
      </div>
    </div>
  );
}
