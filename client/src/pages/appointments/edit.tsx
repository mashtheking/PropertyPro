import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { AppointmentForm } from '@/components/appointments/appointment-form';
import { type Appointment } from '@shared/schema';

interface AppointmentsEditProps {
  id: number;
}

const AppointmentsEdit: React.FC<AppointmentsEditProps> = ({ id }) => {
  const { 
    data: appointment, 
    isLoading, 
    error 
  } = useQuery<Appointment>({
    queryKey: [`/api/appointments/${id}`],
  });

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="material-icons animate-spin text-4xl mb-4">refresh</div>
        <p>Loading appointment...</p>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="text-center py-8 text-red-500">
        <div className="material-icons text-4xl mb-4">error</div>
        <p>{error instanceof Error ? error.message : "Error loading appointment"}</p>
      </div>
    );
  }

  return <AppointmentForm appointment={appointment} isEditing={true} />;
};

export default AppointmentsEdit;
