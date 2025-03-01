"use server"

/**
 * Centralized notification system for the Tell a Friend application
 * 
 * This server action provides a unified interface for sending notifications
 * through multiple channels (email, SMS, in-app). It handles routing
 * notifications to the appropriate services and provides error handling.
 */

import { sendEmailAction } from "@/actions/notifications/send-email-actions"
import { sendSmsAction } from "@/actions/notifications/send-sms-actions"
import { createNotificationAction } from "@/actions/db/notifications-actions"
import { ActionState } from "@/types"
import { v4 as uuidv4 } from "uuid"

// Supported notification types
type NotificationType = "email" | "sms" | "in_app" | "all"

// Common parameters for all notification types
interface BaseNotificationParams {
  userId: string
  type: NotificationType
  title: string
  message: string
  data?: Record<string, any>
}

// Parameters specific to email notifications
interface EmailNotificationParams extends BaseNotificationParams {
  email: string
  html?: string
}

// Parameters specific to SMS notifications
interface SmsNotificationParams extends BaseNotificationParams {
  phoneNumber: string
}

// Union type for all possible notification parameters
type NotificationParams = 
  | EmailNotificationParams 
  | SmsNotificationParams 
  | BaseNotificationParams

/**
 * Send a notification through one or multiple channels
 * 
 * This action routes the notification to the appropriate service(s)
 * based on the specified type and handles any errors that occur.
 * 
 * @param params - The notification parameters
 * @returns Promise with ActionState indicating success/failure
 */
export async function sendNotificationAction(
  params: NotificationParams
): Promise<ActionState<void>> {
  try {
    // Validate common required parameters
    if (!params.userId || !params.type || !params.title || !params.message) {
      return {
        isSuccess: false,
        message: "Missing required notification parameters"
      };
    }

    // Track success/failure for each channel
    const results: { channel: string; success: boolean; message: string }[] = [];
    
    // Send email notification
    if (params.type === "email" || params.type === "all") {
      if ("email" in params) {
        const emailResult = await sendEmailAction(
          params.email,
          params.title,
          params.message,
          params.html
        );
        
        results.push({
          channel: "email",
          success: emailResult.isSuccess,
          message: emailResult.message
        });
      } else {
        results.push({
          channel: "email",
          success: false,
          message: "Email address not provided"
        });
      }
    }
    
    // Send SMS notification
    if (params.type === "sms" || params.type === "all") {
      if ("phoneNumber" in params) {
        const smsResult = await sendSmsAction(
          params.phoneNumber,
          params.message
        );
        
        results.push({
          channel: "sms",
          success: smsResult.isSuccess,
          message: smsResult.message
        });
      } else {
        results.push({
          channel: "sms",
          success: false,
          message: "Phone number not provided"
        });
      }
    }
    
    // Create in-app notification
    if (params.type === "in_app" || params.type === "all") {
      const inAppResult = await createNotificationAction({
        id: uuidv4(),
        userId: params.userId,
        type: "in_app",
        title: params.title,
        message: params.message,
        status: "pending",
        data: params.data
      });
      
      results.push({
        channel: "in_app",
        success: inAppResult.isSuccess,
        message: inAppResult.message
      });
    }
    
    // Check if at least one notification channel succeeded
    const hasSuccess = results.some(result => result.success);
    
    if (hasSuccess) {
      return {
        isSuccess: true,
        message: "Notification sent successfully through at least one channel",
        data: undefined
      };
    } else {
      // All channels failed
      return {
        isSuccess: false,
        message: "Failed to send notification through any channel: " + 
          results.map(r => `${r.channel}: ${r.message}`).join(", ")
      };
    }
  } catch (error) {
    console.error("Error sending notification:", error);
    return {
      isSuccess: false,
      message: error instanceof Error ? error.message : "Failed to send notification"
    };
  }
}

/**
 * Send a referral used notification to a referrer
 * 
 * Notifies a referrer that their referral code was used by a friend
 * through multiple channels based on available contact information.
 * 
 * @param referrerId - ID of the referrer user
 * @param referrerName - Name of the referrer
 * @param referrerEmail - Email of the referrer
 * @param referrerPhone - Phone number of the referrer
 * @param friendName - Name of the friend who used the code
 * @returns Promise with ActionState indicating success/failure
 */
export async function sendReferralUsedNotificationAction(
  referrerId: string,
  referrerName: string,
  referrerEmail: string | null,
  referrerPhone: string | null,
  friendName: string
): Promise<ActionState<void>> {
  try {
    const title = "Your referral code was used!";
    const message = `${friendName} just used your referral code. You'll receive your reward once the service is completed and verified.`;
    
    // Determine which channels to use based on available contact info
    let notificationType: NotificationType = "in_app"; // Always create in-app notification
    
    const params: any = {
      userId: referrerId,
      title,
      message,
      data: { friendName }
    };
    
    // Add email if available
    if (referrerEmail) {
      params.email = referrerEmail;
      notificationType = notificationType === "in_app" ? "email" : "all";
      
      // Add HTML version for email
      params.html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #00A86B;">Your Referral Code Was Used!</h2>
          <p>Hi ${referrerName},</p>
          <p>Good news! <strong>${friendName}</strong> just used your referral code.</p>
          <p>You'll receive your reward once the service is completed and verified.</p>
          <p>Check your dashboard for more details.</p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #888; font-size: 12px;">
            <p>This email was sent from Tell a Friend Referral Program.</p>
          </div>
        </div>
      `;
    }
    
    // Add phone if available
    if (referrerPhone) {
      params.phoneNumber = referrerPhone;
      notificationType = notificationType === "in_app" ? "sms" :
                        notificationType === "email" ? "all" : notificationType;
    }
    
    params.type = notificationType;
    
    // Send the notification
    return await sendNotificationAction(params);
  } catch (error) {
    console.error("Error sending referral used notification:", error);
    return {
      isSuccess: false,
      message: "Failed to send referral notification"
    };
  }
}

/**
 * Send a reward approved notification to a referrer
 * 
 * Notifies a referrer that their reward has been approved
 * through multiple channels based on available contact information.
 * 
 * @param referrerId - ID of the referrer user
 * @param referrerName - Name of the referrer
 * @param referrerEmail - Email of the referrer
 * @param referrerPhone - Phone number of the referrer
 * @param rewardType - Type of reward (cash, discount, credit)
 * @param rewardValue - Value of the reward
 * @returns Promise with ActionState indicating success/failure
 */
export async function sendRewardApprovedNotificationAction(
  referrerId: string,
  referrerName: string,
  referrerEmail: string | null,
  referrerPhone: string | null,
  rewardType: string,
  rewardValue: number
): Promise<ActionState<void>> {
  try {
    const title = "Your referral reward has been approved!";
    const message = `Congratulations! Your referral reward of $${rewardValue} ${rewardType} has been approved. Check your dashboard for details on how to claim your reward.`;
    
    // Determine which channels to use based on available contact info
    let notificationType: NotificationType = "in_app"; // Always create in-app notification
    
    const params: any = {
      userId: referrerId,
      title,
      message,
      data: { rewardType, rewardValue }
    };
    
    // Add email if available
    if (referrerEmail) {
      params.email = referrerEmail;
      notificationType = notificationType === "in_app" ? "email" : "all";
      
      // Add HTML version for email
      params.html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #00A86B;">Your Referral Reward Is Approved!</h2>
          <p>Hi ${referrerName},</p>
          <p>Congratulations! Your referral reward has been approved:</p>
          <p style="font-size: 18px; background-color: #F5F5F5; padding: 10px; border-radius: 4px; text-align: center;">
            <strong>$${rewardValue} ${rewardType}</strong>
          </p>
          <p>Check your dashboard for details on how to claim your reward.</p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #888; font-size: 12px;">
            <p>This email was sent from Tell a Friend Referral Program.</p>
          </div>
        </div>
      `;
    }
    
    // Add phone if available
    if (referrerPhone) {
      params.phoneNumber = referrerPhone;
      notificationType = notificationType === "in_app" ? "sms" :
                        notificationType === "email" ? "all" : notificationType;
    }
    
    params.type = notificationType;
    
    // Send the notification
    return await sendNotificationAction(params);
  } catch (error) {
    console.error("Error sending reward approved notification:", error);
    return {
      isSuccess: false,
      message: "Failed to send reward notification"
    };
  }
}

/**
 * Send a notification to admins about a new referral
 * 
 * Notifies administrators that a new referral has been made
 * and requires their review.
 * 
 * @param adminIds - Array of admin user IDs to notify
 * @param adminEmails - Array of admin email addresses
 * @param referrerName - Name of the referrer
 * @param friendName - Name of the friend who was referred
 * @returns Promise with ActionState indicating success/failure
 */
export async function sendAdminReferralNotificationAction(
  adminIds: string[],
  adminEmails: string[],
  referrerName: string,
  friendName: string
): Promise<ActionState<void>> {
  try {
    const title = "New Referral Alert";
    const message = `${referrerName} has referred ${friendName}. A new purchase has been made using a referral code and requires your review.`;
    
    // Create in-app notifications for all admins
    const notificationPromises = adminIds.map(adminId => 
      createNotificationAction({
        id: uuidv4(),
        userId: adminId,
        type: "in_app",
        title,
        message,
        status: "pending",
        data: { referrerName, friendName }
      })
    );
    
    // Send emails to all admin emails
    const emailPromises = adminEmails.map(email => 
      sendEmailAction(
        email,
        title,
        message,
        `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #00A86B;">New Referral Alert</h2>
            <p><strong>${referrerName}</strong> has referred <strong>${friendName}</strong>.</p>
            <p>A new purchase has been made using a referral code and requires your review.</p>
            <p>Please log in to the admin dashboard to review and approve the reward.</p>
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #888; font-size: 12px;">
              <p>This email was sent from Tell a Friend Referral Program.</p>
            </div>
          </div>
        `
      )
    );
    
    // Wait for all notifications to be sent
    await Promise.all([...notificationPromises, ...emailPromises]);
    
    return {
      isSuccess: true,
      message: "Admin notifications sent successfully",
      data: undefined
    };
  } catch (error) {
    console.error("Error sending admin notification:", error);
    return {
      isSuccess: false,
      message: "Failed to send admin notifications"
    };
  }
}