"use server"

/**
 * Server actions for notification management in the Tell a Friend application
 * 
 * This file contains functions for creating, retrieving, and managing in-app
 * notifications for users (separate from email/SMS notifications).
 */

import { db } from "@/db/db"
import { 
  InsertNotification, 
  SelectNotification, 
  notificationsTable,
  notificationTypeEnum,
  notificationStatusEnum
} from "@/db/schema/notifications-schema"
import { usersTable } from "@/db/schema/users-schema"
import { ActionState } from "@/types"
import { auth } from "@clerk/nextjs/server"
import { and, eq, sql } from "drizzle-orm"
import { getUserByClerkIdAction } from "./users-actions"

/**
 * Create a new notification in the database
 * 
 * @param data - Notification data to insert
 * @returns Promise with ActionState containing the created notification or error message
 */
export async function createNotificationAction(
  data: InsertNotification
): Promise<ActionState<SelectNotification>> {
  try {
    // Validate the notification data
    if (!data.userId || !data.type || !data.title || !data.message) {
      return {
        isSuccess: false,
        message: "Missing required notification information"
      };
    }

    // Insert the notification and return the created record
    const [newNotification] = await db
      .insert(notificationsTable)
      .values(data)
      .returning();

    return {
      isSuccess: true,
      message: "Notification created successfully",
      data: newNotification
    };
  } catch (error) {
    console.error("Error creating notification:", error);
    return { 
      isSuccess: false, 
      message: error instanceof Error ? error.message : "Failed to create notification" 
    };
  }
}

/**
 * Get notifications for a specific user
 * 
 * @param userId - ID of the user to get notifications for
 * @param limit - Optional limit of notifications to return (default: 20)
 * @param includeRead - Whether to include read notifications (default: false)
 * @returns Promise with ActionState containing array of notifications or error message
 */
export async function getUserNotificationsAction(
  userId: string,
  limit: number = 20,
  includeRead: boolean = false
): Promise<ActionState<SelectNotification[]>> {
  try {
    // Get current session to verify authorization
    const { userId: currentClerkUserId } = await auth();
    
    if (!currentClerkUserId) {
      return { 
        isSuccess: false, 
        message: "Unauthorized" 
      };
    }

    // Get current user to check role
    const currentUserResult = await getUserByClerkIdAction(currentClerkUserId);
    
    if (!currentUserResult.isSuccess) {
      return {
        isSuccess: false,
        message: "Failed to authenticate user"
      };
    }

    const currentUser = currentUserResult.data;
    
    // Verify authorization - admins can see anyone's notifications,
    // regular users can only see their own
    if (currentUser.role !== "admin" && currentUser.id !== userId) {
      return {
        isSuccess: false,
        message: "Unauthorized to view these notifications"
      };
    }
    
    // Build the query
    let notifications;
    if (includeRead) {
      notifications = await db.query.notifications.findMany({
        where: eq(notificationsTable.userId, userId),
        orderBy: sql`${notificationsTable.createdAt} desc`,
        limit
      });
    } else {
      notifications = await db.query.notifications.findMany({
        where: and(
          eq(notificationsTable.userId, userId),
          eq(notificationsTable.status, "pending")
        ),
        orderBy: sql`${notificationsTable.createdAt} desc`,
        limit
      });
    }
    
    return {
      isSuccess: true,
      message: "Notifications retrieved successfully",
      data: notifications
    };
  } catch (error) {
    console.error("Error getting user notifications:", error);
    return { 
      isSuccess: false, 
      message: "Failed to get notifications" 
    };
  }
}

/**
 * Mark a notification as read
 * 
 * @param id - Notification ID to mark as read
 * @returns Promise with ActionState containing the updated notification
 */
export async function markNotificationReadAction(
  id: string
): Promise<ActionState<SelectNotification>> {
  try {
    // Get current session to verify authorization
    const { userId } = await auth();
    
    if (!userId) {
      return { 
        isSuccess: false, 
        message: "Unauthorized" 
      };
    }

    // Get current user to check authorization
    const currentUserResult = await getUserByClerkIdAction(userId);
    
    if (!currentUserResult.isSuccess) {
      return {
        isSuccess: false,
        message: "Failed to authenticate user"
      };
    }

    const currentUser = currentUserResult.data;
    
    // Get the notification to check ownership
    const notification = await db.query.notifications.findFirst({
      where: eq(notificationsTable.id, id)
    });
    
    if (!notification) {
      return {
        isSuccess: false,
        message: "Notification not found"
      };
    }
    
    // Verify authorization - admins can mark any notification as read,
    // regular users can only mark their own
    if (currentUser.role !== "admin" && currentUser.id !== notification.userId) {
      return {
        isSuccess: false,
        message: "Unauthorized to modify this notification"
      };
    }
    
    // Update the notification status
    const [updatedNotification] = await db
      .update(notificationsTable)
      .set({
        status: "read",
        updatedAt: new Date()
      })
      .where(eq(notificationsTable.id, id))
      .returning();
      
    return {
      isSuccess: true,
      message: "Notification marked as read",
      data: updatedNotification
    };
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return { 
      isSuccess: false, 
      message: "Failed to mark notification as read" 
    };
  }
}

/**
 * Mark all notifications for a user as read
 * 
 * @param userId - ID of the user whose notifications to mark as read
 * @returns Promise with ActionState indicating success/failure
 */
export async function markAllNotificationsReadAction(
  userId: string
): Promise<ActionState<void>> {
  try {
    // Get current session to verify authorization
    const { userId: currentClerkUserId } = await auth();
    
    if (!currentClerkUserId) {
      return { 
        isSuccess: false, 
        message: "Unauthorized" 
      };
    }

    // Get current user to check authorization
    const currentUserResult = await getUserByClerkIdAction(currentClerkUserId);
    
    if (!currentUserResult.isSuccess) {
      return {
        isSuccess: false,
        message: "Failed to authenticate user"
      };
    }

    const currentUser = currentUserResult.data;
    
    // Verify authorization - admins can mark any user's notifications as read,
    // regular users can only mark their own
    if (currentUser.role !== "admin" && currentUser.id !== userId) {
      return {
        isSuccess: false,
        message: "Unauthorized to modify these notifications"
      };
    }
    
    // Update all unread notifications for the user
    await db
      .update(notificationsTable)
      .set({
        status: "read",
        updatedAt: new Date()
      })
      .where(
        and(
          eq(notificationsTable.userId, userId),
          eq(notificationsTable.status, "pending")
        )
      );
      
    return {
      isSuccess: true,
      message: "All notifications marked as read",
      data: undefined
    };
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return { 
      isSuccess: false, 
      message: "Failed to mark notifications as read" 
    };
  }
}

/**
 * Delete a notification
 * 
 * @param id - Notification ID to delete
 * @returns Promise with ActionState indicating success/failure
 */
export async function deleteNotificationAction(
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

    // Get current user to check authorization
    const currentUserResult = await getUserByClerkIdAction(userId);
    
    if (!currentUserResult.isSuccess) {
      return {
        isSuccess: false,
        message: "Failed to authenticate user"
      };
    }

    const currentUser = currentUserResult.data;
    
    // Get the notification to check ownership
    const notification = await db.query.notifications.findFirst({
      where: eq(notificationsTable.id, id)
    });
    
    if (!notification) {
      return {
        isSuccess: false,
        message: "Notification not found"
      };
    }
    
    // Verify authorization - admins can delete any notification,
    // regular users can only delete their own
    if (currentUser.role !== "admin" && currentUser.id !== notification.userId) {
      return {
        isSuccess: false,
        message: "Unauthorized to delete this notification"
      };
    }
    
    // Delete the notification
    await db
      .delete(notificationsTable)
      .where(eq(notificationsTable.id, id));
      
    return {
      isSuccess: true,
      message: "Notification deleted successfully",
      data: undefined
    };
  } catch (error) {
    console.error("Error deleting notification:", error);
    return { 
      isSuccess: false, 
      message: "Failed to delete notification" 
    };
  }
}