"use client"

/**
 * Send Signup Link Component
 *
 * This client component provides a form for technicians to send sign-up links
 * to customers via SMS after completing a service job.
 *
 * Features:
 * - Phone number input with validation
 * - Success/error feedback
 * - Uses Twilio via server actions for SMS delivery
 *
 * @module app/technician/_components/send-signup-link
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
import { sendSignupLinkAction } from "@/actions/notifications/send-sms-actions"
import { toast } from "@/components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, AlertCircle, Send, Loader2 } from "lucide-react"

interface SendSignupLinkProps {
  technicianId: string
}

export default function SendSignupLink({ technicianId }: SendSignupLinkProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState("")
  const [result, setResult] = useState<{
    success: boolean
    message: string
  } | null>(null)

  // Basic phone number validation, can be enhanced for international numbers
  const isValidPhoneNumber = (number: string) => {
    // Allow for international format or US format
    // This is a basic check and can be enhanced with a library like libphonenumber-js
    const phoneRegex =
      /^\+?[1-9]\d{1,14}$|^\(\d{3}\)\s?\d{3}-\d{4}$|\d{3}-\d{3}-\d{4}$/
    return phoneRegex.test(number)
  }

  // Format phone number to E.164 format for Twilio
  const formatPhoneNumber = (number: string) => {
    // Remove all non-numeric characters
    const digits = number.replace(/\D/g, "")

    // Ensure it has country code
    if (digits.length === 10) {
      // Assume US number and add +1
      return `+1${digits}`
    } else if (digits.length > 10 && !number.startsWith("+")) {
      // Add + for international format
      return `+${digits}`
    }

    // Return original with + if it already has it, otherwise add +
    return number.startsWith("+") ? number : `+${digits}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setResult(null)

    try {
      // Basic validation
      if (!phoneNumber.trim()) {
        setResult({
          success: false,
          message: "Phone number is required"
        })
        setIsSubmitting(false)
        return
      }

      // Validate phone number format
      if (!isValidPhoneNumber(phoneNumber)) {
        setResult({
          success: false,
          message: "Please enter a valid phone number"
        })
        setIsSubmitting(false)
        return
      }

      // Format phone number for Twilio
      const formattedPhoneNumber = formatPhoneNumber(phoneNumber)

      // Call the server action to send the SMS
      const response = await sendSignupLinkAction(
        formattedPhoneNumber,
        technicianId
      )

      if (response.isSuccess) {
        setResult({
          success: true,
          message: "Signup link sent successfully to " + formattedPhoneNumber
        })
        // Reset form
        setPhoneNumber("")
        toast({
          title: "Success",
          description: "Signup link sent to customer"
        })
      } else {
        setResult({
          success: false,
          message: response.message || "Failed to send signup link"
        })
      }
    } catch (error) {
      console.error("Error sending signup link:", error)
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
    <Card>
      <CardHeader>
        <CardTitle>Send Signup Link</CardTitle>
        <CardDescription>
          Send a referral program signup link to customers after completing a
          service
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

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="phoneNumber">Customer Phone Number</Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                placeholder="(555) 123-4567"
                value={phoneNumber}
                onChange={e => setPhoneNumber(e.target.value)}
                required
              />
              <p className="text-muted-foreground text-xs">
                Enter customer's phone number to send them a referral program
                signup link
              </p>
            </div>
          </div>
        </form>
      </CardContent>

      <CardFooter>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="bg-tell-a-friend-green hover:bg-tell-a-friend-green/90"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="mr-2 size-4" />
              Send Signup Link
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
