import api from './api';

export interface TicketType {
  id: string;
  name: string;
  price: string;
  quantityAvailable: number;
  quantitySold?: number;
}

export interface CreateTicketType {
  name: string;
  price: string;
  quantityAvailable: number;
}

export interface CreateEventData {
  title: string;
  description?: string;
  location: string;
  eventDate: string;
  eventTime: string;
  category?: string;
  tags?: string;
  isFeatured?: boolean;
  commissionRate?: string;
  status?: 'draft' | 'published' | 'cancelled' | 'completed';
  ticketTypes?: CreateTicketType[];
}

export interface Event {
  id: string;
  creatorId: string;
  title: string;
  description?: string;
  location: string;
  eventDate: string;
  eventTime: string;
  imageUrl?: string;
  commissionRate?: string;
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  category?: string;
  tags?: string;
  isFeatured?: boolean;
  createdAt: string;
  updatedAt: string;
  creator?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface EventFilters {
  search?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  status?: 'draft' | 'published' | 'cancelled' | 'completed';
  category?: string;
  tags?: string;
  isFeatured?: boolean;
  sortBy?: 'title' | 'date' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface EventsResponse {
  events: Event[];
  total: number;
}

export const eventService = {
  // Get all events
  async getEvents(filters?: EventFilters): Promise<EventsResponse> {
    // Build params object, filtering out undefined/null values
    const params: Record<string, string | number | boolean> = {};

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params[key] = value;
        }
      });
    }

    const response = await api.get('/events', { params });
    return response.data;
  },

  // Get event by ID
  async getEventById(id: string): Promise<Event> {
    const response = await api.get(`/events/${id}`);
    return response.data;
  },

  // Create new event
  async createEvent(eventData: CreateEventData): Promise<Event> {
    const response = await api.post('/events', eventData);
    return response.data;
  },

  // Update event
  async updateEvent(id: string, eventData: Partial<CreateEventData>): Promise<Event> {
    const response = await api.put(`/events/${id}`, eventData);
    return response.data;
  },

  // Delete event
  async deleteEvent(id: string): Promise<void> {
    await api.delete(`/events/${id}`);
  },

  // Get events by current user (creator)
  async getMyEvents(filters?: EventFilters): Promise<EventsResponse> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    
    const response = await api.get(`/events/creator/my-events?${params.toString()}`);
    return response.data;
  },

  // Update event status
  async updateEventStatus(id: string, status: 'draft' | 'published' | 'cancelled' | 'completed'): Promise<Event> {
    const response = await api.patch(`/events/${id}/status`, { status });
    return response.data;
  },

  // Get ticket types for an event
  async getTicketTypesForEvent(eventId: string): Promise<TicketType[]> {
    const response = await api.get(`/events/${eventId}/ticket-types`);
    return response.data;
  },

  // Upload event image
  async uploadEventImage(eventId: string, imageFile: File): Promise<{ success: boolean; filename?: string; url?: string; error?: string }> {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    try {
      const response = await api.post(`/events/${eventId}/upload-image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to upload image',
      };
    }
  },
};