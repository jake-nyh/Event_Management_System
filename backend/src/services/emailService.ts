import nodemailer from 'nodemailer';

// Email interface
export interface EmailData {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

// Email template types
export interface TicketPurchaseEmailData {
  customerName: string;
  customerEmail: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  tickets: Array<{
    ticketTypeName: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  transactionId: string;
  qrCodes?: string[];
}

export interface EventConfirmationEmailData {
  creatorName: string;
  creatorEmail: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  eventId: string;
}

export interface TicketTransferEmailData {
  fromName: string;
  toName: string;
  toEmail: string;
  eventTitle: string;
  eventDate: string;
  tickets: Array<{
    ticketTypeName: string;
    quantity: number;
  }>;
}

export interface RefundConfirmationEmailData {
  customerName: string;
  customerEmail: string;
  eventTitle: string;
  refundAmount: number;
  refundDate: string;
  transactionId: string;
}

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Create transporter with environment variables
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Verify connection configuration
    this.transporter.verify((error, success) => {
      if (error) {
        console.error('Email service configuration error:', error);
      } else {
        console.log('Email service is ready to send messages');
      }
    });
  }

  // Send email method
  async sendEmail(emailData: EmailData): Promise<{ success: boolean; error?: string }> {
    try {
      const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME || 'Event Management System'}" <${process.env.EMAIL_USER}>`,
        to: emailData.to,
        subject: emailData.subject,
        text: emailData.text,
        html: emailData.html,
        attachments: emailData.attachments,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', info.messageId);
      
      return { success: true };
    } catch (error) {
      console.error('Error sending email:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to send email' 
      };
    }
  }

  // Template: Ticket Purchase Confirmation
  async sendTicketPurchaseConfirmation(data: TicketPurchaseEmailData): Promise<{ success: boolean; error?: string }> {
    const html = this.generateTicketPurchaseTemplate(data);
    const text = this.generateTicketPurchaseTextTemplate(data);

    return this.sendEmail({
      to: data.customerEmail,
      subject: `Ticket Purchase Confirmation - ${data.eventTitle}`,
      html,
      text,
    });
  }

  // Template: Event Creation Confirmation
  async sendEventConfirmation(data: EventConfirmationEmailData): Promise<{ success: boolean; error?: string }> {
    const html = this.generateEventConfirmationTemplate(data);
    const text = this.generateEventConfirmationTextTemplate(data);

    return this.sendEmail({
      to: data.creatorEmail,
      subject: `Event Created Successfully - ${data.eventTitle}`,
      html,
      text,
    });
  }

  // Template: Ticket Transfer Notification
  async sendTicketTransferNotification(data: TicketTransferEmailData): Promise<{ success: boolean; error?: string }> {
    const html = this.generateTicketTransferTemplate(data);
    const text = this.generateTicketTransferTextTemplate(data);

    return this.sendEmail({
      to: data.toEmail,
      subject: `Tickets Transferred - ${data.eventTitle}`,
      html,
      text,
    });
  }

  // Template: Refund Confirmation
  async sendRefundConfirmation(data: RefundConfirmationEmailData): Promise<{ success: boolean; error?: string }> {
    const html = this.generateRefundConfirmationTemplate(data);
    const text = this.generateRefundConfirmationTextTemplate(data);

    return this.sendEmail({
      to: data.customerEmail,
      subject: `Refund Processed - ${data.eventTitle}`,
      html,
      text,
    });
  }

  // HTML Template Generators
  private generateTicketPurchaseTemplate(data: TicketPurchaseEmailData): string {
    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    };

    const formatTime = (timeString: string) => {
      return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    };

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Ticket Purchase Confirmation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4f46e5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .ticket-item { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #4f46e5; }
          .total { background: #4f46e5; color: white; padding: 15px; margin: 20px 0; border-radius: 5px; text-align: right; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎫 Ticket Purchase Confirmation</h1>
            <p>Thank you for your purchase!</p>
          </div>
          <div class="content">
            <h2>Event Details</h2>
            <p><strong>Event:</strong> ${data.eventTitle}</p>
            <p><strong>Date:</strong> ${formatDate(data.eventDate)}</p>
            <p><strong>Time:</strong> ${formatTime(data.eventTime)}</p>
            <p><strong>Location:</strong> ${data.eventLocation}</p>
            
            <h2>Ticket Details</h2>
            ${data.tickets.map(ticket => `
              <div class="ticket-item">
                <p><strong>${ticket.ticketTypeName}</strong></p>
                <p>Quantity: ${ticket.quantity} × $${ticket.price.toFixed(2)} = $${(ticket.quantity * ticket.price).toFixed(2)}</p>
              </div>
            `).join('')}
            
            <div class="total">
              <h3>Total Amount: $${data.totalAmount.toFixed(2)}</h3>
              <p>Transaction ID: ${data.transactionId}</p>
            </div>
            
            <p><strong>Important:</strong> Please bring a valid ID and this confirmation email to the event.</p>
            ${data.qrCodes ? `
              <p><strong>Digital Tickets:</strong> Your QR codes have been generated and are attached to this email.</p>
            ` : ''}
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Event Management System. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateEventConfirmationTemplate(data: EventConfirmationEmailData): string {
    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    };

    const formatTime = (timeString: string) => {
      return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    };

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Event Created Successfully</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10b981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .event-details { background: white; padding: 20px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #10b981; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          .btn { display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Event Created Successfully</h1>
            <p>Your event is now live!</p>
          </div>
          <div class="content">
            <h2>Hello ${data.creatorName},</h2>
            <p>Congratulations! Your event has been successfully created and is now available for ticket purchases.</p>
            
            <div class="event-details">
              <h3>${data.eventTitle}</h3>
              <p><strong>Date:</strong> ${formatDate(data.eventDate)}</p>
              <p><strong>Time:</strong> ${formatTime(data.eventTime)}</p>
              <p><strong>Location:</strong> ${data.eventLocation}</p>
            </div>
            
            <p>You can manage your event, view analytics, and track sales through your dashboard.</p>
            
            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL}/dashboard" class="btn">Go to Dashboard</a>
            </div>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Event Management System. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateTicketTransferTemplate(data: TicketTransferEmailData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Tickets Transferred</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f59e0b; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .transfer-details { background: white; padding: 20px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #f59e0b; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎫 Tickets Transferred</h1>
            <p>You've received tickets!</p>
          </div>
          <div class="content">
            <h2>Hello ${data.toName},</h2>
            <p>${data.fromName} has transferred tickets to you for the following event:</p>
            
            <div class="transfer-details">
              <h3>${data.eventTitle}</h3>
              <p><strong>Date:</strong> ${new Date(data.eventDate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}</p>
              
              <h4>Transferred Tickets:</h4>
              ${data.tickets.map(ticket => `
                <p>• ${ticket.ticketTypeName} (Quantity: ${ticket.quantity})</p>
              `).join('')}
            </div>
            
            <p>Please log in to your account to view and manage your transferred tickets.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Event Management System. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateRefundConfirmationTemplate(data: RefundConfirmationEmailData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Refund Processed</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #ef4444; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .refund-details { background: white; padding: 20px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #ef4444; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💰 Refund Processed</h1>
            <p>Your refund has been approved</p>
          </div>
          <div class="content">
            <h2>Hello ${data.customerName},</h2>
            <p>Your refund request for the following event has been processed:</p>
            
            <div class="refund-details">
              <h3>${data.eventTitle}</h3>
              <p><strong>Refund Amount:</strong> $${data.refundAmount.toFixed(2)}</p>
              <p><strong>Refund Date:</strong> ${new Date(data.refundDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}</p>
              <p><strong>Transaction ID:</strong> ${data.transactionId}</p>
            </div>
            
            <p>The refund has been processed to your original payment method. Please allow 3-5 business days for the refund to appear in your account.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Event Management System. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Text Template Generators
  private generateTicketPurchaseTextTemplate(data: TicketPurchaseEmailData): string {
    return `
Ticket Purchase Confirmation

Thank you for your purchase!

Event Details:
Event: ${data.eventTitle}
Date: ${new Date(data.eventDate).toLocaleDateString()}
Time: ${data.eventTime}
Location: ${data.eventLocation}

Ticket Details:
${data.tickets.map(ticket => 
  `${ticket.ticketTypeName}: ${ticket.quantity} × $${ticket.price.toFixed(2)} = $${(ticket.quantity * ticket.price).toFixed(2)}`
).join('\n')}

Total Amount: $${data.totalAmount.toFixed(2)}
Transaction ID: ${data.transactionId}

Important: Please bring a valid ID and this confirmation email to the event.

© ${new Date().getFullYear()} Event Management System. All rights reserved.
    `;
  }

  private generateEventConfirmationTextTemplate(data: EventConfirmationEmailData): string {
    return `
Event Created Successfully

Hello ${data.creatorName},

Congratulations! Your event has been successfully created and is now available for ticket purchases.

Event Details:
${data.eventTitle}
Date: ${new Date(data.eventDate).toLocaleDateString()}
Time: ${data.eventTime}
Location: ${data.eventLocation}

You can manage your event, view analytics, and track sales through your dashboard.

Go to Dashboard: ${process.env.FRONTEND_URL}/dashboard

© ${new Date().getFullYear()} Event Management System. All rights reserved.
    `;
  }

  private generateTicketTransferTextTemplate(data: TicketTransferEmailData): string {
    return `
Tickets Transferred

Hello ${data.toName},

${data.fromName} has transferred tickets to you for the following event:

Event: ${data.eventTitle}
Date: ${new Date(data.eventDate).toLocaleDateString()}

Transferred Tickets:
${data.tickets.map(ticket => `• ${ticket.ticketTypeName} (Quantity: ${ticket.quantity})`).join('\n')}

Please log in to your account to view and manage your transferred tickets.

© ${new Date().getFullYear()} Event Management System. All rights reserved.
    `;
  }

  private generateRefundConfirmationTextTemplate(data: RefundConfirmationEmailData): string {
    return `
Refund Processed

Hello ${data.customerName},

Your refund request for the following event has been processed:

Event: ${data.eventTitle}
Refund Amount: $${data.refundAmount.toFixed(2)}
Refund Date: ${new Date(data.refundDate).toLocaleDateString()}
Transaction ID: ${data.transactionId}

The refund has been processed to your original payment method. Please allow 3-5 business days for the refund to appear in your account.

© ${new Date().getFullYear()} Event Management System. All rights reserved.
    `;
  }
}

export const emailService = new EmailService();