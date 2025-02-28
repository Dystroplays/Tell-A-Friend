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
 *
 * @module app/admin/page
 */

import { checkUserRole } from "@/lib/auth-utils"
import { getUserByClerkIdAction } from "@/actions/db/users-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { auth } from "@clerk/nextjs/server"
import UserManagement from "./_components/user-management"
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

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-tell-a-friend-green mb-6 text-3xl font-bold">
        Admin Dashboard
      </h1>

      <div className="mb-8 grid gap-4 md:grid-cols-3">
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
              Total Referrals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-muted-foreground text-xs">Referrals sent</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Rewards Issued
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-muted-foreground text-xs">
              Total rewards issued
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-6">
          <UserManagement adminId={currentUser.id} />
        </TabsContent>

        <TabsContent value="rewards" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Reward Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                The reward management interface will be implemented in a future
                step.
              </p>
            </CardContent>
          </Card>
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
