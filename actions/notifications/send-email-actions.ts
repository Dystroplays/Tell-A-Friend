"use server"

/**
 * Server actions for sending email notifications via SendGrid
 * 
 * This file contains functions for sending email messages to users
 * for various notification purposes like sign-up confirmations, referral code usage,
 * and reward approvals.
 */

import { sgMail } from "@/lib/sendgrid"
import { ActionState } from "@/types"

/**
 * Validates an email address to ensure it's in a proper format
 * 
 * @param email - The email address to validate
 * @returns Boolean indicating if the email is valid
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Sends an email message to a specified address
 * 
 * @param to - The recipient's email address
 * @param subject - The email subject
 * @param text - The plain text content
 * @param html - The HTML content (optional)
 * @returns Promise with ActionState indicating success/failure and message details
 */
export async function sendEmailAction(
  to: string,
  subject: string,
  text: string,
  html?: string
): Promise<ActionState<void>> {
  try {
    // Validate inputs
    if (!to || !subject || !text) {
      return {
        isSuccess: false,
        message: "Email address, subject, and content are required"
      };
    }

    // Validate email
    if (!isValidEmail(to)) {
      return {
        isSuccess: false,
        message: "Invalid email address format"
      };
    }

    const fromEmail = process.env.SENDGRID_FROM_EMAIL;
    if (!fromEmail) {
      return {
        isSuccess: false,
        message: "Sender email not configured"
      };
    }

    // Prepare email data
    const msg = {
      to,
      from: fromEmail,
      subject,
      text,
      html: html || text // Use HTML if provided, otherwise use plain text
    };

    // Send email via SendGrid
    await sgMail.send(msg);

    return {
      isSuccess: true,
      message: "Email sent successfully",
      data: undefined
    };
  } catch (error) {
    console.error("Error sending email:", error);
    return {
      isSuccess: false,
      message: error instanceof Error ? error.message : "Failed to send email"
    };
  }
}

/**
 * Sends a welcome email to a new referrer
 * 
 * @param email - Referrer's email address
 * @param name - Referrer's name
 * @param referralCode - Referrer's unique code
 * @returns Promise with ActionState indicating success/failure
 */
export async function sendWelcomeEmailAction(
  email: string,
  name: string,
  referralCode: string
): Promise<ActionState<void>> {
  try {
    const subject = "Welcome to Tell a Friend Referral Program";
    
    const text = `Hi ${name},\n\nWelcome to Tell a Friend! You're all set to start referring friends and earning rewards. Your unique referral code is: ${referralCode}\n\nStart sharing your code and earn rewards for each successful referral.\n\nThanks for joining!`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #00A86B;">Welcome to Tell a Friend!</h2>
        <p>Hi ${name},</p>
        <p>You're all set to start referring friends and earning rewards.</p>
        <p>Your unique referral code is: <strong style="background-color: #F5F5F5; padding: 5px 10px; border-radius: 4px;">${referralCode}</strong></p>
        <p>Start sharing your code and earn rewards for each successful referral.</p>
        <p>Thanks for joining!</p>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #888; font-size:
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #888; font-size: 12px;">
          <p>This email was sent from Tell a Friend Referral Program.</p>
        </div>
      </div>
    `;
    
    return await sendEmailAction(email, subject, text, html);
  } catch (error) {
    console.error("Error sending welcome email:", error);
    return {
      isSuccess: false,
      message: "Failed to send welcome email"
    };
  }
}

/**
 * Notifies a referrer via email that their referral code was used
 * 
 * @param email - Referrer's email address
 * @param name - Referrer's name
 * @param friendName - Name of the friend who used the code
 * @returns Promise with ActionState indicating success/failure
 */
export async function notifyReferralUsedEmailAction(
  email: string,
  name: string,
  friendName: string
): Promise<ActionState<void>> {
  try {
    const subject = "Your Referral Code Was Used!";
    
    const text = `Hi ${name},\n\nGood news! ${friendName} just used your referral code. You'll receive your reward once the service is completed and verified.\n\nCheck your dashboard for more details.`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #00A86B;">Your Referral Code Was Used!</h2>
        <p>Hi ${name},</p>
        <p>Good news! <strong>${friendName}</strong> just used your referral code.</p>
        <p>You'll receive your reward once the service is completed and verified.</p>
        <p>Check your dashboard for more details.</p>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #888; font-size: 12px;">
          <p>This email was sent from Tell a Friend Referral Program.</p>
        </div>
      </div>
    `;
    
    return await sendEmailAction(email, subject, text, html);
  } catch (error) {
    console.error("Error sending referral notification email:", error);
    return {
      isSuccess: false,
      message: "Failed to send referral notification email"
    };
  }
}

/**
 * Notifies a referrer via email that their reward has been approved
 * 
 * @param email - Referrer's email address
 * @param name - Referrer's name
 * @param rewardType - Type of reward (cash, discount, credit)
 * @param rewardValue - Value of the reward
 * @returns Promise with ActionState indicating success/failure
 */
export async function notifyRewardApprovedEmailAction(
  email: string,
  name: string,
  rewardType: string,
  rewardValue: number
): Promise<ActionState<void>> {
  try {
    const subject = "Your Referral Reward Has Been Approved!";
    
    const text = `Hi ${name},\n\nCongratulations! Your referral reward of ${rewardValue} ${rewardType} has been approved. Check your dashboard for details on how to claim your reward.`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #00A86B;">Your Referral Reward Is Approved!</h2>
        <p>Hi ${name},</p>
        <p>Congratulations! Your referral reward has been approved:</p>
        <p style="font-size: 18px; background-color: #F5F5F5; padding: 10px; border-radius: 4px; text-align: center;">
          <strong>${rewardValue} ${rewardType}</strong>
        </p>
        <p>Check your dashboard for details on how to claim your reward.</p>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #888; font-size: 12px;">
          <p>This email was sent from Tell a Friend Referral Program.</p>
        </div>
      </div>
    `;
    
    return await sendEmailAction(email, subject, text, html);
  } catch (error) {
    console.error("Error sending reward approval email:", error);
    return {
      isSuccess: false,
      message: "Failed to send reward approval email"
    };
  }
}

/**
 * Sends an email notification to admins about a new referral
 * 
 * @param adminEmail - Admin's email address
 * @param referrerName - Name of the referrer
 * @param friendName - Name of the friend who was referred
 * @returns Promise with ActionState indicating success/failure
 */
export async function notifyAdminNewReferralAction(
  adminEmail: string,
  referrerName: string,
  friendName: string
): Promise<ActionState<void>> {
  try {
    const subject = "New Referral Alert";
    
    const text = `New Referral Alert\n\n${referrerName} has referred ${friendName}. A new purchase has been made using a referral code and requires your review.`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #00A86B;">New Referral Alert</h2>
        <p><strong>${referrerName}</strong> has referred <strong>${friendName}</strong>.</p>
        <p>A new purchase has been made using a referral code and requires your review.</p>
        <p>Please log in to the admin dashboard to review and approve the reward.</p>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #888; font-size: 12px;">
          <p>This email was sent from Tell a Friend Referral Program.</p>
        </div>
      </div>
    `;
    
    return await sendEmailAction(adminEmail, subject, text, html);
  } catch (error) {
    console.error("Error sending admin notification email:", error);
    return {
      isSuccess: false,
      message: "Failed to send admin notification email"
    };
  }
}