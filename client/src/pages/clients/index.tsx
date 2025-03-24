import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ClientList } from '@/components/clients/client-list';
import { type Client } from '@shared/schema';

const ClientsIndex = () => {
  const queryClient = useQueryClient();
  
  const { 
    data: clients = [], 
    isLoading, 
    error 
  } = useQuery<Client[]>({
    queryKey: ['/api/clients'],
  });

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
  };

  return (
    <ClientList
      clients={clients}
      isLoading={isLoading}
      error={error as string | null}
      onRefresh={handleRefresh}
    />
  );
};

export default ClientsIndex;
