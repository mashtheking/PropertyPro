// Resend email service client
const RESEND_API_KEY = import.meta.env.VITE_RESEND_API_KEY || 're_4RZf3gxB_84fjiaZfKdjx7bRotYqfpF3f';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

// Send an email using the Resend API
export const sendEmail = async (options: EmailOptions) => {
  const { to, subject, html, from = 'RealCRM <notifications@realcrm.app>' } = options;
  
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from,
        to,
        subject,
        html
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to send email: ${errorData.message || response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

// Send an appointment reminder email
export const sendAppointmentReminder = async (
  email: string,
  name: string,
  appointmentTitle: string,
  appointmentDate: string,
  appointmentTime: string,
  appointmentLocation: string
) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #3B82F6;">Appointment Reminder</h2>
      <p>Hello ${name},</p>
      <p>This is a reminder for your upcoming appointment:</p>
      <div style="background-color: #F3F4F6; padding: 15px; border-radius: 5px; margin: 15px 0;">
        <p><strong>Title:</strong> ${appointmentTitle}</p>
        <p><strong>Date:</strong> ${appointmentDate}</p>
        <p><strong>Time:</strong> ${appointmentTime}</p>
        <p><strong>Location:</strong> ${appointmentLocation}</p>
      </div>
      <p>If you need to reschedule, please contact us as soon as possible.</p>
      <p>Thank you,<br>RealCRM Team</p>
    </div>
  `;
  
  return sendEmail({
    to: email,
    subject: `Reminder: ${appointmentTitle} on ${appointmentDate}`,
    html
  });
};
