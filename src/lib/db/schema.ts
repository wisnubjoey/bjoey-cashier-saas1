import { pgTable, text, timestamp, integer, pgEnum, decimal, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';

// Enums
export const subscriptionStatusEnum = pgEnum('subscription_status', ['active', 'canceled', 'past_due', 'trial']);
export const userRoleEnum = pgEnum('user_role', ['admin', 'manager', 'cashier']);
export const paymentMethodEnum = pgEnum('payment_method', ['cash', 'card', 'transfer', 'other']);
export const stockReasonEnum = pgEnum('stock_reason', ['sale', 'purchase', 'adjustment', 'return']);
export const paymentStatusEnum = pgEnum('payment_status', ['pending', 'success', 'failed', 'expired']);

// Organizations (Tenant)
export const organizations = pgTable('organizations', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  logo: text('logo'),
  adminPassword: text('admin_password').notNull(),
  userId: text('user_id').notNull(), // Clerk user ID
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Products
export const products = pgTable('products', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  organizationId: text('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  sku: text('sku'),
  barcode: text('barcode'),
  stock: integer('stock').default(0),
  imageUrl: text('image_url'),
  minStockLevel: integer('min_stock_level').default(0),
  costPrice: decimal('cost_price', { precision: 10, scale: 2 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Sales/Transactions
export const sales = pgTable('sales', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  organizationId: text('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  total: decimal('total', { precision: 10, scale: 2 }).notNull(),
  paymentMethod: text('payment_method').notNull(),
  customerName: text('customer_name'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Sale Items (detail transaksi)
export const saleItems = pgTable('sale_items', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  saleId: text('sale_id').notNull().references(() => sales.id, { onDelete: 'cascade' }),
  productId: text('product_id').notNull().references(() => products.id),
  quantity: integer('quantity').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  subtotal: decimal('subtotal', { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// User Subscriptions
export const userSubscriptions = pgTable('user_subscriptions', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull(), // Clerk user ID
  status: subscriptionStatusEnum('status').notNull().default('trial'),
  plan: text('plan').notNull().default('free'),
  isTrialUsed: boolean('is_trial_used').default(false),
  trialStartDate: timestamp('trial_start_date'),
  trialEndDate: timestamp('trial_end_date'),
  currentPeriodStart: timestamp('current_period_start'),
  currentPeriodEnd: timestamp('current_period_end'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Payments
export const payments = pgTable('payments', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull(), // Clerk user ID
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  currency: text('currency').default('IDR').notNull(),
  status: paymentStatusEnum('status').notNull().default('pending'),
  midtransOrderId: text('midtrans_order_id'),
  midtransTransactionId: text('midtrans_transaction_id'),
  paymentType: text('payment_type'),
  metadata: text('metadata'), // JSON stringified additional data
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Subscriptions
export const subscriptions = pgTable('subscriptions', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  organizationId: text('organization_id')
    .notNull()
    .references(() => organizations.id, { onDelete: 'cascade' }),
  status: subscriptionStatusEnum('status').notNull(),
  plan: text('plan').notNull(),
  priceId: text('price_id'),
  currentPeriodStart: timestamp('current_period_start'),
  currentPeriodEnd: timestamp('current_period_end'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Stock History (riwayat perubahan stok)
export const stockHistory = pgTable('stock_history', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  productId: text('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  previousStock: integer('previous_stock'),
  newStock: integer('new_stock'),
  changeAmount: integer('change_amount').notNull(),
  reason: stockReasonEnum('reason').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  userId: text('user_id').notNull(), // Clerk user ID
});

// Relations
export const organizationsRelations = relations(organizations, ({ many }) => ({
  products: many(products),
  sales: many(sales),
  subscriptions: many(subscriptions),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [products.organizationId],
    references: [organizations.id],
  }),
  saleItems: many(saleItems),
  stockHistories: many(stockHistory),
}));

export const salesRelations = relations(sales, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [sales.organizationId],
    references: [organizations.id],
  }),
  items: many(saleItems),
}));

export const saleItemsRelations = relations(saleItems, ({ one }) => ({
  sale: one(sales, {
    fields: [saleItems.saleId],
    references: [sales.id],
  }),
  product: one(products, {
    fields: [saleItems.productId],
    references: [products.id],
  }),
}));

export const stockHistoryRelations = relations(stockHistory, ({ one }) => ({
  product: one(products, {
    fields: [stockHistory.productId],
    references: [products.id],
  }),
}));

export const userSubscriptionsRelations = relations(userSubscriptions, ({ many }) => ({
  payments: many(payments),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  userSubscription: one(userSubscriptions, {
    fields: [payments.userId],
    references: [userSubscriptions.userId],
  }),
}));
