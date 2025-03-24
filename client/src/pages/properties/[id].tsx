import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { useProperties } from '@/hooks/useProperties';
import PropertyForm from '@/components/properties/PropertyForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Building, 
  MapPin, 
  DollarSign, 
  Bed, 
  Bath, 
  Move, 
  Clock, 
  ArrowLeft,
  Trash2
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
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

const PropertyDetail = () => {
  const { id } = useParams();
  const [_, navigate] = useLocation();
  const propertyId = parseInt(id);
  const { properties, fetchProperties, deleteProperty } = useProperties();
  const [property, setProperty] = useState(properties?.find(p => p.id === propertyId));
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadProperty = async () => {
      try {
        await fetchProperties();
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading property:', error);
        toast({
          title: 'Error',
          description: 'Failed to load property details. Please try again.',
          variant: 'destructive',
        });
        setIsLoading(false);
      }
    };

    if (!property) {
      loadProperty();
    } else {
      setIsLoading(false);
    }
  }, [property, propertyId, fetchProperties, toast]);

  // Update property when properties are loaded or changed
  useEffect(() => {
    if (properties) {
      const foundProperty = properties.find(p => p.id === propertyId);
      setProperty(foundProperty);
    }
  }, [properties, propertyId]);

  const handleDelete = async () => {
    try {
      await deleteProperty(propertyId);
      toast({
        title: 'Property Deleted',
        description: 'Property has been deleted successfully.',
      });
      navigate('/properties');
    } catch (error) {
      console.error('Error deleting property:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete property. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Sold':
        return 'bg-blue-100 text-blue-800';
      case 'Off Market':
        return 'bg-gray-100 text-gray-800';
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

  if (!property) {
    return (
      <div className="bg-white rounded-md shadow-sm p-8 text-center">
        <Building className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-semibold text-gray-900">Property not found</h3>
        <p className="mt-1 text-sm text-gray-500">
          The property you're looking for doesn't exist or you don't have access to it.
        </p>
        <div className="mt-6">
          <Button onClick={() => navigate('/properties')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Properties
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
        <PropertyForm property={property} isEditing={true} />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="flex items-center mb-4 sm:mb-0">
          <Button variant="ghost" className="mr-4 p-2" onClick={() => navigate('/properties')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">{property.name}</h1>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => setIsEditing(true)}>
            Edit Property
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
            <CardTitle>Property Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Badge className={getStatusColor(property.status)}>
                {property.status}
              </Badge>
            </div>

            <div className="flex flex-col space-y-4">
              <div className="flex items-start">
                <MapPin className="h-5 w-5 mr-2 text-gray-500 mt-0.5" />
                <span>{property.address}</span>
              </div>
              
              <div className="flex items-start">
                <DollarSign className="h-5 w-5 mr-2 text-gray-500 mt-0.5" />
                <span className="text-xl font-semibold">{formatCurrency(property.price)}</span>
              </div>
              
              <div className="grid grid-cols-3 gap-4 my-4">
                <div className="flex items-center">
                  <Bed className="h-5 w-5 mr-2 text-gray-500" />
                  <div>
                    <div className="text-sm text-gray-500">Bedrooms</div>
                    <div className="font-medium">{property.bedrooms}</div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Bath className="h-5 w-5 mr-2 text-gray-500" />
                  <div>
                    <div className="text-sm text-gray-500">Bathrooms</div>
                    <div className="font-medium">{property.bathrooms}</div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Move className="h-5 w-5 mr-2 text-gray-500" />
                  <div>
                    <div className="text-sm text-gray-500">Square Feet</div>
                    <div className="font-medium">{property.squareFeet}</div>
                  </div>
                </div>
              </div>
              
              {property.description && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Description</h3>
                  <p className="text-gray-700 whitespace-pre-line">{property.description}</p>
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
                  <span>{format(new Date(property.createdAt), 'MMMM d, yyyy')}</span>
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
              This action cannot be undone. This will permanently delete the property and all associated data.
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

export default PropertyDetail;
