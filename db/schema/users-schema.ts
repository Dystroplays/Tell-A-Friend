import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"

/**
 * User role enumeration
 * - customer: Regular users who can refer friends and earn rewards
 * - technician: Service providers who can send sign-up links to customers
 * - admin: System administrators with full access
 */
export const roleEnum = pgEnum("role", ["customer", "technician", "admin"])

/**
 * Users table schema
 *
 * Stores all user information regardless of role (customer, technician, admin)
 * Links to Clerk authentication via clerkUserId
 * Customers have referral codes and may be linked to technicians who referred them
 */
export const usersTable = pgTable("users", {
  // Primary identifier for the user
  id: uuid("id").defaultRandom().primaryKey(),

  // External ID from Clerk authentication service
  clerkUserId: text("clerk_user_id").notNull().unique(),

  // User role determines permissions and access
  role: roleEnum("role").notNull(),

  // Basic user information
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull().unique(),

  // Geographic information for targeting and analytics
  zipCode: text("zip_code"),

  // Only for customers - unique code used for referrals
  referralCode: text("referral_code").unique(),

  // Tracks which technician referred this customer (for customers only)
  referredByTechnicianId: uuid("referred_by_technician_id"),

  // Audit timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
})

// Self-referential relationship - technician can refer customers
export const usersRelations = relations(usersTable, ({ one }) => ({
  referredByTechnician: one(usersTable, {
    fields: [usersTable.referredByTechnicianId],
    references: [usersTable.id],
    relationName: "referrer_technician_to_customer"
  })
}))

// Types for inserting and selecting data
export type InsertUser = typeof usersTable.$inferInsert
export type SelectUser = typeof usersTable.$inferSelect
