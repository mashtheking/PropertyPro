import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { formatDate, formatTime } from '@/lib/utils';
import { type Appointment, type Client, type Property } from '@shared/schema';

interface AppointmentListProps {
  appointments: Appointment[];
  clients: Client[];
  properties: Property[];
  isLoading: boolean;
  error: string | null;
  onRefresh: () => void;
}

export const AppointmentList: React.FC<AppointmentListProps> = ({
  appointments,
  clients,
  properties,
  isLoading,
  error,
  onRefresh,
}) => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [clientFilter, setClientFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Handle appointment deletion
  const handleDeleteAppointment = async (appointmentId: number) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      try {
        await apiRequest('DELETE', `/api/appointments/${appointmentId}`, undefined);
        toast({
          title: 'Appointment deleted',
          description: 'The appointment has been deleted successfully',
        });
        onRefresh();
      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error.message || 'An error occurred while deleting the appointment',
        });
      }
    }
  };

  // Get client name by ID
  const getClientName = (clientId: number | null) => {
    if (!clientId) return 'N/A';
    const client = clients.find(c => c.id === clientId);
    return client ? `${client.firstName} ${client.lastName}` : 'Unknown Client';
  };

  // Get property name by ID
  const getPropertyName = (propertyId: number | null) => {
    if (!propertyId) return 'N/A';
    const property = properties.find(p => p.id === propertyId);
    return property ? property.name : 'Unknown Property';
  };

  // Filter appointments based on search and filters
  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = searchTerm === '' || 
      appointment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getClientName(appointment.clientId).toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDate = dateFilter === '' || 
      formatDate(appointment.date) === dateFilter;
    
    const matchesClient = clientFilter === '' || 
      appointment.clientId === parseInt(clientFilter);
    
    return matchesSearch && matchesDate && matchesClient;
  });

  // Sort appointments by date and time
  const sortedAppointments = [...filteredAppointments].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    if (dateA.getTime() !== dateB.getTime()) {
      return dateA.getTime() - dateB.getTime();
    }
    return a.time.localeCompare(b.time);
  });

  // Pagination
  const totalPages = Math.ceil(sortedAppointments.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAppointments = sortedAppointments.slice(indexOfFirstItem, indexOfLastItem);

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="material-icons animate-spin text-4xl mb-4">refresh</div>
        <p>Loading appointments...</p>
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
        <h1 className="text-2xl font-bold text-neutral-900">Appointments</h1>
        <Button onClick={() => navigate('/appointments/new')}>
          <span className="material-icons mr-1">add</span>
          Add Appointment
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="col-span-1 md:col-span-2">
              <label htmlFor="appointment-search" className="block text-sm font-medium text-neutral-700 mb-1">Search</label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-icons text-neutral-500 text-sm">search</span>
                </div>
                <Input
                  type="text"
                  name="appointment-search"
                  id="appointment-search"
                  placeholder="Title, location, or client"
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label htmlFor="appointment-date" className="block text-sm font-medium text-neutral-700 mb-1">Date</label>
              <Input
                type="date"
                name="appointment-date"
                id="appointment-date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="appointment-client" className="block text-sm font-medium text-neutral-700 mb-1">Client</label>
              <Select value={clientFilter} onValueChange={setClientFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Clients" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Clients</SelectItem>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id.toString()}>
                      {client.firstName} {client.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appointments List */}
      <Card>
        <div className="min-w-full divide-y divide-neutral-200">
          <div className="bg-neutral-50 border-b">
            <div className="grid grid-cols-12 gap-2 px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
              <div className="col-span-2">Date & Time</div>
              <div className="col-span-3">Title</div>
              <div className="col-span-2">Client</div>
              <div className="col-span-2">Property</div>
              <div className="col-span-1">Reminder</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>
          </div>
          
          <div className="bg-white divide-y divide-neutral-200">
            {currentAppointments.length === 0 ? (
              <div className="px-6 py-8 text-center text-neutral-500">
                No appointments found matching your criteria
              </div>
            ) : (
              currentAppointments.map((appointment) => (
                <div key={appointment.id} className="grid grid-cols-12 gap-2 px-6 py-4 hover:bg-neutral-50">
                  <div className="col-span-2">
                    <div className="text-sm font-medium text-neutral-900">{formatDate(appointment.date)}</div>
                    <div className="text-sm text-neutral-500">{formatTime(appointment.time)}</div>
                  </div>
                  <div className="col-span-3">
                    <div className="text-sm font-medium text-neutral-900">{appointment.title}</div>
                    <div className="text-xs text-neutral-500">{appointment.location}</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-sm text-neutral-900">{getClientName(appointment.clientId)}</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-sm text-neutral-900">{appointment.propertyId ? getPropertyName(appointment.propertyId) : 'N/A'}</div>
                  </div>
                  <div className="col-span-1">
                    <div className="text-sm text-neutral-900">
                      {appointment.emailReminder ? (
                        <span className="material-icons text-green-500">notifications_active</span>
                      ) : (
                        <span className="material-icons text-neutral-400">notifications_off</span>
                      )}
                    </div>
                  </div>
                  <div className="col-span-2 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/appointments/edit/${appointment.id}`)}
                      className="text-primary-600 hover:text-primary-900"
                    >
                      <span className="material-icons">edit</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteAppointment(appointment.id)}
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
        {sortedAppointments.length > 0 && (
          <div className="bg-neutral-50 px-4 py-3 border-t border-neutral-200 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-neutral-700">
                Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(indexOfLastItem, sortedAppointments.length)}
                </span>{' '}
                of <span className="font-medium">{sortedAppointments.length}</span> appointments
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
