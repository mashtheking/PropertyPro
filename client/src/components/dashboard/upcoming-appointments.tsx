import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate, formatTime } from '@/lib/utils';

export interface AppointmentPreview {
  id: string | number;
  title: string;
  date: string | Date;
  time: string;
  location: string;
  client: string;
}

interface UpcomingAppointmentsProps {
  appointments: AppointmentPreview[];
  isLoading?: boolean;
  error?: string | null;
}

export const UpcomingAppointments: React.FC<UpcomingAppointmentsProps> = ({ 
  appointments,
  isLoading = false,
  error = null,
}) => {
  const formatMonth = (date: string | Date) => {
    return new Date(date).toLocaleString('en-US', { month: 'short' }).toUpperCase();
  };

  const formatDay = (date: string | Date) => {
    return new Date(date).getDate();
  };

  return (
    <Card>
      <CardHeader className="px-4 py-5 border-b border-neutral-200 sm:px-6">
        <CardTitle className="text-lg font-medium leading-6 text-neutral-900">Upcoming Appointments</CardTitle>
      </CardHeader>
      <CardContent className="px-4 py-0 divide-y divide-neutral-200">
        {isLoading ? (
          <div className="py-6 text-center text-neutral-500">Loading appointments...</div>
        ) : error ? (
          <div className="py-6 text-center text-red-500">{error}</div>
        ) : appointments.length === 0 ? (
          <div className="py-6 text-center text-neutral-500">No upcoming appointments</div>
        ) : (
          appointments.map((appointment) => (
            <div key={appointment.id} className="py-3">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-10 text-center">
                    <div className="text-xs font-medium text-neutral-500">
                      {formatMonth(appointment.date)}
                    </div>
                    <div className="text-lg font-bold text-neutral-800">
                      {formatDay(appointment.date)}
                    </div>
                  </div>
                </div>
                <div className="ml-4 flex-1">
                  <div className="flex justify-between">
                    <div className="text-sm font-medium text-neutral-900">{appointment.title}</div>
                    <div className="text-xs text-neutral-500">{formatTime(appointment.time)}</div>
                  </div>
                  <div className="text-sm text-neutral-500">{appointment.location}</div>
                  <div className="mt-1 text-xs text-neutral-600">Client: {appointment.client}</div>
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
      <CardFooter className="bg-neutral-50 px-4 py-4 rounded-b-lg">
        <div className="text-sm">
          <a href="/appointments" className="font-medium text-primary-600 hover:text-primary-500">
            View all appointments
          </a>
        </div>
      </CardFooter>
    </Card>
  );
};
