/**
 * AccessibleInput Component
 *
 * An enhanced input component that ensures ADA accessibility compliance
 * while maintaining the Tell a Friend design system.
 *
 * Key features:
 * - WCAG 2.1 AA compliant
 * - Proper labeling for screen readers
 * - Focus states for keyboard navigation
 * - Error messaging
 * - Help text support
 *
 * @dependencies
 * - @/components/ui/input: Base input component
 * - @/components/ui/label: For accessible labeling
 */

"use client"

import React, { forwardRef } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface AccessibleInputProps
  extends Omit<React.ComponentProps<"input">, "id"> {
  /** Unique ID for the input (required for accessibility) */
  id: string
  /** Label text for the input */
  label: string
  /** Whether to hide the visual label (still available to screen readers) */
  hideLabel?: boolean
  /** Optional error message */
  error?: string
  /** Optional help text to provide additional context */
  helpText?: string
  /** Whether the field is required */
  required?: boolean
}

/**
 * An accessible input component that follows the Tell a Friend design system
 * and meets ADA compliance requirements
 */
export const AccessibleInput = forwardRef<
  HTMLInputElement,
  AccessibleInputProps
>(
  (
    {
      id,
      label,
      hideLabel = false,
      error,
      helpText,
      className,
      required = false,
      ...props
    },
    ref
  ) => {
    // Generate unique IDs for related elements
    const helpTextId = `${id}-help-text`
    const errorId = `${id}-error`

    // Determine which ID to use for aria-describedby
    const ariaDescribedBy = error ? errorId : helpText ? helpTextId : undefined

    return (
      <div className="space-y-2">
        <Label
          htmlFor={id}
          className={cn(
            hideLabel && "sr-only", // Visually hide but keep for screen readers
            error && "text-destructive"
          )}
        >
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>

        <Input
          id={id}
          ref={ref}
          aria-invalid={!!error}
          aria-describedby={ariaDescribedBy}
          aria-required={required}
          className={cn(
            error && "border-destructive focus-visible:ring-destructive",
            className
          )}
          {...props}
        />

        {/* Error message */}
        {error && (
          <p id={errorId} className="text-destructive text-sm font-medium">
            {error}
          </p>
        )}

        {/* Help text (only shown if no error) */}
        {!error && helpText && (
          <p id={helpTextId} className="text-muted-foreground text-sm">
            {helpText}
          </p>
        )}
      </div>
    )
  }
)

AccessibleInput.displayName = "AccessibleInput"

export default AccessibleInput
