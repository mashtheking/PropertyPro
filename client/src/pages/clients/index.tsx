import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ClientList } from '@/components/clients/client-list';
import { type Client } from '@shared/schema';
import { useNavigate } from 'react-router-dom'; // Added import for useNavigate

const ClientsIndex = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate(); // Added useNavigate hook

  const { 
    data: clients = [], 
    isLoading, 
    error 
  } = useQuery<Client[]>({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch('/api/clients', {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      });
      if (!response.ok) {
        if (response.status === 401) {
          // Redirect to login on 401 Unauthorized
          navigate('/login');
          return [];
        }
        throw new Error(`Failed to fetch clients: ${response.status} ${response.statusText}`);
      }
      return response.json();
    }
  });

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['clients'] });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    const err = error as Error;
    //More robust error handling.  Includes 401 check
    if (err.message.includes('401')) {
      navigate('/login');
      return null;
    }
    return <div>Error: {err.message}</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <ClientList clients={clients} onRefresh={handleRefresh} /> {/*Added onRefresh prop*/}
    </div>
  );
};

export default ClientsIndex;