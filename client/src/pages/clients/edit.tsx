import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { ClientForm } from '@/components/clients/client-form';
import { type Client } from '@shared/schema';

interface ClientsEditProps {
  id: number;
}

const ClientsEdit: React.FC<ClientsEditProps> = ({ id }) => {
  const { 
    data: client, 
    isLoading, 
    error 
  } = useQuery<Client>({
    queryKey: [`/api/clients/${id}`],
  });

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="material-icons animate-spin text-4xl mb-4">refresh</div>
        <p>Loading client...</p>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="text-center py-8 text-red-500">
        <div className="material-icons text-4xl mb-4">error</div>
        <p>{error instanceof Error ? error.message : "Error loading client"}</p>
      </div>
    );
  }

  return <ClientForm client={client} isEditing={true} />;
};

export default ClientsEdit;
