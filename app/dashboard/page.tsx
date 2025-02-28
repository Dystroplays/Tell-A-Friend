"use server"

/**
 * Customer Dashboard Page
 *
 * This page serves as the main dashboard for customers (referrers) in the Tell a Friend application.
 * It displays referral statistics and provides tools for sharing referral codes.
 *
 * Features:
 * - Role-based access control (customer only)
 * - Display of referral statistics (sent, successful, rewards)
 * - Referral code sharing tools
 *
 * @module app/dashboard/page
 */

import { checkUserRole } from "@/lib/auth-utils"
import { getUserByClerkIdAction } from "@/actions/db/users-actions"
import { getRewardsByReferrerAction } from "@/actions/db/rewards-actions"
import { getPurchasesByReferrerAction } from "@/actions/db/purchases-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ReferralStats from "./_components/referral-stats"
import ShareReferral from "./_components/share-referral"
import { formatReferralCode } from "@/lib/referral-utils"

export default async function CustomerDashboardPage() {
  // Check if user has customer role, redirects to unauthorized if not
  const clerkUserId = await checkUserRole(["customer"], "/unauthorized")

  // Get the user's database record
  const { data: currentUser } = await getUserByClerkIdAction(clerkUserId)

  if (!currentUser) {
    // This should not happen since checkUserRole already verified the user exists
    // but we handle it just in case
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-2xl font-bold">Error loading customer dashboard</h1>
        <p>Unable to retrieve user information. Please try again later.</p>
      </div>
    )
  }

  // Get purchases data for this referrer
  const { data: purchases = [] } = await getPurchasesByReferrerAction(
    currentUser.id
  )

  // Get rewards data for this referrer
  const { data: rewards = [] } = await getRewardsByReferrerAction(
    currentUser.id
  )

  // Calculate statistics
  const totalReferrals = purchases.length
  const successfulReferrals = purchases.filter(
    p => p.status === "completed"
  ).length
  const pendingReferrals = purchases.filter(p => p.status === "pending").length
  const conversionRate =
    totalReferrals > 0
      ? ((successfulReferrals / totalReferrals) * 100).toFixed(1)
      : "0"

  // Calculate reward statistics
  const totalRewards = rewards.length
  const approvedRewards = rewards.filter(r => r.status === "approved").length
  const pendingRewards = rewards.filter(r => r.status === "pending").length
  const rejectedRewards = rewards.filter(r => r.status === "rejected").length

  // Format the referral code for display
  const formattedReferralCode = formatReferralCode(
    currentUser.referralCode || ""
  )

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-tell-a-friend-green mb-6 text-3xl font-bold">
        Your Referral Dashboard
      </h1>

      <div className="mb-8 grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Your Referral Code
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formattedReferralCode}</div>
            <p className="text-muted-foreground text-xs">Share with friends</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Referrals Sent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalReferrals}</div>
            <p className="text-muted-foreground text-xs">
              {successfulReferrals} successful ({conversionRate}%)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Rewards</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedRewards}</div>
            <p className="text-muted-foreground text-xs">
              {pendingRewards} pending / {rejectedRewards} rejected
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Earnings Potential
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(approvedRewards * 25).toFixed(2)}
            </div>
            <p className="text-muted-foreground text-xs">$25 per referral</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="share" className="w-full">
        <TabsList>
          <TabsTrigger value="share">Share Referral</TabsTrigger>
          <TabsTrigger value="stats">Detailed Stats</TabsTrigger>
          <TabsTrigger value="rewards">My Rewards</TabsTrigger>
        </TabsList>

        <TabsContent value="share" className="mt-6">
          <ShareReferral
            referralCode={currentUser.referralCode || ""}
            name={currentUser.name}
          />
        </TabsContent>

        <TabsContent value="stats" className="mt-6">
          <ReferralStats purchases={purchases} rewards={rewards} />
        </TabsContent>

        <TabsContent value="rewards" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>My Rewards</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Your rewards history will be implemented in a future version.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
