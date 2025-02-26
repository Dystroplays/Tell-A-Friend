import {
  pgEnum,
  pgTable,
  decimal,
  text,
  timestamp,
  uuid
} from "drizzle-orm/pg-core"
import { usersTable } from "./users-schema"
import { purchasesTable } from "./purchases-schema"

/**
 * Reward status enumeration
 * - pending: Initial state when reward is created but not yet approved
 * - approved: Reward has been approved by an admin
 * - rejected: Reward was rejected due to fraud or other issues
 */
export const rewardStatusEnum = pgEnum("reward_status", [
  "pending",
  "approved",
  "rejected"
])

/**
 * Reward type enumeration
 * - cash: Direct cash payment
 * - discount: Discount on future services
 * - credit: Store credit
 */
export const rewardTypeEnum = pgEnum("reward_type", [
  "cash",
  "discount",
  "credit"
])

/**
 * Rewards table schema
 *
 * Tracks rewards earned by customers for successful referrals.
 * Each reward is linked to a purchase and must be approved by an admin.
 */
export const rewardsTable = pgTable("rewards", {
  // Primary identifier for the reward
  id: uuid("id").defaultRandom().primaryKey(),

  // The purchase that triggered this reward
  purchaseId: uuid("purchase_id")
    .references(() => purchasesTable.id)
    .notNull(),

  // The customer who should receive this reward
  referrerId: uuid("referrer_id")
    .references(() => usersTable.id)
    .notNull(),

  // Type of reward being offered
  rewardType: rewardTypeEnum("reward_type").notNull(),

  // Value of the reward (amount for cash, percentage for discount, points for credit)
  rewardValue: decimal("reward_value", { precision: 10, scale: 2 }).notNull(),

  // Current status of the reward
  status: rewardStatusEnum("status").notNull().default("pending"),

  // Admin who approved or rejected the reward
  reviewedBy: uuid("reviewed_by").references(() => usersTable.id),

  // Notes from admin review (especially useful for rejections)
  reviewNotes: text("review_notes"),

  // Audit timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
})

// Types for inserting and selecting data
export type InsertReward = typeof rewardsTable.$inferInsert
export type SelectReward = typeof rewardsTable.$inferSelect
