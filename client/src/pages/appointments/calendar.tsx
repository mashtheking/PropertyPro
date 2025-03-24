import { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAppointments } from '@/hooks/useAppointments';
import { useClients } from '@/hooks/useClients';
import { useProperties } from '@/hooks/useProperties';
import { Button } from '@/components/ui/button';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, parseISO } from 'date-fns';
import { Card } from '@/components/ui/card';

const AppointmentCalendar = () => {
  const { appointments, fetchAppointments } = useAppointments();
  const { clients, fetchClients } = useClients();
  const { properties, fetchProperties } = useProperties();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [_, navigate] = useLocation();

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

  const renderHeader = () => {
    return (
      <div className="flex items-center justify-between py-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-xl font-semibold">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  const renderDays = () => {
    const days = [];
    const dateFormat = "EEE";
    const startDate = startOfWeek(currentMonth);

    for (let i = 0; i < 7; i++) {
      days.push(
        <div key={i} className="text-center font-medium py-2 border-b">
          {format(addDays(startDate, i), dateFormat)}
        </div>
      );
    }

    return <div className="grid grid-cols-7 gap-x-1">{days}</div>;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = "";

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, "d");
        const cloneDay = day;
        
        // Filter appointments for the current day
        const dayAppointments = appointments?.filter(appointment => {
          const appointmentDate = parseISO(appointment.date.toString());
          return isSameDay(appointmentDate, cloneDay);
        }) || [];
        
        days.push(
          <div
            key={day.toString()}
            className={`min-h-[120px] border p-1 ${
              !isSameMonth(day, monthStart)
                ? "bg-gray-100 text-gray-400"
                : "bg-white"
            } ${
              isSameDay(day, new Date()) ? "border-primary-500" : ""
            }`}
          >
            <div className="p-1">
              <span className="font-medium">{formattedDate}</span>
              <div className="mt-1 space-y-1 max-h-[80px] overflow-y-auto">
                {dayAppointments.map(appointment => {
                  const client = clients?.find(c => c.id === appointment.clientId);
                  const type = appointment.appointmentType;
                  
                  let bgColor = 'bg-gray-100';
                  if (type === 'Property Viewing') bgColor = 'bg-primary-100';
                  if (type === 'Client Meeting') bgColor = 'bg-secondary-100';
                  if (type === 'Contract Signing') bgColor = 'bg-premium-100';
                  if (type === 'Phone Call') bgColor = 'bg-blue-100';
                  
                  return (
                    <div 
                      key={appointment.id}
                      className={`text-xs p-1 rounded ${bgColor} cursor-pointer truncate`}
                      onClick={() => navigate(`/appointments/${appointment.id}`)}
                    >
                      {format(parseISO(appointment.startTime.toString()), 'h:mm a')} - {appointment.title}
                      {client && <span className="ml-1 text-gray-600">({client.firstName})</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      
      rows.push(
        <div key={day.toString()} className="grid grid-cols-7 gap-x-1">
          {days}
        </div>
      );
      days = [];
    }
    
    return <div className="gap-y-1 mt-1">{rows}</div>;
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold tracking-tight mb-4 md:mb-0">Calendar</h1>
        <div className="flex space-x-3">
          <Link href="/appointments">
            <Button variant="outline">List View</Button>
          </Link>
          <Link href="/appointments/add">
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Schedule Appointment
            </Button>
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center my-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-700"></div>
        </div>
      ) : (
        <Card className="p-4 overflow-auto">
          {renderHeader()}
          {renderDays()}
          {renderCells()}
        </Card>
      )}
    </div>
  );
};

export default AppointmentCalendar;
