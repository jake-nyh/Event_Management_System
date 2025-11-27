import { db } from '../database/connection';
import { events, ticketTypes as ticketTypesTable, users, tickets } from '../database/schema';
import { eq, and, desc, asc, like, or, gte, lte, count, sql } from 'drizzle-orm';
import { NewEvent, Event, NewTicketType, TicketType } from '../database/schema';

export interface CreateEventData extends Omit<NewEvent, 'creatorId'> {
  ticketTypes?: NewTicketType[];
}

export interface UpdateEventData extends Partial<Omit<Event, 'id' | 'creatorId' | 'createdAt'>> {
  ticketTypes?: NewTicketType[];
}

export interface EventFilters {
  search?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  status?: 'draft' | 'published' | 'cancelled' | 'completed';
  creatorId?: string;
  category?: string;
  tags?: string;
  isFeatured?: boolean;
  sortBy?: 'title' | 'date' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export class EventService {
  // Create a new event with optional ticket types
  async createEvent(creatorId: string, eventData: CreateEventData): Promise<Event> {
    const { ticketTypes, ...eventDataWithoutTicketTypes } = eventData;
    
    // Start a transaction
    const result = await db.transaction(async (tx) => {
      // Create the event
      const [newEvent] = await tx.insert(events).values({
        ...eventDataWithoutTicketTypes,
        creatorId,
      }).returning();
      
      // Create ticket types if provided
      if (ticketTypes && ticketTypes.length > 0) {
        for (const ticketTypeData of ticketTypes) {
          await tx.insert(ticketTypesTable).values({
            ...ticketTypeData,
            eventId: newEvent.id,
          });
        }
      }
      
      return newEvent;
    });
    
    return result;
  }

  // Get all events with optional filtering
  async getEvents(filters: EventFilters = {}): Promise<{ events: Event[], total: number }> {
    const {
      search,
      location,
      startDate,
      endDate,
      status,
      creatorId,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10,
    } = filters;

    // Build the where conditions
    const conditions = [];
    
    if (status) {
      conditions.push(eq(events.status, status));
    }
    
    if (creatorId) {
      conditions.push(eq(events.creatorId, creatorId));
    }
    
    if (startDate) {
      conditions.push(gte(events.eventDate, startDate));
    }
    
    if (endDate) {
      conditions.push(lte(events.eventDate, endDate));
    }
    
    if (search) {
      conditions.push(
        or(
          like(events.title, `%${search}%`),
          like(events.description, `%${search}%`),
          like(events.location, `%${search}%`),
          like(events.tags, `%${search}%`)
        )
      );
    }
    
    if (location) {
      conditions.push(like(events.location, `%${location}%`));
    }
    
    // TODO: Add category, tags, and isFeatured filters after TypeScript issues are resolved
    
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    
    // Build the order by clause
    let orderBy;
    switch (sortBy) {
      case 'title':
        orderBy = sortOrder === 'asc' ? asc(events.title) : desc(events.title);
        break;
      case 'date':
        orderBy = sortOrder === 'asc' ? asc(events.eventDate) : desc(events.eventDate);
        break;
      case 'createdAt':
      default:
        orderBy = sortOrder === 'asc' ? asc(events.createdAt) : desc(events.createdAt);
        break;
    }
    
    // Get total count
    const countResult = await db
      .select({ count: count() })
      .from(events)
      .where(whereClause);

    const total = Number(countResult[0]?.count || 0);
    
    // Get events with pagination
    const offset = (page - 1) * limit;
    const eventList = await db
      .select()
      .from(events)
      .where(whereClause)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);
    
    return { events: eventList, total };
  }

  // Get event by ID with creator information
  async getEventById(id: string): Promise<Event & { creator?: { firstName: string; lastName: string; email: string } } | null> {
    const event = await db
      .select({
        id: events.id,
        creatorId: events.creatorId,
        title: events.title,
        description: events.description,
        location: events.location,
        eventDate: events.eventDate,
        eventTime: events.eventTime,
        imageUrl: events.imageUrl,
        commissionRate: events.commissionRate,
        status: events.status,
        category: events.category,
        tags: events.tags,
        isFeatured: events.isFeatured,
        createdAt: events.createdAt,
        updatedAt: events.updatedAt,
        creator: {
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
        },
      })
      .from(events)
      .leftJoin(users, eq(events.creatorId, users.id))
      .where(eq(events.id, id))
      .limit(1);
    
    const eventData = event[0];
    if (!eventData) return null;
    
    return {
      ...eventData,
      creator: eventData.creator || undefined,
    };
  }

  // Update an event
  async updateEvent(id: string, creatorId: string, eventData: UpdateEventData): Promise<Event | null> {
    const { ticketTypes, ...eventDataWithoutTicketTypes } = eventData;
    
    const result = await db.transaction(async (tx) => {
      // Update the event
      const [updatedEvent] = await tx
        .update(events)
        .set({
          ...eventDataWithoutTicketTypes,
          updatedAt: new Date(),
        })
        .where(and(eq(events.id, id), eq(events.creatorId, creatorId)))
        .returning();
      
      // Update ticket types if provided
      if (ticketTypes && ticketTypes.length > 0) {
        // Delete existing ticket types
        await tx.delete(ticketTypesTable).where(eq(ticketTypesTable.eventId, id));
        
        // Insert new ticket types
        for (const ticketTypeData of ticketTypes) {
          await tx.insert(ticketTypesTable).values({
            ...ticketTypeData,
            eventId: id,
          });
        }
      }
      
      return updatedEvent;
    });
    
    return result || null;
  }

  // Delete an event
  async deleteEvent(id: string, creatorId: string): Promise<boolean> {
    const result = await db
      .delete(events)
      .where(and(eq(events.id, id), eq(events.creatorId, creatorId)))
      .returning({ id: events.id });
    
    return result.length > 0;
  }

  // Get events by creator
  async getEventsByCreator(creatorId: string, filters: Omit<EventFilters, 'creatorId'> = {}): Promise<{ events: Event[], total: number }> {
    return this.getEvents({ ...filters, creatorId });
  }

  // Get ticket types for an event
  async getTicketTypesForEvent(eventId: string): Promise<TicketType[]> {
    return await db
      .select()
      .from(ticketTypesTable)
      .where(eq(ticketTypesTable.eventId, eventId));
  }

  // Get sold tickets for an event
  async getSoldTicketsForEvent(eventId: string): Promise<any[]> {
    return await db
      .select({
        // Ticket fields
        id: tickets.id,
        qrCode: tickets.qrCode,
        status: tickets.status,
        purchasedAt: tickets.purchasedAt,
        updatedAt: tickets.updatedAt,
        // Ticket type fields
        ticketType: {
          id: ticketTypesTable.id,
          name: ticketTypesTable.name,
          price: ticketTypesTable.price,
        },
        // Customer fields
        customer: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
        },
        // Event fields
        event: {
          id: events.id,
          title: events.title,
          eventDate: events.eventDate,
          eventTime: events.eventTime,
          location: events.location,
        },
      })
      .from(tickets)
      .leftJoin(ticketTypesTable, eq(tickets.ticketTypeId, ticketTypesTable.id))
      .leftJoin(users, eq(tickets.customerId, users.id))
      .leftJoin(events, eq(ticketTypesTable.eventId, events.id))
      .where(eq(events.id, eventId))
      .orderBy(desc(tickets.purchasedAt));
  }

  // Update event status
  async updateEventStatus(id: string, creatorId: string, status: 'draft' | 'published' | 'cancelled' | 'completed'): Promise<Event | null> {
    const [updatedEvent] = await db
      .update(events)
      .set({ 
        status, 
        updatedAt: new Date() 
      })
      .where(and(eq(events.id, id), eq(events.creatorId, creatorId)))
      .returning();
    
    return updatedEvent || null;
  }
}

export const eventService = new EventService();

// Upload event image
export const uploadEventImage = async (file: Express.Multer.File, eventId: string, userId: string): Promise<{ success: boolean; filename?: string; url?: string; error?: string }> => {
  const { uploadService } = await import('./uploadService');
  
  try {
    // Create a File object from the Express.Multer.File buffer
    const fileBlob = new Blob([file.buffer], { type: file.mimetype });
    const fileObject = new File([fileBlob], file.originalname, { type: file.mimetype });
    
    const uploadResult = await uploadService.uploadEventImage(fileObject, eventId);
    
    if (!uploadResult.success || !uploadResult.url) {
      return uploadResult;
    }
    
    // Update the event with the image URL
    await db.update(events)
      .set({ imageUrl: uploadResult.url })
      .where(and(eq(events.id, eventId), eq(events.creatorId, userId)));
    
    return uploadResult;
  } catch (error) {
    console.error('Error uploading event image:', error);
    return {
      success: false,
      error: 'Failed to upload image',
    };
  }
};