import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppointments } from '@/hooks/useAppointments';
import { useClients } from '@/hooks/useClients';
import { useProperties } from '@/hooks/useProperties';
import { Appointment, Client, Property } from '@shared/schema';

// Extend the appointment schema for form validation
const appointmentFormSchema = z.object({
  title: z.string().min(2, { message: 'Title must be at least 2 characters' }),
  date: z.date({ required_error: 'Please select a date' }),
  startTime: z.string({ required_error: 'Please select a start time' }),
  endTime: z.string({ required_error: 'Please select an end time' }),
  location: z.string().optional().or(z.literal('')),
  appointmentType: z.string(),
  clientId: z.coerce.number().optional().nullable(),
  propertyId: z.coerce.number().optional().nullable(),
  notes: z.string().optional().or(z.literal('')),
  sendReminder: z.boolean().default(true),
});

type AppointmentFormValues = z.infer<typeof appointmentFormSchema>;

interface AppointmentFormProps {
  appointment?: Appointment;
  isEditing?: boolean;
}

const AppointmentForm = ({ appointment, isEditing = false }: AppointmentFormProps) => {
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const { createAppointment, updateAppointment } = useAppointments();
  const { clients } = useClients();
  const { properties } = useProperties();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableClients, setAvailableClients] = useState<Client[]>([]);
  const [availableProperties, setAvailableProperties] = useState<Property[]>([]);

  useEffect(() => {
    // Set available clients and properties when data is loaded
    if (clients) {
      setAvailableClients(clients);
    }
    if (properties) {
      setAvailableProperties(properties);
    }
  }, [clients, properties]);

  // Parse date and time from appointment if editing
  const getDefaultDate = () => {
    if (appointment?.date) {
      return new Date(appointment.date);
    }
    return new Date();
  };

  const getDefaultStartTime = () => {
    if (appointment?.startTime) {
      const startTime = new Date(appointment.startTime);
      return format(startTime, 'HH:mm');
    }
    return '09:00';
  };

  const getDefaultEndTime = () => {
    if (appointment?.endTime) {
      const endTime = new Date(appointment.endTime);
      return format(endTime, 'HH:mm');
    }
    return '10:00';
  };

  // Initialize form with existing appointment data or defaults
  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      title: appointment?.title || '',
      date: getDefaultDate(),
      startTime: getDefaultStartTime(),
      endTime: getDefaultEndTime(),
      location: appointment?.location || '',
      appointmentType: appointment?.appointmentType || 'Property Viewing',
      clientId: appointment?.clientId || undefined,
      propertyId: appointment?.propertyId || undefined,
      notes: appointment?.notes || '',
      sendReminder: appointment?.sendReminder ?? true,
    },
  });

  const onSubmit = async (data: AppointmentFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Convert form values to the format the API expects
      const startDateTime = new Date(data.date);
      const [startHours, startMinutes] = data.startTime.split(':').map(Number);
      startDateTime.setHours(startHours, startMinutes);
      
      const endDateTime = new Date(data.date);
      const [endHours, endMinutes] = data.endTime.split(':').map(Number);
      endDateTime.setHours(endHours, endMinutes);
      
      const appointmentData = {
        ...data,
        startTime: startDateTime,
        endTime: endDateTime,
      };
      
      if (isEditing && appointment) {
        // Update existing appointment
        await updateAppointment(appointment.id, appointmentData);
        toast({
          title: 'Appointment Updated',
          description: 'Appointment has been updated successfully.',
        });
      } else {
        // Create new appointment
        await createAppointment(appointmentData);
        toast({
          title: 'Appointment Created',
          description: 'New appointment has been created successfully.',
        });
      }
      navigate('/appointments');
    } catch (error) {
      console.error('Appointment form submission error:', error);
      toast({
        title: 'Error',
        description: `Failed to ${isEditing ? 'update' : 'create'} appointment. Please try again.`,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Appointment' : 'Schedule Appointment'}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Property Viewing" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className="pl-3 text-left font-normal"
                          >
                            {field.value ? (
                              format(field.value, 'PPP')
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="appointmentType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Property Viewing">Property Viewing</SelectItem>
                        <SelectItem value="Client Meeting">Client Meeting</SelectItem>
                        <SelectItem value="Contract Signing">Contract Signing</SelectItem>
                        <SelectItem value="Phone Call">Phone Call</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g. 123 Property Address or Virtual Meeting" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="clientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(value === "none" ? null : parseInt(value))}
                    defaultValue={field.value?.toString() || "none"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a client" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {availableClients.map((client) => (
                        <SelectItem key={client.id} value={client.id.toString()}>
                          {client.firstName} {client.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="propertyId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Property (Optional)</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(value === "none" ? null : parseInt(value))}
                    defaultValue={field.value?.toString() || "none"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a property" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {availableProperties.map((property) => (
                        <SelectItem key={property.id} value={property.id.toString()}>
                          {property.name} - {property.address}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional details about this appointment"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="sendReminder"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Send Email Reminder</FormLabel>
                    <FormDescription>
                      Send an email reminder 24 hours before the appointment
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <div className="bg-gray-50 py-3 flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/appointments')}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {isEditing ? 'Updating...' : 'Scheduling...'}
                  </div>
                ) : (
                  isEditing ? 'Update Appointment' : 'Schedule Appointment'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

// Add the missing FormDescription component
import { FormDescription } from '@/components/ui/form';

export default AppointmentForm;
