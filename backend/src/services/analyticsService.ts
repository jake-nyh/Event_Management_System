import { db } from '../database/connection';
import { 
  users, 
  events, 
  tickets, 
  transactions, 
  ticketTypes,
  subscriptions 
} from '../database/schema';
import { 
  eq, 
  and, 
  gte, 
  lte, 
  count, 
  sum, 
  desc, 
  sql,
  between,
  or
} from 'drizzle-orm';

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

export class AnalyticsService {
  // Dashboard analytics for website owners
  async getDashboardAnalytics(
    startDate?: string,
    endDate?: string
  ): Promise<DashboardAnalytics> {
    try {
      const dateFilter = startDate && endDate
        ? and(
            gte(transactions.createdAt, new Date(startDate)),
            lte(transactions.createdAt, new Date(endDate))
          )
        : undefined;

      // Get total users
      const [{ totalUsers }] = await db
        .select({ totalUsers: count() })
        .from(users);

      // Get total events
      const [{ totalEvents }] = await db
        .select({ totalEvents: count() })
        .from(events);

      // Get active events
      const [{ activeEvents }] = await db
        .select({ activeEvents: count() })
        .from(events)
        .where(eq(events.status, 'published'));

      // Get total revenue and commission
      const revenueResult = await db
        .select({
          totalRevenue: sum(transactions.totalAmount),
          commissionEarned: sum(transactions.commissionAmount),
          totalTransactions: count()
        })
        .from(transactions)
        .where(dateFilter || sql`1=1`);

      const totalRevenue = Number(revenueResult[0]?.totalRevenue || 0);
      const commissionEarned = Number(revenueResult[0]?.commissionEarned || 0);
      const totalTransactions = Number(revenueResult[0]?.totalTransactions || 0);

      // Get total tickets sold
      const [{ totalTicketsSold }] = await db
        .select({ totalTicketsSold: count() })
        .from(tickets)
        .where(eq(tickets.status, 'active'));

      // Get recent transactions
      const recentTransactions = await db
        .select({
          id: transactions.id,
          totalAmount: transactions.totalAmount,
          status: transactions.status,
          createdAt: transactions.createdAt,
          customerEmail: users.email,
          eventTitle: events.title
        })
        .from(transactions)
        .leftJoin(users, eq(transactions.customerId, users.id))
        .leftJoin(events, eq(transactions.eventId, events.id))
        .orderBy(desc(transactions.createdAt))
        .limit(10);

      // Get user growth (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const userGrowth = await db
        .select({
          date: sql`DATE(${users.createdAt})`,
          count: count()
        })
        .from(users)
        .where(gte(users.createdAt, thirtyDaysAgo))
        .groupBy(sql`DATE(${users.createdAt})`)
        .orderBy(sql`DATE(${users.createdAt})`);

      // Get revenue growth (last 30 days)
      const revenueGrowth = await db
        .select({
          date: sql`DATE(${transactions.createdAt})`,
          revenue: sum(transactions.totalAmount)
        })
        .from(transactions)
        .where(
          and(
            gte(transactions.createdAt, thirtyDaysAgo),
            eq(transactions.status, 'completed')
          )
        )
        .groupBy(sql`DATE(${transactions.createdAt})`)
        .orderBy(sql`DATE(${transactions.createdAt})`);

      return {
        totalUsers,
        totalEvents,
        totalRevenue,
        commissionEarned,
        activeEvents,
        totalTicketsSold,
        recentTransactions,
        userGrowth,
        revenueGrowth
      };
    } catch (error) {
      console.error('Error getting dashboard analytics:', error);
      throw error;
    }
  }

  // Event analytics for creators
  async getEventAnalytics(eventId: string): Promise<EventAnalytics> {
    try {
      // Get tickets sold by type
      const ticketsByType = await db
        .select({
          ticketTypeId: ticketTypes.id,
          ticketTypeName: ticketTypes.name,
          price: ticketTypes.price,
          totalSold: count(tickets.id),
          revenue: sum(ticketTypes.price)
        })
        .from(ticketTypes)
        .leftJoin(tickets, eq(ticketTypes.id, tickets.ticketTypeId))
        .where(eq(ticketTypes.eventId, eventId))
        .groupBy(ticketTypes.id, ticketTypes.name, ticketTypes.price);

      // Get total tickets sold and revenue
      const totalTicketsSold = ticketsByType.reduce((sum, type) => sum + Number(type.totalSold || 0), 0);
      const totalRevenue = ticketsByType.reduce((sum, type) => sum + Number(type.revenue || 0), 0);

      // Get sales over time (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const salesOverTime = await db
        .select({
          date: sql`DATE(${tickets.purchasedAt})`,
          ticketsSold: count(tickets.id),
          revenue: sum(ticketTypes.price)
        })
        .from(tickets)
        .leftJoin(ticketTypes, eq(tickets.ticketTypeId, ticketTypes.id))
        .where(
          and(
            eq(ticketTypes.eventId, eventId),
            gte(tickets.purchasedAt, thirtyDaysAgo)
          )
        )
        .groupBy(sql`DATE(${tickets.purchasedAt})`)
        .orderBy(sql`DATE(${tickets.purchasedAt})`);

      // Get event details for conversion rate calculation
      const [event] = await db
        .select()
        .from(events)
        .where(eq(events.id, eventId))
        .limit(1);

      // Calculate conversion rate (views vs purchases)
      // This is a simplified version - in a real app, you'd track page views
      const conversionRate = totalTicketsSold > 0 ? 0.05 : 0; // Mock 5% conversion rate

      return {
        eventId,
        totalTicketsSold,
        totalRevenue,
        ticketsByType,
        salesOverTime,
        attendeeDemographics: {}, // Would need additional user data
        conversionRate
      };
    } catch (error) {
      console.error('Error getting event analytics:', error);
      throw error;
    }
  }

  // Sales analytics
  async getSalesAnalytics(
    startDate?: string,
    endDate?: string
  ): Promise<SalesAnalytics> {
    try {
      const dateFilter = startDate && endDate
        ? and(
            gte(transactions.createdAt, new Date(startDate)),
            lte(transactions.createdAt, new Date(endDate))
          )
        : undefined;

      // Get overall sales metrics
      const salesMetrics = await db
        .select({
          totalRevenue: sum(transactions.totalAmount),
          totalTransactions: count(transactions.id),
          averageTicketPrice: sql`AVG(${transactions.totalAmount})`
        })
        .from(transactions)
        .where(
          and(
            eq(transactions.status, 'completed'),
            dateFilter || sql`1=1`
          )
        );

      const totalRevenue = Number(salesMetrics[0]?.totalRevenue || 0);
      const totalTransactions = Number(salesMetrics[0]?.totalTransactions || 0);
      const averageTicketPrice = Number(salesMetrics[0]?.averageTicketPrice || 0);

      // Get revenue by event
      const revenueByEvent = await db
        .select({
          eventId: events.id,
          eventTitle: events.title,
          revenue: sum(transactions.totalAmount),
          ticketsSold: count(tickets.id)
        })
        .from(transactions)
        .leftJoin(events, eq(transactions.eventId, events.id))
        .leftJoin(tickets, eq(transactions.id, tickets.transactionId))
        .where(
          and(
            eq(transactions.status, 'completed'),
            dateFilter || sql`1=1`
          )
        )
        .groupBy(events.id, events.title)
        .orderBy(desc(sum(transactions.totalAmount)))
        .limit(10);

      // Get revenue by month (last 12 months)
      const twelveMonthsAgo = new Date();
      twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

      const revenueByMonth = await db
        .select({
          month: sql`DATE_TRUNC('month', ${transactions.createdAt})`,
          revenue: sum(transactions.totalAmount),
          transactions: count(transactions.id)
        })
        .from(transactions)
        .where(
          and(
            eq(transactions.status, 'completed'),
            gte(transactions.createdAt, twelveMonthsAgo)
          )
        )
        .groupBy(sql`DATE_TRUNC('month', ${transactions.createdAt})`)
        .orderBy(sql`DATE_TRUNC('month', ${transactions.createdAt})`);

      // Get top selling events
      const topSellingEvents = await db
        .select({
          eventId: events.id,
          eventTitle: events.title,
          ticketsSold: count(tickets.id),
          revenue: sum(transactions.totalAmount),
          eventDate: events.eventDate
        })
        .from(events)
        .leftJoin(transactions, eq(events.id, transactions.eventId))
        .leftJoin(tickets, eq(transactions.id, tickets.transactionId))
        .where(eq(events.status, 'published'))
        .groupBy(events.id, events.title, events.eventDate)
        .orderBy(desc(count(tickets.id)))
        .limit(10);

      return {
        totalRevenue,
        totalTransactions,
        averageTicketPrice,
        revenueByEvent,
        revenueByMonth,
        topSellingEvents
      };
    } catch (error) {
      console.error('Error getting sales analytics:', error);
      throw error;
    }
  }

  // Commission analytics
  async getCommissionAnalytics(
    startDate?: string,
    endDate?: string
  ): Promise<CommissionAnalytics> {
    try {
      const dateFilter = startDate && endDate
        ? and(
            gte(transactions.createdAt, new Date(startDate)),
            lte(transactions.createdAt, new Date(endDate))
          )
        : undefined;

      // Get total commission
      const commissionMetrics = await db
        .select({
          totalCommission: sum(transactions.commissionAmount),
          averageCommissionRate: sql`AVG((${transactions.commissionAmount} / ${transactions.totalAmount}) * 100)`
        })
        .from(transactions)
        .where(
          and(
            eq(transactions.status, 'completed'),
            dateFilter || sql`1=1`
          )
        );

      const totalCommission = Number(commissionMetrics[0]?.totalCommission || 0);
      const averageCommissionRate = Number(commissionMetrics[0]?.averageCommissionRate || 0);

      // Get commission by event
      const commissionByEvent = await db
        .select({
          eventId: events.id,
          eventTitle: events.title,
          commissionAmount: sum(transactions.commissionAmount),
          totalAmount: sum(transactions.totalAmount),
          commissionRate: sql`(${transactions.commissionAmount} / ${transactions.totalAmount}) * 100`
        })
        .from(transactions)
        .leftJoin(events, eq(transactions.eventId, events.id))
        .where(
          and(
            eq(transactions.status, 'completed'),
            dateFilter || sql`1=1`
          )
        )
        .groupBy(events.id, events.title)
        .orderBy(desc(sum(transactions.commissionAmount)))
        .limit(10);

      // Get commission by month (last 12 months)
      const twelveMonthsAgo = new Date();
      twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

      const commissionByMonth = await db
        .select({
          month: sql`DATE_TRUNC('month', ${transactions.createdAt})`,
          commission: sum(transactions.commissionAmount),
          transactions: count(transactions.id)
        })
        .from(transactions)
        .where(
          and(
            eq(transactions.status, 'completed'),
            gte(transactions.createdAt, twelveMonthsAgo)
          )
        )
        .groupBy(sql`DATE_TRUNC('month', ${transactions.createdAt})`)
        .orderBy(sql`DATE_TRUNC('month', ${transactions.createdAt})`);

      // Calculate projected monthly commission (based on last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentCommission = await db
        .select({
          commission: sum(transactions.commissionAmount)
        })
        .from(transactions)
        .where(
          and(
            eq(transactions.status, 'completed'),
            gte(transactions.createdAt, thirtyDaysAgo)
          )
        );

      const projectedMonthlyCommission = Number(recentCommission[0]?.commission || 0) * (30 / 30);

      return {
        totalCommission,
        commissionByEvent,
        commissionByMonth,
        averageCommissionRate,
        projectedMonthlyCommission
      };
    } catch (error) {
      console.error('Error getting commission analytics:', error);
      throw error;
    }
  }

  // Get creator-specific analytics
  async getCreatorAnalytics(creatorId: string): Promise<any> {
    try {
      // Get creator's events
      const creatorEvents = await db
        .select({
          id: events.id,
          title: events.title,
          status: events.status,
          eventDate: events.eventDate,
          createdAt: events.createdAt
        })
        .from(events)
        .where(eq(events.creatorId, creatorId));

      // Get creator's revenue and tickets sold
      const creatorMetrics = await db
        .select({
          totalRevenue: sum(transactions.creatorAmount),
          totalTicketsSold: count(tickets.id),
          totalEvents: count(events.id),
          activeEvents: sql`COUNT(CASE WHEN ${events.status} = 'published' THEN 1 END)`
        })
        .from(events)
        .leftJoin(transactions, eq(events.id, transactions.eventId))
        .leftJoin(tickets, eq(transactions.id, tickets.transactionId))
        .where(eq(events.creatorId, creatorId));

      // Get recent transactions for creator's events
      const recentTransactions = await db
        .select({
          id: transactions.id,
          totalAmount: transactions.totalAmount,
          creatorAmount: transactions.creatorAmount,
          status: transactions.status,
          createdAt: transactions.createdAt,
          eventTitle: events.title
        })
        .from(transactions)
        .leftJoin(events, eq(transactions.eventId, events.id))
        .where(
          and(
            eq(events.creatorId, creatorId),
            eq(transactions.status, 'completed')
          )
        )
        .orderBy(desc(transactions.createdAt))
        .limit(10);

      return {
        events: creatorEvents,
        metrics: creatorMetrics[0] || {
          totalRevenue: 0,
          totalTicketsSold: 0,
          totalEvents: 0,
          activeEvents: 0
        },
        recentTransactions
      };
    } catch (error) {
      console.error('Error getting creator analytics:', error);
      throw error;
    }
  }
}

export const analyticsService = new AnalyticsService();