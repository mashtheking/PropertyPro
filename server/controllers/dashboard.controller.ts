import { Request, Response } from 'express';
import { storage } from '../storage';
import { subMonths, format, isAfter } from 'date-fns';

export const dashboardController = {
  getStats: async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      
      // Get all user data
      const properties = await storage.getProperties(userId);
      const clients = await storage.getClients(userId);
      const appointments = await storage.getAppointments(userId);
      
      // Get previous month data for comparison
      const oneMonthAgo = subMonths(new Date(), 1);
      
      // Count properties
      const propertyCount = properties.length;
      const previousMonthProperties = properties.filter(prop => 
        !isAfter(new Date(prop.createdAt), oneMonthAgo)
      ).length;
      
      // Calculate property change percentage
      let propertyChange = 0;
      if (previousMonthProperties > 0) {
        propertyChange = Math.round(((propertyCount - previousMonthProperties) / previousMonthProperties) * 100);
      }
      
      // Count active clients
      const activeClients = clients.filter(client => client.status === 'Active').length;
      const previousMonthActiveClients = clients.filter(client => 
        client.status === 'Active' && !isAfter(new Date(client.createdAt), oneMonthAgo)
      ).length;
      
      // Calculate client change percentage
      let clientChange = 0;
      if (previousMonthActiveClients > 0) {
        clientChange = Math.round(((activeClients - previousMonthActiveClients) / previousMonthActiveClients) * 100);
      }
      
      // Count upcoming appointments
      const today = new Date();
      const upcomingAppointments = appointments.filter(apt => 
        isAfter(new Date(apt.date), today)
      ).length;
      
      // Get appointments from previous month for comparison
      const previousMonthDate = subMonths(today, 1);
      const previousMonthAppointments = appointments.filter(apt => 
        isAfter(new Date(apt.date), previousMonthDate) && !isAfter(new Date(apt.date), today)
      ).length;
      
      // Calculate appointment change percentage
      let appointmentChange = 0;
      if (previousMonthAppointments > 0) {
        appointmentChange = Math.round(((upcomingAppointments - previousMonthAppointments) / previousMonthAppointments) * 100);
      }
      
      res.status(200).json({
        properties: {
          count: propertyCount,
          change: {
            value: propertyChange,
            isPositive: propertyChange >= 0
          }
        },
        clients: {
          count: activeClients,
          change: {
            value: clientChange,
            isPositive: clientChange >= 0
          }
        },
        appointments: {
          count: upcomingAppointments,
          change: {
            value: appointmentChange,
            isPositive: appointmentChange >= 0
          }
        }
      });
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  },

  getActivities: async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      
      // Get recent properties, clients, and appointments
      const properties = await storage.getProperties(userId);
      const clients = await storage.getClients(userId);
      const appointments = await storage.getAppointments(userId);
      
      // Sort all by created date (most recent first)
      const sortedProperties = properties.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ).slice(0, 5);
      
      const sortedClients = clients.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ).slice(0, 5);
      
      const sortedAppointments = appointments.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ).slice(0, 5);
      
      // Create activities from the data
      const propertyActivities = sortedProperties.map(property => ({
        id: `property-${property.id}`,
        type: 'property' as const,
        icon: 'home_work',
        iconColor: 'text-primary-500',
        title: 'New property listed',
        description: `${property.name}, ${property.city}, ${property.state}`,
        timestamp: property.createdAt
      }));
      
      const clientActivities = sortedClients.map(client => ({
        id: `client-${client.id}`,
        type: 'client' as const,
        icon: 'people',
        iconColor: 'text-green-500',
        title: 'New client added',
        description: `${client.firstName} ${client.lastName}`,
        timestamp: client.createdAt
      }));
      
      const appointmentActivities = sortedAppointments.map(appointment => ({
        id: `appointment-${appointment.id}`,
        type: 'appointment' as const,
        icon: 'event',
        iconColor: 'text-yellow-500',
        title: appointment.title,
        description: appointment.location,
        timestamp: appointment.createdAt
      }));
      
      // Combine and sort all activities
      const allActivities = [
        ...propertyActivities, 
        ...clientActivities, 
        ...appointmentActivities
      ].sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ).slice(0, 10);
      
      res.status(200).json(allActivities);
    } catch (error) {
      console.error('Get activities error:', error);
      res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  },

  getUpcomingAppointments: async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      
      // Get all appointments and clients
      const appointments = await storage.getAppointments(userId);
      const clients = await storage.getClients(userId);
      
      // Filter to only upcoming appointments
      const today = new Date();
      const upcomingAppointments = appointments
        .filter(apt => isAfter(new Date(apt.date), today))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 5)
        .map(apt => {
          // Find client for this appointment
          const client = apt.clientId 
            ? clients.find(c => c.id === apt.clientId) 
            : null;
          
          const clientName = client 
            ? `${client.firstName} ${client.lastName}` 
            : 'No client assigned';
            
          return {
            id: apt.id,
            title: apt.title,
            date: apt.date,
            time: apt.time,
            location: apt.location,
            client: clientName
          };
        });
      
      res.status(200).json(upcomingAppointments);
    } catch (error) {
      console.error('Get upcoming appointments error:', error);
      res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }
};
