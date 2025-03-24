import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Property } from '@shared/schema';
import { propertyService } from '@/services/propertyService';

export const useProperties = () => {
  const queryClient = useQueryClient();
  const [properties, setProperties] = useState<Property[] | null>(null);

  // Fetch all properties
  const fetchProperties = useCallback(async () => {
    try {
      const data = await propertyService.getProperties();
      setProperties(data);
      return data;
    } catch (error) {
      console.error('Error fetching properties:', error);
      throw error;
    }
  }, []);

  // Get a single property
  const getProperty = useCallback(async (id: number) => {
    try {
      const data = await propertyService.getProperty(id);
      return data;
    } catch (error) {
      console.error(`Error fetching property ${id}:`, error);
      throw error;
    }
  }, []);

  // Use react-query to fetch all properties
  const { isLoading, error, data } = useQuery({ 
    queryKey: ['/api/properties'],
    queryFn: fetchProperties,
    enabled: false, // Disable auto-fetching
  });

  // Create property mutation
  const createPropertyMutation = useMutation({
    mutationFn: (propertyData: Omit<Property, 'id' | 'userId' | 'createdAt'>) => {
      return propertyService.createProperty(propertyData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/properties'] });
      fetchProperties(); // Refresh the properties list
    },
  });

  // Update property mutation
  const updatePropertyMutation = useMutation({
    mutationFn: ({ id, propertyData }: { id: number; propertyData: Partial<Property> }) => {
      return propertyService.updateProperty(id, propertyData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/properties'] });
      fetchProperties(); // Refresh the properties list
    },
  });

  // Delete property mutation
  const deletePropertyMutation = useMutation({
    mutationFn: (id: number) => {
      return propertyService.deleteProperty(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/properties'] });
      fetchProperties(); // Refresh the properties list
    },
  });

  // Helper methods that use the mutations
  const createProperty = async (propertyData: Omit<Property, 'id' | 'userId' | 'createdAt'>) => {
    return createPropertyMutation.mutateAsync(propertyData);
  };

  const updateProperty = async (id: number, propertyData: Partial<Property>) => {
    return updatePropertyMutation.mutateAsync({ id, propertyData });
  };

  const deleteProperty = async (id: number) => {
    return deletePropertyMutation.mutateAsync(id);
  };

  return {
    properties,
    fetchProperties,
    getProperty,
    createProperty,
    updateProperty,
    deleteProperty,
    isLoading: isLoading || createPropertyMutation.isPending || updatePropertyMutation.isPending || deletePropertyMutation.isPending,
    error,
  };
};
