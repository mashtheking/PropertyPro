import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import PropertyForm from "@/components/property/property-form";
import { InsertProperty } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";

export default function AddProperty() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();

  const addPropertyMutation = useMutation({
    mutationFn: async (data: InsertProperty) => {
      const res = await apiRequest("POST", "/api/properties", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/properties'] });
      toast({
        title: "Property added successfully",
        description: "Your new property has been added to your listings.",
      });
      navigate("/properties");
    },
    onError: (error) => {
      console.error("Error adding property:", error);
      toast({
        variant: "destructive",
        title: "Failed to add property",
        description: "There was an error adding your property. Please try again.",
      });
    },
  });

  const handleSubmit = async (data: Omit<InsertProperty, "user_id">) => {
    if (!user?.id) {
      toast({
        variant: "destructive",
        title: "Authentication error",
        description: "Please log in again to add a property.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await addPropertyMutation.mutateAsync({
        ...data,
        user_id: user.id,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Add New Property</CardTitle>
        </CardHeader>
        <CardContent>
          <PropertyForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
        </CardContent>
      </Card>
    </div>
  );
}
