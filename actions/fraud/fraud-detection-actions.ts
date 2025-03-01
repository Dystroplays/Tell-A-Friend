"use server"

/**
 * Fraud Detection Server Actions
 * 
 * This file contains server actions for detecting potentially fraudulent
 * activity in the referral program, including IP tracking, email verification,
 * and minimum purchase amount validation.
 * 
 * These actions are used to protect the referral program from abuse and ensure
 * the integrity of the reward system.
 */

import { ActionState } from "@/types"
import { clerkClient } from "@clerk/nextjs/server"
import { db } from "@/db/db"
import { purchasesTable } from "@/db/schema/purchases-schema"
import { usersTable } from "@/db/schema/users-schema"
import { and, count, eq, sql } from "drizzle-orm"

/**
 * Configuration constants for fraud detection
 */
const FRAUD_DETECTION_CONFIG = {
  MIN_PURCHASE_AMOUNT: 50.0, // Minimum purchase amount in dollars
  MAX_PURCHASES_PER_IP: 5, // Maximum purchases allowed from a single IP address
  MAX_PURCHASES_PER_DAY: 10, // Maximum purchases allowed in a 24-hour period
  REQUIRE_EMAIL_VERIFICATION: true // Whether to require verified email for referrals
}

/**
 * Interface for fraud detection input parameters
 */
interface FraudDetectionParams {
  amount: number
  ipAddress: string
  customerId: string
  referrerId: string
  referralCode: string
}

/**
 * Fraud detection score result
 */
interface FraudScore {
  score: number
  flags: string[]
  isLikelyFraud: boolean
}

/**
 * Perform fraud detection checks on a purchase
 * 
 * This function runs several checks to detect potentially fraudulent activity:
 * 1. Verifies the purchase amount meets the minimum requirement
 * 2. Checks if the user's email is verified (via Clerk)
 * 3. Looks for suspicious activity based on IP address
 * 4. Checks for multiple purchases from the same IP in a short timeframe
 * 5. Ensures the customer and referrer are different people
 * 
 * @param params - Parameters for fraud detection
 * @returns Promise with ActionState containing fraud detection results
 */
export async function detectFraudAction(
  params: FraudDetectionParams
): Promise<ActionState<FraudScore>> {
  try {
    const { amount, ipAddress, customerId, referrerId, referralCode } = params
    
    // Initialize fraud score and flags
    let fraudScore = 0
    const flags: string[] = []
    
    // Check 1: Minimum purchase amount
    if (amount < FRAUD_DETECTION_CONFIG.MIN_PURCHASE_AMOUNT) {
      fraudScore += 30
      flags.push("Purchase amount below minimum threshold")
    }
    
    // Check 2: Email verification (only if we have customerId from Clerk)
    if (FRAUD_DETECTION_CONFIG.REQUIRE_EMAIL_VERIFICATION) {
      try {
        // Get customer from our database to get their clerkUserId
        const customer = await db.query.users.findFirst({
          where: eq(usersTable.id, customerId)
        })
        
        if (customer && customer.clerkUserId) {
          const clerk = await clerkClient()
          const clerkUser = await clerk.users.getUser(customer.clerkUserId)
          
          // Check if email is verified
          const primaryEmail = clerkUser.emailAddresses.find(
            email => email.id === clerkUser.primaryEmailAddressId
          )
          
          if (!primaryEmail || !primaryEmail.verification?.status || primaryEmail.verification.status !== "verified") {
            fraudScore += 40
            flags.push("Email not verified")
          }
        }
      } catch (error) {
        console.error("Error checking email verification:", error)
        // Continue with other checks, but flag that we couldn't verify email
        flags.push("Unable to verify email status")
      }
    }
    
    // Check 3: Self-referral (same person)
    if (customerId === referrerId) {
      fraudScore += 100
      flags.push("Self-referral detected")
    }
    
    // Check 4: IP address checks
    if (ipAddress) {
      // Check for multiple purchases from same IP
      const purchasesFromIP = await db
        .select({ count: count() })
        .from(purchasesTable)
        .where(eq(purchasesTable.ipAddress, ipAddress))
      
      const ipPurchaseCount = purchasesFromIP[0]?.count || 0
      
      if (ipPurchaseCount >= FRAUD_DETECTION_CONFIG.MAX_PURCHASES_PER_IP) {
        fraudScore += 50
        flags.push(`Excessive purchases from IP address: ${ipPurchaseCount}`)
      }
      
      // Check for recent purchases from same IP (last 24 hours)
      const recentPurchasesFromIP = await db
        .select({ count: count() })
        .from(purchasesTable)
        .where(
          and(
            eq(purchasesTable.ipAddress, ipAddress),
            sql`${purchasesTable.createdAt} > NOW() - INTERVAL '1 day'`
          )
        )
      
      const recentIPPurchaseCount = recentPurchasesFromIP[0]?.count || 0
      
      if (recentIPPurchaseCount >= FRAUD_DETECTION_CONFIG.MAX_PURCHASES_PER_DAY) {
        fraudScore += 70
        flags.push(`Too many purchases from IP in 24 hours: ${recentIPPurchaseCount}`)
      }
    } else {
      // Missing IP address is suspicious
      fraudScore += 20
      flags.push("Missing IP address")
    }
    
    // Determine if the transaction is likely fraudulent based on score
    // A score of 70 or higher is considered likely fraud
    const isLikelyFraud = fraudScore >= 70
    
    return {
      isSuccess: true,
      message: isLikelyFraud 
        ? "Potential fraud detected" 
        : "Fraud checks completed",
      data: {
        score: fraudScore,
        flags,
        isLikelyFraud
      }
    }
  } catch (error) {
    console.error("Error during fraud detection:", error)
    return {
      isSuccess: false,
      message: error instanceof Error ? error.message : "Failed to perform fraud detection"
    }
  }
}

/**
 * Validate a referral code format and existence
 * 
 * @param referralCode - The referral code to validate
 * @returns Promise with ActionState indicating if the code is valid
 */
export async function validateReferralCodeAction(
  referralCode: string
): Promise<ActionState<{ isValid: boolean; referrerId?: string }>> {
  try {
    if (!referralCode || referralCode.length !== 8) {
      return {
        isSuccess: true,
        message: "Invalid referral code format",
        data: { isValid: false }
      }
    }
    
    // Check if the referral code exists in the database
    const referrer = await db.query.users.findFirst({
      where: eq(usersTable.referralCode, referralCode)
    })
    
    if (!referrer) {
      return {
        isSuccess: true,
        message: "Referral code not found",
        data: { isValid: false }
      }
    }
    
    return {
      isSuccess: true,
      message: "Valid referral code",
      data: { isValid: true, referrerId: referrer.id }
    }
  } catch (error) {
    console.error("Error validating referral code:", error)
    return {
      isSuccess: false,
      message: "Failed to validate referral code"
    }
  }
}

/**
 * Validate a purchase for fraud prevention
 * 
 * This is a simplified wrapper around detectFraudAction that takes individual parameters
 * instead of requiring the caller to construct a FraudDetectionParams object.
 * 
 * @param referralCode - The referral code used for the purchase
 * @param ipAddress - The IP address of the customer
 * @param amount - The purchase amount
 * @param customerEmail - The customer's email address (optional)
 * @returns Promise with ActionState indicating if the purchase passes fraud checks
 */
export async function validatePurchaseAction(
  referralCode: string,
  ipAddress: string,
  amount: number,
  customerEmail?: string
): Promise<ActionState<{ isValid: boolean; fraudScore?: number }>> {
  try {
    // First validate the referral code
    const codeResult = await validateReferralCodeAction(referralCode)
    
    if (!codeResult.isSuccess || !codeResult.data.isValid) {
      return {
        isSuccess: false,
        message: "Invalid referral code"
      }
    }
    
    // Get a temporary customer ID if we don't have a real one yet
    const customerId = "temp-" + Date.now().toString()
    
    // Run fraud detection
    const fraudResult = await detectFraudAction({
      amount,
      ipAddress,
      customerId,
      referrerId: codeResult.data.referrerId || "",
      referralCode
    })
    
    if (!fraudResult.isSuccess) {
      return {
        isSuccess: false,
        message: fraudResult.message
      }
    }
    
    // If the fraud score is too high, reject the purchase
    if (fraudResult.data.isLikelyFraud) {
      return {
        isSuccess: false,
        message: `Purchase flagged as potentially fraudulent: ${fraudResult.data.flags.join(", ")}`
      }
    }
    
    return {
      isSuccess: true,
      message: "Purchase validated successfully",
      data: {
        isValid: true,
        fraudScore: fraudResult.data.score
      }
    }
  } catch (error) {
    console.error("Error validating purchase:", error)
    return {
      isSuccess: false,
      message: error instanceof Error ? error.message : "Failed to validate purchase"
    }
  }
}

/**
 * Get fraud statistics for the admin dashboard
 * 
 * This function retrieves statistics about potentially fraudulent activity
 * for display on the admin dashboard.
 * 
 * @returns Promise with ActionState containing fraud statistics
 */
export async function getFraudStatisticsAction(): Promise<ActionState<{
  flaggedTransactions: number;
  totalReviewed: number;
  averageFraudScore: number;
}>> {
  try {
    // For now, return mock data
    // In a real implementation, this would query the database for actual statistics
    return {
      isSuccess: true,
      message: "Fraud statistics retrieved successfully",
      data: {
        flaggedTransactions: 12,
        totalReviewed: 45,
        averageFraudScore: 62.5
      }
    }
  } catch (error) {
    console.error("Error retrieving fraud statistics:", error)
    return {
      isSuccess: false,
      message: "Failed to retrieve fraud statistics"
    }
  }
}

/**
 * Check if a purchase meets the minimum amount requirement
 * 
 * @param amount - The purchase amount to check
 * @returns Boolean indicating if the amount meets the minimum requirement
 */
export function meetsMinimumPurchaseAmount(amount: number): boolean {
  return amount >= FRAUD_DETECTION_CONFIG.MIN_PURCHASE_AMOUNT
}