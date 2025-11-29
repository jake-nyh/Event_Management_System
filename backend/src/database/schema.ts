import { 
  pgTable, 
  uuid, 
  varchar, 
  text, 
  decimal, 
  integer, 
  timestamp, 
  date, 
  time,
  boolean
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  phone: varchar('phone', { length: 20 }),
  role: varchar('role', { length: 20 }).notNull().$type<'event_creator' | 'customer' | 'website_owner'>(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Events table
export const events = pgTable('events', {
  id: uuid('id').primaryKey().defaultRandom(),
  creatorId: uuid('creator_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  location: varchar('location', { length: 255 }).notNull(),
  eventDate: date('event_date').notNull(),
  eventTime: time('event_time').notNull(),
  imageUrl: varchar('image_url', { length: 500 }),
  commissionRate: decimal('commission_rate', { precision: 5, scale: 2 }).default('5.00'),
  status: varchar('status', { length: 20 }).default('draft').$type<'draft' | 'published' | 'cancelled' | 'completed'>(),
  category: varchar('category', { length: 50 }),
  tags: varchar('tags', { length: 500 }),
  isFeatured: boolean('is_featured').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Ticket Types table
export const ticketTypes = pgTable('ticket_types', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: uuid('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 100 }).notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  quantityAvailable: integer('quantity_available').notNull(),
  quantitySold: integer('quantity_sold').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Tickets table
export const tickets = pgTable('tickets', {
  id: uuid('id').primaryKey().defaultRandom(),
  ticketTypeId: uuid('ticket_type_id').notNull().references(() => ticketTypes.id, { onDelete: 'cascade' }),
  customerId: uuid('customer_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  transactionId: uuid('transaction_id').references(() => transactions.id),
  qrCode: text('qr_code'),
  status: varchar('status', { length: 20 }).default('active').$type<'active' | 'used' | 'transferred' | 'refunded'>(),
  purchasedAt: timestamp('purchased_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Transactions table
export const transactions = pgTable('transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  customerId: uuid('customer_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  eventId: uuid('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
  commissionAmount: decimal('commission_amount', { precision: 10, scale: 2 }).notNull(),
  creatorAmount: decimal('creator_amount', { precision: 10, scale: 2 }).notNull(),
  status: varchar('status', { length: 20 }).default('pending').$type<'pending' | 'completed' | 'failed' | 'refunded'>(),
  stripePaymentIntentId: varchar('stripe_payment_intent_id', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Subscriptions table
export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  creatorId: uuid('creator_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  tierName: varchar('tier_name', { length: 100 }).notNull(),
  monthlyFee: decimal('monthly_fee', { precision: 10, scale: 2 }).notNull(),
  startDate: date('start_date').notNull(),
  endDate: date('end_date'),
  status: varchar('status', { length: 20 }).default('active').$type<'active' | 'cancelled' | 'expired'>(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Waiting List table
export const waitingList = pgTable('waiting_list', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: uuid('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  customerId: uuid('customer_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  quantityRequested: integer('quantity_requested').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Define relations
export const usersRelations = relations(users, ({ many }) => ({
  events: many(events),
  tickets: many(tickets),
  transactions: many(transactions),
  subscriptions: many(subscriptions),
  waitingListEntries: many(waitingList),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  creator: one(users, {
    fields: [events.creatorId],
    references: [users.id],
  }),
  ticketTypes: many(ticketTypes),
  tickets: many(tickets),
  transactions: many(transactions),
  waitingListEntries: many(waitingList),
}));

export const ticketTypesRelations = relations(ticketTypes, ({ one, many }) => ({
  event: one(events, {
    fields: [ticketTypes.eventId],
    references: [events.id],
  }),
  tickets: many(tickets),
}));

export const ticketsRelations = relations(tickets, ({ one }) => ({
  ticketType: one(ticketTypes, {
    fields: [tickets.ticketTypeId],
    references: [ticketTypes.id],
  }),
  customer: one(users, {
    fields: [tickets.customerId],
    references: [users.id],
  }),
  transaction: one(transactions, {
    fields: [tickets.transactionId],
    references: [transactions.id],
  }),
}));

export const transactionsRelations = relations(transactions, ({ one, many }) => ({
  customer: one(users, {
    fields: [transactions.customerId],
    references: [users.id],
  }),
  event: one(events, {
    fields: [transactions.eventId],
    references: [events.id],
  }),
  tickets: many(tickets),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  creator: one(users, {
    fields: [subscriptions.creatorId],
    references: [users.id],
  }),
}));

export const waitingListRelations = relations(waitingList, ({ one }) => ({
  event: one(events, {
    fields: [waitingList.eventId],
    references: [events.id],
  }),
  customer: one(users, {
    fields: [waitingList.customerId],
    references: [users.id],
  }),
}));

// Export types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;
export type TicketType = typeof ticketTypes.$inferSelect;
export type NewTicketType = typeof ticketTypes.$inferInsert;
export type Ticket = typeof tickets.$inferSelect;
export type NewTicket = typeof tickets.$inferInsert;
export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;
export type WaitingList = typeof waitingList.$inferSelect;
export type NewWaitingList = typeof waitingList.$inferInsert;