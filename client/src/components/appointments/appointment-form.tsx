import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { insertAppointmentSchema, type Appointment, type Client, type Property } from '@shared/schema';

// Create a schema for the appointment form using our insertAppointmentSchema
const appointmentFormSchema = insertAppointmentSchema.extend({
  date: z.string().min(1, { message: 'Date is required' }),
  clientId: z.string().min(1, { message: 'Client is required' }).transform(val => parseInt(val)),
  propertyId: z.string().optional().transform(val => val ? parseInt(val) : undefined),
});

type AppointmentFormValues = z.infer<typeof appointmentFormSchema>;

interface AppointmentFormProps {
  appointment?: Appointment;
  isEditing?: boolean;
}

export const AppointmentForm: React.FC<AppointmentFormProps> = ({ 
  appointment,
  isEditing = false,
}) => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch clients
  const { data: clients = [], isLoading: isClientsLoading } = useQuery<Client[]>({
    queryKey: ['/api/clients'],
  });

  // Fetch properties
  const { data: properties = [], isLoading: isPropertiesLoading } = useQuery<Property[]>({
    queryKey: ['/api/properties'],
  });

  // Format appointment data for the form
  const defaultValues: Partial<AppointmentFormValues> = appointment ? {
    ...appointment,
    date: appointment.date ? new Date(appointment.date).toISOString().split('T')[0] : '',
    clientId: String(appointment.clientId),
    propertyId: appointment.propertyId ? String(appointment.propertyId) : undefined,
  } : {
    title: '',
    date: new Date().toISOString().split('T')[0],
    time: '10:00',
    location: '',
    description: '',
    emailReminder: true,
  };

  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues,
  });

  const onSubmit = async (data: AppointmentFormValues) => {
    setIsSubmitting(true);
    
    try {
      if (isEditing && appointment) {
        // Update existing appointment
        await apiRequest('PATCH', `/api/appointments/${appointment.id}`, data);
        toast({
          title: 'Appointment updated',
          description: 'The appointment has been updated successfully',
        });
      } else {
        // Create new appointment
        await apiRequest('POST', '/api/appointments', data);
        toast({
          title: 'Appointment created',
          description: 'The appointment has been created successfully',
        });
      }
      
      // Navigate back to appointments list
      navigate('/appointments');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'An error occurred while saving the appointment',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-neutral-900">
          {isEditing ? 'Edit Appointment' : 'Add New Appointment'}
        </h1>
        <Button
          variant="outline"
          onClick={() => navigate('/appointments')}
        >
          <span className="material-icons mr-1">arrow_back</span>
          Back to Appointments
        </Button>
      </div>

      <Card>
        <CardHeader className="px-4 py-5 border-b border-neutral-200 sm:px-6">
          <CardTitle className="text-lg font-medium leading-6 text-neutral-900">Appointment Details</CardTitle>
          <p className="mt-1 text-sm text-neutral-500">Please fill out all the required fields.</p>
        </CardHeader>
        <CardContent className="px-4 py-5 sm:p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-6">
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Property Showing, Client Meeting, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-3">
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="time"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-3">
                      <FormLabel>Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="clientId"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-3">
                      <FormLabel>Client</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value?.toString()}
                          onValueChange={field.onChange}
                          disabled={isClientsLoading}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a client" />
                          </SelectTrigger>
                          <SelectContent>
                            {isClientsLoading ? (
                              <SelectItem value="">Loading clients...</SelectItem>
                            ) : clients.length === 0 ? (
                              <SelectItem value="">No clients available</SelectItem>
                            ) : (
                              clients.map((client) => (
                                <SelectItem key={client.id} value={client.id.toString()}>
                                  {client.firstName} {client.lastName}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="propertyId"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-3">
                      <FormLabel>Property (Optional)</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value?.toString() || ''}
                          onValueChange={field.onChange}
                          disabled={isPropertiesLoading}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a property" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">None</SelectItem>
                            {isPropertiesLoading ? (
                              <SelectItem value="">Loading properties...</SelectItem>
                            ) : properties.length === 0 ? (
                              <SelectItem value="">No properties available</SelectItem>
                            ) : (
                              properties.map((property) => (
                                <SelectItem key={property.id} value={property.id.toString()}>
                                  {property.name} - {property.address}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-6">
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="Property Address, Office, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-6">
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={3}
                          placeholder="Details about the appointment"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="emailReminder"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-6 flex flex-row items-start space-x-3 space-y-0 mt-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Send email reminder</FormLabel>
                        <p className="text-sm text-neutral-500">
                          A reminder will be sent 24 hours before the appointment.
                        </p>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="px-4 py-3 bg-neutral-50 text-right sm:px-6 border-t border-neutral-200">
          <Button
            type="submit"
            onClick={form.handleSubmit(onSubmit)}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : isEditing ? 'Update Appointment' : 'Save Appointment'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
