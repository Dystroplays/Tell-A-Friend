"use server"

/**
 * Test Purchase Page
 *
 * This page provides a simple form for testing the referral purchase system.
 * It allows users to enter a referral code and simulate a purchase.
 */

import PurchaseForm from "@/components/referral/purchase-form"
import { auth } from "@clerk/nextjs/server"
import { getUserByClerkIdAction } from "@/actions/db/users-actions"

export default async function TestPurchasePage() {
  // Get the current user if they're logged in
  const { userId: clerkUserId } = await auth()
  let currentUser = null

  if (clerkUserId) {
    const userResult = await getUserByClerkIdAction(clerkUserId)
    if (userResult.isSuccess) {
      currentUser = userResult.data
    }
  }

  return (
    <div className="container mx-auto max-w-md py-10">
      <h1 className="text-tell-a-friend-green mb-6 text-center text-3xl font-bold">
        Test Referral Purchase
      </h1>

      <p className="text-muted-foreground mb-6 text-center">
        This page allows you to test the referral system by simulating a
        purchase with a referral code.
      </p>

      <PurchaseForm
        customerId={currentUser?.id}
        customerName={currentUser?.name}
        customerEmail={currentUser?.email}
      />

      <div className="text-muted-foreground mt-8 text-center text-sm">
        <p>
          Note: This is a test page for demonstration purposes. No actual
          payment processing occurs.
        </p>
      </div>
    </div>
  )
}
