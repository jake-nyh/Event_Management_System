import { db } from '../database/connection';
import { ticketTypes, tickets, events } from '../database/schema';
import { eq, and, sql } from 'drizzle-orm';
import { NewTicketType, TicketType } from '../database/schema';

export class TicketService {
  // Create a new ticket type for an event
  static async createTicketType(data: NewTicketType): Promise<TicketType> {
    const [ticketType] = await db.insert(ticketTypes).values(data).returning();
    return ticketType;
  }

  // Get all ticket types for an event
  static async getTicketTypesByEvent(eventId: string): Promise<TicketType[]> {
    return await db.select().from(ticketTypes).where(eq(ticketTypes.eventId, eventId));
  }

  // Get a specific ticket type by ID
  static async getTicketTypeById(id: string): Promise<TicketType | null> {
    const [ticketType] = await db.select().from(ticketTypes).where(eq(ticketTypes.id, id));
    return ticketType || null;
  }

  // Update a ticket type
  static async updateTicketType(id: string, data: Partial<NewTicketType>): Promise<TicketType | null> {
    const [ticketType] = await db
      .update(ticketTypes)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(ticketTypes.id, id))
      .returning();
    return ticketType || null;
  }

  // Delete a ticket type
  static async deleteTicketType(id: string): Promise<boolean> {
    const result = await db.delete(ticketTypes).where(eq(ticketTypes.id, id));
    return result.length > 0;
  }

  // Check if a ticket type has available tickets
  static async checkAvailability(ticketTypeId: string): Promise<boolean> {
    const [ticketType] = await db
      .select()
      .from(ticketTypes)
      .where(eq(ticketTypes.id, ticketTypeId));
    
    if (!ticketType) return false;
    
    return (ticketType.quantitySold || 0) < ticketType.quantityAvailable;
  }

  // Get available ticket count for a ticket type
  static async getAvailableCount(ticketTypeId: string): Promise<number> {
    const [ticketType] = await db
      .select()
      .from(ticketTypes)
      .where(eq(ticketTypes.id, ticketTypeId));
    
    if (!ticketType) return 0;
    
    return Math.max(0, ticketType.quantityAvailable - (ticketType.quantitySold || 0));
  }

  // Update sold count for a ticket type
  static async incrementSoldCount(ticketTypeId: string, quantity: number = 1): Promise<boolean> {
    const [ticketType] = await db
      .update(ticketTypes)
      .set({
        quantitySold: sql`${ticketTypes.quantitySold} + ${quantity}`,
        updatedAt: new Date()
      })
      .where(and(
        eq(ticketTypes.id, ticketTypeId),
        // Ensure we don't sell more than available
        sql`${ticketTypes.quantitySold} + ${quantity} <= ${ticketTypes.quantityAvailable}`
      ))
      .returning();
    
    return !!ticketType;
  }

  // Decrement sold count for a ticket type (for refunds)
  static async decrementSoldCount(ticketTypeId: string, quantity: number = 1): Promise<boolean> {
    const [ticketType] = await db
      .update(ticketTypes)
      .set({
        quantitySold: sql`GREATEST(${ticketTypes.quantitySold} - ${quantity}, 0)`,
        updatedAt: new Date()
      })
      .where(eq(ticketTypes.id, ticketTypeId))
      .returning();
    
    return !!ticketType;
  }

  // Get ticket types with availability info for an event
  static async getTicketTypesWithAvailability(eventId: string) {
    return await db
      .select({
        id: ticketTypes.id,
        name: ticketTypes.name,
        price: ticketTypes.price,
        quantityAvailable: ticketTypes.quantityAvailable,
        quantitySold: ticketTypes.quantitySold,
        available: sql`${ticketTypes.quantityAvailable} - ${ticketTypes.quantitySold}`,
        eventId: ticketTypes.eventId,
        createdAt: ticketTypes.createdAt,
        updatedAt: ticketTypes.updatedAt
      })
      .from(ticketTypes)
      .where(eq(ticketTypes.eventId, eventId));
  }
}