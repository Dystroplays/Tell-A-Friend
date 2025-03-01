/**
 * AccessibleButton Component
 *
 * An enhanced button component that ensures ADA accessibility compliance
 * while following the Tell a Friend design system (green, black, white).
 *
 * Key features:
 * - Meets WCAG contrast requirements
 * - Keyboard navigable
 * - Screen reader support
 * - Focus indicators
 * - Hover/active states
 *
 * @dependencies
 * - @/components/ui/button: Base button component
 */

"use client"

import React from "react"
import { Button, ButtonProps } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

interface AccessibleButtonProps extends ButtonProps {
  /** Indicates if the button is in a loading state */
  isLoading?: boolean
  /** Text to show during loading state */
  loadingText?: string
  /** Additional ARIA attributes for accessibility */
  ariaAttributes?: Record<string, string>
  /** High contrast mode for users with visual impairments */
  highContrast?: boolean
}

/**
 * An accessible button component that follows the Tell a Friend design system
 * and meets ADA compliance requirements
 */
export function AccessibleButton({
  children,
  className,
  variant = "default",
  size = "default",
  isLoading = false,
  loadingText,
  disabled,
  ariaAttributes = {},
  highContrast = false,
  ...props
}: AccessibleButtonProps) {
  // Determine if button should be disabled (either explicitly or due to loading)
  const isDisabled = disabled || isLoading

  // Map of aria attributes with defaults for accessibility
  const ariaProps = {
    "aria-busy": isLoading,
    ...(isDisabled && { "aria-disabled": true }),
    ...ariaAttributes
  }

  // Apply high contrast styling if needed
  const highContrastStyles = highContrast
    ? "border-2 border-tell-a-friend-black dark:border-white text-tell-a-friend-black dark:text-white"
    : ""

  // Apply the Tell a Friend green as primary color for default variant
  const primaryColorStyles =
    variant === "default" && !isDisabled
      ? "bg-tell-a-friend-green hover:bg-tell-a-friend-green/90 text-white focus-visible:ring-tell-a-friend-green"
      : ""

  return (
    <Button
      className={cn(
        // Apply increased padding for touch targets (ADA compliance)
        "min-h-10 min-w-[4rem]",
        // Apply proper focus styles for keyboard navigation
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        // Custom styling based on props
        primaryColorStyles,
        highContrastStyles,
        // Forward any additional classNames
        className
      )}
      variant={variant}
      size={size}
      disabled={isDisabled}
      {...ariaProps}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 size-4 animate-spin" />
          {loadingText || children}
        </>
      ) : (
        children
      )}
    </Button>
  )
}

export default AccessibleButton
