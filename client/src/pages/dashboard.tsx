import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Property, Client, Appointment } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import PropertyCard from "@/components/property/property-card";
import AppointmentCard from "@/components/appointment/appointment-card";
import PremiumUpgradeBanner from "@/components/premium-upgrade-banner";
import { Skeleton } from "@/components/ui/skeleton";
import { Home, Users, Calendar } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();

  const { data: properties, isLoading: propertiesLoading } = useQuery<Property[]>({
    queryKey: ['/api/properties'],
  });

  const { data: clients, isLoading: clientsLoading } = useQuery<Client[]>({
    queryKey: ['/api/clients'],
  });

  const { data: appointments, isLoading: appointmentsLoading } = useQuery<Appointment[]>({
    queryKey: ['/api/appointments'],
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Stats Section */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 lg:col-span-3">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                  <Home className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Properties</dt>
                    <dd>
                      {propertiesLoading ? (
                        <Skeleton className="h-8 w-16" />
                      ) : (
                        <div className="text-lg font-medium text-gray-900">
                          {properties?.length || 0}
                        </div>
                      )}
                    </dd>
                  </dl>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3 -mx-5 mt-5 -mb-5">
                <div className="text-sm">
                  <Link href="/properties" className="font-medium text-primary hover:text-blue-700">
                    View all
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Active Clients</dt>
                    <dd>
                      {clientsLoading ? (
                        <Skeleton className="h-8 w-16" />
                      ) : (
                        <div className="text-lg font-medium text-gray-900">
                          {clients?.length || 0}
                        </div>
                      )}
                    </dd>
                  </dl>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3 -mx-5 mt-5 -mb-5">
                <div className="text-sm">
                  <Link href="/clients" className="font-medium text-primary hover:text-blue-700">
                    View all
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-orange-500 rounded-md p-3">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Upcoming Appointments</dt>
                    <dd>
                      {appointmentsLoading ? (
                        <Skeleton className="h-8 w-16" />
                      ) : (
                        <div className="text-lg font-medium text-gray-900">
                          {appointments?.length || 0}
                        </div>
                      )}
                    </dd>
                  </dl>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3 -mx-5 mt-5 -mb-5">
                <div className="text-sm">
                  <Link href="/appointments" className="font-medium text-primary hover:text-blue-700">
                    View all
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Properties Section */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="px-0 py-0">
              <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Properties</h3>
                <Link href="/properties" className="text-sm font-medium text-primary hover:text-blue-700">
                  View all
                </Link>
              </div>
              <div className="border-t border-gray-200">
                <div className="overflow-hidden">
                  {propertiesLoading ? (
                    <>
                      <div className="p-4">
                        <Skeleton className="h-24 w-full" />
                      </div>
                      <div className="p-4">
                        <Skeleton className="h-24 w-full" />
                      </div>
                    </>
                  ) : properties && properties.length > 0 ? (
                    properties.slice(0, 3).map((property) => (
                      <div key={property.id} className="hover:bg-gray-50 border-b border-gray-200">
                        <PropertyCard property={property} />
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center text-gray-500">
                      No properties found. 
                      <Link href="/properties/add" className="text-primary ml-1 hover:underline">
                        Add your first property
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Appointments Section */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="px-0 py-0">
              <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Upcoming Appointments</h3>
                <Link href="/appointments" className="text-sm font-medium text-primary hover:text-blue-700">
                  View calendar
                </Link>
              </div>
              <div className="border-t border-gray-200">
                <div className="divide-y divide-gray-200">
                  {appointmentsLoading ? (
                    <>
                      <div className="p-4">
                        <Skeleton className="h-16 w-full" />
                      </div>
                      <div className="p-4">
                        <Skeleton className="h-16 w-full" />
                      </div>
                    </>
                  ) : appointments && appointments.length > 0 ? (
                    appointments.slice(0, 3).map((appointment) => (
                      <div key={appointment.id} className="hover:bg-gray-50">
                        <AppointmentCard appointment={appointment} />
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center text-gray-500">
                      No appointments found.
                      <Link href="/appointments/add" className="text-primary ml-1 hover:underline">
                        Schedule your first appointment
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Premium Upgrade Banner */}
      <PremiumUpgradeBanner />
    </div>
  );
}
