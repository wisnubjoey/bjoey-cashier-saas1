import * as schema from './schema';

// Select types (untuk membaca data)
export type Organization = typeof schema.organizations.$inferSelect;
export type Product = typeof schema.products.$inferSelect;
export type Sale = typeof schema.sales.$inferSelect;
export type SaleItem = typeof schema.saleItems.$inferSelect;
export type Subscription = typeof schema.subscriptions.$inferSelect;

// Insert types (untuk menulis data)
export type NewOrganization = typeof schema.organizations.$inferInsert;
export type NewProduct = typeof schema.products.$inferInsert;
export type NewSale = typeof schema.sales.$inferInsert;
export type NewSaleItem = typeof schema.saleItems.$inferInsert;
export type NewSubscription = typeof schema.subscriptions.$inferInsert;
