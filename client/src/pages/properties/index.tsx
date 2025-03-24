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
    queryKey: ['/api/properties'],
  });

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/properties'] });
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
