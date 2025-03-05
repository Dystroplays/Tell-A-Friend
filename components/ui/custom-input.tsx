"use client"

/**
 * CustomInput Component
 * 
 * A branded wrapper around the Shadcn Input component that applies the Tell a Friend 
 * green color scheme and styling according to the design system.
 * 
 * This component enhances the base Input with custom styling for borders, focus states,
 * and text colors while maintaining all functionality.
 * 
 * @example
 * <CustomInput placeholder="Enter your email" />
 * 
 * <CustomInput
 *   type="email"
 *   required
 *   placeholder="Enter your email address"
 * />
 */

import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { forwardRef, ComponentProps } from "react"

export type CustomInputProps = ComponentProps<"input"> & {
  // All props are inherited from ComponentProps<"input">
}

const CustomInput = forwardRef<HTMLInputElement, CustomInputProps>(
  ({ className, ...props }, ref) => {
    return (
      <Input
        ref={ref}
        className={cn(
          "border-input focus:border-primary-green text-text focus:ring-2 focus:ring-primary-green/25 transition-colors",
          "placeholder:text-muted-foreground",
          className
        )}
        {...props}
      />
    )
  }
)

CustomInput.displayName = "CustomInput"

export { CustomInput }