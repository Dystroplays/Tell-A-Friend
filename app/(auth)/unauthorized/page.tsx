"use server"

/**
 * Unauthorized page shown when users try to access content they don't have permission for
 *
 * This page provides a friendly message and redirects users to appropriate sections
 * of the application based on their role.
 */

import { Button } from "@/components/ui/button"
import { getUserRole } from "@/lib/auth-utils"
import { UserRole } from "@/types"
import Link from "next/link"

export default async function UnauthorizedPage() {
  // Get the user's role to provide appropriate redirection
  const userRole = await getUserRole()

  // Determine where to redirect the user based on their role
  let redirectUrl: string
  let roleName: string

  switch (userRole) {
    case "admin":
      redirectUrl = "/admin"
      roleName = "administrator"
      break
    case "technician":
      redirectUrl = "/technician"
      roleName = "technician"
      break
    case "customer":
    default:
      redirectUrl = "/dashboard"
      roleName = "customer"
      break
  }

  return (
    <div className="container mx-auto flex max-w-md flex-col items-center justify-center py-20 text-center">
      <h1 className="text-tell-a-friend-green mb-6 text-3xl font-bold">
        Unauthorized Access
      </h1>

      <p className="mb-8 text-lg">
        Sorry, you don't have permission to access this area of the application.
        Your current role is <span className="font-bold">{roleName}</span>.
      </p>

      <Button asChild>
        <Link href={redirectUrl}>Go to your dashboard</Link>
      </Button>

      <div className="mt-4">
        <Link
          href="/"
          className="text-tell-a-friend-green hover:text-tell-a-friend-green/80 underline"
        >
          Or return to home page
        </Link>
      </div>
    </div>
  )
}
