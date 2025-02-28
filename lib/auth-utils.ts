/**
 * Authentication utility functions
 *
 * This file contains helper functions for handling authentication
 * and authorization related tasks in the Tell a Friend application.
 */

import { auth, currentUser } from "@clerk/nextjs/server"
import { UserRole } from "@/types"
import { redirect } from "next/navigation"

/**
 * Checks if the current user has the required role
 * Redirects to login if not authenticated
 * Redirects to unauthorized page if authenticated but with wrong role
 *
 * @param requiredRoles - Array of roles that are allowed to access the content
 * @param redirectTo - Where to redirect if the user is not authorized
 * @returns User's Clerk ID if authorized
 */
export async function checkUserRole(
  requiredRoles: UserRole[],
  redirectTo: string = "/"
): Promise<string> {
  // Get current auth state
  const { userId } = await auth()

  // If not authenticated, redirect to login
  if (!userId) {
    redirect("/login")
  }

  // If no specific roles required, just return the userId
  if (requiredRoles.length === 0) {
    return userId
  }

  // Get the complete user data
  const user = await currentUser()

  if (!user) {
    redirect("/login")
  }

  // Check if user has the required role
  // Role is stored in public metadata, fallback to "customer" if not set
  const userRole = (user.publicMetadata.role as UserRole) || "customer"

  if (!requiredRoles.includes(userRole)) {
    // User doesn't have the required role, redirect to unauthorized page
    redirect(redirectTo)
  }

  return userId
}

/**
 * Gets the current user's role from Clerk metadata
 *
 * @param defaultRole - Default role to return if no role is found
 * @returns The user's role or the default role if not found
 */
export async function getUserRole(
  defaultRole: UserRole = "customer"
): Promise<UserRole> {
  const user = await currentUser()

  if (!user) {
    return defaultRole
  }

  return (user.publicMetadata.role as UserRole) || defaultRole
}

/**
 * Updates the user's role in Clerk metadata
 *
 * @param userId - Clerk user ID
 * @param role - New role to assign
 * @returns Promise resolving to true if successful
 */
export async function updateUserRole(
  userId: string,
  role: UserRole
): Promise<boolean> {
  try {
    // This is just a placeholder. In a real implementation, you would update
    // the user's metadata in Clerk using their API.
    // const clerkUser = await clerkClient.users.updateUser(userId, {
    //   publicMetadata: { role }
    // });

    // For now, just return true as a placeholder
    return true
  } catch (error) {
    console.error("Error updating user role:", error)
    return false
  }
}
