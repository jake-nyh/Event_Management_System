import api from './api';

export interface CustomerTicket {
  id: string;
  ticketTypeId: string;
  customerId: string;
  transactionId: string | null;
  qrCode: string | null;
  status: 'active' | 'used' | 'transferred' | 'refunded' | null;
  purchasedAt: string | null;
  updatedAt: string | null;
  ticketType?: {
    id: string;
    name: string;
    price: string;
    eventId: string;
    event?: {
      id: string;
      title: string;
      eventDate: string;
      eventTime: string;
      location: string;
      imageUrl?: string | null;
      status: string | null;
      isFeatured?: boolean;
    };
  } | null;
  transaction?: {
    id: string;
    totalAmount: string;
    status: string | null;
    createdAt: string | null;
  } | null;
  customer?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface CustomerTicketStats {
  total: number;
  active: number;
  used: number;
  transferred: number;
  refunded: number;
}

export const customerService = {
  // Get all tickets for a customer
  async getMyTickets(): Promise<{ tickets: CustomerTicket[]; total: number }> {
    const response = await api.get('/customers/tickets');
    return {
      tickets: response.data.data,
      total: response.data.data.length,
    };
  },

  // Get a specific ticket by ID
  async getTicketById(ticketId: string): Promise<CustomerTicket> {
    const response = await api.get(`/customers/tickets/${ticketId}`);
    return response.data.data;
  },

  // Update ticket status
  async updateTicketStatus(ticketId: string, status: 'active' | 'used' | 'transferred' | 'refunded'): Promise<CustomerTicket> {
    const response = await api.patch(`/customers/tickets/${ticketId}/status`, { status });
    return response.data.data;
  },

  // Get customer ticket statistics
  async getMyTicketStats(): Promise<CustomerTicketStats> {
    const response = await api.get('/customers/tickets/stats');
    return response.data.data;
  },

  // Mark ticket as used (for event check-in)
  async markTicketAsUsed(ticketId: string): Promise<{ success: boolean; ticket?: CustomerTicket; error?: string }> {
    const response = await api.post(`/customers/tickets/${ticketId}/use`);
    return response.data;
  },

  // Get tickets for an event (for event organizers)
  async getEventTickets(eventId: string): Promise<CustomerTicket[]> {
    const response = await api.get(`/events/${eventId}/sold-tickets`);
    return response.data;
  },

  // Get QR code image for a ticket
  async getQRCodeImage(ticketId: string): Promise<{ qrCodeImage: string }> {
    const response = await api.get(`/qr-codes/image/${ticketId}`);
    return response.data.data;
  },

  // Regenerate QR code for a specific ticket
  async regenerateQRCode(ticketId: string): Promise<{ qrCode: string; qrCodeImage: string }> {
    const response = await api.post(`/customers/tickets/${ticketId}/regenerate-qr`);
    return response.data.data;
  },

  // Regenerate QR codes for all tickets without QR codes
  async regenerateAllQRCodes(): Promise<{ regenerated: number; total: number }> {
    const response = await api.post('/customers/tickets/regenerate-all-qr');
    return response.data.data;
  },
};