import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { insertPropertySchema, type Property } from '@shared/schema';

// Create a schema for the property form using our insertPropertySchema
const propertyFormSchema = insertPropertySchema.extend({
  price: z.string().min(1, { message: 'Price is required' }),
  bedrooms: z.string().optional().transform(val => val ? parseInt(val) : undefined),
  bathrooms: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
  squareFeet: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
  lotSize: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
  yearBuilt: z.string().optional().transform(val => val ? parseInt(val) : undefined),
});

type PropertyFormValues = z.infer<typeof propertyFormSchema>;

interface PropertyFormProps {
  property?: Property;
  isEditing?: boolean;
}

export const PropertyForm: React.FC<PropertyFormProps> = ({ 
  property,
  isEditing = false,
}) => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Format property data for the form
  const defaultValues: Partial<PropertyFormValues> = property ? {
    ...property,
    price: property.price.toString(),
    bedrooms: property.bedrooms?.toString(),
    bathrooms: property.bathrooms?.toString(),
    squareFeet: property.squareFeet?.toString(),
    lotSize: property.lotSize?.toString(),
    yearBuilt: property.yearBuilt?.toString(),
  } : {
    name: '',
    propertyType: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    price: '',
    status: 'Active',
    description: '',
  };

  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues,
  });

  const onSubmit = async (data: PropertyFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Convert string values to appropriate types
      const propertyData = {
        ...data,
        price: parseFloat(data.price),
      };
      
      if (isEditing && property) {
        // Update existing property
        await apiRequest('PATCH', `/api/properties/${property.id}`, propertyData);
        toast({
          title: 'Property updated',
          description: 'The property has been updated successfully',
        });
      } else {
        // Create new property
        await apiRequest('POST', '/api/properties', propertyData);
        toast({
          title: 'Property created',
          description: 'The property has been created successfully',
        });
      }
      
      // Navigate back to properties list
      navigate('/properties');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'An error occurred while saving the property',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-neutral-900">
          {isEditing ? 'Edit Property' : 'Add New Property'}
        </h1>
        <Button
          variant="outline"
          onClick={() => navigate('/properties')}
        >
          <span className="material-icons mr-1">arrow_back</span>
          Back to Properties
        </Button>
      </div>

      <Card>
        <CardHeader className="px-4 py-5 border-b border-neutral-200 sm:px-6">
          <CardTitle className="text-lg font-medium leading-6 text-neutral-900">Property Information</CardTitle>
          <p className="mt-1 text-sm text-neutral-500">Please fill out all the required fields.</p>
        </CardHeader>
        <CardContent className="px-4 py-5 sm:p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-3">
                      <FormLabel>Property Name/Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Charming Downtown Condo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="propertyType"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-3">
                      <FormLabel>Property Type</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Single Family">Single Family</SelectItem>
                            <SelectItem value="Condo">Condo</SelectItem>
                            <SelectItem value="Townhouse">Townhouse</SelectItem>
                            <SelectItem value="Multi-family">Multi-family</SelectItem>
                            <SelectItem value="Land">Land</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-6">
                      <FormLabel>Street Address</FormLabel>
                      <FormControl>
                        <Input placeholder="123 Main Street" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="Anytown" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input placeholder="CA" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="zipCode"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>ZIP Code</FormLabel>
                      <FormControl>
                        <Input placeholder="12345" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-neutral-500">$</span>
                          </div>
                          <Input placeholder="450000" className="pl-7" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bedrooms"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>Bedrooms</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="3" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bathrooms"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>Bathrooms</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.5" placeholder="2" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="squareFeet"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-3">
                      <FormLabel>Square Feet</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="1500" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lotSize"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-3">
                      <FormLabel>Lot Size (acres)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="0.25" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="yearBuilt"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-3">
                      <FormLabel>Year Built</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="2010" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-3">
                      <FormLabel>Status</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Active">Active</SelectItem>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="Sold">Sold</SelectItem>
                            <SelectItem value="Off Market">Off Market</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-6">
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={5}
                          placeholder="Enter a detailed description of the property"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="sm:col-span-6">
                  <label className="block text-sm font-medium text-neutral-700">Property Photos</label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-neutral-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      <span className="material-icons mx-auto h-12 w-12 text-neutral-400">cloud_upload</span>
                      <div className="flex text-sm text-neutral-600">
                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500">
                          <span>Upload files</span>
                          <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-neutral-500">
                        PNG, JPG, GIF up to 10MB each
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="px-4 py-3 bg-neutral-50 text-right sm:px-6 border-t border-neutral-200">
          <Button
            type="submit"
            onClick={form.handleSubmit(onSubmit)}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : isEditing ? 'Update Property' : 'Save Property'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
