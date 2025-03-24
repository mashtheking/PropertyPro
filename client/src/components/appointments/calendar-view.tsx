import React, { useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { formatDate, formatTime } from '@/lib/utils';
import { type Appointment } from '@shared/schema';

interface CalendarViewProps {
  appointments: Appointment[];
  isLoading: boolean;
  error: string | null;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  appointments,
  isLoading,
  error,
}) => {
  const [, navigate] = useLocation();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [currentView, setCurrentView] = useState<'month' | 'week' | 'day'>('month');

  // Calculate the first day of the month
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  // Calculate the day of the week for the first day (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfWeek = firstDayOfMonth.getDay();
  // Calculate the number of days in the month
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  
  // Calculate the days from the previous month to display
  const daysFromPrevMonth = firstDayOfWeek;
  // Calculate the days from the next month to display to complete the grid
  const daysFromNextMonth = 42 - daysInMonth - daysFromPrevMonth; // 42 = 6 rows * 7 days

  // Get the previous month's days
  const prevMonthDays = Array.from({ length: daysFromPrevMonth }, (_, i) => {
    const day = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 0).getDate() - daysFromPrevMonth + i + 1;
    return { day, isPrevMonth: true };
  });

  // Get the current month's days
  const currentMonthDays = Array.from({ length: daysInMonth }, (_, i) => ({ 
    day: i + 1, 
    isPrevMonth: false,
    isNextMonth: false,
  }));

  // Get the next month's days
  const nextMonthDays = Array.from({ length: daysFromNextMonth }, (_, i) => ({ 
    day: i + 1, 
    isNextMonth: true 
  }));

  // Combine all days
  const calendarDays = [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];

  // Navigate to the previous month
  const goToPrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  // Navigate to the next month
  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  // Go to today
  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  // Format the month and year for display
  const formatMonthAndYear = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  // Get appointments for a specific day
  const getAppointmentsForDay = (day: number, isCurrentMonth: boolean) => {
    if (!isCurrentMonth) return [];
    
    return appointments.filter(apt => {
      const aptDate = new Date(apt.date);
      return aptDate.getDate() === day && 
             aptDate.getMonth() === currentMonth.getMonth() && 
             aptDate.getFullYear() === currentMonth.getFullYear();
    });
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="material-icons animate-spin text-4xl mb-4">refresh</div>
        <p>Loading calendar...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex space-x-2 items-center">
            <Button variant="outline" size="sm" onClick={goToPrevMonth}>
              <span className="material-icons">chevron_left</span>
            </Button>
            <h2 className="text-lg font-semibold">{formatMonthAndYear(currentMonth)}</h2>
            <Button variant="outline" size="sm" onClick={goToNextMonth}>
              <span className="material-icons">chevron_right</span>
            </Button>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={goToToday}>Today</Button>
            <select 
              className="text-sm border-neutral-300 rounded-md"
              value={currentView}
              onChange={(e) => setCurrentView(e.target.value as 'month' | 'week' | 'day')}
            >
              <option value="month">Month</option>
              <option value="week">Week</option>
              <option value="day">Day</option>
            </select>
          </div>
        </div>
        
        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-px bg-neutral-200 border border-neutral-200 rounded-lg overflow-hidden">
          {/* Days of week */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
            <div key={index} className="bg-neutral-100 text-neutral-700 text-sm font-medium p-2 text-center">
              {day}
            </div>
          ))}
          
          {/* Calendar days */}
          {calendarDays.map((day, index) => {
            const isToday = !day.isPrevMonth && !day.isNextMonth && 
                           day.day === new Date().getDate() && 
                           currentMonth.getMonth() === new Date().getMonth() && 
                           currentMonth.getFullYear() === new Date().getFullYear();
            
            const dayAppointments = getAppointmentsForDay(day.day, !day.isPrevMonth && !day.isNextMonth);
            
            return (
              <div 
                key={index} 
                className={`bg-white h-32 p-1 ${day.isPrevMonth || day.isNextMonth ? 'text-neutral-400' : 'text-neutral-900'} ${isToday ? 'bg-blue-50' : ''}`}
              >
                <div className={`text-sm p-1 ${isToday ? 'bg-primary-500 text-white rounded-full w-6 h-6 flex items-center justify-center' : ''}`}>
                  {day.day}
                </div>
                <div className="overflow-y-auto h-24 space-y-1">
                  {dayAppointments.map((apt) => (
                    <div 
                      key={apt.id}
                      onClick={() => navigate(`/appointments/edit/${apt.id}`)}
                      className="text-xs p-1 bg-primary-100 text-primary-800 rounded truncate cursor-pointer hover:bg-primary-200"
                    >
                      {formatTime(apt.time)} - {apt.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
      <CardFooter className="bg-neutral-50 px-4 py-3 border-t border-neutral-200">
        <Button onClick={() => navigate('/appointments/new')}>
          <span className="material-icons mr-1">add</span>
          Add Appointment
        </Button>
      </CardFooter>
    </Card>
  );
};
