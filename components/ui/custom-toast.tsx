"use client"

/**
 * Custom Toast Component
 * 
 * A branded wrapper around the Shadcn Toast component with green-themed styling.
 * Provides styled toast notifications with different variants for success, error, etc.
 * To be used with the Toaster provider already set up in the application.
 *
 * @component
 */

import * as React from "react"
import { ElementRef } from "react"
import { cn } from "@/lib/utils"
import {
  Toast as ShadcnToast,
  ToastAction as ShadcnToastAction,
  ToastClose as ShadcnToastClose,
  ToastDescription as ShadcnToastDescription,
  ToastProvider as ShadcnToastProvider,
  ToastTitle as ShadcnToastTitle,
  ToastViewport as ShadcnToastViewport
} from "@/components/ui/toast"

interface ToastProps extends React.ComponentPropsWithoutRef<typeof ShadcnToast> {
  className?: string
}

const CustomToast = React.forwardRef<
  ElementRef<typeof ShadcnToast>,
  ToastProps
>(({ className, variant, ...props }, ref) => {
  // Define specific variant styles
  const variantStyles = {
    default: "bg-white border-primary-green",
    destructive: "bg-red-50 border-error text-error",
    success: "bg-green-50 border-success text-success"
  }

  // Get the appropriate variant style
  const selectedVariant = variant ? variantStyles[variant as keyof typeof variantStyles] : variantStyles.default

  return (
    <ShadcnToast
      ref={ref}
      className={cn(
        "border-l-4 shadow-md",
        selectedVariant,
        className
      )}
      {...props}
    />
  )
})
CustomToast.displayName = "CustomToast"

interface ToastActionProps extends React.ComponentPropsWithoutRef<typeof ShadcnToastAction> {
  className?: string
}

const CustomToastAction = React.forwardRef<
  ElementRef<typeof ShadcnToastAction>,
  ToastActionProps
>(({ className, ...props }, ref) => (
  <ShadcnToastAction
    ref={ref}
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-md border",
      "bg-primary-green px-3 text-sm font-medium text-white ring-offset-background transition-colors",
      "hover:bg-dark-green focus:outline-none focus:ring-2 focus:ring-dark-green focus:ring-offset-2",
      className
    )}
    {...props}
  />
))
CustomToastAction.displayName = "CustomToastAction"

interface ToastCloseProps extends React.ComponentPropsWithoutRef<typeof ShadcnToastClose> {
  className?: string
}

const CustomToastClose = React.forwardRef<
  ElementRef<typeof ShadcnToastClose>,
  ToastCloseProps
>(({ className, ...props }, ref) => (
  <ShadcnToastClose
    ref={ref}
    className={cn(
      "absolute right-2 top-2 rounded-md p-1 opacity-70",
      "text-foreground/50 ring-offset-background transition-opacity",
      "hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-dark-green focus:ring-offset-2",
      className
    )}
    toast-close=""
    {...props}
  />
))
CustomToastClose.displayName = "CustomToastClose"

interface ToastDescriptionProps extends React.ComponentPropsWithoutRef<typeof ShadcnToastDescription> {
  className?: string
}

const CustomToastDescription = React.forwardRef<
  ElementRef<typeof ShadcnToastDescription>,
  ToastDescriptionProps
>(({ className, ...props }, ref) => (
  <ShadcnToastDescription
    ref={ref}
    className={cn("text-sm opacity-90", className)}
    {...props}
  />
))
CustomToastDescription.displayName = "CustomToastDescription"

interface ToastProviderProps extends React.ComponentPropsWithoutRef<typeof ShadcnToastProvider> {}

function CustomToastProvider({ ...props }: ToastProviderProps) {
  return <ShadcnToastProvider {...props} />
}

interface ToastTitleProps extends React.ComponentPropsWithoutRef<typeof ShadcnToastTitle> {
  className?: string
}

const CustomToastTitle = React.forwardRef<
  ElementRef<typeof ShadcnToastTitle>,
  ToastTitleProps
>(({ className, ...props }, ref) => (
  <ShadcnToastTitle
    ref={ref}
    className={cn("text-base font-semibold", className)}
    {...props}
  />
))
CustomToastTitle.displayName = "CustomToastTitle"

interface ToastViewportProps extends React.ComponentPropsWithoutRef<typeof ShadcnToastViewport> {
  className?: string
}

const CustomToastViewport = React.forwardRef<
  ElementRef<typeof ShadcnToastViewport>,
  ToastViewportProps
>(({ className, ...props }, ref) => (
  <ShadcnToastViewport
    ref={ref}
    className={cn(
      "fixed top-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4",
      "sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
      className
    )}
    {...props}
  />
))
CustomToastViewport.displayName = "CustomToastViewport"

export {
  CustomToast as Toast,
  CustomToastAction as ToastAction,
  CustomToastClose as ToastClose,
  CustomToastDescription as ToastDescription,
  CustomToastProvider as ToastProvider,
  CustomToastTitle as ToastTitle,
  CustomToastViewport as ToastViewport
}