"use server"

/**
 * Server actions for reward management in the Tell a Friend application
 * 
 * This file contains functions for creating, retrieving, and managing rewards
 * earned by users for successful referrals.
 */

import { db } from "@/db/db"
import { 
  InsertReward, 
  SelectReward, 
  rewardsTable,
  rewardStatusEnum,
  rewardTypeEnum
} from "@/db/schema/rewards-schema"
import { purchasesTable } from "@/db/schema/purchases-schema"
import { usersTable } from "@/db/schema/users-schema"
import { ActionState } from "@/types"
import { auth } from "@clerk/nextjs/server"
import { and, eq, sql } from "drizzle-orm"
import { getUserByClerkIdAction } from "./users-actions"

/**
 * Create a new reward in the database
 * 
 * @param data - Reward data to insert
 * @returns Promise with ActionState containing the created reward or error message
 */
export async function createRewardAction(
  data: InsertReward
): Promise<ActionState<SelectReward>> {
  try {
    // Insert the reward and return the created record
    const [newReward] = await db
      .insert(rewardsTable)
      .values(data)
      .returning();

    return {
      isSuccess: true,
      message: "Reward created successfully",
      data: newReward
    };
  } catch (error) {
    console.error("Error creating reward:", error);
    return { 
      isSuccess: false, 
      message: error instanceof Error ? error.message : "Failed to create reward" 
    };
  }
}

/**
 * Get a reward by its ID
 * 
 * @param id - Reward ID to find
 * @returns Promise with ActionState containing the reward or error message
 */
export async function getRewardByIdAction(
  id: string
): Promise<ActionState<SelectReward>> {
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
    
    // Find the requested reward
    const reward = await db.query.rewards.findFirst({
      where: eq(rewardsTable.id, id),
      with: {
        purchase: true
      }
    });
    
    if (!reward) {
      return { isSuccess: false, message: "Reward not found" };
    }
    
    // Verify authorization - admins can see any reward,
    // customers can only see their own rewards
    if (
      currentUser.role !== "admin" &&
      currentUser.id !== reward.referrerId
    ) {
      return {
        isSuccess: false,
        message: "Unauthorized to view this reward"
      };
    }
    
    return {
      isSuccess: true,
      message: "Reward retrieved successfully",
      data: reward
    };
  } catch (error) {
    console.error("Error getting reward:", error);
    return { 
      isSuccess: false, 
      message: "Failed to get reward" 
    };
  }
}

/**
 * Get rewards by referrer ID
 * 
 * @param referrerId - ID of the referrer user
 * @returns Promise with ActionState containing array of rewards or error message
 */
export async function getRewardsByReferrerAction(
  referrerId: string
): Promise<ActionState<SelectReward[]>> {
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
    
    // Verify authorization - admins can see anyone's rewards,
    // customers can only see their own rewards
    if (currentUser.role !== "admin" && currentUser.id !== referrerId) {
      return {
        isSuccess: false,
        message: "Unauthorized to view these rewards"
      };
    }
    
    // Get all rewards for the referrer
    const rewards = await db.query.rewards.findMany({
      where: eq(rewardsTable.referrerId, referrerId),
      orderBy: [sql`${rewardsTable.createdAt} desc`],
      with: {
        purchase: true
      }
    });
    
    return {
      isSuccess: true,
      message: "Rewards retrieved successfully",
      data: rewards
    };
  } catch (error) {
    console.error("Error getting rewards by referrer:", error);
    return { 
      isSuccess: false, 
      message: "Failed to get rewards" 
    };
  }
}

/**
 * Get all pending rewards for review by admins
 * 
 * @returns Promise with ActionState containing array of pending rewards
 */
export async function getPendingRewardsAction(): Promise<ActionState<SelectReward[]>> {
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
        message: "Only admins can view pending rewards"
      };
    }
    
    // Get all pending rewards
    const rewards = await db.query.rewards.findMany({
      where: eq(rewardsTable.status, "pending"),
      orderBy: [sql`${rewardsTable.createdAt} asc`],
      with: {
        purchase: {
          with: {
            customer: true
          }
        },
        referrer: true
      }
    });
    
    return {
      isSuccess: true,
      message: "Pending rewards retrieved successfully",
      data: rewards
    };
  } catch (error) {
    console.error("Error getting pending rewards:", error);
    return { 
      isSuccess: false, 
      message: "Failed to get pending rewards" 
    };
  }
}

/**
 * Update a reward's status (admin only)
 * 
 * @param id - Reward ID to update
 * @param status - New status to set
 * @param reviewNotes - Optional notes explaining approval/rejection
 * @returns Promise with ActionState containing the updated reward
 */
export async function updateRewardStatusAction(
  id: string,
  status: "approved" | "rejected",
  reviewNotes?: string
): Promise<ActionState<SelectReward>> {
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
        message: "Only admins can update reward status"
      };
    }
    // Update the reward status
    const [updatedReward] = await db
      .update(rewardsTable)
      .set({
        status,
        reviewedBy: currentUserResult.data.id,
        reviewNotes,
        updatedAt: new Date()
      })
      .where(eq(rewardsTable.id, id))
      .returning();
      
    if (!updatedReward) {
      return {
        isSuccess: false,
        message: "Reward not found"
      };
    }
    
    return {
      isSuccess: true,
      message: `Reward ${status}`,
      data: updatedReward
    };
  } catch (error) {
    console.error("Error updating reward status:", error);
    return { 
      isSuccess: false, 
      message: "Failed to update reward status" 
    };
  }
}

/**
 * Get reward statistics for the admin dashboard
 * 
 * @returns Promise with ActionState containing reward statistics
 */
export async function getRewardStatsAction(): Promise<
  ActionState<{
    totalRewardsAmount: number;
    approvedRewardsAmount: number;
    pendingRewardsAmount: number;
    rejectedRewardsAmount: number;
    rewardsByType: Record<string, number>;
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
        message: "Only admins can view reward statistics"
      };
    }
    
    // Get total rewards amount
    const totalRewardsResult = await db
      .select({ sum: sql<string>`sum(${rewardsTable.rewardValue})` })
      .from(rewardsTable);
    
    const totalRewardsAmount = parseFloat(totalRewardsResult[0]?.sum || "0");
    
    // Get approved rewards amount
    const approvedRewardsResult = await db
      .select({ sum: sql<string>`sum(${rewardsTable.rewardValue})` })
      .from(rewardsTable)
      .where(eq(rewardsTable.status, "approved"));
    
    const approvedRewardsAmount = parseFloat(approvedRewardsResult[0]?.sum || "0");
    
    // Get pending rewards amount
    const pendingRewardsResult = await db
      .select({ sum: sql<string>`sum(${rewardsTable.rewardValue})` })
      .from(rewardsTable)
      .where(eq(rewardsTable.status, "pending"));
    
    const pendingRewardsAmount = parseFloat(pendingRewardsResult[0]?.sum || "0");
    
    // Get rejected rewards amount
    const rejectedRewardsResult = await db
      .select({ sum: sql<string>`sum(${rewardsTable.rewardValue})` })
      .from(rewardsTable)
      .where(eq(rewardsTable.status, "rejected"));
    
    const rejectedRewardsAmount = parseFloat(rejectedRewardsResult[0]?.sum || "0");
    
    // Get rewards by type
    const rewardsByTypeResult = await db
      .select({
        type: rewardsTable.rewardType,
        sum: sql<string>`sum(${rewardsTable.rewardValue})`
      })
      .from(rewardsTable)
      .where(eq(rewardsTable.status, "approved"))
      .groupBy(rewardsTable.rewardType);
    
    const rewardsByType: Record<string, number> = {};
    
    rewardsByTypeResult.forEach(row => {
      rewardsByType[row.type] = parseFloat(row.sum || "0");
    });
    
    return {
      isSuccess: true,
      message: "Reward statistics retrieved successfully",
      data: {
        totalRewardsAmount,
        approvedRewardsAmount,
        pendingRewardsAmount,
        rejectedRewardsAmount,
        rewardsByType
      }
    };
  } catch (error) {
    console.error("Error getting reward statistics:", error);
    return { 
      isSuccess: false, 
      message: "Failed to get reward statistics" 
    };
  }
}