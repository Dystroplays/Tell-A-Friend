"use client"

/**
 * Custom Textarea Component
 * 
 * A branded wrapper around the Shadcn Textarea component with green-themed styling.
 * Provides a consistent look and feel with the rest of the application's form elements.
 * 
 * @component
 */

import * as React from "react"
import { cn } from "@/lib/utils"
import { Textarea as ShadcnTextarea } from "@/components/ui/textarea"

export interface CustomTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /**
   * Additional styling to apply to the textarea
   */
  className?: string
}

const CustomTextarea = React.forwardRef<HTMLTextAreaElement, CustomTextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <ShadcnTextarea
        className={cn(
          "border-primary-green text-text",
          "focus:border-dark-green focus:ring-1 focus:ring-dark-green",
          "min-h-[80px] rounded-md border px-3 py-2",
          "placeholder:text-muted-foreground",
          "focus:outline-none focus:ring-2 focus:ring-dark-green focus:ring-offset-1",
          "resize-vertical",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
CustomTextarea.displayName = "CustomTextarea"

export { CustomTextarea as Textarea }