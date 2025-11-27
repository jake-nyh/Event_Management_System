import api from './api';

export interface TicketItem {
  ticketTypeId: string;
  quantity: number;
}

export interface CreatePaymentIntentData {
  eventId: string;
  ticketItems: TicketItem[];
  customerEmail?: string;
}

export interface PaymentIntent {
  clientSecret: string;
  paymentIntentId: string;
}

export interface ConfirmPaymentData {
  paymentIntentId: string;
  paymentMethodId?: string;
}

export interface Transaction {
  id: string;
  customerId: string;
  eventId: string;
  totalAmount: string;
  commissionAmount: string;
  creatorAmount: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  stripePaymentIntentId?: string;
  createdAt: string;
  updatedAt: string;
}

export const paymentService = {
  // Create payment intent
  async createPaymentIntent(data: CreatePaymentIntentData): Promise<PaymentIntent> {
    const response = await api.post('/payments/create-intent', data);
    return response.data.data;
  },

  // Confirm payment
  async confirmPayment(data: ConfirmPaymentData): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    const response = await api.post('/payments/confirm', data);
    return response.data;
  },

  // Get payment details
  async getPaymentDetails(paymentIntentId: string): Promise<any> {
    const response = await api.get(`/payments/${paymentIntentId}`);
    return response.data.data;
  },

  // Get transaction details
  async getTransaction(transactionId: string): Promise<Transaction> {
    const response = await api.get(`/payments/transaction/${transactionId}`);
    return response.data.data;
  },

  // Refund payment
  async refundPayment(transactionId: string): Promise<{ success: boolean; error?: string }> {
    const response = await api.post(`/payments/refund/${transactionId}`);
    return response.data;
  },

  // Get customer transactions
  async getCustomerTransactions(customerId: string): Promise<Transaction[]> {
    const response = await api.get(`/payments/customer/${customerId}`);
    return response.data.data;
  },

  // Get event transactions
  async getEventTransactions(eventId: string): Promise<Transaction[]> {
    const response = await api.get(`/payments/event/${eventId}`);
    return response.data.data;
  },
};