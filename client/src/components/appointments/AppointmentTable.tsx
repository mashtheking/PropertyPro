import { useState } from 'react';
import { Appointment, Client, Property } from '@shared/schema';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow
} from '@/components/ui/table';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'wouter';
import { format } from 'date-fns';
import { CalendarCheck, Eye, Pencil, Trash2, MoreHorizontal, Clock, MapPin, User, Home } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface AppointmentTableProps {
  appointments: Appointment[];
  clients: Client[];
  properties: Property[];
  onDelete: (id: number) => void;
}

const AppointmentTable = ({ appointments, clients, properties, onDelete }: AppointmentTableProps) => {
  const [deleteId, setDeleteId] = useState<number | null>(null);
  
  // Format date and time
  const formatDate = (date: Date | string) => {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, 'MMM d, yyyy');
  };

  const formatTime = (date: Date | string) => {
    if (!date) return '';
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

  // Get client by ID
  const getClient = (clientId: number | null | undefined) => {
    if (!clientId) return null;
    return clients.find(client => client.id === clientId);
  };

  // Get property by ID
  const getProperty = (propertyId: number | null | undefined) => {
    if (!propertyId) return null;
    return properties.find(property => property.id === propertyId);
  };

  const handleDelete = () => {
    if (deleteId !== null) {
      onDelete(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <>
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {appointments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  No appointments found
                </TableCell>
              </TableRow>
            ) : (
              appointments.map((appointment) => {
                const client = getClient(appointment.clientId);
                const property = getProperty(appointment.propertyId);
                
                return (
                  <TableRow key={appointment.id}>
                    <TableCell>
                      <div className="flex items-center">
                        <div className={`flex-shrink-0 ${getAppointmentTypeColor(appointment.appointmentType)} rounded-md w-10 h-10 flex items-center justify-center`}>
                          <CalendarCheck className="h-5 w-5" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{appointment.title}</div>
                          {appointment.location && (
                            <div className="text-xs text-gray-500 flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {appointment.location}
                            </div>
                          )}
                          {property && (
                            <div className="text-xs text-gray-500 flex items-center">
                              <Home className="h-3 w-3 mr-1" />
                              {property.name}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">{formatDate(appointment.date)}</div>
                      <div className="text-xs text-gray-500 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {client ? (
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-1 text-gray-500" />
                          <Link href={`/clients/${client.id}`}>
                            <a className="text-sm text-primary-600 hover:underline">
                              {client.firstName} {client.lastName}
                            </a>
                          </Link>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">No client</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={getAppointmentTypeColor(appointment.appointmentType)}>
                        {appointment.appointmentType}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <Link href={`/appointments/${appointment.id}`}>
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              <span>View</span>
                            </DropdownMenuItem>
                          </Link>
                          <Link href={`/appointments/${appointment.id}`}>
                            <DropdownMenuItem>
                              <Pencil className="mr-2 h-4 w-4" />
                              <span>Edit</span>
                            </DropdownMenuItem>
                          </Link>
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-600"
                            onClick={() => setDeleteId(appointment.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Delete</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the appointment.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AppointmentTable;
