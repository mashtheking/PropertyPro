import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import AppointmentForm from '@/components/appointments/AppointmentForm';
import { useClients } from '@/hooks/useClients';
import { useProperties } from '@/hooks/useProperties';

const AppointmentAdd = () => {
  const [_, params] = useLocation();
  const [clientId, setClientId] = useState<number | null>(null);
  const [propertyId, setPropertyId] = useState<number | null>(null);
  const { fetchClients } = useClients();
  const { fetchProperties } = useProperties();

  // Parse query parameters for client or property ID
  useEffect(() => {
    // Parse the query parameters
    const searchParams = new URLSearchParams(params);
    
    const clientParam = searchParams.get('clientId');
    if (clientParam) {
      setClientId(parseInt(clientParam));
    }
    
    const propertyParam = searchParams.get('propertyId');
    if (propertyParam) {
      setPropertyId(parseInt(propertyParam));
    }
    
    // Fetch necessary data
    fetchClients();
    fetchProperties();
  }, [params, fetchClients, fetchProperties]);

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight mb-6">Schedule New Appointment</h1>
      <AppointmentForm 
        clientIdParam={clientId} 
        propertyIdParam={propertyId} 
      />
    </div>
  );
};

export default AppointmentAdd;
