import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';

export interface Activity {
  id: string | number;
  type: 'property' | 'client' | 'appointment';
  icon: string;
  iconColor: string;
  title: string;
  description: string;
  timestamp: string | Date;
}

interface ActivityListProps {
  activities: Activity[];
  isLoading?: boolean;
  error?: string | null;
}

export const ActivityList: React.FC<ActivityListProps> = ({ 
  activities,
  isLoading = false,
  error = null,
}) => {
  const getIconColor = (type: Activity['type']) => {
    switch (type) {
      case 'property':
        return 'text-primary-500';
      case 'client':
        return 'text-green-500';
      case 'appointment':
        return 'text-yellow-500';
      default:
        return 'text-neutral-500';
    }
  };

  const getIcon = (type: Activity['type']) => {
    switch (type) {
      case 'property':
        return 'home_work';
      case 'client':
        return 'people';
      case 'appointment':
        return 'event';
      default:
        return 'circle';
    }
  };

  return (
    <Card>
      <CardHeader className="px-4 py-5 border-b border-neutral-200 sm:px-6">
        <CardTitle className="text-lg font-medium leading-6 text-neutral-900">Recent Activities</CardTitle>
      </CardHeader>
      <CardContent className="px-4 py-0 divide-y divide-neutral-200">
        {isLoading ? (
          <div className="py-6 text-center text-neutral-500">Loading activities...</div>
        ) : error ? (
          <div className="py-6 text-center text-red-500">{error}</div>
        ) : activities.length === 0 ? (
          <div className="py-6 text-center text-neutral-500">No recent activities</div>
        ) : (
          activities.map((activity) => (
            <div key={activity.id} className="py-3">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <span className={`material-icons ${getIconColor(activity.type)}`}>
                    {activity.icon || getIcon(activity.type)}
                  </span>
                </div>
                <div className="ml-4 flex-1">
                  <div className="text-sm font-medium text-neutral-900">{activity.title}</div>
                  <div className="text-sm text-neutral-500">{activity.description}</div>
                  <div className="mt-1 text-xs text-neutral-400">
                    {formatDate(activity.timestamp)}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
      <CardFooter className="bg-neutral-50 px-4 py-4 rounded-b-lg">
        <div className="text-sm">
          <a href="/activities" className="font-medium text-primary-600 hover:text-primary-500">
            View all activity
          </a>
        </div>
      </CardFooter>
    </Card>
  );
};
