"use client"

/**
 * Purchase Form Component
 *
 * This client component provides a form for testing the referral purchase system
 * with integrated fraud prevention feedback. It allows users to simulate making
 * a purchase with a referral code.
 *
 * Features:
 * - Form fields for referral code, amount, and customer information
 * - Live validation with error feedback
 * - Submission handling with success/error messaging
 * - IP address tracking for fraud prevention
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
import { AlertCircle, CheckCircle2, DollarSign, Loader2 } from "lucide-react"

interface PurchaseFormProps {
  customerId?: string
  customerName?: string
  customerEmail?: string
}

export default function PurchaseForm({
  customerId,
  customerName,
  customerEmail
}: PurchaseFormProps) {
  // Form state
  const [formState, setFormState] = useState({
    referralCode: "",
    amount: "",
    name: customerName || "",
    email: customerEmail || "",
    phone: ""
  })

  // Form submission state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<{
    success: boolean
    message: string
  } | null>(null)

  // Form field validation
  const isValidReferralCode = (code: string) =>
    /^[A-Z0-9]{4}-?[A-Z0-9]{4}$/.test(code)
  const isValidAmount = (amount: string) =>
    !isNaN(Number(amount)) && Number(amount) >= 50
  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const isValidPhone = (phone: string) => /^\+?[0-9]{10,15}$/.test(phone)

  // Update form state when inputs change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    // Special handling for referral code formatting
    if (name === "referralCode") {
      // If user enters 8 characters without a hyphen, add it
      if (
        value.length === 8 &&
        !value.includes("-") &&
        value !== formState.referralCode
      ) {
        const formatted = `${value.slice(0, 4)}-${value.slice(4)}`
        setFormState(prev => ({ ...prev, [name]: formatted }))
        return
      }
    }

    setFormState(prev => ({ ...prev, [name]: value }))
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setResult(null)

    try {
      // Validate form fields
      const cleanReferralCode = formState.referralCode.replace(/-/g, "")
      if (!isValidReferralCode(formState.referralCode)) {
        setResult({
          success: false,
          message: "Please enter a valid referral code (8 characters)"
        })
        setIsSubmitting(false)
        return
      }

      if (!isValidAmount(formState.amount)) {
        setResult({
          success: false,
          message: "Amount must be at least $50"
        })
        setIsSubmitting(false)
        return
      }

      if (!formState.name.trim()) {
        setResult({
          success: false,
          message: "Please enter your name"
        })
        setIsSubmitting(false)
        return
      }

      if (formState.email && !isValidEmail(formState.email)) {
        setResult({
          success: false,
          message: "Please enter a valid email address"
        })
        setIsSubmitting(false)
        return
      }

      if (formState.phone && !isValidPhone(formState.phone)) {
        setResult({
          success: false,
          message: "Please enter a valid phone number"
        })
        setIsSubmitting(false)
        return
      }

      // Prepare the request payload
      const payload = {
        referralCode: cleanReferralCode,
        amount: parseFloat(formState.amount),
        customerName: formState.name,
        customerEmail: formState.email,
        customerPhone: formState.phone,
        customerId
      }

      // Make API request to create purchase
      const response = await fetch("/api/purchases", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (data.success) {
        setResult({
          success: true,
          message: "Purchase created successfully with referral code"
        })

        // Reset form on success
        setFormState({
          referralCode: "",
          amount: "",
          name: customerName || "",
          email: customerEmail || "",
          phone: ""
        })

        toast({
          title: "Success",
          description: "Your purchase has been processed successfully"
        })
      } else {
        let errorMessage = data.message

        // Provide more user-friendly messages for fraud detection
        if (errorMessage.includes("Fraud detection:")) {
          errorMessage = errorMessage.replace("Fraud detection: ", "")

          // Check for common fraud reasons and give clearer messages
          if (errorMessage.includes("email")) {
            errorMessage =
              "Your email address must be verified before making a purchase."
          } else if (errorMessage.includes("minimum")) {
            errorMessage = "Purchase amount must be at least $50."
          } else if (errorMessage.includes("self-referral")) {
            errorMessage =
              "You cannot use your own referral code or one from the same household."
          } else if (errorMessage.includes("IP address")) {
            errorMessage =
              "Too many purchases detected from your location. Please try again later."
          }
        }

        setResult({
          success: false,
          message: errorMessage
        })
      }
    } catch (error) {
      console.error("Error creating purchase:", error)
      setResult({
        success: false,
        message:
          error instanceof Error ? error.message : "An unknown error occurred"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Make a Purchase with Referral</CardTitle>
        <CardDescription>
          Enter a referral code and purchase details to test the system
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
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="referralCode">Referral Code</Label>
            <Input
              id="referralCode"
              name="referralCode"
              placeholder="ABCD-1234"
              value={formState.referralCode}
              onChange={handleChange}
              className={
                formState.referralCode &&
                !isValidReferralCode(formState.referralCode)
                  ? "border-red-500"
                  : ""
              }
            />
            {formState.referralCode &&
              !isValidReferralCode(formState.referralCode) && (
                <p className="text-xs text-red-500">
                  Please enter a valid 8-character referral code
                </p>
              )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="amount">Purchase Amount ($)</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-500" />
              <Input
                id="amount"
                name="amount"
                type="number"
                min="50"
                placeholder="50.00"
                value={formState.amount}
                onChange={handleChange}
                className={`pl-10 ${formState.amount && !isValidAmount(formState.amount) ? "border-red-500" : ""}`}
              />
            </div>
            {formState.amount && !isValidAmount(formState.amount) && (
              <p className="text-xs text-red-500">
                Minimum purchase amount is $50
              </p>
            )}
            <p className="text-muted-foreground text-xs">
              Minimum purchase: $50.00
            </p>
          </div>

          {/* Only show name field if not provided via props */}
          {!customerName && (
            <div className="grid gap-2">
              <Label htmlFor="name">Your Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="John Doe"
                value={formState.name}
                onChange={handleChange}
                required
              />
            </div>
          )}

          {/* Only show email field if not provided via props */}
          {!customerEmail && (
            <div className="grid gap-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="john@example.com"
                value={formState.email}
                onChange={handleChange}
                className={
                  formState.email && !isValidEmail(formState.email)
                    ? "border-red-500"
                    : ""
                }
              />
              {formState.email && !isValidEmail(formState.email) && (
                <p className="text-xs text-red-500">
                  Please enter a valid email address
                </p>
              )}
              <p className="text-muted-foreground text-xs">
                Verified email required for fraud prevention
              </p>
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              name="phone"
              placeholder="+1 (555) 123-4567"
              value={formState.phone}
              onChange={handleChange}
              className={
                formState.phone && !isValidPhone(formState.phone)
                  ? "border-red-500"
                  : ""
              }
            />
            {formState.phone && !isValidPhone(formState.phone) && (
              <p className="text-xs text-red-500">
                Please enter a valid phone number
              </p>
            )}
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
            "Complete Purchase"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
