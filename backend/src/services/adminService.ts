import { db } from '../database/connection';
import { eq, and, desc, sql } from 'drizzle-orm';
import { 
  users, 
  events, 
  tickets, 
  transactions, 
  subscriptions
} from '../database/schema';

export interface CommissionData {
  eventCreatorPercentage: number;
  platformPercentage: number;
  minCommission: number;
  maxCommission: number;
}

export interface SubscriptionTierData {
  name: string;
  price: number;
  duration: number; // in months
  features: string[];
  maxEvents: number;
  maxTicketsPerEvent: number;
  commissionRate: number;
}

export interface UserSubscriptionData {
  userId: string;
  tierName: string;
  monthlyFee: number;
  startDate: string;
  endDate?: string;
  status: 'active' | 'expired' | 'cancelled';
  autoRenew: boolean;
}

class AdminService {
  // Commission Management (using events.commissionRate as a commission setting)
  async getCommissionSettings(): Promise<{
    eventCreatorPercentage: number;
    platformPercentage: number;
    minCommission: number;
    maxCommission: number;
  }> {
    // Get average commission rate from events as default
    const [avgCommission] = await db
      .select({
        avgRate: sql`AVG(commission_rate)`
      })
      .from(events)
      .where(eq(events.status, 'published'));

    const avgRate = Number(avgCommission?.avgRate || 5);
    
    return {
      eventCreatorPercentage: avgRate,
      platformPercentage: 100 - avgRate,
      minCommission: 0,
      maxCommission: 1000
    };
  }

  async updateCommissionSettings(data: CommissionData): Promise<{
    eventCreatorPercentage: number;
    platformPercentage: number;
    minCommission: number;
    maxCommission: number;
  }> {
    // Update commission rate for all future events
    // This is a simplified approach - in a real system, you'd have a separate commission settings table
    const updatedSettings = {
      eventCreatorPercentage: data.eventCreatorPercentage || 10,
      platformPercentage: data.platformPercentage || 5,
      minCommission: data.minCommission || 0,
      maxCommission: data.maxCommission || 1000
    };

    return updatedSettings;
  }

  // Subscription Management
  async getSubscriptionTiers(): Promise<any[]> {
    // Since we don't have a dedicated subscription tiers table, we'll return default tiers
    return [
      {
        id: 'basic',
        name: 'Basic',
        price: 29.99,
        duration: 1,
        features: ['Create up to 5 events', 'Basic analytics', 'Email support'],
        maxEvents: 5,
        maxTicketsPerEvent: 100,
        commissionRate: 5,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'pro',
        name: 'Professional',
        price: 79.99,
        duration: 1,
        features: ['Create up to 20 events', 'Advanced analytics', 'Priority support', 'Custom branding'],
        maxEvents: 20,
        maxTicketsPerEvent: 500,
        commissionRate: 3,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        price: 199.99,
        duration: 1,
        features: ['Unlimited events', 'White-label solution', 'Dedicated support', 'Custom integrations'],
        maxEvents: -1,
        maxTicketsPerEvent: -1,
        commissionRate: 2,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }

  async createSubscriptionTier(data: SubscriptionTierData): Promise<any> {
    const newTier = {
      id: `tier_${Date.now()}`,
      ...data,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    return newTier;
  }

  async updateSubscriptionTier(id: string, data: Partial<SubscriptionTierData>): Promise<any | null> {
    // This would update subscription tier
    // For now, return the updated data
    const updatedTier = {
      id,
      ...data,
      updatedAt: new Date()
    };
    
    return updatedTier;
  }

  async deleteSubscriptionTier(id: string): Promise<boolean> {
    // This would delete subscription tier
    // For now, just return true
    return true;
  }

  // User Subscription Management
  async getUserSubscription(userId: string): Promise<any | null> {
    const [userSubscription] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.creatorId, userId))
      .orderBy(desc(subscriptions.createdAt))
      .limit(1);
    
    return userSubscription || null;
  }

  async subscribeUser(userId: string, tierData: SubscriptionTierData): Promise<any> {
    const newSubscription = {
      creatorId: userId,
      tierName: tierData.name,
      monthlyFee: tierData.price.toString(),
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + tierData.duration * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'active' as const,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const subscription = await db
      .insert(subscriptions)
      .values(newSubscription)
      .returning();
    
    return subscription;
  }

  async cancelUserSubscription(userId: string): Promise<boolean> {
    const [cancelledSubscription] = await db
      .update(subscriptions)
      .set({
        status: 'cancelled',
        updatedAt: new Date()
      })
      .where(eq(subscriptions.creatorId, userId))
      .returning();
    
    return !!cancelledSubscription;
  }

  // User Management
  async getUsers(page: number = 1, limit: number = 20, search?: string): Promise<{
    users: any[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    let whereCondition = undefined;
    
    if (search) {
      whereCondition = sql`(first_name || ' ' || last_name || ' ' || email) ILIKE ${'%' + search + '%'}`;
    }

    const [totalResult] = await db
      .select({ count: sql`count(*)` })
      .from(users)
      .where(whereCondition || sql`1=1`);
    
    const total = Number(totalResult?.count || 0);
    const totalPages = Math.ceil(total / limit);

    const usersList = await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(whereCondition || sql`1=1`)
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset((page - 1) * limit);

    return {
      users: usersList,
      total,
      page,
      totalPages
    };
  }

  async updateUserStatus(userId: string, isActive: boolean): Promise<boolean> {
    const [updatedUser] = await db
      .update(users)
      .set({ 
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning();
    
    return !!updatedUser;
  }

  async deleteUser(userId: string): Promise<boolean> {
    const [deletedUser] = await db
      .delete(users)
      .where(eq(users.id, userId))
      .returning();
    
    return !!deletedUser;
  }

  // Analytics Helper Methods
  async getDashboardAnalytics(): Promise<any> {
    const [
      totalUsers,
      totalEvents,
      totalRevenue,
      activeEvents
    ] = await Promise.all([
      db.select({ count: sql`count(*)` }).from(users).then(res => Number(res[0]?.count || 0)),
      db.select({ count: sql`count(*)` }).from(events).then(res => Number(res[0]?.count || 0)),
      db.select({ total: sql`SUM(total_amount)` }).from(transactions).where(eq(transactions.status, 'completed')).then(res => Number(res[0]?.total || 0)),
      db.select({ count: sql`count(*)` }).from(events).where(eq(events.status, 'published')).then(res => Number(res[0]?.count || 0))
    ]);

    return {
      totalUsers,
      totalEvents,
      totalRevenue,
      activeEvents,
      commissionEarned: totalRevenue * 0.05 // Assuming 5% platform commission
    };
  }

  async getEventAnalytics(eventId: string): Promise<any> {
    const [
      eventDetails,
      ticketStats,
      revenueStats
    ] = await Promise.all([
      db.select().from(events).where(eq(events.id, eventId)).limit(1),
      db.select({
        totalSold: sql`SUM(quantity_sold)`,
        totalRevenue: sql`SUM(price * quantity_sold)`
      }).from(tickets).where(eq(tickets.ticketTypeId, sql`(SELECT id FROM ticket_types WHERE event_id = ${eventId})`)),
      db.select({
        totalTransactions: sql`COUNT(*)`,
        totalRevenue: sql`SUM(total_amount)`
      }).from(transactions).where(and(eq(transactions.eventId, eventId), eq(transactions.status, 'completed')))
    ]);

    return {
      event: eventDetails[0],
      ticketStats: ticketStats[0] || { totalSold: 0, totalRevenue: 0 },
      revenueStats: revenueStats[0] || { totalTransactions: 0, totalRevenue: 0 }
    };
  }

  async getSalesAnalytics(): Promise<any> {
    const salesData = await db
      .select({
        date: sql`DATE(created_at)`,
        totalSales: sql`SUM(total_amount)`,
        transactionCount: sql`COUNT(*)`
      })
      .from(transactions)
      .where(eq(transactions.status, 'completed'))
      .groupBy(sql`DATE(created_at)`)
      .orderBy(desc(sql`DATE(created_at)`))
      .limit(30);

    // Calculate totals safely
    let totalRevenue = 0;
    let totalTransactions = 0;

    if (Array.isArray(salesData) && salesData.length > 0) {
      totalRevenue = salesData.reduce((sum: number, day: any) => {
        const daySales = Number(day.totalSales || 0);
        return sum + daySales;
      }, 0);
      
      totalTransactions = salesData.reduce((sum: number, day: any) => {
        const dayTransactions = Number(day.transactionCount || 0);
        return sum + dayTransactions;
      }, 0);
    }

    return {
      sales: salesData,
      totalRevenue,
      totalTransactions
    };
  }

  async getCommissionAnalytics(): Promise<any> {
    const commissionData = await db
      .select({
        totalCommission: sql`SUM(commission_amount)`,
        totalRevenue: sql`SUM(total_amount)`,
        transactionCount: sql`COUNT(*)`
      })
      .from(transactions)
      .where(eq(transactions.status, 'completed'));

    // Calculate totals safely
    let totalCommission = 0;
    let totalRevenue = 0;
    let totalTransactions = 0;

    if (Array.isArray(commissionData) && commissionData.length > 0) {
      const data = commissionData[0];
      totalCommission = Number(data.totalCommission || 0);
      totalRevenue = Number(data.totalRevenue || 0);
      totalTransactions = Number(data.transactionCount || 0);
    }

    const averageCommissionPerTransaction = totalTransactions > 0 ? totalCommission / totalTransactions : 0;

    return {
      totalCommission,
      totalRevenue,
      totalTransactions,
      averageCommissionPerTransaction
    };
  }
}

export const adminService = new AdminService();