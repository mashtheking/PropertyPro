import { useEffect, useState } from 'react';
import { Link } from 'wouter';
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
import { Plus, Search, Building } from 'lucide-react';
import PropertyTable from '@/components/properties/PropertyTable';
import PropertyCard from '@/components/properties/PropertyCard';
import { useToast } from '@/hooks/use-toast';

const PropertiesIndex = () => {
  const { properties, fetchProperties, deleteProperty } = useProperties();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProperties = async () => {
      try {
        await fetchProperties();
      } catch (error) {
        console.error('Error loading properties:', error);
        toast({
          title: 'Error',
          description: 'Failed to load properties. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadProperties();
  }, [fetchProperties, toast]);

  // Filter properties based on search query and status filter
  const filteredProperties = properties?.filter(property => {
    const matchesQuery = 
      property.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.address.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' || 
      property.status === statusFilter;
    
    return matchesQuery && matchesStatus;
  }) || [];

  const handleDeleteProperty = async (id: number) => {
    try {
      await deleteProperty(id);
      toast({
        title: 'Property Deleted',
        description: 'Property has been deleted successfully.',
      });
    } catch (error) {
      console.error('Error deleting property:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete property. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold tracking-tight mb-4 md:mb-0">Properties</h1>
        <Link href="/properties/add">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add Property
          </Button>
        </Link>
      </div>

      <div className="mb-6 flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Search properties..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex space-x-4">
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Sold">Sold</SelectItem>
              <SelectItem value="Off Market">Off Market</SelectItem>
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
      ) : filteredProperties.length === 0 ? (
        <div className="bg-white rounded-md shadow-sm p-8 text-center">
          <Building className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No properties found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchQuery || statusFilter !== 'all'
              ? 'Try changing your search criteria'
              : 'Get started by creating a new property'}
          </p>
          <div className="mt-6">
            <Link href="/properties/add">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Property
              </Button>
            </Link>
          </div>
        </div>
      ) : viewMode === 'list' ? (
        <PropertyTable 
          properties={filteredProperties} 
          onDelete={handleDeleteProperty} 
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map(property => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </div>
  );
};

export default PropertiesIndex;
