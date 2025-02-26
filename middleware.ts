/*
<ai_context>
Contains middleware for protecting routes, checking user authentication, and redirecting as needed.
</ai_context>
*/

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

// Define protected routes with role-based access
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)", // Customer/referrer routes
  "/admin(.*)",     // Admin routes
  "/technician(.*)" // Technician routes
])

export default clerkMiddleware(async (auth, req) => {
  const { userId, redirectToSignIn } = await auth()
  const path = req.nextUrl.pathname

  // If the user isn't signed in and the route is protected, redirect to sign-in
  if (!userId && isProtectedRoute(req)) {
    return redirectToSignIn({ returnBackUrl: req.url })
  }

  // Allow authenticated users to proceed to protected routes
  // Role-based protection will happen at the page level
  if (userId && isProtectedRoute(req)) {
    // Allow the request to proceed - role checks will be done within the routes
    return NextResponse.next()
  }

  // For all other routes (public routes), allow access
  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"]
}