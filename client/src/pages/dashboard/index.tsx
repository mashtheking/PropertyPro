import { useEffect } from 'react';
import { Link } from 'wouter';
import { useProperties } from '@/hooks/useProperties';
import { useClients } from '@/hooks/useClients';
import { useAppointments } from '@/hooks/useAppointments';
import { Building, Users, CalendarCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import PropertyCard from '@/components/properties/PropertyCard';
import AppointmentCard from '@/components/appointments/AppointmentCard';
import ClientCard from '@/components/clients/ClientCard';
import { formatCurrency } from '@/lib/utils';

const Dashboard = () => {
  const { properties, fetchProperties } = useProperties();
  const { clients, fetchClients } = useClients();
  const { appointments, fetchUpcomingAppointments } = useAppointments();

  useEffect(() => {
    fetchProperties();
    fetchClients();
    fetchUpcomingAppointments();
  }, [fetchProperties, fetchClients, fetchUpcomingAppointments]);

  // Get recent properties, clients, and appointments
  const recentProperties = properties?.slice(0, 3) || [];
  const recentClients = clients?.slice(0, 3) || [];
  const upcomingAppointments = appointments?.slice(0, 3) || [];

  return (
    <div>
      {/* Dashboard Overview */}
      <div className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-white shadow-sm border border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-primary-100 p-3 rounded-md">
                  <Building className="h-5 w-5 text-primary-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">Active Properties</h3>
                  <p className="text-2xl font-semibold">
                    {properties ? properties.filter(p => p.status === 'Active').length : '...'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-secondary-100 p-3 rounded-md">
                  <Users className="h-5 w-5 text-secondary-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">Total Clients</h3>
                  <p className="text-2xl font-semibold">
                    {clients ? clients.length : '...'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-premium-100 p-3 rounded-md">
                  <CalendarCheck className="h-5 w-5 text-premium-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">Upcoming Appointments</h3>
                  <p className="text-2xl font-semibold">
                    {appointments ? appointments.length : '...'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Properties Section */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">Recent Properties</h2>
          <Link href="/properties">
            <a className="text-sm font-medium text-primary-600 hover:text-primary-700">View all</a>
          </Link>
        </div>
        
        {recentProperties.length > 0 ? (
          <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentProperties.map((property) => (
                    <tr key={property.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-md bg-gray-200">
                            {property.images && Array.isArray(property.images) && property.images.length > 0 ? (
                              <img className="h-10 w-10 rounded-md object-cover" src={property.images[0]} alt={property.name} />
                            ) : (
                              <div className="h-10 w-10 rounded-md flex items-center justify-center bg-gray-200 text-gray-500">
                                <Building className="h-5 w-5" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{property.name}</div>
                            <div className="text-sm text-gray-500">
                              {property.bedrooms} bed • {property.bathrooms} bath • {property.squareFeet} sqft
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {property.address}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(property.price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={
                          property.status === 'Active' ? 'bg-green-100 text-green-800' :
                          property.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                          property.status === 'Sold' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }>
                          {property.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link href={`/properties/${property.id}`}>
                          <a className="text-primary-600 hover:text-primary-800">Edit</a>
                        </Link>
                        <span className="mx-1 text-gray-300">|</span>
                        <Link href={`/properties/${property.id}`}>
                          <a className="text-gray-600 hover:text-gray-800">View</a>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <Card className="bg-white">
            <CardContent className="p-6 text-center">
              <p className="text-gray-500 mb-4">No properties found</p>
              <Link href="/properties/add">
                <Button>Add Your First Property</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Upcoming Appointments & Recent Clients Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Appointments */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Upcoming Appointments</h2>
            <Link href="/appointments/calendar">
              <a className="text-sm font-medium text-primary-600 hover:text-primary-700">View calendar</a>
            </Link>
          </div>
          
          {upcomingAppointments.length > 0 ? (
            <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
              <ul className="divide-y divide-gray-200">
                {upcomingAppointments.map((appointment) => {
                  const client = clients?.find(c => c.id === appointment.clientId);
                  const property = properties?.find(p => p.id === appointment.propertyId);
                  
                  return (
                    <li key={appointment.id} className="p-4">
                      <AppointmentCard 
                        appointment={appointment} 
                        client={client} 
                        property={property} 
                      />
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : (
            <Card className="bg-white">
              <CardContent className="p-6 text-center">
                <p className="text-gray-500 mb-4">No upcoming appointments</p>
                <Link href="/appointments/add">
                  <Button>Schedule Appointment</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </section>
        
        {/* Recent Clients */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Recent Clients</h2>
            <Link href="/clients">
              <a className="text-sm font-medium text-primary-600 hover:text-primary-700">View all</a>
            </Link>
          </div>
          
          {recentClients.length > 0 ? (
            <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
              <ul className="divide-y divide-gray-200">
                {recentClients.map((client) => (
                  <li key={client.id} className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200">
                        <div className="h-full w-full rounded-full flex items-center justify-center bg-gray-300 text-gray-600">
                          <Users className="h-5 w-5" />
                        </div>
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium text-gray-900">
                            {client.firstName} {client.lastName}
                          </h3>
                          <Badge className={
                            client.clientType === 'Buyer' ? 'bg-green-100 text-green-800' :
                            client.clientType === 'Seller' ? 'bg-blue-100 text-blue-800' :
                            client.clientType === 'Investor' ? 'bg-purple-100 text-purple-800' :
                            'bg-gray-100 text-gray-800'
                          }>
                            {client.clientType}
                          </Badge>
                        </div>
                        {client.email && (
                          <div className="mt-1 flex items-center text-sm text-gray-500">
                            <svg className="mr-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <span>{client.email}</span>
                          </div>
                        )}
                        {client.phone && (
                          <div className="mt-1 flex items-center text-sm text-gray-500">
                            <svg className="mr-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            <span>{client.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <Card className="bg-white">
              <CardContent className="p-6 text-center">
                <p className="text-gray-500 mb-4">No clients found</p>
                <Link href="/clients/add">
                  <Button>Add Your First Client</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
