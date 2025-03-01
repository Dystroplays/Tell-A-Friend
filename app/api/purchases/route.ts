/**
 * API route handler for purchases with referral codes
 *
 * This endpoint allows creating purchases through HTTP POST requests,
 * validates referral codes, and associates purchases with referrers.
 * It can be called from Stripe webhooks or directly from the application.
 */

import { createPurchaseAction } from "@/actions/db/purchases-actions"
import { createRewardAction } from "@/actions/db/rewards-actions"
import { getUserByIdAction } from "@/actions/db/users-actions"
import { validatePurchaseAction } from "@/actions/fraud/fraud-detection-actions"
import {
  sendReferralUsedNotificationAction,
  sendAdminReferralNotificationAction
} from "@/actions/notifications/send-notification-action"
import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"

/**
 * Configuration for IP address checking
 */
export const runtime = "nodejs"

/**
 * POST handler for purchases with referral codes
 * This endpoint can be used for:
 * 1. Direct purchase creation from within the app
 * 2. Webhook integration with payment providers
 *
 * @param request The incoming HTTP request
 * @returns JSON response with success/error information
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Get client IP address for fraud prevention
    const ipAddress = request.headers.get("x-forwarded-for") || "unknown"

    // Parse the request body
    const body = await request.json()
    const { referralCode, amount, customerName, customerEmail, description } =
      body

    // Basic input validation
    if (!referralCode || !amount || amount <= 0 || !customerName) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Missing required fields: referralCode, amount, and customerName are required"
        },
        { status: 400 }
      )
    }

    // Find the referrer by the provided referral code
    const allUsersResult = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/users?referralCode=${referralCode}`,
      { method: "GET" }
    )

    const allUsers = await allUsersResult.json()

    if (!allUsers.success || !allUsers.data || allUsers.data.length === 0) {
      return NextResponse.json(
        { success: false, message: "Invalid referral code" },
        { status: 400 }
      )
    }

    const referrer = allUsers.data[0]

    // Get or create a customer user
    // For this endpoint, we'll create a temporary user for the customer if needed
    // In a real-world scenario, you might want to integrate this with your checkout process
    let customerId = body.customerId // If provided directly

    if (!customerId) {
      // Create a temporary customer record
      const customerUserResult = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/users`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: customerName,
            email: customerEmail || `guest-${uuidv4().slice(0, 8)}@example.com`,
            phone: body.customerPhone || "+11234567890",
            role: "customer"
          })
        }
      )

      const customerUser = await customerUserResult.json()

      if (!customerUser.success) {
        return NextResponse.json(
          { success: false, message: "Failed to create customer record" },
          { status: 500 }
        )
      }

      customerId = customerUser.data.id
    }

    // Run fraud checks before creating the purchase
    const fraudCheckResult = await validatePurchaseAction(
      referralCode,
      ipAddress,
      parseFloat(amount),
      customerEmail
    )

    // If fraud checks fail, return the error
    if (!fraudCheckResult.isSuccess) {
      return NextResponse.json(
        {
          success: false,
          message: `Fraud detection: ${fraudCheckResult.message}`
        },
        { status: 400 }
      )
    }

    // Create the purchase record
    const purchaseResult = await createPurchaseAction({
      id: uuidv4(),
      referrerId: referrer.id,
      customerId,
      amount: parseFloat(amount).toString(),
      status: "pending", // Purchases start as pending until verified by admin
      description: description || "Purchase with referral code",
      ipAddress
    })

    if (!purchaseResult.isSuccess) {
      return NextResponse.json(
        { success: false, message: purchaseResult.message },
        { status: 500 }
      )
    }

    // Create a pending reward for this purchase
    const rewardAmount = 25.0 // Fixed reward amount of $25
    const rewardResult = await createRewardAction({
      id: uuidv4(),
      purchaseId: purchaseResult.data.id,
      referrerId: referrer.id,
      rewardType: "cash", // Default to cash rewards
      rewardValue: rewardAmount.toString(),
      status: "pending" // All rewards start as pending until approved by an admin
    })

    if (!rewardResult.isSuccess) {
      console.error("Failed to create reward:", rewardResult.message)
      // Continue processing - we don't want to fail the purchase if reward creation fails
    }

    // Notify the referrer via the notification system
    try {
      await sendReferralUsedNotificationAction(
        referrer.id,
        referrer.name,
        referrer.email,
        referrer.phone,
        customerName
      )
    } catch (error) {
      console.error("Failed to send notifications:", error)
      // Continue processing - we don't want to fail the purchase if notifications fail
    }

    // Notify admins about the new referral
    try {
      // Get all admin users and notify them
      const adminUsersResult = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/users?role=admin`,
        { method: "GET" }
      )

      const adminUsers = await adminUsersResult.json()

      if (adminUsers.success && adminUsers.data && adminUsers.data.length > 0) {
        const adminIds = adminUsers.data.map(
          (admin: { id: string }) => admin.id
        )
        const adminEmails = adminUsers.data
          .map((admin: { email?: string }) => admin.email)
          .filter(Boolean)

        await sendAdminReferralNotificationAction(
          adminIds,
          adminEmails,
          referrer.name,
          customerName
        )
      }
    } catch (error) {
      console.error("Failed to notify admins:", error)
      // Continue processing - we don't want to fail the purchase if admin notifications fail
    }

    // Return success response with the created purchase
    return NextResponse.json({
      success: true,
      message: "Purchase created successfully",
      data: {
        purchase: purchaseResult.data,
        reward: rewardResult.isSuccess ? rewardResult.data : null
      }
    })
  } catch (error) {
    console.error("Error processing purchase:", error)

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to process purchase"
      },
      { status: 500 }
    )
  }
}
