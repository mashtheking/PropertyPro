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
import { insertClientSchema, type Client } from '@shared/schema';

// Create a schema for the client form using our insertClientSchema
const clientFormSchema = insertClientSchema;

type ClientFormValues = z.infer<typeof clientFormSchema>;

interface ClientFormProps {
  client?: Client;
  isEditing?: boolean;
}

export const ClientForm: React.FC<ClientFormProps> = ({ 
  client,
  isEditing = false,
}) => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Format client data for the form
  const defaultValues: Partial<ClientFormValues> = client ? {
    ...client,
  } : {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    clientType: 'Buyer',
    status: 'Active',
    address: '',
    preferences: '',
    notes: '',
  };

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues,
  });

  const onSubmit = async (data: ClientFormValues) => {
    setIsSubmitting(true);
    
    try {
      if (isEditing && client) {
        // Update existing client
        await apiRequest('PATCH', `/api/clients/${client.id}`, data);
        toast({
          title: 'Client updated',
          description: 'The client has been updated successfully',
        });
      } else {
        // Create new client
        await apiRequest('POST', '/api/clients', data);
        toast({
          title: 'Client created',
          description: 'The client has been created successfully',
        });
      }
      
      // Navigate back to clients list
      navigate('/clients');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'An error occurred while saving the client',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-neutral-900">
          {isEditing ? 'Edit Client' : 'Add New Client'}
        </h1>
        <Button
          variant="outline"
          onClick={() => navigate('/clients')}
        >
          <span className="material-icons mr-1">arrow_back</span>
          Back to Clients
        </Button>
      </div>

      <Card>
        <CardHeader className="px-4 py-5 border-b border-neutral-200 sm:px-6">
          <CardTitle className="text-lg font-medium leading-6 text-neutral-900">Client Information</CardTitle>
          <p className="mt-1 text-sm text-neutral-500">Please fill out all the required fields.</p>
        </CardHeader>
        <CardContent className="px-4 py-5 sm:p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-3">
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-3">
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-3">
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="john.doe@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-3">
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="(555) 123-4567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="clientType"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-3">
                      <FormLabel>Client Type</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select client type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Buyer">Buyer</SelectItem>
                            <SelectItem value="Seller">Seller</SelectItem>
                            <SelectItem value="Both">Both</SelectItem>
                            <SelectItem value="Lead">Lead</SelectItem>
                          </SelectContent>
                        </Select>
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
                            <SelectItem value="Inactive">Inactive</SelectItem>
                            <SelectItem value="Closed">Closed</SelectItem>
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
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input placeholder="123 Main St, Anytown, CA 12345" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="preferences"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-6">
                      <FormLabel>Property Preferences</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={3}
                          placeholder="List any specific requirements, price range, locations, etc."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-6">
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={3}
                          placeholder="Additional notes about this client"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="sm:col-span-6">
                  <label className="block text-sm font-medium text-neutral-700">Profile Photo</label>
                  <div className="mt-1 flex items-center">
                    <span className="h-12 w-12 rounded-full overflow-hidden bg-neutral-100">
                      <span className="material-icons text-neutral-300 h-full w-full flex items-center justify-center">person</span>
                    </span>
                    <button type="button" className="ml-5 bg-white py-2 px-3 border border-neutral-300 rounded-md shadow-sm text-sm leading-4 font-medium text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                      Change
                    </button>
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
            {isSubmitting ? 'Saving...' : isEditing ? 'Update Client' : 'Save Client'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
