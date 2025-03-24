import { Appointment, Client, User } from "@shared/schema";
import { format } from 'date-fns';

// Resend API
const RESEND_API_KEY = process.env.RESEND_API_KEY || 're_4RZf3gxB_84fjiaZfKdjx7bRotYqfpF3f';
const DEFAULT_FROM_EMAIL = 'notifications@realcrm.com';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
  text?: string;
}

export class EmailService {
  private async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RESEND_API_KEY}`
        },
        body: JSON.stringify({
          from: options.from || DEFAULT_FROM_EMAIL,
          to: options.to,
          subject: options.subject,
          html: options.html,
          text: options.text
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Email sending failed:', errorData);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Email service error:', error);
      return false;
    }
  }

  public async sendAppointmentReminder(user: User, appointment: Appointment, client?: Client): Promise<boolean> {
    const appointmentDate = new Date(appointment.date);
    const formattedDate = format(appointmentDate, 'EEEE, MMMM d, yyyy');
    
    const clientName = client ? `${client.firstName} ${client.lastName}` : 'a client';
    
    const subject = `Reminder: ${appointment.title} - Tomorrow at ${appointment.time}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Appointment Reminder</h2>
        <p>Hello ${user.fullName},</p>
        <p>This is a reminder that you have an appointment scheduled for tomorrow:</p>
        
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Title:</strong> ${appointment.title}</p>
          <p><strong>Date:</strong> ${formattedDate}</p>
          <p><strong>Time:</strong> ${appointment.time}</p>
          <p><strong>Location:</strong> ${appointment.location}</p>
          <p><strong>Client:</strong> ${clientName}</p>
          ${appointment.description ? `<p><strong>Description:</strong> ${appointment.description}</p>` : ''}
        </div>
        
        <p>Please make sure you're prepared for this appointment.</p>
        <p>Thank you for using RealCRM!</p>
        
        <div style="margin-top: 30px; font-size: 12px; color: #888;">
          <p>This is an automated message from RealCRM. Please do not reply to this email.</p>
        </div>
      </div>
    `;
    
    const text = `
      Appointment Reminder
      
      Hello ${user.fullName},
      
      This is a reminder that you have an appointment scheduled for tomorrow:
      
      Title: ${appointment.title}
      Date: ${formattedDate}
      Time: ${appointment.time}
      Location: ${appointment.location}
      Client: ${clientName}
      ${appointment.description ? `Description: ${appointment.description}` : ''}
      
      Please make sure you're prepared for this appointment.
      
      Thank you for using RealCRM!
      
      This is an automated message from RealCRM. Please do not reply to this email.
    `;
    
    return this.sendEmail({
      to: user.email,
      subject,
      html,
      text
    });
  }

  public async sendSubscriptionConfirmation(user: User, planName: string, amount: string, nextBillingDate: Date): Promise<boolean> {
    const formattedDate = format(nextBillingDate, 'MMMM d, yyyy');
    
    const subject = 'Welcome to RealCRM Premium!';
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to RealCRM Premium!</h2>
        <p>Hello ${user.fullName},</p>
        <p>Thank you for subscribing to RealCRM Premium. Your subscription has been successfully activated.</p>
        
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Plan:</strong> ${planName}</p>
          <p><strong>Amount:</strong> ${amount}</p>
          <p><strong>Next Billing Date:</strong> ${formattedDate}</p>
        </div>
        
        <p>You now have access to all premium features:</p>
        <ul>
          <li>Advanced analytics and reporting</li>
          <li>Bulk actions and data export</li>
          <li>Custom branding</li>
          <li>Priority support</li>
          <li>And much more!</li>
        </ul>
        
        <p>If you have any questions about your subscription, please contact our support team.</p>
        
        <div style="margin-top: 30px; font-size: 12px; color: #888;">
          <p>This is an automated message from RealCRM. Please do not reply to this email.</p>
        </div>
      </div>
    `;
    
    const text = `
      Welcome to RealCRM Premium!
      
      Hello ${user.fullName},
      
      Thank you for subscribing to RealCRM Premium. Your subscription has been successfully activated.
      
      Plan: ${planName}
      Amount: ${amount}
      Next Billing Date: ${formattedDate}
      
      You now have access to all premium features:
      - Advanced analytics and reporting
      - Bulk actions and data export
      - Custom branding
      - Priority support
      - And much more!
      
      If you have any questions about your subscription, please contact our support team.
      
      This is an automated message from RealCRM. Please do not reply to this email.
    `;
    
    return this.sendEmail({
      to: user.email,
      subject,
      html,
      text
    });
  }

  public async sendSubscriptionCancellation(user: User, endDate: Date): Promise<boolean> {
    const formattedDate = format(endDate, 'MMMM d, yyyy');
    
    const subject = 'Your RealCRM Premium Subscription Has Been Cancelled';
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Subscription Cancellation Confirmation</h2>
        <p>Hello ${user.fullName},</p>
        <p>We're sorry to see you go. Your RealCRM Premium subscription has been cancelled as requested.</p>
        
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p>You will continue to have access to premium features until <strong>${formattedDate}</strong>.</p>
        </div>
        
        <p>After this date, your account will be converted to the free plan, and you'll need to use reward units to access premium features.</p>
        
        <p>We hope to see you again soon! If you change your mind, you can resubscribe at any time.</p>
        
        <div style="margin-top: 30px; font-size: 12px; color: #888;">
          <p>This is an automated message from RealCRM. Please do not reply to this email.</p>
        </div>
      </div>
    `;
    
    const text = `
      Subscription Cancellation Confirmation
      
      Hello ${user.fullName},
      
      We're sorry to see you go. Your RealCRM Premium subscription has been cancelled as requested.
      
      You will continue to have access to premium features until ${formattedDate}.
      
      After this date, your account will be converted to the free plan, and you'll need to use reward units to access premium features.
      
      We hope to see you again soon! If you change your mind, you can resubscribe at any time.
      
      This is an automated message from RealCRM. Please do not reply to this email.
    `;
    
    return this.sendEmail({
      to: user.email,
      subject,
      html,
      text
    });
  }
}

export const emailService = new EmailService();
