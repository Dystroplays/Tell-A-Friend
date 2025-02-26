"use server"

/**
 * Server actions for sending SMS notifications via Twilio
 * 
 * This file contains functions for sending SMS messages to users
 * for various notification purposes like sign-up links, referral code usage,
 * and reward approvals.
 */

import { twilioClient } from "@/lib/twilio"
import { ActionState } from "@/types"

/**
 * Validates a phone number to ensure it's in a proper format
 * 
 * @param phoneNumber - The phone number to validate
 * @returns Boolean indicating if the phone number is valid
 */
function isValidPhoneNumber(phoneNumber: string): boolean {
  // Basic validation - can be enhanced with more sophisticated validation
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phoneNumber);
}

/**
 * Sends an SMS message to a specified phone number
 * 
 * @param to - The recipient's phone number
 * @param body - The message content
 * @returns Promise with ActionState indicating success/failure and message details
 */
export async function sendSmsAction(
  to: string,
  body: string
): Promise<ActionState<void>> {
  try {
    // Validate inputs
    if (!to || !body) {
      return {
        isSuccess: false,
        message: "Phone number and message body are required"
      };
    }

    // Format phone number if needed (ensure E.164 format)
    const formattedPhoneNumber = to.startsWith('+') ? to : `+${to}`;
    
    // Validate phone number
    if (!isValidPhoneNumber(formattedPhoneNumber)) {
      return {
        isSuccess: false,
        message: "Invalid phone number format"
      };
    }

    // Check if Twilio client is available
    if (!twilioClient) {
      console.error("Twilio client not initialized");
      return {
        isSuccess: false,
        message: "SMS service not configured properly"
      };
    }

    // Send SMS via Twilio
    const message = await twilioClient.messages.create({
      body,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedPhoneNumber
    });

    console.log(`SMS sent with SID: ${message.sid}`);

    return {
      isSuccess: true,
      message: "SMS sent successfully",
      data: undefined
    };
  } catch (error) {
    console.error("Error sending SMS:", error);
    return {
      isSuccess: false,
      message: error instanceof Error ? error.message : "Failed to send SMS"
    };
  }
}

/**
 * Sends a sign-up link to a potential referrer via SMS
 * 
 * @param phoneNumber - Customer's phone number
 * @param technicianId - ID of the technician who completed the service
 * @returns Promise with ActionState indicating success/failure
 */
export async function sendSignupLinkAction(
  phoneNumber: string,
  technicianId: string
): Promise<ActionState<void>> {
  try {
    // Create the sign-up URL with technician ID
    const signupUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/signup?technicianId=${technicianId}`;
    
    // Create message body
    const messageBody = `Thank you for your service! Sign up for our referral program and earn rewards for referring friends: ${signupUrl}`;
    
    // Send the SMS
    return await sendSmsAction(phoneNumber, messageBody);
  } catch (error) {
    console.error("Error sending signup link:", error);
    return {
      isSuccess: false,
      message: "Failed to send signup link"
    };
  }
}

/**
 * Notifies a referrer that their referral code was used
 * 
 * @param phoneNumber - Referrer's phone number
 * @param friendName - Name of the friend who used the code
 * @returns Promise with ActionState indicating success/failure
 */
export async function notifyReferralUsedAction(
  phoneNumber: string,
  friendName: string
): Promise<ActionState<void>> {
  try {
    const messageBody = `Good news! ${friendName} just used your referral code. You'll receive your reward once the service is completed and verified.`;
    
    return await sendSmsAction(phoneNumber, messageBody);
  } catch (error) {
    console.error("Error sending referral notification:", error);
    return {
      isSuccess: false,
      message: "Failed to send referral notification"
    };
  }
}

/**
 * Notifies a referrer that their reward has been approved
 * 
 * @param phoneNumber - Referrer's phone number
 * @param rewardType - Type of reward (cash, discount, credit)
 * @param rewardValue - Value of the reward
 * @returns Promise with ActionState indicating success/failure
 */
export async function notifyRewardApprovedAction(
  phoneNumber: string,
  rewardType: string,
  rewardValue: number
): Promise<ActionState<void>> {
  try {
    const messageBody = `Congratulations! Your referral reward of ${rewardValue} ${rewardType} has been approved. Check your dashboard for details.`;
    
    return await sendSmsAction(phoneNumber, messageBody);
  } catch (error) {
    console.error("Error sending reward notification:", error);
    return {
      isSuccess: false,
      message: "Failed to send reward notification"
    };
  }
}