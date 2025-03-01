/**
 * Accessible Form Controls Component
 *
 * This file provides enhanced checkbox and radio button components
 * that ensure ADA accessibility compliance while following the
 * Tell a Friend design system.
 *
 * Key features:
 * - WCAG 2.1 AA compliant form controls
 * - Enhanced focus states
 * - Proper labeling for screen readers
 * - Custom styling using Tell a Friend colors
 *
 * @dependencies
 * - @/components/ui/checkbox: Base checkbox component
 * - @/components/ui/radio-group: Base radio components
 * - @/components/ui/label: For accessible labeling
 */

"use client"

import React, { forwardRef } from "react"
import { Checkbox as BaseCheckbox } from "@/components/ui/checkbox"
import {
  RadioGroup as BaseRadioGroup,
  RadioGroupItem as BaseRadioGroupItem
} from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

// =================
// CHECKBOX COMPONENT
// =================

interface AccessibleCheckboxProps
  extends React.ComponentPropsWithoutRef<typeof BaseCheckbox> {
  /** Label text for the checkbox */
  label: string
  /** Optional help text */
  helpText?: string
}

/**
 * An accessible checkbox component that meets ADA compliance requirements
 */
export const AccessibleCheckbox = forwardRef<
  HTMLButtonElement,
  AccessibleCheckboxProps
>(({ id, label, helpText, className, ...props }, ref) => {
  // Generate unique ID for the help text if provided
  const helpTextId = helpText ? `${id}-help-text` : undefined

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <BaseCheckbox
          id={id}
          ref={ref}
          className={cn(
            "border-tell-a-friend-green/50 data-[state=checked]:bg-tell-a-friend-green data-[state=checked]:text-tell-a-friend-white",
            "focus-visible:ring-tell-a-friend-green/70 focus-visible:ring-offset-2",
            className
          )}
          aria-describedby={helpTextId}
          {...props}
        />
        <Label
          htmlFor={id}
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          {label}
        </Label>
      </div>

      {helpText && (
        <p id={helpTextId} className="text-muted-foreground pl-6 text-sm">
          {helpText}
        </p>
      )}
    </div>
  )
})

AccessibleCheckbox.displayName = "AccessibleCheckbox"

// =================
// RADIO GROUP COMPONENTS
// =================

interface RadioOption {
  /** Value of the radio option */
  value: string
  /** Label text for the radio option */
  label: string
  /** Optional help text for this option */
  helpText?: string
  /** Whether this option is disabled */
  disabled?: boolean
}

interface AccessibleRadioGroupProps {
  /** Unique ID for the radio group */
  id: string
  /** Name attribute for the form field */
  name: string
  /** Label for the entire radio group */
  label: string
  /** Array of radio options */
  options: RadioOption[]
  /** Currently selected value */
  value?: string
  /** Called when selection changes */
  onValueChange?: (value: string) => void
  /** Whether the field is required */
  required?: boolean
  /** Optional error message */
  error?: string
  /** Additional class name */
  className?: string
}

/**
 * An accessible radio group component that meets ADA compliance requirements
 */
export function AccessibleRadioGroup({
  id,
  name,
  label,
  options,
  value,
  onValueChange,
  required = false,
  error,
  className
}: AccessibleRadioGroupProps) {
  // Generate unique IDs
  const labelId = `${id}-label`
  const errorId = error ? `${id}-error` : undefined

  return (
    <div className={cn("space-y-3", className)}>
      <div className="space-y-1">
        <Label id={labelId} className={cn(error && "text-destructive")}>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>

        {error && (
          <p id={errorId} className="text-destructive text-sm font-medium">
            {error}
          </p>
        )}
      </div>

      <BaseRadioGroup
        name={name}
        value={value}
        onValueChange={onValueChange}
        className="space-y-3"
        aria-labelledby={labelId}
        aria-describedby={errorId}
        aria-required={required}
        aria-invalid={!!error}
      >
        {options.map((option, index) => {
          const optionId = `${id}-option-${index}`
          const helpTextId = option.helpText
            ? `${optionId}-help-text`
            : undefined

          return (
            <div key={option.value} className="space-y-1">
              <div className="flex items-center space-x-2">
                <BaseRadioGroupItem
                  id={optionId}
                  value={option.value}
                  disabled={option.disabled}
                  aria-describedby={helpTextId}
                  className="border-tell-a-friend-green/50 text-tell-a-friend-green focus-visible:ring-tell-a-friend-green/70"
                />
                <Label htmlFor={optionId}>{option.label}</Label>
              </div>

              {option.helpText && (
                <p
                  id={helpTextId}
                  className="text-muted-foreground pl-6 text-sm"
                >
                  {option.helpText}
                </p>
              )}
            </div>
          )
        })}
      </BaseRadioGroup>
    </div>
  )
}
