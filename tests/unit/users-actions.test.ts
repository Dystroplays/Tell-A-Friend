/**
 * @description
 * Unit tests for user-related server actions in the Tell a Friend application.
 * These tests verify the functionality of createUserAction and getUserByIdAction
 * by mocking the database interactions.
 * 
 * @dependencies
 * - jest: Testing framework
 * - @/actions/db/users-actions: The actions being tested
 * - @/db/db: The database connection to mock
 * - @/db/schema: Database schema definitions
 */

import { createUserAction, getUserByIdAction } from "@/actions/db/users-actions"
import { db } from "@/db/db"
import { usersTable } from "@/db/schema"
import { generateReferralCode } from "@/lib/referral-utils"

// Mock the database module
jest.mock("@/db/db", () => ({
  insert: jest.fn(),
  query: {
    users: {
      findFirst: jest.fn()
    }
  }
}))

// Mock referral code generation to return predictable values
jest.mock("@/lib/referral-utils", () => ({
  generateReferralCode: jest.fn().mockReturnValue("ABCD1234")
}))

describe("User Actions", () => {
  // Reset all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("createUserAction", () => {
    it("should create a user successfully", async () => {
      // Mock data
      const mockUser = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        clerkUserId: "clerk_123",
        role: "customer",
        name: "John Doe",
        email: "john@example.com",
        phone: "+15555555555",
        referralCode: "ABCD1234",
        createdAt: new Date(),
        updatedAt: new Date()
      }

      // Setup mock return value
      const mockedInsert = jest.fn().mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([mockUser])
        })
      })
      
      // @ts-ignore - Mocking the db.insert method
      db.insert.mockImplementation(mockedInsert)

      // Execute action
      const result = await createUserAction({
        clerkUserId: "clerk_123",
        role: "customer",
        name: "John Doe",
        email: "john@example.com",
        phone: "+15555555555"
      })

      // Verify result
      expect(result.isSuccess).toBe(true)
      expect(result.message).toBe("User created successfully")
      expect(result.data).toEqual(mockUser)

      // Verify generateReferralCode was called for customer role
      expect(generateReferralCode).toHaveBeenCalled()
      
      // Verify db.insert was called with correct table
      expect(db.insert).toHaveBeenCalledWith(usersTable)
    })

    it("should handle database errors gracefully", async () => {
      // Setup mock to throw an error
      const mockError = new Error("Database connection failed")
      const mockedInsert = jest.fn().mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockRejectedValue(mockError)
        })
      })
      
      // @ts-ignore - Mocking the db.insert method
      db.insert.mockImplementation(mockedInsert)

      // Execute action
      const result = await createUserAction({
        clerkUserId: "clerk_123",
        role: "customer",
        name: "John Doe",
        email: "john@example.com",
        phone: "+15555555555"
      })

      // Verify result
      expect(result.isSuccess).toBe(false)
      expect(result.message).toBe("Database connection failed")
      expect(result.data).toBeUndefined()
    })

    it("should not generate referral code for non-customer roles", async () => {
      // Mock data
      const mockUser = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        clerkUserId: "clerk_123",
        role: "technician",
        name: "John Technician",
        email: "tech@example.com",
        phone: "+15555555555",
        createdAt: new Date(),
        updatedAt: new Date()
      }

      // Setup mock return value
      const mockedInsert = jest.fn().mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([mockUser])
        })
      })
      
      // @ts-ignore - Mocking the db.insert method
      db.insert.mockImplementation(mockedInsert)

      // Reset the mock to check if it gets called
      jest.clearAllMocks()

      // Execute action
      await createUserAction({
        clerkUserId: "clerk_123",
        role: "technician",
        name: "John Technician",
        email: "tech@example.com",
        phone: "+15555555555"
      })

      // Verify generateReferralCode was not called for technician role
      expect(generateReferralCode).not.toHaveBeenCalled()
    })
  })

  describe("getUserByIdAction", () => {
    it("should return a user when found", async () => {
      // Mock data
      const mockUser = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        clerkUserId: "clerk_123",
        role: "customer",
        name: "John Doe",
        email: "john@example.com",
        phone: "+15555555555",
        referralCode: "ABCD1234",
        createdAt: new Date(),
        updatedAt: new Date()
      }

      // Setup mock return value
      // @ts-ignore - Mocking the db.query.users.findFirst method
      db.query.users.findFirst.mockResolvedValue(mockUser)

      // Execute action
      const result = await getUserByIdAction("123e4567-e89b-12d3-a456-426614174000")

      // Verify result
      expect(result.isSuccess).toBe(true)
      expect(result.message).toBe("User retrieved successfully")
      expect(result.data).toEqual(mockUser)
    })

    it("should return an error when user is not found", async () => {
      // Setup mock return value
      // @ts-ignore - Mocking the db.query.users.findFirst method
      db.query.users.findFirst.mockResolvedValue(null)

      // Execute action
      const result = await getUserByIdAction("non-existent-id")

      // Verify result
      expect(result.isSuccess).toBe(false)
      expect(result.message).toBe("User not found")
      expect(result.data).toBeUndefined()
    })

    it("should handle database errors gracefully", async () => {
      // Setup mock to throw an error
      const mockError = new Error("Database connection failed")
      // @ts-ignore - Mocking the db.query.users.findFirst method
      db.query.users.findFirst.mockRejectedValue(mockError)

      // Execute action
      const result = await getUserByIdAction("123e4567-e89b-12d3-a456-426614174000")

      // Verify result
      expect(result.isSuccess).toBe(false)
      expect(result.message).toBe("Failed to get user")
      expect(result.data).toBeUndefined()
    })
  })
})