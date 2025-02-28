"use client"

/**
 * User Management Component
 *
 * This client component provides an interface for admins to manage users in the system.
 * It allows creating new users with specific roles (technicians, admins, customers).
 *
 * Features:
 * - Form to create new users with name, email, and role
 * - Displays success/error feedback
 * - Uses Clerk's API via server actions
 *
 * @module app/admin/_components/user-management
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { createInvitedUserAction } from "@/actions/db/users-actions"
import { UserRole } from "@/types"
import { toast } from "@/lib/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, AlertCircle } from "lucide-react"

interface UserManagementProps {
  adminId: string
}

export default function UserManagement({ adminId }: UserManagementProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    role: "technician" as UserRole
  })
  const [result, setResult] = useState<{
    success: boolean
    message: string
  } | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormState(prev => ({ ...prev, [name]: value }))
  }

  const handleRoleChange = (value: UserRole) => {
    setFormState(prev => ({ ...prev, role: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setResult(null)

    try {
      // Basic validation
      if (!formState.name.trim() || !formState.email.trim()) {
        setResult({
          success: false,
          message: "Name and email are required"
        })
        setIsSubmitting(false)
        return
      }

      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formState.email)) {
        setResult({
          success: false,
          message: "Please enter a valid email address"
        })
        setIsSubmitting(false)
        return
      }

      // Call the server action to create the user
      const response = await createInvitedUserAction(
        formState.email,
        formState.name,
        formState.role
      )

      if (response.isSuccess) {
        setResult({
          success: true,
          message: `Successfully invited ${formState.name} as a ${formState.role}`
        })
        // Reset form
        setFormState({
          name: "",
          email: "",
          role: "technician"
        })
        toast({
          title: "User Invited",
          description: `${formState.name} has been invited as a ${formState.role}`
        })
      } else {
        setResult({
          success: false,
          message: response.message || "Failed to invite user"
        })
      }
    } catch (error) {
      console.error("Error inviting user:", error)
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
        <CardTitle>User Management</CardTitle>
        <CardDescription>
          Invite new technicians and administrators to the system
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
          <div className="grid gap-6">
            <div className="grid gap-3">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="John Doe"
                value={formState.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid gap-3">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="john@example.com"
                value={formState.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid gap-3">
              <Label>Role</Label>
              <RadioGroup
                value={formState.role}
                onValueChange={value => handleRoleChange(value as UserRole)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="technician" id="technician" />
                  <Label htmlFor="technician" className="cursor-pointer">
                    Technician
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="admin" id="admin" />
                  <Label htmlFor="admin" className="cursor-pointer">
                    Administrator
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="customer" id="customer" />
                  <Label htmlFor="customer" className="cursor-pointer">
                    Customer
                  </Label>
                </div>
              </RadioGroup>
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
          {isSubmitting ? "Sending Invitation..." : "Send Invitation"}
        </Button>
      </CardFooter>
    </Card>
  )
}
