"use server"

/**
 * Technician Dashboard Page
 *
 * This page serves as the main dashboard for technicians in the Tell a Friend application.
 * It allows technicians to send sign-up links to customers via SMS and view their performance metrics.
 *
 * Features:
 * - Role-based access control (technician only)
 * - Form to send sign-up links to customers via SMS
 * - Display of technician performance metrics
 *
 * @module app/technician/page
 */

import { checkUserRole } from "@/lib/auth-utils"
import { getUserByClerkIdAction } from "@/actions/db/users-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import SendSignupLink from "./_components/send-signup-link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function TechnicianDashboardPage() {
  // Check if user has technician role, redirects to unauthorized if not
  const clerkUserId = await checkUserRole(["technician"], "/unauthorized")

  // Get the user's database record
  const { data: currentUser } = await getUserByClerkIdAction(clerkUserId)

  if (!currentUser) {
    // This should not happen since checkUserRole already verified the user exists
    // but we handle it just in case
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-2xl font-bold">
          Error loading technician dashboard
        </h1>
        <p>Unable to retrieve user information. Please try again later.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-tell-a-friend-green mb-6 text-3xl font-bold">
        Technician Dashboard
      </h1>

      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Referrals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-muted-foreground text-xs">Customers referred</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Sign-up Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-muted-foreground text-xs">
              Of customers sent links
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Performance Rank
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-muted-foreground text-xs">
              Among all technicians
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="send-link" className="w-full">
        <TabsList>
          <TabsTrigger value="send-link">Send Signup Link</TabsTrigger>
          <TabsTrigger value="history">Customer History</TabsTrigger>
        </TabsList>

        <TabsContent value="send-link" className="mt-6">
          <SendSignupLink technicianId={currentUser.id} />
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer History</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Your customer history will be implemented in a future version.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
