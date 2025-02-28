"use server"

/**
 * Dashboard Layout Component
 *
 * This server component provides a layout wrapper for the customer dashboard.
 * It includes navigation and ensures the user is authenticated before displaying content.
 *
 * @module app/dashboard/layout
 */

import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default async function DashboardLayout({
  children
}: DashboardLayoutProps) {
  // Check if user is authenticated
  const { userId } = await auth()

  // If not authenticated, redirect to login
  if (!userId) {
    redirect("/login?redirect=/dashboard")
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* We can add a dashboard-specific header or navigation here in the future */}
      <main className="flex-1">{children}</main>
    </div>
  )
}
