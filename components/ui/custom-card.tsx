"use client"

/**
 * CustomCard Components
 * 
 * A set of branded wrappers around the Shadcn Card components that apply the Tell a Friend 
 * green color scheme and styling according to the design system.
 * 
 * This file exports multiple components for building cards with consistent styling:
 * - CustomCard: The main card container
 * - CustomCardHeader: The header section of the card
 * - CustomCardTitle: The title element of the card
 * - CustomCardDescription: The description element of the card
 * - CustomCardContent: The content section of the card
 * - CustomCardFooter: The footer section of the card
 * 
 * @example
 * <CustomCard>
 *   <CustomCardHeader>
 *     <CustomCardTitle>Card Title</CustomCardTitle>
 *     <CustomCardDescription>Card description text</CustomCardDescription>
 *   </CustomCardHeader>
 *   <CustomCardContent>
 *     <p>Main content goes here</p>
 *   </CustomCardContent>
 *   <CustomCardFooter>
 *     <Button>Action</Button>
 *   </CustomCardFooter>
 * </CustomCard>
 */

import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent
} from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { forwardRef, HTMLAttributes } from "react"

// CustomCard component
export const CustomCard = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <Card
        ref={ref}
        className={cn(
          "border-light-green bg-white shadow-sm overflow-hidden",
          className
        )}
        {...props}
      />
    )
  }
)
CustomCard.displayName = "CustomCard"

// CustomCardHeader component
export const CustomCardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <CardHeader
        ref={ref}
        className={cn("pb-2", className)}
        {...props}
      />
    )
  }
)
CustomCardHeader.displayName = "CustomCardHeader"

// CustomCardTitle component
export const CustomCardTitle = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => {
    return (
      <CardTitle
        ref={ref}
        className={cn("text-primary-green text-xl", className)}
        {...props}
      />
    )
  }
)
CustomCardTitle.displayName = "CustomCardTitle"

// CustomCardDescription component
export const CustomCardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => {
    return (
      <CardDescription
        ref={ref}
        className={cn("text-muted-foreground", className)}
        {...props}
      />
    )
  }
)
CustomCardDescription.displayName = "CustomCardDescription"

// CustomCardContent component
export const CustomCardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <CardContent
        ref={ref}
        className={cn("pt-4", className)}
        {...props}
      />
    )
  }
)
CustomCardContent.displayName = "CustomCardContent"

// CustomCardFooter component
export const CustomCardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <CardFooter
        ref={ref}
        className={cn("flex justify-end gap-2 pt-4", className)}
        {...props}
      />
    )
  }
)
CustomCardFooter.displayName = "CustomCardFooter"