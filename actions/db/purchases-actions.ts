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
import { createRewardAction } from "./rewards-actions"
import { v4 as uuidv4 } from "uuid"

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

    // Validate that the referrer exists
    const referrerCheck = await db.query.users.findFirst({
      where: eq(usersTable.id, data.referrerId)
    });

    if (!referrerCheck) {
      return {
        isSuccess: false,
        message: "Referrer not found"
      };
    }

    // Validate that the customer exists
    const customerCheck = await db.query.users.findFirst({
      where: eq(usersTable.id, data.customerId)
    });

    if (!customerCheck) {
      return {
        isSuccess: false,
        message: "Customer not found"
      };
    }

    // Prevent self-referrals
    if (data.referrerId === data.customerId) {
      return {
        isSuccess: false,
        message: "Self-referrals are not allowed"
      };
    }

    // Insert the purchase and return the created record
    const [newPurchase] = await db
      .insert(purchasesTable)
      .values(data)
      .returning();

    // Automatically create a pending reward for this purchase
    try {
      // Default reward value - in a real application, this might be configurable or percentage-based
      const rewardValue = 25.00; // $25 reward

      await createRewardAction({
        id: uuidv4(),
        purchaseId: newPurchase.id,
        referrerId: data.referrerId,
        rewardType: "cash", // Default to cash rewards
        rewardValue: rewardValue.toString(),
        status: "pending" // All rewards start as pending until approved
      });
    } catch (rewardError) {
      console.error("Error creating reward for purchase:", rewardError);
      // We don't fail the entire purchase if reward creation fails
      // But in a production app, you might want to implement retry logic
    }

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
 * Get purchases by customer ID
 * 
 * @param customerId - ID of the customer user
 * @returns Promise with ActionState containing array of purchases or error message
 */
export async function getPurchasesByCustomerAction(
  customerId: string
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
    if (currentUser.role !== "admin" && currentUser.id !== customerId) {
      return {
        isSuccess: false,
        message: "Unauthorized to view these purchases"
      };
    }
    
    // Get all purchases for the customer
    const purchases = await db.query.purchases.findMany({
      where: eq(purchasesTable.customerId, customerId),
      orderBy: [sql`${purchasesTable.createdAt} desc`]
    });
    
    return {
      isSuccess: true,
      message: "Purchases retrieved successfully",
      data: purchases
    };
  } catch (error) {
    console.error("Error getting purchases by customer:", error);
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
export async function getPurchaseStatsAction(): Promise<ActionState<{
  totalPurchases: number;
  totalAmount: number;
  conversionRate: number;
  pendingPurchases: number;
}>> {
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

/**
 * Validate a referral code and create a purchase
 * 
 * @param referralCode - Referral code to validate
 * @param customerId - ID of the customer making the purchase
 * @param amount - Purchase amount
 * @param description - Optional purchase description
 * @returns Promise with ActionState containing the created purchase
 */
export async function createPurchaseWithReferralAction(
  referralCode: string,
  customerId: string,
  amount: number,
  description?: string
): Promise<ActionState<SelectPurchase>> {
  try {
    // Validate the referral code
    const referrerResult = await db.query.users.findFirst({
      where: eq(usersTable.referralCode, referralCode)
    });
    
    if (!referrerResult) {
      return {
        isSuccess: false,
        message: "Invalid referral code"
      };
    }
    
    // Create the purchase
    return await createPurchaseAction({
      referrerId: referrerResult.id,
      customerId,
      amount: amount.toString(),
      description,
      status: "pending" // Start as pending until admin approves
    });
    
  } catch (error) {
    console.error("Error creating purchase with referral:", error);
    return { 
      isSuccess: false, 
      message: "Failed to create purchase with referral" 
    };
  }
}