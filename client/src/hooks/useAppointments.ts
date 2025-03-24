import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Appointment } from '@shared/schema';
import { appointmentService } from '@/services/appointmentService';

export const useAppointments = () => {
  const queryClient = useQueryClient();
  const [appointments, setAppointments] = useState<Appointment[] | null>(null);

  // Fetch all appointments
  const fetchAppointments = useCallback(async () => {
    try {
      const data = await appointmentService.getAppointments();
      setAppointments(data);
      return data;
    } catch (error) {
      console.error('Error fetching appointments:', error);
      throw error;
    }
  }, []);

  // Fetch upcoming appointments
  const fetchUpcomingAppointments = useCallback(async () => {
    try {
      const data = await appointmentService.getUpcomingAppointments();
      setAppointments(data);
      return data;
    } catch (error) {
      console.error('Error fetching upcoming appointments:', error);
      throw error;
    }
  }, []);

  // Get a single appointment
  const getAppointment = useCallback(async (id: number) => {
    try {
      const data = await appointmentService.getAppointment(id);
      return data;
    } catch (error) {
      console.error(`Error fetching appointment ${id}:`, error);
      throw error;
    }
  }, []);

  // Use react-query to fetch all appointments
  const { isLoading, error, data } = useQuery({ 
    queryKey: ['/api/appointments'],
    queryFn: fetchAppointments,
    enabled: false, // Disable auto-fetching
  });

  // Create appointment mutation
  const createAppointmentMutation = useMutation({
    mutationFn: (appointmentData: Omit<Appointment, 'id' | 'userId' | 'reminderSent' | 'createdAt'>) => {
      return appointmentService.createAppointment(appointmentData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
      fetchAppointments(); // Refresh the appointments list
    },
  });

  // Update appointment mutation
  const updateAppointmentMutation = useMutation({
    mutationFn: ({ id, appointmentData }: { id: number; appointmentData: Partial<Appointment> }) => {
      return appointmentService.updateAppointment(id, appointmentData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
      fetchAppointments(); // Refresh the appointments list
    },
  });

  // Delete appointment mutation
  const deleteAppointmentMutation = useMutation({
    mutationFn: (id: number) => {
      return appointmentService.deleteAppointment(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
      fetchAppointments(); // Refresh the appointments list
    },
  });

  // Helper methods that use the mutations
  const createAppointment = async (appointmentData: Omit<Appointment, 'id' | 'userId' | 'reminderSent' | 'createdAt'>) => {
    return createAppointmentMutation.mutateAsync(appointmentData);
  };

  const updateAppointment = async (id: number, appointmentData: Partial<Appointment>) => {
    return updateAppointmentMutation.mutateAsync({ id, appointmentData });
  };

  const deleteAppointment = async (id: number) => {
    return deleteAppointmentMutation.mutateAsync(id);
  };

  return {
    appointments,
    fetchAppointments,
    fetchUpcomingAppointments,
    getAppointment,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    isLoading: isLoading || createAppointmentMutation.isPending || updateAppointmentMutation.isPending || deleteAppointmentMutation.isPending,
    error,
  };
};
