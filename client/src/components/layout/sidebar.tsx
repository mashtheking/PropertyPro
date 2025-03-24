import React from 'react';
import { useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { useSubscription } from '@/contexts/subscription-context';

interface SidebarProps {
  isOpen: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const [location, navigate] = useLocation();
  const { isPremium } = useSubscription();

  const navItems = [
    { href: "/", label: "Dashboard", icon: "dashboard" },
    { href: "/properties", label: "Properties", icon: "home" },
    { href: "/clients", label: "Clients", icon: "people" },
    { href: "/appointments", label: "Appointments", icon: "calendar_today" },
    { 
      href: "/analytics", 
      label: "Analytics", 
      icon: "bar_chart", 
      isPremium: true
    },
  ];

  const settingsItems = [
    { href: "/profile", label: "Account", icon: "account_circle" },
    { href: "/subscription", label: "Subscription", icon: "card_membership" },
    { href: "/help", label: "Help & Support", icon: "help_outline" },
  ];
  
  const isActive = (href: string) => {
    if (href === '/' && location === '/') return true;
    if (href !== '/' && location.startsWith(href)) return true;
    return false;
  };

  return (
    <aside 
      className={cn(
        "bg-neutral-800 text-white w-64 flex-shrink-0 h-full overflow-y-auto transition-all duration-300 ease-in-out fixed lg:static z-40",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}
    >
      <nav className="px-4 py-4">
        <div className="space-y-1">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={(e) => {
                e.preventDefault();
                navigate(item.href);
              }}
              className={cn(
                "flex items-center px-2 py-2 text-sm font-medium rounded-md group",
                isActive(item.href)
                  ? "bg-neutral-900 text-white"
                  : "text-neutral-300 hover:bg-neutral-700 hover:text-white"
              )}
            >
              <span className="material-icons mr-3 text-neutral-400">{item.icon}</span>
              {item.label}
              {item.isPremium && (
                <span className={cn(
                  "ml-auto text-xs",
                  isPremium ? "text-yellow-400" : "text-neutral-500"
                )}>
                  {isPremium ? "★" : "Premium"}
                </span>
              )}
            </a>
          ))}
        </div>
        <div className="mt-8 pt-6 border-t border-neutral-700">
          <h3 className="px-3 text-xs font-semibold text-neutral-400 uppercase tracking-wider">
            Settings
          </h3>
          <div className="mt-1 space-y-1">
            {settingsItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  navigate(item.href);
                }}
                className={cn(
                  "flex items-center px-2 py-2 text-sm font-medium rounded-md group",
                  isActive(item.href)
                    ? "bg-neutral-900 text-white"
                    : "text-neutral-300 hover:bg-neutral-700 hover:text-white"
                )}
              >
                <span className="material-icons mr-3 text-neutral-400">{item.icon}</span>
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </nav>
    </aside>
  );
};
