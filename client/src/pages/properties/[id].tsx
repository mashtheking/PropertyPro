import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Property } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Bed, Bath, Home, MapPin, Check, ArrowLeft, Edit, Trash2 } from "lucide-react";
import PropertyForm from "@/components/property/property-form";
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

interface PropertyDetailProps {
  id: string;
}

export default function PropertyDetail({ id }: PropertyDetailProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [_, navigate] = useLocation();
  const { toast } = useToast();

  const { data: property, isLoading, error } = useQuery<Property>({
    queryKey: [`/api/properties/${id}`],
  });

  const updatePropertyMutation = useMutation({
    mutationFn: async (data: Partial<Property>) => {
      const res = await apiRequest("PATCH", `/api/properties/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/properties/${id}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/properties'] });
      toast({
        title: "Property updated",
        description: "Your property has been updated successfully.",
      });
      setIsEditing(false);
    },
    onError: (error) => {
      console.error("Error updating property:", error);
      toast({
        variant: "destructive",
        title: "Update failed",
        description: "There was an error updating your property.",
      });
    },
  });

  const deletePropertyMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("DELETE", `/api/properties/${id}`, null);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/properties'] });
      toast({
        title: "Property deleted",
        description: "Your property has been deleted successfully.",
      });
      navigate("/properties");
    },
    onError: (error) => {
      console.error("Error deleting property:", error);
      toast({
        variant: "destructive",
        title: "Delete failed",
        description: "There was an error deleting your property.",
      });
    },
  });

  const handleSubmit = async (data: Partial<Property>) => {
    setIsSubmitting(true);
    try {
      await updatePropertyMutation.mutateAsync(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    await deletePropertyMutation.mutateAsync();
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
            <Skeleton className="h-72 w-full mb-6" />
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-6 w-1/2 mb-4" />
            <div className="grid grid-cols-3 gap-4 mb-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !property) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <h3 className="text-xl font-medium text-gray-900 mb-2">Property not found</h3>
          <p className="text-gray-500 mb-6">
            The property you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Button onClick={() => navigate("/properties")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Properties
          </Button>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (isEditing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Edit Property
          </h1>
          <Button variant="outline" onClick={() => setIsEditing(false)}>
            Cancel
          </Button>
        </div>
        <Card>
          <CardContent className="p-6">
            <PropertyForm
              property={property}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
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
          <Button variant="outline" size="sm" onClick={() => navigate("/properties")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            {property.name}
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
        <CardContent className="p-6">
          {property.images && property.images.length > 0 ? (
            <div className="aspect-w-16 aspect-h-9 mb-6">
              <img
                src={property.images[0]}
                alt={property.name}
                className="object-cover w-full h-72 rounded-lg"
              />
            </div>
          ) : (
            <div className="bg-gray-200 flex items-center justify-center h-72 mb-6 rounded-lg">
              <Home className="h-16 w-16 text-gray-400" />
            </div>
          )}

          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{property.name}</h2>
              <div className="flex items-center text-gray-500 mt-1">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{property.address}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">{formatCurrency(property.price)}</div>
              <div className="text-sm text-gray-500">Listed property</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <Bed className="h-5 w-5 text-gray-400 mr-2" />
              <div>
                <span className="text-lg font-medium">{property.bedrooms}</span>
                <span className="text-gray-500 ml-1">bed</span>
              </div>
            </div>
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <Bath className="h-5 w-5 text-gray-400 mr-2" />
              <div>
                <span className="text-lg font-medium">{property.bathrooms}</span>
                <span className="text-gray-500 ml-1">bath</span>
              </div>
            </div>
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <Check className="h-5 w-5 text-gray-400 mr-2" />
              <div>
                <span className="text-lg font-medium">{property.square_feet}</span>
                <span className="text-gray-500 ml-1">sqft</span>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium mb-2">Description</h3>
            <p className="text-gray-700">{property.description || "No description provided."}</p>
          </div>

          <div className="border-t border-gray-200 mt-6 pt-6">
            <h3 className="text-lg font-medium mb-2">Property Details</h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Property Type</span>
                <span className="font-medium">{property.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Year Built</span>
                <span className="font-medium">N/A</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Property ID</span>
                <span className="font-medium">#{property.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Last Updated</span>
                <span className="font-medium">
                  {new Date(property.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this property?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the property
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
