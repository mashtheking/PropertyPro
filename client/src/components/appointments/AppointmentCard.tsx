import { Appointment, Client, Property } from '@shared/schema';
import { Card, CardContent } from '@/components/ui/card';
import { CalendarCheck, Clock, MapPin, User, Home } from 'lucide-react';
import { Link } from 'wouter';
import { format } from 'date-fns';

interface AppointmentCardProps {
  appointment: Appointment;
  client?: Client;
  property?: Property;
}

const AppointmentCard = ({ appointment, client, property }: AppointmentCardProps) => {
  // Format date and time
  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, 'MMMM d, yyyy');
  };

  const formatTime = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, 'h:mm a');
  };

  // Get appointment type color
  const getAppointmentTypeColor = (type: string) => {
    switch (type) {
      case 'Property Viewing':
        return 'bg-primary-100 text-primary-600';
      case 'Client Meeting':
        return 'bg-secondary-100 text-secondary-600';
      case 'Contract Signing':
        return 'bg-premium-100 text-premium-600';
      case 'Phone Call':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  // Get appointment type icon
  const getAppointmentTypeIcon = (type: string) => {
    switch (type) {
      case 'Property Viewing':
        return <Home className="h-4 w-4" />;
      case 'Client Meeting':
        return <User className="h-4 w-4" />;
      case 'Contract Signing':
        return <CalendarCheck className="h-4 w-4" />;
      case 'Phone Call':
        return <Phone className="h-4 w-4" />;
      default:
        return <CalendarCheck className="h-4 w-4" />;
    }
  };

  return (
    <Card className="overflow-hidden h-full">
      <CardContent className="p-4">
        <div className="flex items-start">
          <div className={`flex-shrink-0 ${getAppointmentTypeColor(appointment.appointmentType)} rounded-md w-10 h-10 flex items-center justify-center`}>
            {getAppointmentTypeIcon(appointment.appointmentType)}
          </div>
          <div className="ml-4 flex-1">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-900">{appointment.title}</h3>
              <span className="text-xs text-gray-500">
                {formatDate(appointment.date)}
              </span>
            </div>
            
            <div className="mt-1 flex items-center text-sm text-gray-500">
              <Clock className="mr-1 h-4 w-4" />
              <span>
                {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
              </span>
            </div>
            
            {appointment.location && (
              <div className="mt-1 flex items-center text-sm text-gray-500">
                <MapPin className="mr-1 h-4 w-4" />
                <span>{appointment.location}</span>
              </div>
            )}
            
            {client && (
              <div className="mt-1 flex items-center text-sm text-gray-500">
                <User className="mr-1 h-4 w-4" />
                <Link href={`/clients/${client.id}`}>
                  <a className="text-primary-600 hover:underline">
                    {client.firstName} {client.lastName}
                  </a>
                </Link>
              </div>
            )}
            
            {property && (
              <div className="mt-1 flex items-center text-sm text-gray-500">
                <Home className="mr-1 h-4 w-4" />
                <Link href={`/properties/${property.id}`}>
                  <a className="text-primary-600 hover:underline">
                    {property.name}
                  </a>
                </Link>
              </div>
            )}
            
            {appointment.notes && (
              <div className="mt-2 text-xs text-gray-500 line-clamp-2">
                {appointment.notes}
              </div>
            )}
            
            <div className="mt-2 flex justify-end">
              <Link href={`/appointments/${appointment.id}`}>
                <a className="text-xs text-primary-600 hover:text-primary-700">
                  View Details
                </a>
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Add the missing Phone icon component
const Phone = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
  </svg>
);

export default AppointmentCard;
