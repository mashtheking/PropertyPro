import { useState } from "react";
import { useLocation, useSearch } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import AppointmentForm from "@/components/appointment/appointment-form";
import { InsertAppointment, Client, Property } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";

export default function AddAppointment() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [_, navigate] = useLocation();
  const search = useSearch();
  const searchParams = new URLSearchParams(search);
  const preSelectedClientId = searchParams.get("clientId") ? parseInt(searchParams.get("clientId")!) : undefined;
  const preSelectedPropertyId = searchParams.get("propertyId") ? parseInt(searchParams.get("propertyId")!) : undefined;
  
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch clients and properties for dropdown menus
  const { data: clients } = useQuery<Client[]>({
    queryKey: ['/api/clients'],
  });
  
  const { data: properties } = useQuery<Property[]>({
    queryKey: ['/api/properties'],
  });

  const addAppointmentMutation = useMutation({
    mutationFn: async (data: InsertAppointment) => {
      const res = await apiRequest("POST", "/api/appointments", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
      toast({
        title: "Appointment scheduled",
        description: "Your appointment has been scheduled successfully.",
      });
      navigate("/appointments");
    },
    onError: (error) => {
      console.error("Error adding appointment:", error);
      toast({
        variant: "destructive",
        title: "Failed to schedule appointment",
        description: "There was an error scheduling your appointment. Please try again.",
      });
    },
  });

  const handleSubmit = async (data: Omit<InsertAppointment, "user_id">) => {
    if (!user?.id) {
      toast({
        variant: "destructive",
        title: "Authentication error",
        description: "Please log in again to schedule an appointment.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await addAppointmentMutation.mutateAsync({
        ...data,
        user_id: user.id,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Schedule New Appointment</CardTitle>
        </CardHeader>
        <CardContent>
          <AppointmentForm 
            onSubmit={handleSubmit} 
            isSubmitting={isSubmitting} 
            clients={clients || []} 
            properties={properties || []}
            initialClientId={preSelectedClientId}
            initialPropertyId={preSelectedPropertyId}
          />
        </CardContent>
      </Card>
    </div>
  );
}
