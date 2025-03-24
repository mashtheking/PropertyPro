import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { useAppointments } from '@/hooks/useAppointments';
import { useClients } from '@/hooks/useClients';
import { useProperties } from '@/hooks/useProperties';
import AppointmentForm from '@/components/appointments/AppointmentForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar,
  Clock, 
  MapPin,
  User,
  Home,
  Bell,
  ArrowLeft,
  Trash2
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'wouter';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const AppointmentDetail = () => {
  const { id } = useParams();
  const [_, navigate] = useLocation();
  const appointmentId = parseInt(id);
  const { appointments, fetchAppointments, deleteAppointment } = useAppointments();
  const { clients, fetchClients } = useClients();
  const { properties, fetchProperties } = useProperties();
  const [appointment, setAppointment] = useState(appointments?.find(a => a.id === appointmentId));
  const [client, setClient] = useState(null);
  const [property, setProperty] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          fetchAppointments(),
          fetchClients(),
          fetchProperties()
        ]);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading appointment data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load appointment details. Please try again.',
          variant: 'destructive',
        });
        setIsLoading(false);
      }
    };

    if (!appointment || !clients || !properties) {
      loadData();
    } else {
      setIsLoading(false);
    }
  }, [appointment, clients, properties, fetchAppointments, fetchClients, fetchProperties, toast]);

  // Update appointment and related data when they are loaded or changed
  useEffect(() => {
    if (appointments) {
      const foundAppointment = appointments.find(a => a.id === appointmentId);
      setAppointment(foundAppointment);
      
      if (foundAppointment && clients) {
        const relatedClient = clients.find(c => c.id === foundAppointment.clientId);
        setClient(relatedClient || null);
      }
      
      if (foundAppointment && properties) {
        const relatedProperty = properties.find(p => p.id === foundAppointment.propertyId);
        setProperty(relatedProperty || null);
      }
    }
  }, [appointments, clients, properties, appointmentId]);

  const handleDelete = async () => {
    try {
      await deleteAppointment(appointmentId);
      toast({
        title: 'Appointment Deleted',
        description: 'Appointment has been deleted successfully.',
      });
      navigate('/appointments');
    } catch (error) {
      console.error('Error deleting appointment:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete appointment. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Get appointment type color
  const getAppointmentTypeColor = (type: string) => {
    switch (type) {
      case 'Property Viewing':
        return 'bg-primary-100 text-primary-600';
      case 'Client Meeting':
        return 'bg-secondary-100 text-secondary-600';
      case 'Contract Signing':
        return 'bg-premium-100 text-premium-600';
      case 'Phone Call':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center my-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-700"></div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="bg-white rounded-md shadow-sm p-8 text-center">
        <Calendar className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-semibold text-gray-900">Appointment not found</h3>
        <p className="mt-1 text-sm text-gray-500">
          The appointment you're looking for doesn't exist or you don't have access to it.
        </p>
        <div className="mt-6">
          <Button onClick={() => navigate('/appointments')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Appointments
          </Button>
        </div>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div>
        <div className="mb-6">
          <Button variant="ghost" onClick={() => setIsEditing(false)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Details
          </Button>
        </div>
        <AppointmentForm appointment={appointment} isEditing={true} />
      </div>
    );
  }

  // Format date and time
  const formatDate = (date: string | Date) => {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, 'MMMM d, yyyy');
  };

  const formatTime = (date: string | Date) => {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, 'h:mm a');
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="flex items-center mb-4 sm:mb-0">
          <Button variant="ghost" className="mr-4 p-2" onClick={() => navigate('/appointments')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">{appointment.title}</h1>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => setIsEditing(true)}>
            Edit Appointment
          </Button>
          <Button variant="destructive" onClick={() => setShowDeleteAlert(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Appointment Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Badge className={getAppointmentTypeColor(appointment.appointmentType)}>
                {appointment.appointmentType}
              </Badge>
            </div>

            <div className="flex flex-col space-y-4">
              <div className="flex items-start">
                <Calendar className="h-5 w-5 mr-2 text-gray-500 mt-0.5" />
                <span>{formatDate(appointment.date)}</span>
              </div>
              
              <div className="flex items-start">
                <Clock className="h-5 w-5 mr-2 text-gray-500 mt-0.5" />
                <span>{formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}</span>
              </div>
              
              {appointment.location && (
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 mr-2 text-gray-500 mt-0.5" />
                  <span>{appointment.location}</span>
                </div>
              )}
              
              {client && (
                <div className="flex items-start">
                  <User className="h-5 w-5 mr-2 text-gray-500 mt-0.5" />
                  <div>
                    <div className="font-medium">Client</div>
                    <Link href={`/clients/${client.id}`}>
                      <a className="text-primary-600 hover:underline">
                        {client.firstName} {client.lastName}
                      </a>
                    </Link>
                    {client.phone && (
                      <div className="text-sm text-gray-500">{client.phone}</div>
                    )}
                    {client.email && (
                      <div className="text-sm text-gray-500">{client.email}</div>
                    )}
                  </div>
                </div>
              )}
              
              {property && (
                <div className="flex items-start">
                  <Home className="h-5 w-5 mr-2 text-gray-500 mt-0.5" />
                  <div>
                    <div className="font-medium">Property</div>
                    <Link href={`/properties/${property.id}`}>
                      <a className="text-primary-600 hover:underline">
                        {property.name}
                      </a>
                    </Link>
                    <div className="text-sm text-gray-500">{property.address}</div>
                  </div>
                </div>
              )}
              
              {appointment.notes && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Notes</h3>
                  <p className="text-gray-700 whitespace-pre-line">{appointment.notes}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Bell className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-sm">Email Reminder</span>
                </div>
                <Badge className={appointment.sendReminder ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                  {appointment.sendReminder ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Created</h3>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-gray-500" />
                  <span>{format(new Date(appointment.createdAt), 'MMMM d, yyyy')}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this appointment.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AppointmentDetail;
