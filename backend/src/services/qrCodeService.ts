import { db } from '../database/connection';
import { tickets } from '../database/schema';
import { eq } from 'drizzle-orm';
import QRCode from 'qrcode';

export class QRCodeService {
  // Generate QR code as base64 data URL locally
  async generateQRCodeImage(qrData: string): Promise<string> {
    return await QRCode.toDataURL(qrData, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
      width: 256,
    });
  }

  // Generate QR code for a ticket - stores compact data, generates image on demand
  async generateQRCode(ticketId: string): Promise<{ success: boolean; qrCode?: string; qrCodeImage?: string; error?: string }> {
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

      // Generate compact QR code data (just the ticket ID is enough for validation)
      const qrData = JSON.stringify({
        t: ticket.id,
        tt: ticket.ticketTypeId,
        s: ticket.status,
      });

      // Update ticket with QR code DATA (not image)
      await db
        .update(tickets)
        .set({ qrCode: qrData })
        .where(eq(tickets.id, ticketId));

      // Generate the image locally
      const qrCodeImage = await this.generateQRCodeImage(qrData);

      return {
        success: true,
        qrCode: qrData,
        qrCodeImage: qrCodeImage,
      };
    } catch (error) {
      console.error('Error generating QR code:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate QR code',
      };
    }
  }

  // Get QR code image for a ticket (generates from stored data or returns existing image)
  async getTicketQRCodeImage(ticketId: string): Promise<{ success: boolean; qrCodeImage?: string; error?: string }> {
    try {
      const [ticket] = await db
        .select()
        .from(tickets)
        .where(eq(tickets.id, ticketId))
        .limit(1);

      if (!ticket) {
        return { success: false, error: 'Ticket not found' };
      }

      if (!ticket.qrCode) {
        return { success: false, error: 'QR code not generated yet' };
      }

      // Check if qrCode is already a base64 image (old format)
      if (ticket.qrCode.startsWith('data:image/png;base64,')) {
        return {
          success: true,
          qrCodeImage: ticket.qrCode,
        };
      }

      // Generate image from stored compact JSON data (new format)
      const qrCodeImage = await this.generateQRCodeImage(ticket.qrCode);

      return {
        success: true,
        qrCodeImage: qrCodeImage,
      };
    } catch (error) {
      console.error('Error getting QR code image:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get QR code image',
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

      // Support both old format (ticketId) and new compact format (t)
      const ticketId = parsedData.ticketId || parsedData.t;
      if (!ticketId) {
        return { success: false, error: 'Invalid QR code data' };
      }

      // Get ticket from database
      const [ticket] = await db
        .select()
        .from(tickets)
        .where(eq(tickets.id, ticketId))
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
  async generateMultipleQRCodes(ticketIds: string[]): Promise<{ success: boolean; results: Array<{ ticketId: string; success: boolean; qrCode?: string; qrCodeImage?: string; error?: string }> }> {
    const results = [];

    for (const ticketId of ticketIds) {
      const result = await this.generateQRCode(ticketId);
      results.push({
        ticketId,
        success: result.success,
        qrCode: result.qrCode,
        qrCodeImage: result.qrCodeImage,
        error: result.error,
      });
    }

    return {
      success: true,
      results,
    };
  }

  // Create QR code for event check-in (for organizers)
  async createEventCheckInQR(eventId: string, organizerId: string): Promise<{ success: boolean; qrCode?: string; qrCodeImage?: string; error?: string }> {
    try {
      // Generate QR code data for event check-in
      const qrData = JSON.stringify({
        type: 'event_check_in',
        eventId,
        organizerId,
        timestamp: new Date().toISOString(),
      });

      const qrCodeImage = await this.generateQRCodeImage(qrData);

      return {
        success: true,
        qrCode: qrData,
        qrCodeImage: qrCodeImage,
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
