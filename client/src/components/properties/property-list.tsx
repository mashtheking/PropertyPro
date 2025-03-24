import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { formatCurrency, formatDate } from '@/lib/utils';
import { type Property } from '@shared/schema';

interface PropertyListProps {
  properties: Property[];
  isLoading: boolean;
  error: string | null;
  onRefresh: () => void;
}

export const PropertyList: React.FC<PropertyListProps> = ({
  properties,
  isLoading,
  error,
  onRefresh,
}) => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [propertyTypeFilter, setPropertyTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Handle property deletion
  const handleDeleteProperty = async (propertyId: number) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      try {
        await apiRequest('DELETE', `/api/properties/${propertyId}`, undefined);
        toast({
          title: 'Property deleted',
          description: 'The property has been deleted successfully',
        });
        onRefresh();
      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error.message || 'An error occurred while deleting the property',
        });
      }
    }
  };

  // Filter properties based on search and filters
  const filteredProperties = properties.filter(property => {
    const matchesSearch = searchTerm === '' || 
      property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.zipCode.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPropertyType = propertyTypeFilter === '' || 
      property.propertyType === propertyTypeFilter;
    
    const matchesStatus = statusFilter === '' || 
      property.status === statusFilter;
    
    return matchesSearch && matchesPropertyType && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredProperties.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProperties = filteredProperties.slice(indexOfFirstItem, indexOfLastItem);

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Sold':
        return 'bg-blue-100 text-blue-800';
      case 'Off Market':
        return 'bg-neutral-100 text-neutral-800';
      default:
        return 'bg-neutral-100 text-neutral-800';
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="material-icons animate-spin text-4xl mb-4">refresh</div>
        <p>Loading properties...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        <div className="material-icons text-4xl mb-4">error</div>
        <p>{error}</p>
        <Button className="mt-4" onClick={onRefresh}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-neutral-900">Properties</h1>
        <Button onClick={() => navigate('/properties/new')}>
          <span className="material-icons mr-1">add</span>
          Add Property
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="col-span-1 md:col-span-2">
              <label htmlFor="search" className="block text-sm font-medium text-neutral-700 mb-1">Search</label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-icons text-neutral-500 text-sm">search</span>
                </div>
                <Input
                  type="text"
                  name="search"
                  id="search"
                  placeholder="Address, city, or property ID"
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label htmlFor="property-type" className="block text-sm font-medium text-neutral-700 mb-1">Property Type</label>
              <Select value={propertyTypeFilter} onValueChange={setPropertyTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  <SelectItem value="Single Family">Single Family</SelectItem>
                  <SelectItem value="Condo">Condo</SelectItem>
                  <SelectItem value="Townhouse">Townhouse</SelectItem>
                  <SelectItem value="Multi-family">Multi-family</SelectItem>
                  <SelectItem value="Land">Land</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-neutral-700 mb-1">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Statuses</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Sold">Sold</SelectItem>
                  <SelectItem value="Off Market">Off Market</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Properties List */}
      <Card>
        <div className="min-w-full divide-y divide-neutral-200">
          <div className="bg-neutral-50 border-b">
            <div className="grid grid-cols-12 gap-2 px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
              <div className="col-span-1">ID</div>
              <div className="col-span-2">Image</div>
              <div className="col-span-3">Address</div>
              <div className="col-span-1">Type</div>
              <div className="col-span-1">Price</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-1">Listed</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>
          </div>
          
          <div className="bg-white divide-y divide-neutral-200">
            {currentProperties.length === 0 ? (
              <div className="px-6 py-8 text-center text-neutral-500">
                No properties found matching your criteria
              </div>
            ) : (
              currentProperties.map((property) => (
                <div key={property.id} className="grid grid-cols-12 gap-2 px-6 py-4 items-center hover:bg-neutral-50">
                  <div className="col-span-1 text-sm text-neutral-500">#{property.id}</div>
                  <div className="col-span-2">
                    {/* Use a placeholder image if no images are available */}
                    <div className="h-16 w-24 bg-neutral-200 rounded flex items-center justify-center">
                      <span className="material-icons text-neutral-400">home</span>
                    </div>
                  </div>
                  <div className="col-span-3">
                    <div className="text-sm font-medium text-neutral-900">{property.name}</div>
                    <div className="text-xs text-neutral-500">{property.address}, {property.city}, {property.state} {property.zipCode}</div>
                  </div>
                  <div className="col-span-1 text-sm text-neutral-500">{property.propertyType}</div>
                  <div className="col-span-1 text-sm font-medium text-neutral-900">{formatCurrency(property.price)}</div>
                  <div className="col-span-1">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(property.status)}`}>
                      {property.status}
                    </span>
                  </div>
                  <div className="col-span-1 text-sm text-neutral-500">{formatDate(property.createdAt)}</div>
                  <div className="col-span-2 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/properties/edit/${property.id}`)}
                      className="text-primary-600 hover:text-primary-900"
                    >
                      <span className="material-icons">edit</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteProperty(property.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <span className="material-icons">delete</span>
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* Pagination */}
        {filteredProperties.length > 0 && (
          <div className="bg-neutral-50 px-4 py-3 border-t border-neutral-200 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-neutral-700">
                Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(indexOfLastItem, filteredProperties.length)}
                </span>{' '}
                of <span className="font-medium">{filteredProperties.length}</span> properties
              </div>
              <div className="flex-1 flex justify-end">
                <nav className="inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-neutral-300 bg-white text-sm font-medium text-neutral-500 hover:bg-neutral-50"
                  >
                    <span className="material-icons text-sm">chevron_left</span>
                  </Button>
                  
                  {/* Page numbers */}
                  {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                    let pageNumber;
                    if (totalPages <= 5) {
                      pageNumber = i + 1;
                    } else if (currentPage <= 3) {
                      pageNumber = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNumber = totalPages - 4 + i;
                    } else {
                      pageNumber = currentPage - 2 + i;
                    }
                    
                    if (pageNumber <= totalPages) {
                      return (
                        <Button
                          key={pageNumber}
                          variant={currentPage === pageNumber ? 'secondary' : 'outline'}
                          size="sm"
                          onClick={() => setCurrentPage(pageNumber)}
                          className="relative inline-flex items-center px-4 py-2 border border-neutral-300 bg-white text-sm font-medium text-neutral-500 hover:bg-neutral-50"
                        >
                          {pageNumber}
                        </Button>
                      );
                    }
                    return null;
                  })}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-neutral-300 bg-white text-sm font-medium text-neutral-500 hover:bg-neutral-50"
                  >
                    <span className="material-icons text-sm">chevron_right</span>
                  </Button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
