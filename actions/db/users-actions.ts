"use server"

/**
 * Server actions for user management in the Tell a Friend application
 * 
 * This file contains functions for creating, reading, updating, and deleting
 * user records in the database, including role-specific operations.
 */

import { db } from "@/db/db"
import { 
  InsertUser, 
  SelectUser, 
  usersTable, 
  roleEnum 
} from "@/db/schema/users-schema"
import { ActionState } from "@/types"
import { auth } from "@clerk/nextjs/server"
import { eq } from "drizzle-orm"
import { v4 as uuidv4 } from "uuid"
import { clerkClient } from "@clerk/nextjs/server"
import { generateReferralCode } from "@/lib/referral-utils"

/**
 * Create a new user in the database
 * 
 * @param data - User data to insert
 * @returns Promise with ActionState containing the created user or error message
 */
export async function createUserAction(
  data: InsertUser
): Promise<ActionState<SelectUser>> {
  try {
    // If creating a customer, generate a referral code
    if (data.role === "customer" && !data.referralCode) {
      data.referralCode = generateReferralCode();
    }

    const [newUser] = await db.insert(usersTable).values(data).returning();
    
    return {
      isSuccess: true,
      message: "User created successfully",
      data: newUser
    };
  } catch (error) {
    console.error("Error creating user:", error);
    return { 
      isSuccess: false, 
      message: error instanceof Error ? error.message : "Failed to create user" 
    };
  }
}

/**
 * Get a user by their ID
 * 
 * @param id - User ID to find
 * @returns Promise with ActionState containing the user or error message
 */
export async function getUserByIdAction(
  id: string
): Promise<ActionState<SelectUser>> {
  try {
    const user = await db.query.users.findFirst({
      where: eq(usersTable.id, id)
    });
    
    if (!user) {
      return { isSuccess: false, message: "User not found" };
    }
    
    return {
      isSuccess: true,
      message: "User retrieved successfully",
      data: user
    };
  } catch (error) {
    console.error("Error getting user by ID:", error);
    return { 
      isSuccess: false, 
      message: "Failed to get user" 
    };
  }
}

/**
 * Get a user by their Clerk ID
 * 
 * @param clerkUserId - Clerk user ID to find
 * @returns Promise with ActionState containing the user or error message
 */
export async function getUserByClerkIdAction(
  clerkUserId: string
): Promise<ActionState<SelectUser>> {
  try {
    const user = await db.query.users.findFirst({
      where: eq(usersTable.clerkUserId, clerkUserId)
    });
    
    if (!user) {
      return { isSuccess: false, message: "User not found" };
    }
    
    return {
      isSuccess: true,
      message: "User retrieved successfully",
      data: user
    };
  } catch (error) {
    console.error("Error getting user by Clerk ID:", error);
    return { 
      isSuccess: false, 
      message: "Failed to get user" 
    };
  }
}

/**
 * Update a user's information
 * 
 * @param id - User ID to update
 * @param data - Partial user data to update
 * @returns Promise with ActionState containing the updated user or error message
 */
export async function updateUserAction(
  id: string,
  data: Partial<InsertUser>
): Promise<ActionState<SelectUser>> {
  try {
    // Get current session to verify authorization
    const { userId } = await auth();
    
    if (!userId) {
      return { 
        isSuccess: false, 
        message: "Unauthorized" 
      };
    }

    // Get current user to check if admin or self
    const currentUserResult = await getUserByClerkIdAction(userId);
    
    if (!currentUserResult.isSuccess) {
      return {
        isSuccess: false,
        message: "Failed to authenticate user"
      };
    }

    const currentUser = currentUserResult.data;
    const targetUser = await getUserByIdAction(id);
    
    // Only allow update if admin or updating self
    if (currentUser.role !== "admin" && currentUser.id !== id) {
      return {
        isSuccess: false,
        message: "Unauthorized to update this user"
      };
    }

    // Admins can update roles, other users cannot
    if (data.role && currentUser.role !== "admin") {
      return {
        isSuccess: false,
        message: "Only admins can update user roles"
      };
    }

    const [updatedUser] = await db
      .update(usersTable)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(usersTable.id, id))
      .returning();

    if (!updatedUser) {
      return { isSuccess: false, message: "User not found for update" };
    }

    return {
      isSuccess: true,
      message: "User updated successfully",
      data: updatedUser
    };
  } catch (error) {
    console.error("Error updating user:", error);
    return { 
      isSuccess: false, 
      message: "Failed to update user" 
    };
  }
}

/**
 * Create a new user with an invitation via Clerk
 * 
 * This action is admin-only and creates both a Clerk user and database user
 * 
 * @param email - Email of the user to invite
 * @param name - Name of the user to invite
 * @param role - Role to assign to the user
 * @returns Promise with ActionState containing the created user or error message
 */
export async function createInvitedUserAction(
  email: string,
  name: string,
  role: "customer" | "technician" | "admin"
): Promise<ActionState<SelectUser>> {
  try {
    // Get current session to verify authorization
    const { userId } = await auth();
    
    if (!userId) {
      return { 
        isSuccess: false, 
        message: "Unauthorized" 
      };
    }

    // Verify admin role (only admins can create invited users)
    const currentUserResult = await getUserByClerkIdAction(userId);
    
    if (!currentUserResult.isSuccess || currentUserResult.data.role !== "admin") {
      return {
        isSuccess: false,
        message: "Only admins can create invited users"
      };
    }

    // Check if a user with this email already exists in Clerk
    const clerk = await clerkClient()
    const existingUsers = await clerk.users.getUserList({
      emailAddress: [email]
    });
    
    if (existingUsers.data.length > 0) {
      return {
        isSuccess: false,
        message: "A user with this email already exists"
      };
    }
    
    // Create the user in Clerk
    const clerkUser = await clerk.users.createUser({
      emailAddress: [email],
      firstName: name.split(' ')[0],
      lastName: name.split(' ').slice(1).join(' ') || undefined,
      skipPasswordRequirement: true,
      publicMetadata: {
        role
      }
    });

    // Generate a referral code if creating a customer
    const referralCode = role === "customer" ? generateReferralCode() : undefined;

    // Create user in our database
    const userData: InsertUser = {
      id: uuidv4(),
      clerkUserId: clerkUser.id,
      role: role,
      name: name,
      email: email,
      phone: "", // This will be filled when the user completes their profile
      zipCode: "", // This will be filled when the user completes their profile
      referralCode: referralCode
    };

    const result = await createUserAction(userData);
    
    return result;
  } catch (error) {
    console.error("Error creating invited user:", error);
    return { 
      isSuccess: false, 
      message: error instanceof Error ? error.message : "Failed to create invited user" 
    };
  }
}

/**
 * Delete a user from the database
 * 
 * @param id - User ID to delete
 * @returns Promise with ActionState containing success/failure message
 */
export async function deleteUserAction(
  id: string
): Promise<ActionState<void>> {
  try {
    // Get current session to verify authorization
    const { userId } = await auth();
    
    if (!userId) {
      return { 
        isSuccess: false, 
        message: "Unauthorized" 
      };
    }

    // Verify admin role (only admins can delete users)
    const currentUserResult = await getUserByClerkIdAction(userId);
    
    if (!currentUserResult.isSuccess || currentUserResult.data.role !== "admin") {
      return {
        isSuccess: false,
        message: "Only admins can delete users"
      };
    }

    // Delete the user
    await db.delete(usersTable).where(eq(usersTable.id, id));
    
    return {
      isSuccess: true,
      message: "User deleted successfully",
      data: undefined
    };
  } catch (error) {
    console.error("Error deleting user:", error);
    return { 
      isSuccess: false, 
      message: "Failed to delete user" 
    };
  }
}

/**
 * Get all users with optional filtering by role
 * 
 * @param role - Optional role filter to apply
 * @returns Promise with ActionState containing array of users or error message
 */
export async function getAllUsersAction(
  role?: "customer" | "technician" | "admin" 
): Promise<ActionState<SelectUser[]>> {
  try {
    // Get current session to verify authorization
    const { userId } = await auth();
    
    if (!userId) {
      return { 
        isSuccess: false, 
        message: "Unauthorized" 
      };
    }

    // Verify admin role (only admins can list all users)
    const currentUserResult = await getUserByClerkIdAction(userId);
    
    if (!currentUserResult.isSuccess || currentUserResult.data.role !== "admin") {
      return {
        isSuccess: false,
        message: "Only admins can view all users"
      };
    }

    // Query users with optional role filter
    let users;
    if (role) {
      users = await db.query.users.findMany({
        where: eq(usersTable.role, role)
      });
    } else {
      users = await db.query.users.findMany();
    }
    
    return {
      isSuccess: true,
      message: "Users retrieved successfully",
      data: users
    };
  } catch (error) {
    console.error("Error getting all users:", error);
    return { 
      isSuccess: false, 
      message: "Failed to get users" 
    };
  }
}