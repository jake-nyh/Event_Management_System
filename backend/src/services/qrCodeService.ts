import { db } from '../database/connection';
import { tickets } from '../database/schema';
import { eq } from 'drizzle-orm';
import QRCode from 'qrcode';

export class QRCodeService {
  // Generate QR code for a ticket
  async generateQRCode(ticketId: string): Promise<{ success: boolean; qrCode?: string; error?: string }> {
    try {
      // Get ticket details
      const [ticket] = await db
        .select()
        .from(tickets)
        .where(eq(tickets.id, ticketId))
        .limit(1);

      if (!ticket) {
        return { success: false, error: 'Ticket not found' };
      }

      // Generate QR code data (for demo purposes, we'll include ticket ID and status)
      const qrData = JSON.stringify({
        ticketId: ticket.id,
        ticketType: ticket.ticketTypeId,
        status: ticket.status,
        timestamp: new Date().toISOString(),
        // In a real app, you might include more secure data
        // like encrypted ticket information
      });

      // Generate QR code as base64
      const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
        width: 256,
      });

      // Update ticket with QR code
      await db
        .update(tickets)
        .set({ qrCode: qrCodeDataUrl })
        .where(eq(tickets.id, ticketId));

      return {
        success: true,
        qrCode: qrCodeDataUrl,
      };
    } catch (error) {
      console.error('Error generating QR code:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate QR code',
      };
    }
  }

  // Validate QR code (for event check-in)
  async validateQRCode(qrData: string): Promise<{ success: boolean; ticket?: any; error?: string }> {
    try {
      // Parse QR code data
      let parsedData;
      try {
        parsedData = JSON.parse(qrData);
      } catch (parseError) {
        return { success: false, error: 'Invalid QR code format' };
      }

      if (!parsedData.ticketId) {
        return { success: false, error: 'Invalid QR code data' };
      }

      // Get ticket from database
      const [ticket] = await db
        .select()
        .from(tickets)
        .where(eq(tickets.id, parsedData.ticketId))
        .limit(1);

      if (!ticket) {
        return { success: false, error: 'Ticket not found' };
      }

      // Check if ticket is still valid
      if (ticket.status !== 'active') {
        return { 
          success: false, 
          error: `Ticket is ${ticket.status}`,
          ticket 
        };
      }

      // In a real app, you might want to check:
      // - Event date/time
      // - Ticket expiration
      // - Anti-fraud measures

      return {
        success: true,
        ticket,
      };
    } catch (error) {
      console.error('Error validating QR code:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to validate QR code',
      };
    }
  }

  // Generate QR codes for multiple tickets
  async generateMultipleQRCodes(ticketIds: string[]): Promise<{ success: boolean; results: Array<{ ticketId: string; success: boolean; qrCode?: string; error?: string }> }> {
    const results = [];

    for (const ticketId of ticketIds) {
      const result = await this.generateQRCode(ticketId);
      results.push({
        ticketId,
        success: result.success,
        qrCode: result.qrCode,
        error: result.error,
      });
    }

    return {
      success: true,
      results,
    };
  }

  // Create QR code for event check-in (for organizers)
  async createEventCheckInQR(eventId: string, organizerId: string): Promise<{ success: boolean; qrCode?: string; error?: string }> {
    try {
      // Generate QR code data for event check-in
      const qrData = JSON.stringify({
        type: 'event_check_in',
        eventId,
        organizerId,
        timestamp: new Date().toISOString(),
        // In a real app, this would include more secure data
        // and possibly a one-time use token
      });

      // Generate QR code
      const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
        width: 256,
      });

      return {
        success: true,
        qrCode: qrCodeDataUrl,
      };
    } catch (error) {
      console.error('Error creating event check-in QR:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create event check-in QR',
      };
    }
  }

  // Mark ticket as used (for admin/event check-in)
  async markTicketAsUsed(ticketId: string): Promise<{ success: boolean; ticket?: any; error?: string }> {
    try {
      // Get ticket from database
      const [ticket] = await db
        .select()
        .from(tickets)
        .where(eq(tickets.id, ticketId))
        .limit(1);

      if (!ticket) {
        return { success: false, error: 'Ticket not found' };
      }

      // Check if ticket is already used
      if (ticket.status !== 'active') {
        return { success: false, error: `Ticket is already ${ticket.status}` };
      }

      // Update ticket status to 'used'
      const [updatedTicket] = await db
        .update(tickets)
        .set({
          status: 'used',
          updatedAt: new Date()
        })
        .where(eq(tickets.id, ticketId))
        .returning();

      if (!updatedTicket) {
        return { success: false, error: 'Failed to mark ticket as used' };
      }

      return {
        success: true,
        ticket: updatedTicket,
      };
    } catch (error) {
      console.error('Error marking ticket as used:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to mark ticket as used',
      };
    }
  }
}

export const qrCodeService = new QRCodeService();