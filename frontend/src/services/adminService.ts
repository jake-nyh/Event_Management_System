import api from './api';

export interface CommissionSettings {
  eventCreatorPercentage: number;
  platformPercentage: number;
  minCommission: number;
  maxCommission: number;
}

export interface SubscriptionTier {
  id: string;
  name: string;
  price: number;
  duration: number;
  features: string[];
  maxEvents: number;
  maxTicketsPerEvent: number;
  commissionRate: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSubscription {
  id: string;
  creatorId: string;
  tierName: string;
  monthlyFee: string;
  startDate: string;
  endDate?: string;
  status: 'active' | 'expired' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'event_creator' | 'customer' | 'website_owner';
  createdAt: Date;
  updatedAt: Date;
}

export interface UsersResponse {
  users: User[];
  total: number;
  page: number;
  totalPages: number;
}

export interface DashboardAnalytics {
  totalUsers: number;
  totalEvents: number;
  totalRevenue: number;
  activeEvents: number;
  commissionEarned: number;
}

export interface SalesAnalytics {
  sales: Array<{
    date: string;
    totalSales: number;
    transactionCount: number;
  }>;
  totalRevenue: number;
  totalTransactions: number;
}

export interface CommissionAnalytics {
  totalCommission: number;
  totalRevenue: number;
  totalTransactions: number;
  averageCommissionPerTransaction: number;
}

export const adminService = {
  // Commission Management
  async getCommissionSettings(): Promise<CommissionSettings> {
    const response = await api.get('/admin/commissions');
    return response.data.data;
  },

  async updateCommissionSettings(settings: CommissionSettings): Promise<CommissionSettings> {
    const response = await api.put('/admin/commissions', settings);
    return response.data.data;
  },

  // Subscription Management
  async getSubscriptionTiers(): Promise<SubscriptionTier[]> {
    const response = await api.get('/admin/subscriptions');
    return response.data.data;
  },

  async createSubscriptionTier(tier: Omit<SubscriptionTier, 'id' | 'isActive' | 'createdAt' | 'updatedAt'>): Promise<SubscriptionTier> {
    const response = await api.post('/admin/subscriptions', tier);
    return response.data.data;
  },

  async updateSubscriptionTier(id: string, tier: Partial<SubscriptionTier>): Promise<SubscriptionTier> {
    const response = await api.put(`/admin/subscriptions/${id}`, tier);
    return response.data.data;
  },

  async deleteSubscriptionTier(id: string): Promise<boolean> {
    const response = await api.delete(`/admin/subscriptions/${id}`);
    return response.data.success;
  },

  // User Subscription Management
  async getUserSubscription(): Promise<UserSubscription | null> {
    const response = await api.get('/admin/subscriptions/my-subscription');
    return response.data.data;
  },

  async subscribeUser(tierId: string): Promise<UserSubscription> {
    const response = await api.post('/admin/subscriptions/subscribe', { tierId });
    return response.data.data;
  },

  async cancelUserSubscription(): Promise<boolean> {
    const response = await api.post('/admin/subscriptions/cancel');
    return response.data.success;
  },

  // User Management
  async getUsers(page?: number, limit?: number, search?: string): Promise<UsersResponse> {
    const params = new URLSearchParams();
    if (page) params.append('page', page.toString());
    if (limit) params.append('limit', limit.toString());
    if (search) params.append('search', search);

    const response = await api.get(`/admin/users?${params.toString()}`);
    return response.data.data;
  },

  async updateUserStatus(userId: string, isActive: boolean): Promise<boolean> {
    const response = await api.put(`/admin/users/${userId}/status`, { isActive });
    return response.data.success;
  },

  async deleteUser(userId: string): Promise<boolean> {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data.success;
  },

  // Analytics
  async getDashboardAnalytics(): Promise<DashboardAnalytics> {
    const response = await api.get('/analytics/dashboard');
    return response.data.data;
  },

  async getEventAnalytics(eventId: string): Promise<any> {
    const response = await api.get(`/analytics/events/${eventId}`);
    return response.data.data;
  },

  async getSalesAnalytics(): Promise<SalesAnalytics> {
    const response = await api.get('/analytics/sales');
    return response.data.data;
  },

  async getCommissionAnalytics(): Promise<CommissionAnalytics> {
    const response = await api.get('/analytics/commissions');
    return response.data.data;
  },
};