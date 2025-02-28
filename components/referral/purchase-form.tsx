"use client"

/**
 * Purchase Form Component
 *
 * This client component provides a form for testing the referral purchase system.
 * It allows a user to enter a referral code and simulate a purchase.
 */

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, AlertCircle, DollarSign, Loader2 } from "lucide-react"

/**
 * Interface for the Purchase Form props
 */
interface PurchaseFormProps {
  customerId?: string // Optional customer ID if already authenticated
  customerName?: string // Optional customer name if already known
  customerEmail?: string // Optional customer email if already known
}

/**
 * Purchase Form Component for testing referral purchases
 */
export default function PurchaseForm({
  customerId,
  customerName,
  customerEmail
}: PurchaseFormProps) {
  // Form state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    referralCode: "",
    amount: "100.00",
    customerName: customerName || "",
    customerEmail: customerEmail || "",
    description: "Test purchase"
  })

  // Results state
  const [result, setResult] = useState<{
    success: boolean
    message: string
    data?: any
  } | null>(null)

  /**
   * Handle input changes
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setResult(null)

    try {
      // Basic validation
      if (!formData.referralCode.trim()) {
        setResult({
          success: false,
          message: "Referral code is required"
        })
        setIsSubmitting(false)
        return
      }

      if (
        isNaN(parseFloat(formData.amount)) ||
        parseFloat(formData.amount) <= 0
      ) {
        setResult({
          success: false,
          message: "Please enter a valid amount greater than 0"
        })
        setIsSubmitting(false)
        return
      }

      if (!formData.customerName.trim() && !customerId) {
        setResult({
          success: false,
          message: "Customer name is required for purchases"
        })
        setIsSubmitting(false)
        return
      }

      // Format the request data
      const requestData = {
        referralCode: formData.referralCode.trim(),
        amount: parseFloat(formData.amount),
        customerName: formData.customerName.trim(),
        customerEmail: formData.customerEmail.trim(),
        customerId, // Pass if provided
        description: formData.description.trim() || "Purchase via referral"
      }

      // Call the API endpoint
      const response = await fetch("/api/purchases", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestData)
      })

      const responseData = await response.json()

      if (response.ok && responseData.success) {
        setResult({
          success: true,
          message: "Purchase created successfully!",
          data: responseData.data
        })

        // Show success notification
        toast({
          title: "Purchase successful",
          description:
            "The purchase has been recorded and a reward is pending approval"
        })

        // Reset form
        setFormData({
          referralCode: "",
          amount: "100.00",
          customerName: customerName || "",
          customerEmail: customerEmail || "",
          description: "Test purchase"
        })
      } else {
        setResult({
          success: false,
          message: responseData.message || "Failed to process purchase"
        })
      }
    } catch (error) {
      console.error("Error processing purchase:", error)
      setResult({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <CardTitle>Make a Purchase with Referral</CardTitle>
        <CardDescription>
          Enter a referral code to simulate a purchase and test the referral
          system
        </CardDescription>
      </CardHeader>

      <CardContent>
        {result && (
          <Alert
            className={`mb-6 ${result.success ? "bg-green-50" : "bg-red-50"}`}
            variant={result.success ? "default" : "destructive"}
          >
            {result.success ? (
              <CheckCircle2 className="size-4 text-green-600" />
            ) : (
              <AlertCircle className="size-4" />
            )}
            <AlertTitle>{result.success ? "Success" : "Error"}</AlertTitle>
            <AlertDescription>{result.message}</AlertDescription>

            {result.success && result.data && (
              <div className="mt-2 text-xs">
                <p>Purchase ID: {result.data.purchase.id}</p>
                {result.data.reward && (
                  <p>Reward ID: {result.data.reward.id}</p>
                )}
              </div>
            )}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="referralCode">Referral Code</Label>
            <Input
              id="referralCode"
              name="referralCode"
              placeholder="Enter referral code"
              value={formData.referralCode}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Purchase Amount ($)</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="100.00"
              value={formData.amount}
              onChange={handleChange}
              required
            />
          </div>

          {!customerId && (
            <>
              <div className="space-y-2">
                <Label htmlFor="customerName">Customer Name</Label>
                <Input
                  id="customerName"
                  name="customerName"
                  placeholder="John Doe"
                  value={formData.customerName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerEmail">Customer Email</Label>
                <Input
                  id="customerEmail"
                  name="customerEmail"
                  type="email"
                  placeholder="customer@example.com"
                  value={formData.customerEmail}
                  onChange={handleChange}
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              name="description"
              placeholder="House painting service"
              value={formData.description}
              onChange={handleChange}
            />
          </div>
        </form>
      </CardContent>

      <CardFooter>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="bg-tell-a-friend-green hover:bg-tell-a-friend-green/90 w-full"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <DollarSign className="mr-2 size-4" />
              Complete Purchase
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
