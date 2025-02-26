/**
 * Authentication and authorization related type definitions
 *
 * This file contains types related to user roles, permissions, and authentication
 * for the Tell a Friend referral application.
 */

/**
 * Available user roles in the system
 * - customer: Regular users who can refer friends and earn rewards
 * - technician: Service providers who can send sign-up links to customers
 * - admin: System administrators with full access to manage the application
 */
export type UserRole = "customer" | "technician" | "admin"

/**
 * Type for role-based route access control
 * Maps routes to the roles that can access them
 */
export interface RoutePermissions {
  [route: string]: UserRole[]
}

/**
 * Default route permissions configuration
 * Defines which roles can access which routes
 */
export const defaultRoutePermissions: RoutePermissions = {
  "/dashboard": ["customer"],
  "/admin": ["admin"],
  "/technician": ["technician"],
  // Public routes accessible to all users regardless of authentication
  "/": [], // Empty array means no role restrictions (public)
  "/login": [],
  "/signup": [],
  "/about": [],
  "/contact": [],
  "/pricing": []
}
