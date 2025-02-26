/*
<ai_context>
This client page provides the signup form from Clerk.
</ai_context>
*/

"use client"

import { SignUp } from "@clerk/nextjs"
import { dark } from "@clerk/themes"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Cookies from "js-cookie"

export default function SignUpPage() {
  const { theme } = useTheme()
  const searchParams = useSearchParams()
  const [isReferral, setIsReferral] = useState(false)
  const [technicianId, setTechnicianId] = useState<string | null>(null)

  useEffect(() => {
    // Check for technician ID in URL query
    const techId = searchParams.get("technicianId")

    if (techId) {
      setTechnicianId(techId)
      setIsReferral(true)

      // Store technician ID in a cookie to access it after Clerk auth flow
      // This will be used to associate the user with the technician
      Cookies.set("referredByTechnician", techId, { expires: 1 }) // Expires in 1 day
    }
  }, [searchParams])

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="mb-8 text-center">
        <h1 className="text-tell-a-friend-green text-3xl font-bold">
          {isReferral ? "Join Our Referral Program" : "Create Your Account"}
        </h1>
        <p className="text-muted-foreground mt-2">
          {isReferral
            ? "Start referring friends and earn rewards"
            : "Sign up to get started with Tell a Friend"}
        </p>
        {technicianId && (
          <p className="bg-muted mt-2 rounded p-2 text-sm">
            You were referred by one of our technicians
          </p>
        )}
      </div>

      <SignUp
        appearance={{
          baseTheme: theme === "dark" ? dark : undefined,
          elements: {
            card: "bg-card",
            formButtonPrimary:
              "bg-tell-a-friend-green hover:bg-tell-a-friend-green/90",
            footerActionLink:
              "text-tell-a-friend-green hover:text-tell-a-friend-green/90"
          }
        }}
        redirectUrl="/dashboard"
      />
    </div>
  )
}
