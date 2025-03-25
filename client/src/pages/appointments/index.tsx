import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarView } from '@/components/appointments/calendar-view';
import { AppointmentList } from '@/components/appointments/appointment-list';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { type Appointment, type Client, type Property } from '@shared/schema';

const AppointmentsIndex = () => {
  const queryClient = useQueryClient();
  const [view, setView] = useState<'calendar' | 'list'>('calendar');
  
  const { 
    data: appointments = [], 
    isLoading: appointmentsLoading, 
    error: appointmentsError 
  } = useQuery<Appointment[]>({
    queryKey: ['appointments'],
    queryFn: async () => {
      const response = await fetch('/api/appointments', {
        credentials: 'include'
      });
      if (response.status === 401) {
        window.location.href = '/login';
        return [];
      }
      if (!response.ok) {
        throw new Error('Failed to fetch appointments');
      }
      return response.json();
    }
  });

  const { 
    data: clients = [], 
    isLoading: clientsLoading 
  } = useQuery<Client[]>({
    queryKey: ['/api/clients'],
  });

  const { 
    data: properties = [], 
    isLoading: propertiesLoading 
  } = useQuery<Property[]>({
    queryKey: ['/api/properties'],
  });

  const isLoading = appointmentsLoading || clientsLoading || propertiesLoading;
  const error = appointmentsError as string | null;

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-neutral-900">Appointments</h1>
      </div>

      <Tabs defaultValue="calendar" onValueChange={(value) => setView(value as 'calendar' | 'list')}>
        <TabsList className="mb-4">
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
        </TabsList>
        <TabsContent value="calendar">
          <CalendarView
            appointments={appointments}
            isLoading={isLoading}
            error={error}
          />
        </TabsContent>
        <TabsContent value="list">
          <AppointmentList
            appointments={appointments}
            clients={clients}
            properties={properties}
            isLoading={isLoading}
            error={error}
            onRefresh={handleRefresh}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AppointmentsIndex;
