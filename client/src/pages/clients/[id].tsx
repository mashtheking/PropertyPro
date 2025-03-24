import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { useClients } from '@/hooks/useClients';
import { useAppointments } from '@/hooks/useAppointments';
import ClientForm from '@/components/clients/ClientForm';
import AppointmentCard from '@/components/appointments/AppointmentCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Mail, 
  Phone, 
  Clock, 
  ArrowLeft,
  Trash2,
  CalendarPlus
} from 'lucide-react';
import { format } from 'date-fns';
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

const ClientDetail = () => {
  const { id } = useParams();
  const [_, navigate] = useLocation();
  const clientId = parseInt(id);
  const { clients, fetchClients, deleteClient } = useClients();
  const { appointments, fetchAppointments } = useAppointments();
  const [client, setClient] = useState(clients?.find(c => c.id === clientId));
  const [clientAppointments, setClientAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchClients();
        await fetchAppointments();
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading client data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load client details. Please try again.',
          variant: 'destructive',
        });
        setIsLoading(false);
      }
    };

    if (!client || !appointments) {
      loadData();
    } else {
      setIsLoading(false);
    }
  }, [client, appointments, fetchClients, fetchAppointments, toast]);

  // Update client when clients are loaded or changed
  useEffect(() => {
    if (clients) {
      const foundClient = clients.find(c => c.id === clientId);
      setClient(foundClient);
    }
  }, [clients, clientId]);

  // Filter appointments for this client
  useEffect(() => {
    if (appointments && client) {
      const filteredAppointments = appointments.filter(a => a.clientId === client.id);
      setClientAppointments(filteredAppointments);
    }
  }, [appointments, client]);

  const handleDelete = async () => {
    try {
      await deleteClient(clientId);
      toast({
        title: 'Client Deleted',
        description: 'Client has been deleted successfully.',
      });
      navigate('/clients');
    } catch (error) {
      console.error('Error deleting client:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete client. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Get client type color
  const getClientTypeColor = (clientType: string) => {
    switch (clientType) {
      case 'Buyer':
        return 'bg-green-100 text-green-800';
      case 'Seller':
        return 'bg-blue-100 text-blue-800';
      case 'Investor':
        return 'bg-purple-100 text-purple-800';
      case 'Renter':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center my-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-700"></div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="bg-white rounded-md shadow-sm p-8 text-center">
        <Users className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-semibold text-gray-900">Client not found</h3>
        <p className="mt-1 text-sm text-gray-500">
          The client you're looking for doesn't exist or you don't have access to it.
        </p>
        <div className="mt-6">
          <Button onClick={() => navigate('/clients')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Clients
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
        <ClientForm client={client} isEditing={true} />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="flex items-center mb-4 sm:mb-0">
          <Button variant="ghost" className="mr-4 p-2" onClick={() => navigate('/clients')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">{client.firstName} {client.lastName}</h1>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => setIsEditing(true)}>
            Edit Client
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
            <CardTitle>Client Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Badge className={getClientTypeColor(client.clientType)}>
                {client.clientType}
              </Badge>
            </div>

            <div className="flex flex-col space-y-4">
              {client.email && (
                <div className="flex items-start">
                  <Mail className="h-5 w-5 mr-2 text-gray-500 mt-0.5" />
                  <span>{client.email}</span>
                </div>
              )}
              
              {client.phone && (
                <div className="flex items-start">
                  <Phone className="h-5 w-5 mr-2 text-gray-500 mt-0.5" />
                  <span>{client.phone}</span>
                </div>
              )}
              
              {client.notes && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Notes</h3>
                  <p className="text-gray-700 whitespace-pre-line">{client.notes}</p>
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
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Created</h3>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-gray-500" />
                  <span>{format(new Date(client.createdAt), 'MMMM d, yyyy')}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Client's Appointments */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">Appointments</h2>
          <Link href={`/appointments/add?clientId=${client.id}`}>
            <Button>
              <CalendarPlus className="mr-2 h-4 w-4" />
              Schedule Appointment
            </Button>
          </Link>
        </div>

        {clientAppointments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clientAppointments.map(appointment => (
              <AppointmentCard 
                key={appointment.id} 
                appointment={appointment} 
                client={client} 
              />
            ))}
          </div>
        ) : (
          <Card className="bg-white">
            <CardContent className="p-6 text-center">
              <p className="text-gray-500 mb-4">No appointments found for this client</p>
              <Link href={`/appointments/add?clientId=${client.id}`}>
                <Button>Schedule First Appointment</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the client and all associated data.
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

export default ClientDetail;
