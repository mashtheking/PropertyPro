import { useState } from 'react';
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
import { useProperties } from '@/hooks/useProperties';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Property } from '@shared/schema';

// Extend the property schema for form validation
const propertyFormSchema = z.object({
  name: z.string().min(2, { message: 'Property name must be at least 2 characters' }),
  address: z.string().min(5, { message: 'Address must be at least 5 characters' }),
  price: z.coerce.number().positive({ message: 'Price must be a positive number' }),
  bedrooms: z.coerce.number().int().nonnegative(),
  bathrooms: z.coerce.number().nonnegative(),
  squareFeet: z.coerce.number().int().nonnegative(),
  status: z.string(),
  description: z.string().optional(),
});

type PropertyFormValues = z.infer<typeof propertyFormSchema>;

interface PropertyFormProps {
  property?: Property;
  isEditing?: boolean;
}

const PropertyForm = ({ property, isEditing = false }: PropertyFormProps) => {
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const { createProperty, updateProperty } = useProperties();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with existing property data or defaults
  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: {
      name: property?.name || '',
      address: property?.address || '',
      price: property?.price || 0,
      bedrooms: property?.bedrooms || 0,
      bathrooms: property?.bathrooms || 0,
      squareFeet: property?.squareFeet || 0,
      status: property?.status || 'Active',
      description: property?.description || '',
    },
  });

  const onSubmit = async (data: PropertyFormValues) => {
    setIsSubmitting(true);
    try {
      if (isEditing && property) {
        // Update existing property
        await updateProperty(property.id, data);
        toast({
          title: 'Property Updated',
          description: 'Property has been updated successfully.',
        });
      } else {
        // Create new property
        await createProperty(data);
        toast({
          title: 'Property Created',
          description: 'New property has been created successfully.',
        });
      }
      navigate('/properties');
    } catch (error) {
      console.error('Property form submission error:', error);
      toast({
        title: 'Error',
        description: `Failed to ${isEditing ? 'update' : 'create'} property. Please try again.`,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Property' : 'Add New Property'}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Property Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Modern Villa" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Full property address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price ($)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g. 350000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Sold">Sold</SelectItem>
                        <SelectItem value="Off Market">Off Market</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="bedrooms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Beds</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g. 3" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="bathrooms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Baths</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.5" placeholder="e.g. 2.5" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="squareFeet"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sq. Ft.</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g. 2000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the property"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="bg-gray-50 py-3 flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/properties')}
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
                    {isEditing ? 'Updating...' : 'Saving...'}
                  </div>
                ) : (
                  isEditing ? 'Update Property' : 'Save Property'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default PropertyForm;
