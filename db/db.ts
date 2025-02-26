/**
 * Database connection and schema configuration
 *
 * This file sets up the database connection using Drizzle ORM
 * and registers all schema tables for use in database operations.
 */

import {
  profilesTable,
  todosTable,
  usersTable,
  purchasesTable,
  rewardsTable,
  notificationsTable
} from "@/db/schema"
import { config } from "dotenv"
import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"

// Load environment variables
config({ path: ".env.local" })

// Register all schema tables
const schema = {
  // Existing schemas
  profiles: profilesTable,
  todos: todosTable,

  // New schemas for Tell a Friend app
  users: usersTable,
  purchases: purchasesTable,
  rewards: rewardsTable,
  notifications: notificationsTable
}

// Create database client
const client = postgres(process.env.DATABASE_URL!)

// Export configured database instance
export const db = drizzle(client, { schema })
