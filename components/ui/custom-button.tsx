"use client"

/**
 * CustomButton Component
 * 
 * A branded wrapper around the Shadcn Button component that applies the Tell a Friend 
 * green color scheme and styling according to the design system.
 * 
 * This component handles different button variants (primary, secondary, destructive)
 * and passes all props to the underlying Button component.
 * 
 * @example
 * // Primary button (default)
 * <CustomButton>Get Started</CustomButton>
 * 
 * // Secondary button
 * <CustomButton variant="secondary">Learn More</CustomButton>
 * 
 * // Destructive button
 * <CustomButton variant="destructive">Delete</CustomButton>
 */

import { Button, ButtonProps } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { forwardRef } from "react"

export type CustomButtonProps = ButtonProps & {
  // All props are inherited from ButtonProps
}

const CustomButton = forwardRef<HTMLButtonElement, CustomButtonProps>(
  ({ className, variant = "default", ...props }, ref) => {
    // Define variant-specific styles
    const variantStyles = {
      default: "bg-primary-green text-white hover:bg-dark-green focus:ring-primary-green/50",
      secondary: "bg-light-green text-primary-green hover:bg-light-green/80 focus:ring-primary-green/50",
      destructive: "bg-error text-white hover:bg-error/80 focus:ring-error/50",
      outline: "border-primary-green text-primary-green hover:bg-light-green",
      ghost: "hover:bg-light-green text-primary-green",
      link: "text-primary-green underline-offset-4 hover:underline"
    }

    // Get the appropriate style for the current variant
    const variantStyle = variantStyles[variant as keyof typeof variantStyles] || variantStyles.default

    return (
      <Button
        ref={ref}
        variant={variant}
        className={cn(
          "font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2",
          variantStyle,
          className
        )}
        {...props}
      />
    )
  }
)

CustomButton.displayName = "CustomButton"

export { CustomButton }