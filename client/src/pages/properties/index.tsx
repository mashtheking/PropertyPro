import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { PropertyList } from '@/components/properties/property-list';
import { type Property } from '@shared/schema';
import { useNavigate } from 'react-router-dom'; // Added import for useNavigate

const PropertiesIndex = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate(); // Added useNavigate hook

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
        window.location.href = '/login'; //This line remains, as the changes didn't replace it.  Consider removing for consistency with the useNavigate approach below.
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

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    const err = error as Error;
    if (err.message.includes('401')) {
      navigate('/login'); // Using useNavigate for 401 errors
      return null;
    }
    return <div>Error: {err.message}</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <PropertyList properties={properties} />
    </div>
  );
};

export default PropertiesIndex;