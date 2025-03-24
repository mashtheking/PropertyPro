import React from 'react';
import { cn } from '@/lib/utils';

interface PremiumBadgeProps {
  className?: string;
}

export const PremiumBadge: React.FC<PremiumBadgeProps> = ({ className }) => {
  return (
    <span 
      className={cn(
        "inline-flex items-center text-xs font-medium text-yellow-600 bg-yellow-100 rounded-full px-3 py-1",
        className
      )}
    >
      <span className="mr-1">★</span>
      Premium
    </span>
  );
};
