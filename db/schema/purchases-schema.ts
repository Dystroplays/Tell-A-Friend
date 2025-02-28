import {
  pgEnum,
  pgTable,
  decimal,
  text,
  timestamp,
  uuid
} from "drizzle-orm/pg-core"
import { usersTable } from "./users-schema"
import { relations } from "drizzle-orm"

/**
 * Purchase status enumeration
 * - pending: Initial state when purchase is made but not yet confirmed
 * - completed: Purchase has been confirmed and payment received
 * - cancelled: Purchase was cancelled before completion
 */
export const purchaseStatusEnum = pgEnum("purchase_status", [
  "pending",
  "completed",
  "cancelled"
])

/**
 * Purchases table schema
 *
 * Tracks purchases made by customers who were referred by other customers.
 * Each purchase is linked to a referrer who should receive a reward.
 */
export const purchasesTable = pgTable("purchases", {
  // Primary identifier for the purchase
  id: uuid("id").defaultRandom().primaryKey(),

  // The customer who referred the friend that made this purchase
  referrerId: uuid("referrer_id")
    .references(() => usersTable.id)
    .notNull(),

  // The customer who made the purchase (using someone's referral code)
  customerId: uuid("customer_id")
    .references(() => usersTable.id)
    .notNull(),

  // Purchase amount to track revenue and possibly calculate percentage-based rewards
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),

  // IP address for fraud detection
  ipAddress: text("ip_address"),

  // Current status of the purchase
  status: purchaseStatusEnum("status").notNull().default("pending"),

  // Description or product details
  description: text("description"),

  // Audit timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
})

/**
 * Relations configuration for the purchases table
 *
 * This sets up the relationship between purchases and users:
 * - Each purchase has one referrer (the user who referred the customer)
 * - Each purchase has one customer (the user who made the purchase)
 */
export const purchasesRelations = relations(purchasesTable, ({ one }) => ({
  referrer: one(usersTable, {
    fields: [purchasesTable.referrerId],
    references: [usersTable.id],
    relationName: "purchase_referrer"
  }),
  customer: one(usersTable, {
    fields: [purchasesTable.customerId],
    references: [usersTable.id],
    relationName: "purchase_customer"
  })
}))

// Types for inserting and selecting data
export type InsertPurchase = typeof purchasesTable.$inferInsert
export type SelectPurchase = typeof purchasesTable.$inferSelect
