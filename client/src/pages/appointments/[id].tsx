import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Appointment, Client, Property } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { ArrowLeft, Edit, Trash2, Calendar, Clock, User, Home, MapPin, FileText } from "lucide-react";
import AppointmentForm from "@/components/appointment/appointment-form";
import { format } from "date-fns";
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

interface AppointmentDetailProps {
  id: string;
}

export default function AppointmentDetail({ id }: AppointmentDetailProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [_, navigate] = useLocation();
  const { toast } = useToast();

  const { data: appointment, isLoading, error } = useQuery<Appointment>({
    queryKey: [`/api/appointments/${id}`],
  });
  
  const { data: clients } = useQuery<Client[]>({
    queryKey: ['/api/clients'],
  });
  
  const { data: properties } = useQuery<Property[]>({
    queryKey: ['/api/properties'],
  });

  const updateAppointmentMutation = useMutation({
    mutationFn: async (data: Partial<Appointment>) => {
      const res = await apiRequest("PATCH", `/api/appointments/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/appointments/${id}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
      toast({
        title: "Appointment updated",
        description: "Your appointment has been updated successfully.",
      });
      setIsEditing(false);
    },
    onError: (error) => {
      console.error("Error updating appointment:", error);
      toast({
        variant: "destructive",
        title: "Update failed",
        description: "There was an error updating your appointment.",
      });
    },
  });

  const deleteAppointmentMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("DELETE", `/api/appointments/${id}`, null);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
      toast({
        title: "Appointment deleted",
        description: "Your appointment has been deleted successfully.",
      });
      navigate("/appointments");
    },
    onError: (error) => {
      console.error("Error deleting appointment:", error);
      toast({
        variant: "destructive",
        title: "Delete failed",
        description: "There was an error deleting your appointment.",
      });
    },
  });

  const handleSubmit = async (data: Partial<Appointment>) => {
    setIsSubmitting(true);
    try {
      await updateAppointmentMutation.mutateAsync(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    await deleteAppointmentMutation.mutateAsync();
  };

  const client = appointment?.client_id ? clients?.find(c => c.id === appointment.client_id) : null;
  const property = appointment?.property_id ? properties?.find(p => p.id === appointment.property_id) : null;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-3/4 max-w-md" />
          <Skeleton className="h-10 w-24" />
        </div>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-8 w-1/2 mb-4" />
            <div className="grid grid-cols-2 gap-4 mb-6">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <h3 className="text-xl font-medium text-gray-900 mb-2">Appointment not found</h3>
          <p className="text-gray-500 mb-6">
            The appointment you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Button onClick={() => navigate("/appointments")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Appointments
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isEditing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Edit Appointment
          </h1>
          <Button variant="outline" onClick={() => setIsEditing(false)}>
            Cancel
          </Button>
        </div>
        <Card>
          <CardContent className="p-6">
            <AppointmentForm
              appointment={appointment}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              clients={clients || []}
              properties={properties || []}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => navigate("/appointments")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Appointment Details
          </h1>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="destructive" size="sm" onClick={() => setIsDeleteDialogOpen(true)}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{appointment.title}</CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                <div>
                  <div className="text-sm font-medium text-gray-500">Date</div>
                  <div className="text-gray-900">{format(new Date(appointment.date), 'EEEE, MMMM d, yyyy')}</div>
                </div>
              </div>
              
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-gray-400 mr-2" />
                <div>
                  <div className="text-sm font-medium text-gray-500">Time</div>
                  <div className="text-gray-900">{format(new Date(`2000-01-01T${appointment.time}`), 'h:mm a')}</div>
                </div>
              </div>
              
              {client && (
                <div className="flex items-center">
                  <User className="h-5 w-5 text-gray-400 mr-2" />
                  <div>
                    <div className="text-sm font-medium text-gray-500">Client</div>
                    <div className="text-gray-900">{client.first_name} {client.last_name}</div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              {property && (
                <div className="flex items-center">
                  <Home className="h-5 w-5 text-gray-400 mr-2" />
                  <div>
                    <div className="text-sm font-medium text-gray-500">Property</div>
                    <div className="text-gray-900">{property.name}</div>
                  </div>
                </div>
              )}
              
              {appointment.location && (
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                  <div>
                    <div className="text-sm font-medium text-gray-500">Location</div>
                    <div className="text-gray-900">{appointment.location}</div>
                  </div>
                </div>
              )}
              
              <div className="flex items-center">
                <FileText className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" />
                <div>
                  <div className="text-sm font-medium text-gray-500">Reminder</div>
                  <div className="text-gray-900">
                    {appointment.reminder_sent ? "Reminder sent" : "Reminder scheduled"}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {appointment.notes && (
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Notes</h3>
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-gray-700 whitespace-pre-line">{appointment.notes}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this appointment?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the appointment.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
