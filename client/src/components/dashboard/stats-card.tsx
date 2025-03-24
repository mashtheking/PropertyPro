import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  icon: string;
  iconColor: string;
  iconBgColor: string;
  title: string;
  value: number | string;
  change?: {
    value: number;
    isPositive: boolean;
  };
  linkHref: string;
  linkText: string;
  linkColor: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  icon,
  iconColor,
  iconBgColor,
  title,
  value,
  change,
  linkHref,
  linkText,
  linkColor,
}) => {
  return (
    <Card>
      <CardContent className="px-4 py-5 sm:p-6">
        <div className="flex items-center">
          <div className={cn("flex-shrink-0 rounded-md p-3", iconBgColor)}>
            <span className={cn("material-icons", iconColor)}>{icon}</span>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-neutral-500 truncate">{title}</dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-neutral-900">{value}</div>
                {change && (
                  <div className={cn(
                    "ml-2 flex items-baseline text-sm font-semibold",
                    change.isPositive ? "text-green-600" : "text-red-600"
                  )}>
                    <span className="material-icons text-xs">
                      {change.isPositive ? "arrow_upward" : "arrow_downward"}
                    </span>
                    <span>{Math.abs(change.value)}%</span>
                  </div>
                )}
              </dd>
            </dl>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-neutral-50 px-4 py-4 sm:px-6">
        <div className="text-sm">
          <a 
            href={linkHref} 
            className={cn("font-medium hover:opacity-80", linkColor)}
          >
            {linkText}
          </a>
        </div>
      </CardFooter>
    </Card>
  );
};
