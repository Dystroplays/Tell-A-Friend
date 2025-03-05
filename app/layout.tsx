/*
<ai_context>
The root server layout for the app.
</ai_context>
*/

import {
  createProfileAction,
  getProfileByUserIdAction
} from "@/actions/db/profiles-actions"
import {
  createUserAction,
  getUserByClerkIdAction
} from "@/actions/db/users-actions"
import { Toaster } from "@/components/ui/toaster"
import { PostHogPageview } from "@/components/utilities/posthog/posthog-pageview"
import { PostHogUserIdentify } from "@/components/utilities/posthog/posthog-user-identity"
import { Providers } from "@/components/utilities/providers"
import { TailwindIndicator } from "@/components/utilities/tailwind-indicator"
import { cn } from "@/lib/utils"
import { ClerkProvider, UserProfile } from "@clerk/nextjs"
import { auth, currentUser } from "@clerk/nextjs/server"
import { cookies } from "next/headers"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { v4 as uuidv4 } from "uuid"
import { generateReferralCode } from "@/lib/referral-utils"


// Load Inter font
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-inter"
})

export const metadata: Metadata = {
  title: "Tell a Friend - Referral Program",
  description:
    "A referral program for small local businesses in the home service industry.",
  keywords: [
    "referral",
    "home service",
    "house painters",
    "rewards",
    "referral program"
  ]
}

export default async function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  const { userId: clerkUserId } = await auth()

  if (clerkUserId) {
    // Check if user exists in our database
    const userRes = await getUserByClerkIdAction(clerkUserId)

    if (!userRes.isSuccess) {
      // User doesn't exist in our database yet - create them
      // This typically happens right after Clerk authentication

      // Get user details from Clerk
      const user = await currentUser()
      if (!user) return null

      // Check for technician referral cookie
      const cookieStore = await cookies()
      const referredByTechnicianId = cookieStore.get(
        "referredByTechnician"
      )?.value

      // Default to customer role, could be updated later for admin/technicians
      const role = "customer"

      // Generate unique referral code for customers
      const referralCode = generateReferralCode()

      // Create user in our database with appropriate role and referral info
      await createUserAction({
        id: uuidv4(),
        clerkUserId: user.id,
        role,
        name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
        email: user.emailAddresses[0]?.emailAddress || "",
        phone: user.phoneNumbers[0]?.phoneNumber || "",
        zipCode: "",
        referralCode,
        referredByTechnicianId: referredByTechnicianId
      })

      // Clear the cookie after use
      if (referredByTechnicianId) {
        const cookieStore = await cookies()
        cookieStore.delete("referredByTechnician")
      }
    }

    // Ensure profile exists (handles profile features like Stripe integration)
    const profileRes = await getProfileByUserIdAction(clerkUserId)
    if (!profileRes.isSuccess) {
      await createProfileAction({ userId: clerkUserId })
    }
  }

  return (
    <ClerkProvider
      appearance={{
        elements: {
          formButtonPrimary:
            "bg-primary-green hover:bg-primary-green/90",
          footerActionLink:
            "text-primary-green hover:text-primary-green/90"
        }
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <body className={cn(inter.variable, inter.className)}>
          <Providers
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            disableTransitionOnChange
          >
            <PostHogUserIdentify />
            <PostHogPageview />

            {children}

            <TailwindIndicator />

            <Toaster />
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  )
}