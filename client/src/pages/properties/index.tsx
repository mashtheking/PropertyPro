import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { PropertyList } from '@/components/properties/property-list';
import { type Property } from '@shared/schema';

const PropertiesIndex = () => {
  const queryClient = useQueryClient();

  const { 
    data: properties = [], 
    isLoading, 
    error 
  } = useQuery<Property[]>({
    queryKey: ['properties'],
    queryFn: async () => {
      const response = await fetch('/api/properties', {
        credentials: 'include'
      });
      if (response.status === 401) {
        window.location.href = '/login';
        return [];
      }
      if (!response.ok) {
        throw new Error('Failed to fetch properties');
      }
      return response.json();
    }
  });

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['properties'] });
  };

  return (
    <PropertyList
      properties={properties}
      isLoading={isLoading}
      error={error as string | null}
      onRefresh={handleRefresh}
    />
  );
};

export default PropertiesIndex;