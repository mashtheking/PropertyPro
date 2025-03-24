import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Client } from '@shared/schema';
import { clientService } from '@/services/clientService';

export const useClients = () => {
  const queryClient = useQueryClient();
  const [clients, setClients] = useState<Client[] | null>(null);

  // Fetch all clients
  const fetchClients = useCallback(async () => {
    try {
      const data = await clientService.getClients();
      setClients(data);
      return data;
    } catch (error) {
      console.error('Error fetching clients:', error);
      throw error;
    }
  }, []);

  // Get a single client
  const getClient = useCallback(async (id: number) => {
    try {
      const data = await clientService.getClient(id);
      return data;
    } catch (error) {
      console.error(`Error fetching client ${id}:`, error);
      throw error;
    }
  }, []);

  // Use react-query to fetch all clients
  const { isLoading, error, data } = useQuery({ 
    queryKey: ['/api/clients'],
    queryFn: fetchClients,
    enabled: false, // Disable auto-fetching
  });

  // Create client mutation
  const createClientMutation = useMutation({
    mutationFn: (clientData: Omit<Client, 'id' | 'userId' | 'createdAt'>) => {
      return clientService.createClient(clientData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      fetchClients(); // Refresh the clients list
    },
  });

  // Update client mutation
  const updateClientMutation = useMutation({
    mutationFn: ({ id, clientData }: { id: number; clientData: Partial<Client> }) => {
      return clientService.updateClient(id, clientData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      fetchClients(); // Refresh the clients list
    },
  });

  // Delete client mutation
  const deleteClientMutation = useMutation({
    mutationFn: (id: number) => {
      return clientService.deleteClient(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      fetchClients(); // Refresh the clients list
    },
  });

  // Helper methods that use the mutations
  const createClient = async (clientData: Omit<Client, 'id' | 'userId' | 'createdAt'>) => {
    return createClientMutation.mutateAsync(clientData);
  };

  const updateClient = async (id: number, clientData: Partial<Client>) => {
    return updateClientMutation.mutateAsync({ id, clientData });
  };

  const deleteClient = async (id: number) => {
    return deleteClientMutation.mutateAsync(id);
  };

  return {
    clients,
    fetchClients,
    getClient,
    createClient,
    updateClient,
    deleteClient,
    isLoading: isLoading || createClientMutation.isPending || updateClientMutation.isPending || deleteClientMutation.isPending,
    error,
  };
};
