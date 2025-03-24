import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { useAppointments } from '@/hooks/useAppointments';
import { useClients } from '@/hooks/useClients';
import { useProperties } from '@/hooks/useProperties';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Search, Calendar, CalendarX } from 'lucide-react';
import AppointmentTable from '@/components/appointments/AppointmentTable';
import AppointmentCard from '@/components/appointments/AppointmentCard';
import { useToast } from '@/hooks/use-toast';

const AppointmentsIndex = () => {
  const { appointments, fetchAppointments, deleteAppointment } = useAppointments();
  const { clients, fetchClients } = useClients();
  const { properties, fetchProperties } = useProperties();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          fetchAppointments(),
          fetchClients(),
          fetchProperties()
        ]);
      } catch (error) {
        console.error('Error loading appointments data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load appointments. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [fetchAppointments, fetchClients, fetchProperties, toast]);

  // Filter appointments based on search query and type filter
  const filteredAppointments = appointments?.filter(appointment => {
    const matchesQuery = 
      appointment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (appointment.location && appointment.location.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesType = 
      typeFilter === 'all' || 
      appointment.appointmentType === typeFilter;
    
    return matchesQuery && matchesType;
  }) || [];

  const handleDeleteAppointment = async (id: number) => {
    try {
      await deleteAppointment(id);
      toast({
        title: 'Appointment Deleted',
        description: 'Appointment has been deleted successfully.',
      });
    } catch (error) {
      console.error('Error deleting appointment:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete appointment. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold tracking-tight mb-4 md:mb-0">Appointments</h1>
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
          <Link href="/appointments/calendar">
            <Button variant="outline">
              <Calendar className="mr-2 h-4 w-4" /> Calendar View
            </Button>
          </Link>
          <Link href="/appointments/add">
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Schedule Appointment
            </Button>
          </Link>
        </div>
      </div>

      <div className="mb-6 flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Search appointments..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex space-x-4">
          <Select
            value={typeFilter}
            onValueChange={setTypeFilter}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Property Viewing">Property Viewing</SelectItem>
              <SelectItem value="Client Meeting">Client Meeting</SelectItem>
              <SelectItem value="Contract Signing">Contract Signing</SelectItem>
              <SelectItem value="Phone Call">Phone Call</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex space-x-2">
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('list')}
              title="List view"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-list">
                <line x1="8" x2="21" y1="6" y2="6"></line>
                <line x1="8" x2="21" y1="12" y2="12"></line>
                <line x1="8" x2="21" y1="18" y2="18"></line>
                <line x1="3" x2="3" y1="6" y2="6"></line>
                <line x1="3" x2="3" y1="12" y2="12"></line>
                <line x1="3" x2="3" y1="18" y2="18"></line>
              </svg>
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('grid')}
              title="Grid view"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-grid">
                <rect width="7" height="7" x="3" y="3" rx="1"></rect>
                <rect width="7" height="7" x="14" y="3" rx="1"></rect>
                <rect width="7" height="7" x="14" y="14" rx="1"></rect>
                <rect width="7" height="7" x="3" y="14" rx="1"></rect>
              </svg>
            </Button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center my-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-700"></div>
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="bg-white rounded-md shadow-sm p-8 text-center">
          <CalendarX className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No appointments found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchQuery || typeFilter !== 'all'
              ? 'Try changing your search criteria'
              : 'Get started by creating a new appointment'}
          </p>
          <div className="mt-6">
            <Link href="/appointments/add">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Schedule Appointment
              </Button>
            </Link>
          </div>
        </div>
      ) : viewMode === 'list' ? (
        <AppointmentTable 
          appointments={filteredAppointments} 
          clients={clients || []}
          properties={properties || []}
          onDelete={handleDeleteAppointment} 
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAppointments.map(appointment => {
            const client = clients?.find(c => c.id === appointment.clientId);
            const property = properties?.find(p => p.id === appointment.propertyId);
            
            return (
              <AppointmentCard 
                key={appointment.id} 
                appointment={appointment}
                client={client}
                property={property}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AppointmentsIndex;
