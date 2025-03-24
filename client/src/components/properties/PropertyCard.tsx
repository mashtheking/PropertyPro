import { Property } from '@shared/schema';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building, MapPin, Bed, Bath, Move } from 'lucide-react';
import { Link } from 'wouter';
import { formatCurrency } from '@/lib/utils';

interface PropertyCardProps {
  property: Property;
}

const PropertyCard = ({ property }: PropertyCardProps) => {
  // Get status color based on property status
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

  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="aspect-w-16 aspect-h-9 bg-gray-200 relative">
        {/* If property has images, use first one */}
        {property.images && Array.isArray(property.images) && property.images.length > 0 ? (
          <img 
            src={property.images[0]} 
            alt={property.name} 
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className="w-full h-48 flex items-center justify-center bg-gray-200 text-gray-500">
            <Building size={48} />
          </div>
        )}
        <div className="absolute top-2 right-2">
          <Badge className={getStatusColor(property.status)}>
            {property.status}
          </Badge>
        </div>
      </div>
      
      <CardContent className="pt-4 flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{property.name}</h3>
          <span className="font-semibold text-primary-600">{formatCurrency(property.price)}</span>
        </div>
        
        <p className="text-sm text-gray-500 flex items-center mb-3">
          <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
          <span className="truncate">{property.address}</span>
        </p>
        
        <div className="flex space-x-4 text-sm text-gray-500">
          {property.bedrooms !== undefined && property.bedrooms !== null && (
            <div className="flex items-center">
              <Bed className="h-4 w-4 mr-1" />
              <span>{property.bedrooms} bed</span>
            </div>
          )}
          
          {property.bathrooms !== undefined && property.bathrooms !== null && (
            <div className="flex items-center">
              <Bath className="h-4 w-4 mr-1" />
              <span>{property.bathrooms} bath</span>
            </div>
          )}
          
          {property.squareFeet !== undefined && property.squareFeet !== null && (
            <div className="flex items-center">
              <Move className="h-4 w-4 mr-1" />
              <span>{property.squareFeet} sqft</span>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="pt-0 border-t">
        <div className="flex justify-between w-full text-sm">
          <Link href={`/properties/${property.id}`}>
            <a className="text-primary-600 hover:text-primary-800">View Details</a>
          </Link>
          <Link href={`/properties/${property.id}`}>
            <a className="text-gray-600 hover:text-gray-800">Edit</a>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
};

export default PropertyCard;
