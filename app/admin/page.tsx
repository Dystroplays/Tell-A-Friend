"use server"

/**
 * Admin Dashboard Page
 *
 * This page serves as the main admin dashboard for the Tell a Friend application.
 * It provides an overview of key metrics and access to user management functionality.
 *
 * Features:
 * - Role-based access control (admin only)
 * - Overview of key metrics (users, referrals, rewards)
 * - User management interface
 * - Reward approval interface
 * - Notification center
 */

import { checkUserRole } from "@/lib/auth-utils"
import { getUserByClerkIdAction } from "@/actions/db/users-actions"
import { getPendingRewardsAction } from "@/actions/db/rewards-actions"
import { getUserNotificationsAction } from "@/actions/db/notifications-actions"
import { getFraudStatisticsAction } from "@/actions/fraud/fraud-detection-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { auth } from "@clerk/nextjs/server"
import UserManagement from "./_components/user-management"
import RewardApproval from "./_components/reward-approval"
import AdminNotifications from "./_components/admin-notifications"
import FraudReview from "./_components/fraud-review"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function AdminDashboardPage() {
  // Check if user has admin role, redirects to unauthorized if not
  const clerkUserId = await checkUserRole(["admin"], "/unauthorized")

  // Get the user's database record
  const { data: currentUser } = await getUserByClerkIdAction(clerkUserId)

  if (!currentUser) {
    // This should not happen since checkUserRole already verified the user exists
    // but we handle it just in case
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-2xl font-bold">Error loading admin dashboard</h1>
        <p>Unable to retrieve user information. Please try again later.</p>
      </div>
    )
  }

  // Get counts for dashboard metrics
  const pendingRewardsResult = await getPendingRewardsAction()
  const pendingRewardsCount = pendingRewardsResult.isSuccess
    ? pendingRewardsResult.data.length
    : 0

  // Get fraud statistics
  const fraudStatsResult = await getFraudStatisticsAction()
  const flaggedTransactionsCount = fraudStatsResult.isSuccess
    ? fraudStatsResult.data.flaggedTransactions
    : 0

  // Get unread notifications count
  const notificationsResult = await getUserNotificationsAction(
    currentUser.id,
    100,
    false
  )
  const unreadNotificationsCount = notificationsResult.isSuccess
    ? notificationsResult.data.length
    : 0

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-tell-a-friend-green mb-6 text-3xl font-bold">
        Admin Dashboard
      </h1>

      <div className="mb-8 grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-muted-foreground text-xs">Users in the system</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Rewards
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingRewardsCount}</div>
            <p className="text-muted-foreground text-xs">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Flagged Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{flaggedTransactionsCount}</div>
            <p className="text-muted-foreground text-xs">
              Fraud detection alerts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {unreadNotificationsCount > 0 ? (
                <span className="flex items-center">
                  Notifications
                  <span className="bg-primary text-primary-foreground ml-2 inline-flex size-5 items-center justify-center rounded-full text-xs font-bold">
                    {unreadNotificationsCount}
                  </span>
                </span>
              ) : (
                "Notifications"
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unreadNotificationsCount}</div>
            <p className="text-muted-foreground text-xs">unread</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="rewards">
            Rewards
            {pendingRewardsCount > 0 && (
              <span className="bg-primary text-primary-foreground ml-2 inline-flex size-5 items-center justify-center rounded-full text-xs font-bold">
                {pendingRewardsCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="fraud">
            Fraud Prevention
            {flaggedTransactionsCount > 0 && (
              <span className="bg-primary text-primary-foreground ml-2 inline-flex size-5 items-center justify-center rounded-full text-xs font-bold">
                {flaggedTransactionsCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="notifications">
            Notifications
            {unreadNotificationsCount > 0 && (
              <span className="bg-primary text-primary-foreground ml-2 inline-flex size-5 items-center justify-center rounded-full text-xs font-bold">
                {unreadNotificationsCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-6">
          <UserManagement adminId={currentUser.id} />
        </TabsContent>

        <TabsContent value="rewards" className="mt-6">
          <RewardApproval />
        </TabsContent>

        <TabsContent value="fraud" className="mt-6">
          <FraudReview />
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <AdminNotifications adminId={currentUser.id} />
        </TabsContent>

        <TabsContent value="statistics" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>System Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                The statistics dashboard will be implemented in a future step.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
