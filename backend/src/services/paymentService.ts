import { db } from '../database/connection';
import { tickets, transactions, ticketTypes, events, users } from '../database/schema';
import { eq, and } from 'drizzle-orm';
import { NewTransaction, NewTicket, NewUser } from '../database/schema';
import { v4 as uuidv4 } from 'uuid';
import { emailService, TicketPurchaseEmailData } from './emailService';

export interface CreatePaymentIntentData {
  eventId: string;
  ticketItems: Array<{
    ticketTypeId: string;
    quantity: number;
  }>;
  customerEmail: string;
}

export interface ConfirmPaymentData {
  paymentIntentId: string;
  paymentMethodId?: string;
}

export interface MockPaymentIntent {
  id: string;
  clientSecret: string;
  amount: number;
  currency: string;
  status: 'requires_payment_method' | 'succeeded' | 'canceled';
  metadata: {
    eventId: string;
    customerEmail: string;
    ticketItems: string; // JSON string
  };
}

export class PaymentService {
  // Mock payment intents storage (in production, this would be in Stripe)
  private mockPaymentIntents = new Map<string, MockPaymentIntent>();

  // Create a mock payment intent
  async createPaymentIntent(data: CreatePaymentIntentData): Promise<{ clientSecret: string; paymentIntentId: string }> {
    const { eventId, ticketItems, customerEmail } = data;
    
    // Calculate total amount
    let totalAmount = 0;
    for (const item of ticketItems) {
      const ticketType = await db
        .select()
        .from(ticketTypes)
        .where(eq(ticketTypes.id, item.ticketTypeId))
        .limit(1);
      
      if (ticketType.length === 0) {
        throw new Error(`Ticket type ${item.ticketTypeId} not found`);
      }
      
      if (ticketType[0].quantityAvailable < item.quantity) {
        throw new Error(`Not enough tickets available for ${ticketType[0].name}`);
      }
      
      totalAmount += parseFloat(ticketType[0].price.toString()) * item.quantity;
    }
    
    // Convert to cents (Stripe format)
    const amountInCents = Math.round(totalAmount * 100);
    
    // Create mock payment intent
    const paymentIntentId = `pi_mock_${uuidv4()}`;
    const clientSecret = `pi_mock_${uuidv4()}_secret_${uuidv4()}`;
    
    const mockPaymentIntent: MockPaymentIntent = {
      id: paymentIntentId,
      clientSecret,
      amount: amountInCents,
      currency: 'usd',
      status: 'requires_payment_method',
      metadata: {
        eventId,
        customerEmail,
        ticketItems: JSON.stringify(ticketItems),
      },
    };
    
    this.mockPaymentIntents.set(paymentIntentId, mockPaymentIntent);
    
    return {
      clientSecret,
      paymentIntentId,
    };
  }

  // Confirm mock payment
  async confirmPayment(data: ConfirmPaymentData): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    const { paymentIntentId } = data;
    
    const paymentIntent = this.mockPaymentIntents.get(paymentIntentId);
    if (!paymentIntent) {
      return { success: false, error: 'Payment intent not found' };
    }
    
    if (paymentIntent.status !== 'requires_payment_method') {
      return { success: false, error: 'Payment intent cannot be confirmed' };
    }
    
    try {
      // Parse metadata
      const { eventId, customerEmail, ticketItems } = paymentIntent.metadata;
      const ticketItemsParsed = JSON.parse(ticketItems);
      
      // Get event details for commission calculation
      const [event] = await db
        .select()
        .from(events)
        .where(eq(events.id, eventId));
      
      if (!event) {
        return { success: false, error: 'Event not found' };
      }
      
      // Create transaction record
      const commissionRate = parseFloat(event.commissionRate?.toString() || '5.00');
      const totalAmount = paymentIntent.amount / 100; // Convert back to dollars
      const commissionAmount = totalAmount * (commissionRate / 100);
      const creatorAmount = totalAmount - commissionAmount;
      
      // For demo purposes, we'll use a mock customer ID
      // In a real app, this would come from authenticated user
      const mockCustomerId = 'mock_customer_' + uuidv4();
      
      // First, check if we need to create a customer record
      // For demo purposes, we'll skip the foreign key constraint check by using a valid UUID format
      // that matches an existing user or creating a minimal user record
      let customerId = mockCustomerId;
      
      // Try to find an existing customer with this email
      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.email, customerEmail))
        .limit(1);
      
      if (existingUser) {
        customerId = existingUser.id;
        console.log('Found existing user with ID:', customerId);
      } else {
        // Create a minimal customer record for demo purposes
        // In a real app, this should not be done here - users should register first
        const [newUser] = await db
          .insert(users)
          .values({
            id: mockCustomerId,
            email: customerEmail,
            passwordHash: 'demo_password_hash', // In a real app, this would be properly hashed
            firstName: 'Demo',
            lastName: 'User',
            role: 'customer',
          } as NewUser)
          .returning();
        customerId = newUser.id;
        console.log('Created new user with ID:', customerId);
      }
      
      console.log('Final customerId to be used:', customerId);
      
      const [transaction] = await db
        .insert(transactions)
        .values({
          id: uuidv4(),
          eventId,
          customerId,
          totalAmount: totalAmount.toString(),
          commissionAmount: commissionAmount.toString(),
          creatorAmount: creatorAmount.toString(),
          status: 'completed',
          stripePaymentIntentId: paymentIntentId,
        } as NewTransaction)
        .returning();
      
      // Create ticket records
      for (const item of ticketItemsParsed) {
        // Update ticket type quantity
        const [ticketType] = await db
          .select()
          .from(ticketTypes)
          .where(eq(ticketTypes.id, item.ticketTypeId))
          .limit(1);
        
        if (ticketType.quantityAvailable < item.quantity) {
          throw new Error(`Not enough tickets available for ${ticketType.name}`);
        }
        
        await db
          .update(ticketTypes)
          .set({
            quantityAvailable: ticketType.quantityAvailable - item.quantity,
            quantitySold: (ticketType.quantitySold || 0) + item.quantity,
          })
          .where(eq(ticketTypes.id, item.ticketTypeId));
        
        // Create individual ticket records
        for (let i = 0; i < item.quantity; i++) {
          await db.insert(tickets).values({
            id: uuidv4(),
            ticketTypeId: item.ticketTypeId,
            customerId: customerId, // Use the actual customer ID, not the mock one
            transactionId: transaction.id,
            qrCode: `QR_${uuidv4()}`, // Mock QR code
            status: 'active',
          } as NewTicket);
        }
      }
      
      // Update payment intent status
      paymentIntent.status = 'succeeded';
      this.mockPaymentIntents.set(paymentIntentId, paymentIntent);
      
      // Send ticket purchase confirmation email
      try {
        // Get event details for email
        const [event] = await db
          .select()
          .from(events)
          .where(eq(events.id, eventId));
        
        if (event) {
          // Get ticket details for email
          const ticketDetails = [];
          for (const item of ticketItemsParsed) {
            const [ticketType] = await db
              .select()
              .from(ticketTypes)
              .where(eq(ticketTypes.id, item.ticketTypeId))
              .limit(1);
            
            if (ticketType) {
              ticketDetails.push({
                ticketTypeName: ticketType.name,
                quantity: item.quantity,
                price: parseFloat(ticketType.price.toString())
              });
            }
          }
          
          const emailData: TicketPurchaseEmailData = {
            customerName: 'Customer', // Would need to get from user table
            customerEmail,
            eventTitle: event.title,
            eventDate: event.eventDate.toString(),
            eventTime: event.eventTime,
            eventLocation: event.location,
            tickets: ticketDetails,
            totalAmount: totalAmount,
            transactionId: transaction.id
          };
          
          await emailService.sendTicketPurchaseConfirmation(emailData);
        }
      } catch (emailError) {
        console.error('Error sending ticket purchase email:', emailError);
        // Don't fail the transaction if email fails
      }
      
      return {
        success: true,
        transactionId: transaction.id,
      };
    } catch (error) {
      console.error('Error confirming payment:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment confirmation failed',
      };
    }
  }

  // Get payment details
  async getPaymentDetails(paymentIntentId: string): Promise<MockPaymentIntent | null> {
    return this.mockPaymentIntents.get(paymentIntentId) || null;
  }

  // Mock refund (for demo purposes)
  async refundPayment(transactionId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Update transaction status
      await db
        .update(transactions)
        .set({ status: 'refunded' })
        .where(eq(transactions.id, transactionId));
      
      // Update associated tickets
      await db
        .update(tickets)
        .set({ status: 'refunded' })
        .where(eq(tickets.transactionId, transactionId));
      
      return { success: true };
    } catch (error) {
      console.error('Error refunding payment:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Refund failed',
      };
    }
  }

  // Get transaction by ID
  async getTransaction(transactionId: string) {
    const [transaction] = await db
      .select()
      .from(transactions)
      .where(eq(transactions.id, transactionId))
      .limit(1);
    
    return transaction || null;
  }

  // Get transactions for a customer
  async getCustomerTransactions(customerId: string) {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.customerId, customerId));
  }

  // Get transactions for an event
  async getEventTransactions(eventId: string) {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.eventId, eventId));
  }
}

export const paymentService = new PaymentService();