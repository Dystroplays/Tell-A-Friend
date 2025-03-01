"use server"

/**
 * Application Header Component
 *
 * This server component renders the main application header with navigation links,
 * authentication controls, and notification functionality.
 *
 * Features:
 * - Responsive layout with mobile menu
 * - User profile and authentication buttons
 * - Notification bell with unread count
 * - Role-based navigation links
 */

import { UserButton } from "@clerk/nextjs"
import { auth, currentUser } from "@clerk/nextjs/server"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import NotificationBell from "@/components/notification/notification-bell"
import { getUserByClerkIdAction } from "@/actions/db/users-actions"

export default async function Header() {
  const { userId } = await auth()
  const user = await currentUser()

  // Determine if user is logged in and their role
  let dbUser = null
  let dashboardPath = "/dashboard" // Default path for customers

  if (userId) {
    const result = await getUserByClerkIdAction(userId)
    if (result.isSuccess) {
      dbUser = result.data

      // Set dashboard path based on role
      if (dbUser.role === "admin") {
        dashboardPath = "/admin"
      } else if (dbUser.role === "technician") {
        dashboardPath = "/technician"
      }
    }
  }

  return (
    <header className="border-b bg-white">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="text-tell-a-friend-green flex items-center text-xl font-bold"
          >
            Tell a Friend
          </Link>

          <nav className="hidden gap-6 md:flex">
            <Link
              href="/"
              className="hover:text-primary text-sm font-medium transition-colors"
            >
              Home
            </Link>
            <Link
              href="/about"
              className="hover:text-primary text-sm font-medium transition-colors"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="hover:text-primary text-sm font-medium transition-colors"
            >
              Contact
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {userId ? (
            <>
              {/* Notification Bell - only shown to authenticated users */}
              {dbUser && (
                <NotificationBell
                  userId={dbUser.id}
                  dashboardPath={dashboardPath}
                />
              )}

              {/* Dashboard link - takes user to appropriate dashboard based on role */}
              <Button asChild variant="ghost" size="sm">
                <Link href={dashboardPath}>Dashboard</Link>
              </Button>

              {/* User button for profile and logout */}
              <UserButton afterSignOutUrl="/" />
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/signup">Sign up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
