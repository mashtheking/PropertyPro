import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, Bell, X, Home, Users, Calendar, BarChart, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { usePremium } from "@/hooks/use-premium";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAdRewards } from "@/hooks/use-ad-rewards";

export default function MobileHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const { isPremiumUser } = usePremium();
  const { adRewards } = useAdRewards();

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  const title = (() => {
    switch (location) {
      case "/":
        return "Dashboard";
      case "/properties":
        return "Properties";
      case "/clients":
        return "Clients";
      case "/appointments":
        return "Appointments";
      case "/analytics":
        return "Analytics";
      case "/settings":
        return "Settings";
      default:
        if (location.startsWith("/properties/")) return "Property Details";
        if (location.startsWith("/clients/")) return "Client Details";
        if (location.startsWith("/appointments/")) return "Appointment Details";
        return "RealEstate CRM";
    }
  })();

  const MobileNavItem = ({ href, icon: Icon, children, isPremium = false }: {
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    children: React.ReactNode;
    isPremium?: boolean;
  }) => {
    const isActive = location === href;

    return (
      <Link href={href}>
        <a 
          className={cn(
            "flex items-center px-3 py-3 text-base font-medium rounded-md",
            isActive 
              ? "bg-gray-100 text-gray-900" 
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          )}
          onClick={() => setIsOpen(false)}
        >
          <Icon className="w-6 h-6 mr-3 text-gray-400" />
          {children}
          {isPremium && !isPremiumUser && (
            <span className="ml-auto inline-block py-0.5 px-2 text-xs rounded-full bg-amber-500 text-white">Premium</span>
          )}
        </a>
      </Link>
    );
  };

  return (
    <div className="md:hidden fixed top-0 w-full bg-white z-10 border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-4">
        <div className="flex items-center">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6 text-gray-500" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] p-0">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-4 border-b">
                  <div className="font-semibold">RealEstate CRM</div>
                  {isPremiumUser && (
                    <span className="px-2 py-1 text-xs font-semibold text-white bg-green-500 rounded-full">Premium</span>
                  )}
                </div>
                <div className="flex-1 overflow-auto py-2">
                  <div className="space-y-1 px-2">
                    <MobileNavItem href="/" icon={Home}>Dashboard</MobileNavItem>
                    <MobileNavItem href="/properties" icon={Home}>Properties</MobileNavItem>
                    <MobileNavItem href="/clients" icon={Users}>Clients</MobileNavItem>
                    <MobileNavItem href="/appointments" icon={Calendar}>Appointments</MobileNavItem>
                    <MobileNavItem href="/analytics" icon={BarChart} isPremium={true}>Analytics</MobileNavItem>
                    <MobileNavItem href="/settings" icon={Settings}>Settings</MobileNavItem>
                  </div>
                </div>
                <div className="border-t p-4">
                  <div className="flex items-center mb-4">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {user?.first_name?.[0]}{user?.last_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="ml-3">
                      <p className="text-sm font-medium">{user?.first_name} {user?.last_name}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between px-2 py-2 mb-2 text-sm font-medium text-gray-700 rounded-md bg-gray-100">
                    <span>Ad rewards</span>
                    <span className="px-2 py-0.5 text-xs rounded-full bg-blue-600 text-white">{adRewards} units</span>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          <div className="ml-2 text-xl font-semibold text-gray-900">{title}</div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Bell className="h-6 w-6 text-gray-500" />
          </Button>
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {user?.first_name?.[0]}{user?.last_name?.[0]}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </div>
  );
}
