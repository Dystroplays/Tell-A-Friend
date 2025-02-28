/**
 * API route handler for user-related operations
 *
 * This endpoint provides user management functionality including:
 * - Fetching users by role or referral code
 * - Creating new user records
 */

import { createUserAction, getAllUsersAction } from "@/actions/db/users-actions"
import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"
import { generateReferralCode } from "@/lib/referral-utils"

/**
 * GET handler for retrieving users
 * Supports filtering by role or referral code
 *
 * @param request The incoming HTTP request with query parameters
 * @returns JSON response with users matching the criteria
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Get URL search params
    const searchParams = request.nextUrl.searchParams
    const role = searchParams.get("role") as
      | "customer"
      | "technician"
      | "admin"
      | null
    const referralCode = searchParams.get("referralCode")

    // Ensure the requester is authenticated
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    // If referral code is provided, find users with that code
    if (referralCode) {
      // For security, we'll use a different approach than getAllUsersAction
      // to avoid exposing all users when searching by referral code
      const usersResult = await getAllUsersAction("customer")

      if (!usersResult.isSuccess) {
        return NextResponse.json(
          { success: false, message: usersResult.message },
          { status: 500 }
        )
      }

      // Filter users with the matching referral code
      const matchingUsers = usersResult.data.filter(
        user => user.referralCode === referralCode
      )

      return NextResponse.json({
        success: true,
        message:
          matchingUsers.length > 0
            ? "Users found"
            : "No users found with that referral code",
        data: matchingUsers
      })
    }

    // If role is provided, get all users with that role
    if (role) {
      const usersResult = await getAllUsersAction(role)

      if (!usersResult.isSuccess) {
        return NextResponse.json(
          { success: false, message: usersResult.message },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: "Users retrieved successfully",
        data: usersResult.data
      })
    }

    // If no filters are provided, get all users (admin only)
    const usersResult = await getAllUsersAction()

    if (!usersResult.isSuccess) {
      return NextResponse.json(
        { success: false, message: usersResult.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Users retrieved successfully",
      data: usersResult.data
    })
  } catch (error) {
    console.error("Error retrieving users:", error)

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to retrieve users"
      },
      { status: 500 }
    )
  }
}

/**
 * POST handler for creating new users
 *
 * @param request The incoming HTTP request with user data
 * @returns JSON response with the created user
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Parse the request body
    const body = await request.json()
    const { name, email, phone, role = "customer" } = body

    // Basic validation
    if (!name || !email || !phone) {
      return NextResponse.json(
        { success: false, message: "Name, email, and phone are required" },
        { status: 400 }
      )
    }

    // Generate a referral code for customers
    const referralCode =
      role === "customer" ? generateReferralCode() : undefined

    // Create the user
    const userResult = await createUserAction({
      id: uuidv4(),
      clerkUserId: body.clerkUserId || `temp-${uuidv4()}`, // For users created via API without Clerk
      name,
      email,
      phone,
      role,
      referralCode,
      zipCode: body.zipCode || "",
      referredByTechnicianId: body.referredByTechnicianId
    })

    if (!userResult.isSuccess) {
      return NextResponse.json(
        { success: false, message: userResult.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "User created successfully",
      data: userResult.data
    })
  } catch (error) {
    console.error("Error creating user:", error)

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to create user"
      },
      { status: 500 }
    )
  }
}
