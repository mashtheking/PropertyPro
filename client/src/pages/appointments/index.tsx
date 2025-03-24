import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Appointment, Client, Property } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import { Link } from "wouter";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isToday, addWeeks, subWeeks, isSameDay } from "date-fns";
import AppointmentCard from "@/components/appointment/appointment-card";

export default function Appointments() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"week" | "list">("week");

  const { data: appointments, isLoading } = useQuery<Appointment[]>({
    queryKey: ['/api/appointments'],
  });
  
  const { data: clients } = useQuery<Client[]>({
    queryKey: ['/api/clients'],
  });
  
  const { data: properties } = useQuery<Property[]>({
    queryKey: ['/api/properties'],
  });

  // Navigation functions
  const goToPreviousWeek = () => setCurrentDate(subWeeks(currentDate, 1));
  const goToNextWeek = () => setCurrentDate(addWeeks(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  // Calculate week boundaries
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Start on Monday
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Get appointments for a specific day
  const getAppointmentsForDay = (day: Date) => {
    return appointments?.filter(appointment => {
      const appointmentDate = new Date(appointment.date);
      return isSameDay(appointmentDate, day);
    }) || [];
  };

  // Find client and property for an appointment
  const findClientName = (clientId?: number) => {
    if (!clientId) return "No client";
    const client = clients?.find(c => c.id === clientId);
    return client ? `${client.first_name} ${client.last_name}` : "Unknown client";
  };

  const findPropertyName = (propertyId?: number) => {
    if (!propertyId) return "No property";
    const property = properties?.find(p => p.id === propertyId);
    return property ? property.name : "Unknown property";
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
          Appointments
        </h1>
        <Link href="/appointments/add">
          <Button size="sm" className="gap-1">
            <Plus className="h-4 w-4" />
            Add Appointment
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Button size="sm" variant="outline" onClick={goToPreviousWeek}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={goToToday}>
                Today
              </Button>
              <Button size="sm" variant="outline" onClick={goToNextWeek}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium">
                {format(weekStart, "MMM d")} - {format(weekEnd, "MMM d, yyyy")}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                size="sm" 
                variant={view === "week" ? "default" : "outline"} 
                onClick={() => setView("week")}
              >
                Week
              </Button>
              <Button 
                size="sm" 
                variant={view === "list" ? "default" : "outline"} 
                onClick={() => setView("list")}
              >
                List
              </Button>
              <Button size="sm" variant="outline">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[...Array(5)].map((_, index) => (
                <Skeleton key={index} className="h-20 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      ) : view === "week" ? (
        <div className="grid grid-cols-7 gap-4">
          {weekDays.map((day) => (
            <div key={day.toString()} className="space-y-2">
              <div className={`text-center p-2 rounded-md ${isToday(day) ? 'bg-primary text-white' : 'bg-gray-100'}`}>
                <div className="text-xs font-medium">{format(day, 'EEE')}</div>
                <div className={`text-xl font-bold ${isToday(day) ? 'text-white' : 'text-gray-900'}`}>{format(day, 'd')}</div>
              </div>
              
              <div className="space-y-2">
                {getAppointmentsForDay(day).length > 0 ? (
                  getAppointmentsForDay(day).map(appointment => (
                    <Link key={appointment.id} href={`/appointments/${appointment.id}`}>
                      <a className="block">
                        <Card className="hover:shadow-md transition-shadow duration-200">
                          <CardContent className="p-3">
                            <div className="space-y-1">
                              <div className="text-sm font-medium truncate">{appointment.title}</div>
                              <div className="text-xs text-gray-500">{format(new Date(`${appointment.date}T${appointment.time}`), 'h:mm a')}</div>
                              <div className="text-xs text-gray-500 truncate">{findClientName(appointment.client_id)}</div>
                            </div>
                          </CardContent>
                        </Card>
                      </a>
                    </Link>
                  ))
                ) : (
                  <div className="text-center py-2 text-xs text-gray-500">No appointments</div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            {appointments && appointments.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {appointments
                  .sort((a, b) => {
                    // Sort by date and time
                    const dateA = new Date(`${a.date}T${a.time}`);
                    const dateB = new Date(`${b.date}T${b.time}`);
                    return dateA.getTime() - dateB.getTime();
                  })
                  .map(appointment => (
                    <Link key={appointment.id} href={`/appointments/${appointment.id}`}>
                      <a className="block hover:bg-gray-50">
                        <div className="p-4">
                          <AppointmentCard 
                            appointment={appointment} 
                            client={clients?.find(c => c.id === appointment.client_id)}
                            property={properties?.find(p => p.id === appointment.property_id)}
                          />
                        </div>
                      </a>
                    </Link>
                  ))}
              </div>
            ) : (
              <div className="p-12 text-center">
                <h3 className="text-xl font-medium text-gray-900 mb-2">No appointments found</h3>
                <p className="text-gray-500 mb-6">
                  Get started by scheduling your first appointment
                </p>
                <Link href="/appointments/add">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Appointment
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
