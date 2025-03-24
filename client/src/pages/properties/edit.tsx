import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { PropertyForm } from '@/components/properties/property-form';
import { type Property } from '@shared/schema';

interface PropertiesEditProps {
  id: number;
}

const PropertiesEdit: React.FC<PropertiesEditProps> = ({ id }) => {
  const { 
    data: property, 
    isLoading, 
    error 
  } = useQuery<Property>({
    queryKey: [`/api/properties/${id}`],
  });

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="material-icons animate-spin text-4xl mb-4">refresh</div>
        <p>Loading property...</p>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="text-center py-8 text-red-500">
        <div className="material-icons text-4xl mb-4">error</div>
        <p>{error instanceof Error ? error.message : "Error loading property"}</p>
      </div>
    );
  }

  return <PropertyForm property={property} isEditing={true} />;
};

export default PropertiesEdit;
