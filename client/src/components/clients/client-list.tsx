import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { getInitials, formatDate } from '@/lib/utils';
import { type Client } from '@shared/schema';

interface ClientListProps {
  clients: Client[];
  isLoading: boolean;
  error: string | null;
  onRefresh: () => void;
}

export const ClientList: React.FC<ClientListProps> = ({
  clients,
  isLoading,
  error,
  onRefresh,
}) => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [clientTypeFilter, setClientTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Handle client deletion
  const handleDeleteClient = async (clientId: number) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      try {
        await apiRequest('DELETE', `/api/clients/${clientId}`, undefined);
        toast({
          title: 'Client deleted',
          description: 'The client has been deleted successfully',
        });
        onRefresh();
      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error.message || 'An error occurred while deleting the client',
        });
      }
    }
  };

  // Filter clients based on search and filters
  const filteredClients = clients.filter(client => {
    const matchesSearch = searchTerm === '' || 
      `${client.firstName} ${client.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone.includes(searchTerm);
    
    const matchesClientType = clientTypeFilter === '' || 
      client.clientType === clientTypeFilter;
    
    const matchesStatus = statusFilter === '' || 
      client.status === statusFilter;
    
    return matchesSearch && matchesClientType && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentClients = filteredClients.slice(indexOfFirstItem, indexOfLastItem);

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Inactive':
        return 'bg-neutral-100 text-neutral-800';
      case 'Closed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-neutral-100 text-neutral-800';
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="material-icons animate-spin text-4xl mb-4">refresh</div>
        <p>Loading clients...</p>
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
        <h1 className="text-2xl font-bold text-neutral-900">Clients</h1>
        <Button onClick={() => navigate('/clients/new')}>
          <span className="material-icons mr-1">add</span>
          Add Client
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="col-span-1 md:col-span-2">
              <label htmlFor="client-search" className="block text-sm font-medium text-neutral-700 mb-1">Search</label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-icons text-neutral-500 text-sm">search</span>
                </div>
                <Input
                  type="text"
                  name="client-search"
                  id="client-search"
                  placeholder="Name, email, or phone"
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label htmlFor="client-type" className="block text-sm font-medium text-neutral-700 mb-1">Client Type</label>
              <Select value={clientTypeFilter} onValueChange={setClientTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  <SelectItem value="Buyer">Buyer</SelectItem>
                  <SelectItem value="Seller">Seller</SelectItem>
                  <SelectItem value="Both">Both</SelectItem>
                  <SelectItem value="Lead">Lead</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label htmlFor="client-status" className="block text-sm font-medium text-neutral-700 mb-1">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Statuses</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="Closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Clients List */}
      <Card>
        <div className="min-w-full divide-y divide-neutral-200">
          <div className="bg-neutral-50 border-b">
            <div className="grid grid-cols-12 gap-2 px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
              <div className="col-span-3">Name</div>
              <div className="col-span-3">Contact</div>
              <div className="col-span-2">Type</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>
          </div>
          
          <div className="bg-white divide-y divide-neutral-200">
            {currentClients.length === 0 ? (
              <div className="px-6 py-8 text-center text-neutral-500">
                No clients found matching your criteria
              </div>
            ) : (
              currentClients.map((client) => (
                <div key={client.id} className="grid grid-cols-12 gap-2 px-6 py-4 hover:bg-neutral-50">
                  <div className="col-span-3">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <Avatar className="h-10 w-10 rounded-full bg-neutral-300">
                          <AvatarImage src={client.profileImage || ''} alt={`${client.firstName} ${client.lastName}`} />
                          <AvatarFallback>{getInitials(`${client.firstName} ${client.lastName}`)}</AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-neutral-900">{client.firstName} {client.lastName}</div>
                        <div className="text-xs text-neutral-500">Added {formatDate(client.createdAt)}</div>
                      </div>
                    </div>
                  </div>
                  <div className="col-span-3">
                    <div className="text-sm text-neutral-900">{client.email}</div>
                    <div className="text-sm text-neutral-500">{client.phone}</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-sm text-neutral-900">{client.clientType}</div>
                  </div>
                  <div className="col-span-2">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(client.status)}`}>
                      {client.status}
                    </span>
                  </div>
                  <div className="col-span-2 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/clients/edit/${client.id}`)}
                      className="text-primary-600 hover:text-primary-900"
                    >
                      <span className="material-icons">edit</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClient(client.id)}
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
        {filteredClients.length > 0 && (
          <div className="bg-neutral-50 px-4 py-3 border-t border-neutral-200 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-neutral-700">
                Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(indexOfLastItem, filteredClients.length)}
                </span>{' '}
                of <span className="font-medium">{filteredClients.length}</span> clients
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
