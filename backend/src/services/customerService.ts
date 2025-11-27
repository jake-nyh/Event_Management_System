import { db } from '../database/connection';
import { tickets, ticketTypes, events, users, transactions } from '../database/schema';
import { eq, and, desc } from 'drizzle-orm';

export interface CustomerTicket {
  id: string;
  ticketTypeId: string;
  customerId: string;
  transactionId: string | null;
  qrCode: string | null;
  status: 'active' | 'used' | 'transferred' | 'refunded' | null;
  purchasedAt: Date | null;
  updatedAt: Date | null;
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
    createdAt: Date | null;
  } | null;
  customer?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export class CustomerService {
  // Get all tickets for a customer
  async getCustomerTickets(customerId: string): Promise<CustomerTicket[]> {
    const customerTickets = await db
      .select({
        id: tickets.id,
        ticketTypeId: tickets.ticketTypeId,
        customerId: tickets.customerId,
        transactionId: tickets.transactionId,
        qrCode: tickets.qrCode,
        status: tickets.status,
        purchasedAt: tickets.purchasedAt,
        updatedAt: tickets.updatedAt,
        ticketType: {
          id: ticketTypes.id,
          name: ticketTypes.name,
          price: ticketTypes.price,
          eventId: ticketTypes.eventId,
        },
        transaction: {
          id: transactions.id,
          totalAmount: transactions.totalAmount,
          status: transactions.status,
          createdAt: transactions.createdAt,
        },
      })
      .from(tickets)
      .leftJoin(ticketTypes, eq(tickets.ticketTypeId, ticketTypes.id))
      .leftJoin(transactions, eq(tickets.transactionId, transactions.id))
      .where(eq(tickets.customerId, customerId))
      .orderBy(desc(tickets.purchasedAt));

    // Get event details for each ticket
    const ticketsWithEvents = await Promise.all(
      customerTickets.map(async (ticket) => {
        if (ticket.ticketType?.eventId) {
          const [event] = await db
            .select()
            .from(events)
            .where(eq(events.id, ticket.ticketType.eventId))
            .limit(1);
          
          return {
            ...ticket,
            ticketType: ticket.ticketType ? {
              ...ticket.ticketType,
              event: event || undefined,
            } : null,
          } as CustomerTicket;
        }
        return ticket;
      })
    );

    return ticketsWithEvents;
  }

  // Get a specific ticket by ID (with ownership check)
  async getTicketById(ticketId: string, customerId?: string): Promise<CustomerTicket | null> {
    const [ticket] = await db
      .select({
        id: tickets.id,
        ticketTypeId: tickets.ticketTypeId,
        customerId: tickets.customerId,
        transactionId: tickets.transactionId,
        qrCode: tickets.qrCode,
        status: tickets.status,
        purchasedAt: tickets.purchasedAt,
        updatedAt: tickets.updatedAt,
        ticketType: {
          id: ticketTypes.id,
          name: ticketTypes.name,
          price: ticketTypes.price,
          eventId: ticketTypes.eventId,
        },
        transaction: {
          id: transactions.id,
          totalAmount: transactions.totalAmount,
          status: transactions.status,
          createdAt: transactions.createdAt,
        },
      })
      .from(tickets)
      .leftJoin(ticketTypes, eq(tickets.ticketTypeId, ticketTypes.id))
      .leftJoin(transactions, eq(tickets.transactionId, transactions.id))
      .where(eq(tickets.id, ticketId))
      .limit(1);

    if (!ticket) return null;

    // Check ownership if customerId is provided
    if (customerId && ticket.customerId !== customerId) {
      return null;
    }

    // Get event details
    if (ticket.ticketType?.eventId) {
      const [event] = await db
        .select()
        .from(events)
        .where(eq(events.id, ticket.ticketType.eventId))
        .limit(1);
      
      return {
        ...ticket,
        ticketType: ticket.ticketType ? {
          ...ticket.ticketType,
          event: event || undefined,
        } : null,
      } as CustomerTicket;
    }

    return ticket;
  }

  // Update ticket status (for marking as used, transferred, etc.)
  async updateTicketStatus(ticketId: string, customerId: string, status: 'active' | 'used' | 'transferred' | 'refunded'): Promise<CustomerTicket | null> {
    // First check if the ticket exists and belongs to the customer
    const existingTicket = await this.getTicketById(ticketId, customerId);
    if (!existingTicket) {
      return null;
    }

    // Update the ticket status
    const [updatedTicket] = await db
      .update(tickets)
      .set({ 
        status, 
        updatedAt: new Date() 
      })
      .where(and(eq(tickets.id, ticketId), eq(tickets.customerId, customerId)))
      .returning();

    if (!updatedTicket) return null;

    // Return the updated ticket with full details
    return this.getTicketById(ticketId, customerId);
  }

  // Mark ticket as used (for event check-in)
  async markTicketAsUsed(ticketId: string): Promise<{ success: boolean; ticket?: CustomerTicket; error?: string }> {
    try {
      const [ticket] = await db
        .select()
        .from(tickets)
        .where(eq(tickets.id, ticketId))
        .limit(1);

      if (!ticket) {
        return { success: false, error: 'Ticket not found' };
      }

      if (ticket.status !== 'active') {
        return { success: false, error: `Ticket is already ${ticket.status}` };
      }

      const [updatedTicket] = await db
        .update(tickets)
        .set({ 
          status: 'used', 
          updatedAt: new Date() 
        })
        .where(eq(tickets.id, ticketId))
        .returning();

      if (!updatedTicket) {
        return { success: false, error: 'Failed to update ticket' };
      }

      const fullTicket = await this.getTicketById(ticketId);
      return { success: true, ticket: fullTicket || undefined };
    } catch (error) {
      console.error('Error marking ticket as used:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to mark ticket as used' 
      };
    }
  }

  // Get tickets for an event (for event organizers)
  async getEventTickets(eventId: string): Promise<CustomerTicket[]> {
    const eventTickets = await db
      .select({
        id: tickets.id,
        ticketTypeId: tickets.ticketTypeId,
        customerId: tickets.customerId,
        transactionId: tickets.transactionId,
        qrCode: tickets.qrCode,
        status: tickets.status,
        purchasedAt: tickets.purchasedAt,
        updatedAt: tickets.updatedAt,
        ticketType: {
          id: ticketTypes.id,
          name: ticketTypes.name,
          price: ticketTypes.price,
          eventId: ticketTypes.eventId,
        },
        transaction: {
          id: transactions.id,
          totalAmount: transactions.totalAmount,
          status: transactions.status,
          createdAt: transactions.createdAt,
        },
      })
      .from(tickets)
      .leftJoin(ticketTypes, eq(tickets.ticketTypeId, ticketTypes.id))
      .leftJoin(transactions, eq(tickets.transactionId, transactions.id))
      .where(eq(ticketTypes.eventId, eventId))
      .orderBy(desc(tickets.purchasedAt));

    // Get customer and event details
    const ticketsWithDetails = await Promise.all(
      eventTickets.map(async (ticket) => {
        const [customer] = await db
          .select({
            id: users.id,
            firstName: users.firstName,
            lastName: users.lastName,
            email: users.email,
          })
          .from(users)
          .where(eq(users.id, ticket.customerId))
          .limit(1);

        const [event] = await db
          .select()
          .from(events)
          .where(eq(events.id, ticket.ticketType?.eventId || ''))
          .limit(1);

        return {
          ...ticket,
          customer: customer || undefined,
          ticketType: ticket.ticketType ? {
            ...ticket.ticketType,
            event: event || undefined,
          } : null,
        } as CustomerTicket;
      })
    );

    return ticketsWithDetails;
  }

  // Get ticket statistics for a customer
  async getCustomerTicketStats(customerId: string): Promise<{
    total: number;
    active: number;
    used: number;
    transferred: number;
    refunded: number;
  }> {
    console.log('Getting stats for customer ID:', customerId);
    
    const stats = await db
      .select({
        total: tickets.id, // We'll count these
        status: tickets.status,
      })
      .from(tickets)
      .where(eq(tickets.customerId, customerId));

    const result = {
      total: stats.length,
      active: stats.filter(t => t.status === 'active').length,
      used: stats.filter(t => t.status === 'used').length,
      transferred: stats.filter(t => t.status === 'transferred').length,
      refunded: stats.filter(t => t.status === 'refunded').length,
    };

    return result;
  }
}

export const customerService = new CustomerService();