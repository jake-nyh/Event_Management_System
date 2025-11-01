import api from './api';

export interface TicketType {
  id: string;
  eventId: string;
  name: string;
  price: string;
  quantityAvailable: number;
  quantitySold: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface TicketTypeWithAvailability extends TicketType {
  available: number;
}

export interface CreateTicketTypeData {
  eventId: string;
  name: string;
  price: number;
  quantityAvailable: number;
}

export interface UpdateTicketTypeData {
  name?: string;
  price?: number;
  quantityAvailable?: number;
}

export const ticketService = {
  // Get all ticket types for an event
  async getTicketTypesByEvent(eventId: string): Promise<TicketType[]> {
    const response = await api.get(`/tickets/event/${eventId}`);
    return response.data;
  },

  // Get ticket types with availability info for an event
  async getTicketTypesWithAvailability(eventId: string): Promise<TicketTypeWithAvailability[]> {
    const response = await api.get(`/tickets/event/${eventId}/availability`);
    return response.data;
  },

  // Get a specific ticket type by ID
  async getTicketTypeById(id: string): Promise<TicketType> {
    const response = await api.get(`/tickets/${id}`);
    return response.data;
  },

  // Create a new ticket type
  async createTicketType(data: CreateTicketTypeData): Promise<TicketType> {
    const response = await api.post('/tickets', data);
    return response.data;
  },

  // Update a ticket type
  async updateTicketType(id: string, data: UpdateTicketTypeData): Promise<TicketType> {
    const response = await api.put(`/tickets/${id}`, data);
    return response.data;
  },

  // Delete a ticket type
  async deleteTicketType(id: string): Promise<void> {
    await api.delete(`/tickets/${id}`);
  },

  // Check availability for a ticket type
  async checkAvailability(id: string): Promise<{ available: boolean }> {
    const response = await api.get(`/tickets/${id}/availability`);
    return response.data;
  },

  // Get available count for a ticket type
  async getAvailableCount(id: string): Promise<{ availableCount: number }> {
    const response = await api.get(`/tickets/${id}/available-count`);
    return response.data;
  },
};