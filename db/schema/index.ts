/**
 * Central export point for all database schemas
 *
 * This file exports all table schemas and their associated types
 * to simplify imports throughout the application
 */

// Base schemas and their types
export * from "./users-schema"
export * from "./purchases-schema"
export * from "./rewards-schema"
export * from "./notifications-schema"

// Continue to export existing schemas
export * from "./profiles-schema"
export * from "./todos-schema"
