import React from 'react';
import { cn } from '@/lib/utils';
import { useReward } from '@/contexts/reward-context';

interface RewardUnitsProps {
  className?: string;
  showIcon?: boolean;
}

export const RewardUnits: React.FC<RewardUnitsProps> = ({ 
  className,
  showIcon = true
}) => {
  const { rewardUnits } = useReward();

  return (
    <div 
      className={cn(
        "flex items-center space-x-1 bg-neutral-100 rounded-full px-3 py-1",
        className
      )}
    >
      {showIcon && (
        <span className="material-icons text-yellow-600 text-sm">stars</span>
      )}
      <span className="text-sm font-medium text-neutral-700">
        {rewardUnits} Reward {rewardUnits === 1 ? 'Unit' : 'Units'}
      </span>
    </div>
  );
};
