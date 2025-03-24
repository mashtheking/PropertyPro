import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import ClientForm from "@/components/client/client-form";
import { InsertClient } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";

export default function AddClient() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();

  const addClientMutation = useMutation({
    mutationFn: async (data: InsertClient) => {
      const res = await apiRequest("POST", "/api/clients", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      toast({
        title: "Client added successfully",
        description: "Your new client has been added to your database.",
      });
      navigate("/clients");
    },
    onError: (error) => {
      console.error("Error adding client:", error);
      toast({
        variant: "destructive",
        title: "Failed to add client",
        description: "There was an error adding your client. Please try again.",
      });
    },
  });

  const handleSubmit = async (data: Omit<InsertClient, "user_id">) => {
    if (!user?.id) {
      toast({
        variant: "destructive",
        title: "Authentication error",
        description: "Please log in again to add a client.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await addClientMutation.mutateAsync({
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
          <CardTitle>Add New Client</CardTitle>
        </CardHeader>
        <CardContent>
          <ClientForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
        </CardContent>
      </Card>
    </div>
  );
}
