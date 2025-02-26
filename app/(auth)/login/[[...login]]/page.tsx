/*
<ai_context>
This client page provides the login form from Clerk.
</ai_context>
*/

"use client"

import { SignIn } from "@clerk/nextjs"
import { dark } from "@clerk/themes"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export default function LoginPage() {
  const { theme } = useTheme()
  const [afterSignInUrl, setAfterSignInUrl] = useState("/dashboard")

  // Check for redirect param in URL
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    const redirectUrl = searchParams.get("redirect")

    if (redirectUrl) {
      setAfterSignInUrl(redirectUrl)
    }
  }, [])

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="mb-8 text-center">
        <h1 className="text-tell-a-friend-green text-3xl font-bold">
          Welcome Back
        </h1>
        <p className="text-muted-foreground mt-2">
          Sign in to your Tell a Friend account
        </p>
      </div>

      <SignIn
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
        redirectUrl={afterSignInUrl}
      />
    </div>
  )
}
