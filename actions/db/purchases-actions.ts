"use server"

/**
 * Server actions for purchase management in the Tell a Friend application
 * 
 * This file contains functions for creating, retrieving, and managing purchases
 * made through referral codes. Each purchase is linked to both a referrer and customer.
 */

import { db } from "@/db/db"
import { 
  InsertPurchase, 
  SelectPurchase, 
  purchasesTable,
  purchaseStatusEnum
} from "@/db/schema/purchases-schema"
import { usersTable } from "@/db/schema/users-schema"
import { ActionState } from "@/types"
import { auth } from "@clerk/nextjs/server"
import { and, eq, gte, sql } from "drizzle-orm"
import { getUserByClerkIdAction } from "./users-actions"

/**
 * Create a new purchase in the database
 * 
 * @param data - Purchase data to insert
 * @returns Promise with ActionState containing the created purchase or error message
 */
export async function createPurchaseAction(
  data: InsertPurchase
): Promise<ActionState<SelectPurchase>> {
  try {
    // Validate the purchase data
    if (!data.referrerId || !data.customerId || !data.amount) {
      return {
        isSuccess: false,
        message: "Missing required purchase information"
      };
    }

    // Insert the purchase and return the created record
    const [newPurchase] = await db
      .insert(purchasesTable)
      .values(data)
      .returning();

    return {
      isSuccess: true,
      message: "Purchase created successfully",
      data: newPurchase
    };
  } catch (error) {
    console.error("Error creating purchase:", error);
    return { 
      isSuccess: false, 
      message: error instanceof Error ? error.message : "Failed to create purchase" 
    };
  }
}

/**
 * Get a purchase by its ID
 * 
 * @param id - Purchase ID to find
 * @returns Promise with ActionState containing the purchase or error message
 */
export async function getPurchaseByIdAction(
  id: string
): Promise<ActionState<SelectPurchase>> {
  try {
    // Get current session to verify authorization
    const { userId } = await auth();
    
    if (!userId) {
      return { 
        isSuccess: false, 
        message: "Unauthorized" 
      };
    }

    // Get current user to check role
    const currentUserResult = await getUserByClerkIdAction(userId);
    
    if (!currentUserResult.isSuccess) {
      return {
        isSuccess: false,
        message: "Failed to authenticate user"
      };
    }

    const currentUser = currentUserResult.data;
    
    // Find the requested purchase
    const purchase = await db.query.purchases.findFirst({
      where: eq(purchasesTable.id, id)
    });
    
    if (!purchase) {
      return { isSuccess: false, message: "Purchase not found" };
    }
    
    // Verify authorization - admins can see any purchase,
    // customers can only see purchases where they are the referrer or customer
    if (
      currentUser.role !== "admin" &&
      currentUser.id !== purchase.referrerId &&
      currentUser.id !== purchase.customerId
    ) {
      return {
        isSuccess: false,
        message: "Unauthorized to view this purchase"
      };
    }
    
    return {
      isSuccess: true,
      message: "Purchase retrieved successfully",
      data: purchase
    };
  } catch (error) {
    console.error("Error getting purchase:", error);
    return { 
      isSuccess: false, 
      message: "Failed to get purchase" 
    };
  }
}

/**
 * Get purchases by referrer ID
 * 
 * @param referrerId - ID of the referrer user
 * @returns Promise with ActionState containing array of purchases or error message
 */
export async function getPurchasesByReferrerAction(
  referrerId: string
): Promise<ActionState<SelectPurchase[]>> {
  try {
    // Get current session to verify authorization
    const { userId } = await auth();
    
    if (!userId) {
      return { 
        isSuccess: false, 
        message: "Unauthorized" 
      };
    }

    // Get current user to check role
    const currentUserResult = await getUserByClerkIdAction(userId);
    
    if (!currentUserResult.isSuccess) {
      return {
        isSuccess: false,
        message: "Failed to authenticate user"
      };
    }

    const currentUser = currentUserResult.data;
    
    // Verify authorization - admins can see anyone's purchases,
    // customers can only see their own purchases
    if (currentUser.role !== "admin" && currentUser.id !== referrerId) {
      return {
        isSuccess: false,
        message: "Unauthorized to view these purchases"
      };
    }
    
    // Get all purchases for the referrer
    const purchases = await db.query.purchases.findMany({
      where: eq(purchasesTable.referrerId, referrerId),
      orderBy: [sql`${purchasesTable.createdAt} desc`]
    });
    
    return {
      isSuccess: true,
      message: "Purchases retrieved successfully",
      data: purchases
    };
  } catch (error) {
    console.error("Error getting purchases by referrer:", error);
    return { 
      isSuccess: false, 
      message: "Failed to get purchases" 
    };
  }
}

/**
 * Get all pending purchases for review by admins
 * 
 * @returns Promise with ActionState containing array of pending purchases
 */
export async function getPendingPurchasesAction(): Promise<ActionState<SelectPurchase[]>> {
  try {
    // Get current session to verify authorization
    const { userId } = await auth();
    
    if (!userId) {
      return { 
        isSuccess: false, 
        message: "Unauthorized" 
      };
    }

    // Get current user to check role
    const currentUserResult = await getUserByClerkIdAction(userId);
    
    if (!currentUserResult.isSuccess || currentUserResult.data.role !== "admin") {
      return {
        isSuccess: false,
        message: "Only admins can view pending purchases"
      };
    }
    
    // Get all pending purchases
    const purchases = await db.query.purchases.findMany({
      where: eq(purchasesTable.status, "pending"),
      orderBy: [sql`${purchasesTable.createdAt} asc`],
      with: {
        referrer: true,
        customer: true
      }
    });
    
    return {
      isSuccess: true,
      message: "Pending purchases retrieved successfully",
      data: purchases
    };
  } catch (error) {
    console.error("Error getting pending purchases:", error);
    return { 
      isSuccess: false, 
      message: "Failed to get pending purchases" 
    };
  }
}

/**
 * Update a purchase's status (admin only)
 * 
 * @param id - Purchase ID to update
 * @param status - New status to set
 * @returns Promise with ActionState containing the updated purchase
 */
export async function updatePurchaseStatusAction(
  id: string,
  status: "pending" | "completed" | "cancelled"
): Promise<ActionState<SelectPurchase>> {
  try {
    // Get current session to verify authorization
    const { userId } = await auth();
    
    if (!userId) {
      return { 
        isSuccess: false, 
        message: "Unauthorized" 
      };
    }

    // Get current user to check role
    const currentUserResult = await getUserByClerkIdAction(userId);
    
    if (!currentUserResult.isSuccess || currentUserResult.data.role !== "admin") {
      return {
        isSuccess: false,
        message: "Only admins can update purchase status"
      };
    }
    
    // Update the purchase status
    const [updatedPurchase] = await db
      .update(purchasesTable)
      .set({
        status,
        updatedAt: new Date()
      })
      .where(eq(purchasesTable.id, id))
      .returning();
      
    if (!updatedPurchase) {
      return {
        isSuccess: false,
        message: "Purchase not found"
      };
    }
    
    return {
      isSuccess: true,
      message: `Purchase status updated to ${status}`,
      data: updatedPurchase
    };
  } catch (error) {
    console.error("Error updating purchase status:", error);
    return { 
      isSuccess: false, 
      message: "Failed to update purchase status" 
    };
  }
}

/**
 * Get purchase statistics for the admin dashboard
 * 
 * @returns Promise with ActionState containing purchase statistics
 */
export async function getPurchaseStatsAction(): Promise<
  ActionState<{
    totalPurchases: number;
    totalAmount: number;
    conversionRate: number;
    pendingPurchases: number;
  }>
> {
  try {
    // Get current session to verify authorization
    const { userId } = await auth();
    
    if (!userId) {
      return { 
        isSuccess: false, 
        message: "Unauthorized" 
      };
    }

    // Get current user to check role
    const currentUserResult = await getUserByClerkIdAction(userId);
    
    if (!currentUserResult.isSuccess || currentUserResult.data.role !== "admin") {
      return {
        isSuccess: false,
        message: "Only admins can view purchase statistics"
      };
    }
    
    // Get total number of purchases
    const totalPurchasesResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(purchasesTable);
    
    const totalPurchases = totalPurchasesResult[0]?.count || 0;
    
    // Get total purchase amount
    const totalAmountResult = await db
      .select({ sum: sql<string>`sum(${purchasesTable.amount})` })
      .from(purchasesTable)
      .where(eq(purchasesTable.status, "completed"));
    
    const totalAmount = parseFloat(totalAmountResult[0]?.sum || "0");
    
    // Get total number of customers (for conversion rate)
    const totalCustomersResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(usersTable)
      .where(eq(usersTable.role, "customer"));
    
    const totalCustomers = totalCustomersResult[0]?.count || 0;
    
    // Get total number of pending purchases
    const pendingPurchasesResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(purchasesTable)
      .where(eq(purchasesTable.status, "pending"));
    
    const pendingPurchases = pendingPurchasesResult[0]?.count || 0;
    
    // Calculate conversion rate
    const conversionRate = totalCustomers > 0
      ? (totalPurchases / totalCustomers) * 100
      : 0;
    
    return {
      isSuccess: true,
      message: "Purchase statistics retrieved successfully",
      data: {
        totalPurchases,
        totalAmount,
        conversionRate,
        pendingPurchases
      }
    };
  } catch (error) {
    console.error("Error getting purchase statistics:", error);
    return { 
      isSuccess: false, 
      message: "Failed to get purchase statistics" 
    };
  }
}