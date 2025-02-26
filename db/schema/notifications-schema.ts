import {
  pgEnum,
  pgTable,
  jsonb,
  text,
  timestamp,
  uuid
} from "drizzle-orm/pg-core"
import { usersTable } from "./users-schema"

/**
 * Notification type enumeration
 * - email: Email notifications
 * - sms: SMS text message notifications
 * - in_app: In-app notifications displayed in the UI
 */
export const notificationTypeEnum = pgEnum("notification_type", [
  "email",
  "sms",
  "in_app"
])

/**
 * Notification status enumeration
 * - pending: Notification is queued to be sent
 * - sent: Notification has been sent
 * - failed: Notification failed to send
 * - read: In-app notification has been read by the user
 */
export const notificationStatusEnum = pgEnum("notification_status", [
  "pending",
  "sent",
  "failed",
  "read"
])

/**
 * Notifications table schema
 *
 * Tracks all notifications sent to users through various channels.
 * Provides a record of communication and read status.
 */
export const notificationsTable = pgTable("notifications", {
  // Primary identifier for the notification
  id: uuid("id").defaultRandom().primaryKey(),

  // The user this notification is for
  userId: uuid("user_id")
    .references(() => usersTable.id)
    .notNull(),

  // Type of notification channel
  type: notificationTypeEnum("type").notNull(),

  // Current status of the notification
  status: notificationStatusEnum("status").notNull().default("pending"),

  // Notification subject/title
  title: text("title").notNull(),

  // Notification content
  message: text("message").notNull(),

  // Additional data for the notification (e.g., reward details, purchase info)
  data: jsonb("data"),

  // Audit timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
})

// Types for inserting and selecting data
export type InsertNotification = typeof notificationsTable.$inferInsert
export type SelectNotification = typeof notificationsTable.$inferSelect
