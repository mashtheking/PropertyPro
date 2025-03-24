import { Client } from '@shared/schema';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Phone } from 'lucide-react';
import { Link } from 'wouter';

interface ClientCardProps {
  client: Client;
}

const ClientCard = ({ client }: ClientCardProps) => {
  // Get client type color
  const getClientTypeColor = (clientType: string) => {
    switch (clientType) {
      case 'Buyer':
        return 'bg-green-100 text-green-800';
      case 'Seller':
        return 'bg-blue-100 text-blue-800';
      case 'Investor':
        return 'bg-purple-100 text-purple-800';
      case 'Renter':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <CardContent className="pt-4 flex-grow">
        <div className="flex items-center space-x-3 mb-4">
          <div className="flex-shrink-0 h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
            <User className="h-6 w-6 text-gray-500" />
          </div>
          <div>
            <div className="flex items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                {client.firstName} {client.lastName}
              </h3>
              <Badge 
                className={`ml-2 ${getClientTypeColor(client.clientType)}`}
              >
                {client.clientType}
              </Badge>
            </div>
          </div>
        </div>
        
        {client.email && (
          <div className="flex items-center text-sm text-gray-500 mb-2">
            <Mail className="h-4 w-4 mr-2" />
            <span>{client.email}</span>
          </div>
        )}
        
        {client.phone && (
          <div className="flex items-center text-sm text-gray-500 mb-2">
            <Phone className="h-4 w-4 mr-2" />
            <span>{client.phone}</span>
          </div>
        )}
        
        {client.notes && (
          <div className="mt-4">
            <h4 className="text-xs uppercase font-semibold text-gray-500 mb-1">Notes</h4>
            <p className="text-sm text-gray-600 line-clamp-3">{client.notes}</p>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-0 border-t">
        <div className="flex justify-between w-full text-sm">
          <Link href={`/clients/${client.id}`}>
            <a className="text-primary-600 hover:text-primary-800">View Details</a>
          </Link>
          <Link href={`/clients/${client.id}`}>
            <a className="text-gray-600 hover:text-gray-800">Edit</a>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ClientCard;
