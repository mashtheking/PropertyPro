import { type Property } from "@shared/schema";
import { formatDistance } from "date-fns";
import { Home, MapPin, Bed, Bath, SquareTerminal } from "lucide-react";

interface PropertyCardProps {
  property: Property;
  compact?: boolean;
}

export default function PropertyCard({ property, compact = false }: PropertyCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format date like "3 days ago"
  const getListingDate = (date: string) => {
    try {
      return formatDistance(new Date(date), new Date(), { addSuffix: true });
    } catch (e) {
      return "Recently";
    }
  };

  if (compact) {
    return (
      <div className="flex items-center p-3">
        <div className="flex-shrink-0 h-12 w-12 bg-gray-200 rounded overflow-hidden">
          {property.images && property.images.length > 0 ? (
            <img
              src={property.images[0]}
              alt={property.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              <Home className="h-6 w-6 text-gray-400" />
            </div>
          )}
        </div>
        <div className="ml-4 flex-1 min-w-0">
          <p className="text-sm font-medium text-primary truncate">{property.name}</p>
          <p className="text-xs text-gray-500">{formatCurrency(property.price)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center px-4 py-4 sm:px-6 hover:bg-gray-50">
      <div className="min-w-0 flex-1 flex items-center">
        <div className="flex-shrink-0">
          {property.images && property.images.length > 0 ? (
            <img
              className="h-16 w-16 rounded-md object-cover"
              src={property.images[0]}
              alt={property.name}
            />
          ) : (
            <div className="h-16 w-16 rounded-md bg-gray-200 flex items-center justify-center">
              <Home className="h-8 w-8 text-gray-400" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1 px-4">
          <div>
            <p className="text-sm font-medium text-primary truncate">{property.name}</p>
            <p className="mt-1 flex text-sm text-gray-500">
              <MapPin className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
              <span className="truncate">{property.address}</span>
            </p>
          </div>
          <div className="mt-2 flex">
            <div className="flex items-center text-sm text-gray-500 mr-6">
              <Bed className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
              <span>{property.bedrooms} bed</span>
            </div>
            <div className="flex items-center text-sm text-gray-500 mr-6">
              <Bath className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
              <span>{property.bathrooms} bath</span>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <SquareTerminal className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
              <span>{property.square_feet} sqft</span>
            </div>
          </div>
        </div>
      </div>
      <div>
        <div className="text-lg font-medium text-gray-900">{formatCurrency(property.price)}</div>
        <div className="text-sm text-gray-500">
          Listed {getListingDate(property.created_at)}
        </div>
      </div>
    </div>
  );
}
