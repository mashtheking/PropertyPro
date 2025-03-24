import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Client, Appointment } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { ArrowLeft, Edit, Trash2, Mail, Phone, Calendar, MessageSquare } from "lucide-react";
import ClientForm from "@/components/client/client-form";
import AppointmentCard from "@/components/appointment/appointment-card";
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

interface ClientDetailProps {
  id: string;
}

export default function ClientDetail({ id }: ClientDetailProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [_, navigate] = useLocation();
  const { toast } = useToast();

  const { data: client, isLoading, error } = useQuery<Client>({
    queryKey: [`/api/clients/${id}`],
  });

  const { data: clientAppointments } = useQuery<Appointment[]>({
    queryKey: [`/api/clients/${id}/appointments`],
  });

  const updateClientMutation = useMutation({
    mutationFn: async (data: Partial<Client>) => {
      const res = await apiRequest("PATCH", `/api/clients/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/clients/${id}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      toast({
        title: "Client updated",
        description: "Client information has been updated successfully.",
      });
      setIsEditing(false);
    },
    onError: (error) => {
      console.error("Error updating client:", error);
      toast({
        variant: "destructive",
        title: "Update failed",
        description: "There was an error updating the client information.",
      });
    },
  });

  const deleteClientMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("DELETE", `/api/clients/${id}`, null);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      toast({
        title: "Client deleted",
        description: "Client has been removed from your database.",
      });
      navigate("/clients");
    },
    onError: (error) => {
      console.error("Error deleting client:", error);
      toast({
        variant: "destructive",
        title: "Delete failed",
        description: "There was an error deleting the client.",
      });
    },
  });

  const handleSubmit = async (data: Partial<Client>) => {
    setIsSubmitting(true);
    try {
      await updateClientMutation.mutateAsync(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    await deleteClientMutation.mutateAsync();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-3/4 max-w-md" />
          <Skeleton className="h-10 w-24" />
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="flex mb-6">
              <Skeleton className="h-20 w-20 rounded-full" />
              <div className="ml-6 space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !client) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <h3 className="text-xl font-medium text-gray-900 mb-2">Client not found</h3>
          <p className="text-gray-500 mb-6">
            The client you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Button onClick={() => navigate("/clients")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Clients
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
            Edit Client
          </h1>
          <Button variant="outline" onClick={() => setIsEditing(false)}>
            Cancel
          </Button>
        </div>
        <Card>
          <CardContent className="p-6">
            <ClientForm
              client={client}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => navigate("/clients")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Client Details
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-primary text-white rounded-full flex items-center justify-center text-3xl font-bold mb-4">
                {getInitials(client.first_name, client.last_name)}
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                {client.first_name} {client.last_name}
              </h2>
              <div className="mt-4 w-full space-y-3">
                {client.email && (
                  <a 
                    href={`mailto:${client.email}`} 
                    className="flex items-center p-2 rounded-md hover:bg-gray-100 transition-colors w-full"
                  >
                    <Mail className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-gray-700 text-sm truncate">{client.email}</span>
                  </a>
                )}
                {client.phone && (
                  <a 
                    href={`tel:${client.phone}`} 
                    className="flex items-center p-2 rounded-md hover:bg-gray-100 transition-colors w-full"
                  >
                    <Phone className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-gray-700 text-sm">{client.phone}</span>
                  </a>
                )}
                <div className="pt-4 border-t border-gray-200 mt-4">
                  <Link href={`/appointments/add?clientId=${client.id}`}>
                    <Button variant="outline" size="sm" className="w-full">
                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule Appointment
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Client Information</CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            {client.notes ? (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Notes</h3>
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="text-gray-700 whitespace-pre-line">{client.notes}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center bg-gray-50 p-6 rounded-md mb-6">
                <MessageSquare className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-gray-500">No notes available</span>
              </div>
            )}

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-sm font-medium text-gray-500 mb-4">Upcoming Appointments</h3>
              {clientAppointments && clientAppointments.length > 0 ? (
                <div className="space-y-4">
                  {clientAppointments.map((appointment) => (
                    <div key={appointment.id} className="border border-gray-200 rounded-md">
                      <AppointmentCard appointment={appointment} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center bg-gray-50 p-6 rounded-md">
                  <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-gray-500">No upcoming appointments</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this client?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the client
              and all associated data.
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
