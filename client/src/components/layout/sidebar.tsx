import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { usePremium } from "@/hooks/use-premium";
import { useAdRewards } from "@/hooks/use-ad-rewards";
import { Home, Users, Calendar, BarChart, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const NavItem = ({ href, icon: Icon, children, isPremium = false }: { 
  href: string; 
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  isPremium?: boolean;
}) => {
  const [location] = useLocation();
  const isActive = location === href;
  const { isPremiumUser } = usePremium();

  return (
    <Link href={href}>
      <a className={cn(
        "flex items-center px-2 py-2 text-sm font-medium rounded-md",
        isActive 
          ? "text-white bg-gray-900" 
          : "text-gray-300 hover:text-white hover:bg-gray-700",
      )}>
        <Icon className="w-6 h-6 mr-3" />
        {children}
        {isPremium && !isPremiumUser && (
          <span className="ml-auto inline-block py-0.5 px-2 text-xs rounded-full bg-amber-500 text-white">Premium</span>
        )}
      </a>
    </Link>
  );
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { isPremiumUser } = usePremium();
  const { adRewards } = useAdRewards();
  
  const handleLogout = () => {
    logout();
  };

  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64 bg-gray-800">
        <div className="flex items-center h-16 px-4 bg-gray-900">
          <div className="flex items-center">
            <span className="text-xl font-semibold text-white">RealEstate CRM</span>
            {isPremiumUser && (
              <span className="ml-2 px-2 py-1 text-xs font-semibold text-white bg-green-500 rounded-full">Premium</span>
            )}
          </div>
        </div>
        <div className="flex flex-col flex-grow">
          <nav className="flex-1 px-2 py-4 space-y-1">
            <NavItem href="/" icon={Home}>Dashboard</NavItem>
            <NavItem href="/properties" icon={Home}>Properties</NavItem>
            <NavItem href="/clients" icon={Users}>Clients</NavItem>
            <NavItem href="/appointments" icon={Calendar}>Appointments</NavItem>
            <NavItem href="/analytics" icon={BarChart} isPremium={true}>Analytics</NavItem>
            <NavItem href="/settings" icon={Settings}>Settings</NavItem>
          </nav>
          <div className="p-4">
            <div className="flex items-center">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {user?.first_name?.[0]}{user?.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="ml-3">
                <p className="text-sm font-medium text-white">{user?.first_name} {user?.last_name}</p>
                <p className="text-xs font-medium text-gray-300">{user?.email}</p>
              </div>
            </div>
            <div className="mt-3">
              <div className="flex items-center justify-between px-2 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 rounded-md">
                <span>Ad rewards</span>
                <span className="px-2 py-0.5 text-xs rounded-full bg-blue-600 text-white">{adRewards} units</span>
              </div>
              <Button
                variant="ghost"
                className="w-full mt-2 text-gray-300 hover:text-white hover:bg-gray-700 justify-start p-2"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
