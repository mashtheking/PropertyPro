import { type Appointment, type Client, type Property } from "@shared/schema";
import { Calendar, Clock, User, Home, MapPin, Edit } from "lucide-react";
import { format, isToday, isTomorrow, isPast } from 'date-fns';
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";

interface AppointmentCardProps {
  appointment: Appointment;
  client?: Client;
  property?: Property;
  compact?: boolean;
}

export default function AppointmentCard({
  appointment,
  client,
  property,
  compact = false
}: AppointmentCardProps) {
  // Format the appointment date
  const formatAppointmentDate = (date: string) => {
    const appointmentDate = new Date(date);
    if (isToday(appointmentDate)) {
      return "Today";
    } else if (isTomorrow(appointmentDate)) {
      return "Tomorrow";
    } else {
      return format(appointmentDate, "EEEE, MMMM d, yyyy");
    }
  };

  // Format the appointment time
  const formatAppointmentTime = (time: string) => {
    try {
      const [hour, minute] = time.split(":");
      const timeDate = new Date();
      timeDate.setHours(parseInt(hour), parseInt(minute));
      return format(timeDate, "h:mm a");
    } catch (e) {
      return time;
    }
  };

  // Get status badge for the appointment
  const getAppointmentStatus = () => {
    const appointmentDateTime = new Date(`${appointment.date}T${appointment.time}`);
    if (isPast(appointmentDateTime)) {
      return { label: "Completed", color: "bg-green-100 text-green-800" };
    } else if (isToday(new Date(appointment.date))) {
      return { label: "Today", color: "bg-blue-100 text-blue-800" };
    } else {
      return { label: "Upcoming", color: "bg-gray-100 text-gray-800" };
    }
  };

  const status = getAppointmentStatus();

  if (compact) {
    return (
      <div className="flex justify-between items-center p-3">
        <div>
          <p className="text-sm font-medium text-gray-900">{appointment.title}</p>
          <p className="text-xs text-gray-500">
            {formatAppointmentDate(appointment.date)} at {formatAppointmentTime(appointment.time)}
          </p>
        </div>
        <Badge variant="outline" className={status.color}>{status.label}</Badge>
      </div>
    );
  }

  return (
    <div className="p-4 hover:bg-gray-50">
      <div className="flex justify-between">
        <div className="flex-1">
          <h4 className="text-sm font-medium text-primary">{appointment.title}</h4>
          {property && (
            <p className="mt-1 text-sm text-gray-600">{property.name}</p>
          )}
          <div className="mt-2 flex items-center text-sm text-gray-500">
            <Calendar className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
            <span>{formatAppointmentDate(appointment.date)}</span>
          </div>
          <div className="mt-1 flex items-center text-sm text-gray-500">
            <Clock className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
            <span>{formatAppointmentTime(appointment.time)}</span>
          </div>
          {client && (
            <div className="mt-1 flex items-center text-sm text-gray-500">
              <User className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
              <span>{client.first_name} {client.last_name}</span>
            </div>
          )}
          {(appointment.location || (property && property.address)) && (
            <div className="mt-1 flex items-center text-sm text-gray-500">
              <MapPin className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
              <span>{appointment.location || property?.address}</span>
            </div>
          )}
        </div>
        <div className="ml-4 flex-shrink-0 flex flex-col items-end">
          <Badge variant="outline" className={status.color}>{status.label}</Badge>
          <Link href={`/appointments/${appointment.id}`}>
            <Button variant="ghost" size="sm" className="mt-2">
              <Edit className="h-4 w-4 mr-1" />
              Details
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
