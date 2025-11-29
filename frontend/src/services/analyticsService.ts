import api from './api';

export interface DashboardAnalytics {
  totalUsers: number;
  totalEvents: number;
  totalRevenue: number;
  commissionEarned: number;
  activeEvents: number;
  totalTicketsSold: number;
  recentTransactions: any[];
  userGrowth: any[];
  revenueGrowth: any[];
}

export interface EventAnalytics {
  eventId: string;
  totalTicketsSold: number;
  totalRevenue: number;
  ticketsByType: any[];
  salesOverTime: any[];
  attendeeDemographics: any;
  conversionRate: number;
}

export interface SalesAnalytics {
  totalRevenue: number;
  totalTransactions: number;
  averageTicketPrice: number;
  revenueByEvent: any[];
  revenueByMonth: any[];
  topSellingEvents: any[];
}

export interface CommissionAnalytics {
  totalCommission: number;
  commissionByEvent: any[];
  commissionByMonth: any[];
  averageCommissionRate: number;
  projectedMonthlyCommission: number;
}

export interface CreatorAnalytics {
  events: any[];
  metrics: {
    totalRevenue: number;
    totalTicketsSold: number;
    totalEvents: number;
    activeEvents: number;
  };
  recentTransactions: any[];
}

class AnalyticsService {
  // Get dashboard analytics
  async getDashboardAnalytics(startDate?: string, endDate?: string): Promise<DashboardAnalytics> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await api.get(`/analytics/dashboard?${params.toString()}`);
    return response.data.data || response.data;
  }

  // Get event analytics
  async getEventAnalytics(eventId: string): Promise<EventAnalytics> {
    const response = await api.get(`/analytics/events/${eventId}`);
    return response.data.data || response.data;
  }

  // Get sales analytics
  async getSalesAnalytics(startDate?: string, endDate?: string): Promise<SalesAnalytics> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await api.get(`/analytics/sales?${params.toString()}`);
    return response.data.data || response.data;
  }

  // Get commission analytics
  async getCommissionAnalytics(startDate?: string, endDate?: string): Promise<CommissionAnalytics> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await api.get(`/analytics/commissions?${params.toString()}`);
    return response.data.data || response.data;
  }

  // Get creator analytics
  async getCreatorAnalytics(): Promise<CreatorAnalytics> {
    const response = await api.get('/analytics/creator');
    return response.data.data || response.data;
  }
}

export const analyticsService = new AnalyticsService();