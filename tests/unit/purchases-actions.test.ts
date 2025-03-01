/**
 * @description
 * Unit tests for purchase-related server actions in the Tell a Friend application.
 * These tests verify the functionality of createPurchaseAction by mocking
 * database interactions and other dependencies.
 * 
 * @dependencies
 * - jest: Testing framework
 * - @/actions/db/purchases-actions: The actions being tested
 * - @/db/db: The database connection to mock
 * - @/db/schema: Database schema definitions
 * - @/actions/db/rewards-actions: Reward actions to mock
 */

import { createPurchaseAction } from "@/actions/db/purchases-actions"
import { db } from "@/db/db"
import { purchasesTable, usersTable } from "@/db/schema"
import { createRewardAction } from "@/actions/db/rewards-actions"
import { v4 as uuidv4 } from "uuid"

// Mock UUID generation for predictable IDs
jest.mock("uuid", () => ({
  v4: jest.fn().mockReturnValue("mocked-uuid")
}))

// Mock the database module
jest.mock("@/db/db", () => {
  return {
    insert: jest.fn(),
    query: {
      users: {
        findFirst: jest.fn()
      }
    }
  }
})

// Mock the rewards actions
jest.mock("@/actions/db/rewards-actions", () => ({
  createRewardAction: jest.fn().mockResolvedValue({
    isSuccess: true,
    message: "Reward created successfully",
    data: { id: "reward-123" }
  })
}))

describe("Purchase Actions", () => {
  // Reset all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("createPurchaseAction", () => {
    it("should create a purchase successfully", async () => {
      // Mock data
      const mockPurchase = {
        id: "purchase-123",
        referrerId: "referrer-123",
        customerId: "customer-123",
        amount: "100.00",
        status: "pending",
        createdAt: new Date(),
        updatedAt: new Date()
      }

      // Setup user query mock implementations
      const findFirst = db.query.users.findFirst as jest.Mock
      findFirst
        .mockResolvedValueOnce({ id: "referrer-123", name: "Referrer" }) // First call for referrer
        .mockResolvedValueOnce({ id: "customer-123", name: "Customer" }) // Second call for customer

      // Setup mock return value for purchase insert
      const mockedInsert = jest.fn().mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([mockPurchase])
        })
      })
      
      const dbInsert = db.insert as jest.Mock
      dbInsert.mockImplementation(mockedInsert)

      // Execute action
      const result = await createPurchaseAction({
        referrerId: "referrer-123",
        customerId: "customer-123",
        amount: "100.00"
      })

      // Verify result
      expect(result.isSuccess).toBe(true)
      expect(result.message).toBe("Purchase created successfully")
      expect(result.data).toEqual(mockPurchase)

      // Verify db.insert was called with correct table
      expect(db.insert).toHaveBeenCalledWith(purchasesTable)
      
      // Verify user existence was checked
      expect(db.query.users.findFirst).toHaveBeenCalledTimes(2)
      
      // Verify reward was created
      expect(createRewardAction).toHaveBeenCalled()
    })

    it("should return error if required fields are missing", async () => {
      // Execute action with missing fields
      const result = await createPurchaseAction({
        referrerId: "referrer-123",
        // Missing customerId and amount
      } as any)

      // Verify result
      expect(result.isSuccess).toBe(false)
      expect(result.message).toBe("Missing required purchase information")
      
      // Verify no database operations were performed
      expect(db.query.users.findFirst).not.toHaveBeenCalled()
      expect(db.insert).not.toHaveBeenCalled()
      expect(createRewardAction).not.toHaveBeenCalled()
    })

    it("should return error if referrer not found", async () => {
      // Setup user query mock to return null for referrer
      const findFirst = db.query.users.findFirst as jest.Mock
      findFirst.mockResolvedValueOnce(null)

      // Execute action
      const result = await createPurchaseAction({
        referrerId: "non-existent-referrer",
        customerId: "customer-123",
        amount: "100.00"
      })

      // Verify result
      expect(result.isSuccess).toBe(false)
      expect(result.message).toBe("Referrer not found")
      
      // Verify no purchase was created
      expect(db.insert).not.toHaveBeenCalled()
      expect(createRewardAction).not.toHaveBeenCalled()
    })

    it("should return error if customer not found", async () => {
      // Setup user query mock to return referrer but null for customer
      const findFirst = db.query.users.findFirst as jest.Mock
      findFirst
        .mockResolvedValueOnce({ id: "referrer-123", name: "Referrer" }) // First call for referrer
        .mockResolvedValueOnce(null) // Second call for customer

      // Execute action
      const result = await createPurchaseAction({
        referrerId: "referrer-123",
        customerId: "non-existent-customer",
        amount: "100.00"
      })

      // Verify result
      expect(result.isSuccess).toBe(false)
      expect(result.message).toBe("Customer not found")
      
      // Verify no purchase was created
      expect(db.insert).not.toHaveBeenCalled()
      expect(createRewardAction).not.toHaveBeenCalled()
    })

    it("should prevent self-referrals", async () => {
      // Execute action with same referrer and customer ID
      const result = await createPurchaseAction({
        referrerId: "same-id",
        customerId: "same-id",
        amount: "100.00"
      })

      // Verify result
      expect(result.isSuccess).toBe(false)
      expect(result.message).toBe("Self-referrals are not allowed")
      
      // Verify no database operations were performed after validation
      expect(db.query.users.findFirst).not.toHaveBeenCalled()
      expect(db.insert).not.toHaveBeenCalled()
      expect(createRewardAction).not.toHaveBeenCalled()
    })

    it("should handle database errors gracefully", async () => {
      // Setup user query mock implementations to succeed
      const findFirst = db.query.users.findFirst as jest.Mock
      findFirst
        .mockResolvedValueOnce({ id: "referrer-123", name: "Referrer" })
        .mockResolvedValueOnce({ id: "customer-123", name: "Customer" })

      // Setup insert mock to throw an error
      const mockError = new Error("Database connection failed")
      const mockedInsert = jest.fn().mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockRejectedValue(mockError)
        })
      })
      
      const dbInsert = db.insert as jest.Mock
      dbInsert.mockImplementation(mockedInsert)

      // Execute action
      const result = await createPurchaseAction({
        referrerId: "referrer-123",
        customerId: "customer-123",
        amount: "100.00"
      })

      // Verify result
      expect(result.isSuccess).toBe(false)
      expect(result.message).toBe("Database connection failed")
      expect(result.data).toBeUndefined()
      
      // Verify reward was not created
      expect(createRewardAction).not.toHaveBeenCalled()
    })

    it("should continue even if reward creation fails", async () => {
      // Mock data
      const mockPurchase = {
        id: "purchase-123",
        referrerId: "referrer-123",
        customerId: "customer-123",
        amount: "100.00",
        status: "pending",
        createdAt: new Date(),
        updatedAt: new Date()
      }

      // Setup user query mock implementations
      const findFirst = db.query.users.findFirst as jest.Mock
      findFirst
        .mockResolvedValueOnce({ id: "referrer-123", name: "Referrer" })
        .mockResolvedValueOnce({ id: "customer-123", name: "Customer" })

      // Setup mock return value for purchase insert
      const mockedInsert = jest.fn().mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([mockPurchase])
        })
      })
      
      const dbInsert = db.insert as jest.Mock
      dbInsert.mockImplementation(mockedInsert)

      // Mock reward creation to fail
      const mockCreateReward = createRewardAction as jest.Mock
      mockCreateReward.mockRejectedValueOnce(new Error("Reward creation failed"))

      // Execute action
      const result = await createPurchaseAction({
        referrerId: "referrer-123",
        customerId: "customer-123",
        amount: "100.00"
      })

      // Verify result - purchase should succeed even if reward creation fails
      expect(result.isSuccess).toBe(true)
      expect(result.message).toBe("Purchase created successfully")
      expect(result.data).toEqual(mockPurchase)
      
      // Verify reward creation was attempted
      expect(createRewardAction).toHaveBeenCalled()
    })
  })
})