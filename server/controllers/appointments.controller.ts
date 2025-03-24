import { Request, Response } from 'express';
import { storage } from '../storage';
import { emailService } from '../services/email';
import { insertAppointmentSchema } from '@shared/schema';
import { addDays, isToday, isTomorrow } from 'date-fns';

export const appointmentsController = {
  getAll: async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const appointments = await storage.getAppointments(userId);
      res.status(200).json(appointments);
    } catch (error) {
      console.error('Get appointments error:', error);
      res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  },

  getById: async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const appointmentId = parseInt(req.params.id);
      
      if (isNaN(appointmentId)) {
        return res.status(400).json({ message: 'Invalid appointment ID' });
      }

      const appointment = await storage.getAppointment(appointmentId, userId);
      
      if (!appointment) {
        return res.status(404).json({ message: 'Appointment not found' });
      }

      res.status(200).json(appointment);
    } catch (error) {
      console.error('Get appointment error:', error);
      res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  },

  create: async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      
      // Validate request body
      const validationResult = insertAppointmentSchema.safeParse({ ...req.body, userId });
      if (!validationResult.success) {
        return res.status(400).json({ message: 'Invalid request data', errors: validationResult.error.errors });
      }

      // Create appointment
      const appointment = await storage.createAppointment(validationResult.data);
      
      // Check if appointment is tomorrow and send reminder if emailReminder is true
      try {
        if (appointment.emailReminder) {
          const appointmentDate = new Date(appointment.date);
          if (isTomorrow(appointmentDate)) {
            const user = await storage.getUser(userId);
            if (user) {
              // Get client info if clientId is provided
              let client = undefined;
              if (appointment.clientId) {
                client = await storage.getClient(appointment.clientId, userId);
              }
              
              await emailService.sendAppointmentReminder(user, appointment, client);
            }
          }
        }
      } catch (emailError) {
        console.error('Error sending appointment reminder:', emailError);
        // Continue anyway, the appointment was created successfully
      }
      
      res.status(201).json(appointment);
    } catch (error) {
      console.error('Create appointment error:', error);
      res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  },

  update: async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const appointmentId = parseInt(req.params.id);
      
      if (isNaN(appointmentId)) {
        return res.status(400).json({ message: 'Invalid appointment ID' });
      }

      // Check if appointment exists and belongs to user
      const existingAppointment = await storage.getAppointment(appointmentId, userId);
      if (!existingAppointment) {
        return res.status(404).json({ message: 'Appointment not found' });
      }

      // Validate request body (partial)
      const validationResult = insertAppointmentSchema.partial().safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ message: 'Invalid request data', errors: validationResult.error.errors });
      }

      // Update appointment
      const updatedAppointment = await storage.updateAppointment(appointmentId, userId, validationResult.data);
      
      if (!updatedAppointment) {
        return res.status(404).json({ message: 'Appointment not found' });
      }

      // Check if date or time was updated and if the appointment is now tomorrow
      if ((req.body.date !== undefined || req.body.time !== undefined) && updatedAppointment.emailReminder) {
        try {
          const appointmentDate = new Date(updatedAppointment.date);
          if (isTomorrow(appointmentDate) && !existingAppointment.reminderSent) {
            const user = await storage.getUser(userId);
            if (user) {
              // Get client info if clientId is provided
              let client = undefined;
              if (updatedAppointment.clientId) {
                client = await storage.getClient(updatedAppointment.clientId, userId);
              }
              
              await emailService.sendAppointmentReminder(user, updatedAppointment, client);
              
              // Mark reminder as sent
              await storage.updateAppointment(appointmentId, userId, { reminderSent: true });
            }
          }
        } catch (emailError) {
          console.error('Error sending appointment reminder:', emailError);
          // Continue anyway, the appointment was updated successfully
        }
      }

      res.status(200).json(updatedAppointment);
    } catch (error) {
      console.error('Update appointment error:', error);
      res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  },

  delete: async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const appointmentId = parseInt(req.params.id);
      
      if (isNaN(appointmentId)) {
        return res.status(400).json({ message: 'Invalid appointment ID' });
      }

      // Check if appointment exists and belongs to user
      const existingAppointment = await storage.getAppointment(appointmentId, userId);
      if (!existingAppointment) {
        return res.status(404).json({ message: 'Appointment not found' });
      }

      // Delete appointment
      const success = await storage.deleteAppointment(appointmentId, userId);
      
      if (!success) {
        return res.status(500).json({ message: 'Failed to delete appointment' });
      }

      res.status(200).json({ message: 'Appointment deleted successfully' });
    } catch (error) {
      console.error('Delete appointment error:', error);
      res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }
};
