"use client"

/**
 * Custom Tabs Component
 * 
 * A branded wrapper around the Shadcn Tabs component with green-themed styling.
 * Provides the same functionality as the standard tabs but with consistent branding.
 * 
 * @component
 */

import * as React from "react"
import { ElementRef } from "react"
import { cn } from "@/lib/utils"
import {
  Tabs as ShadcnTabs,
  TabsContent as ShadcnTabsContent,
  TabsList as ShadcnTabsList,
  TabsTrigger as ShadcnTabsTrigger
} from "@/components/ui/tabs"

interface TabsProps extends React.ComponentPropsWithoutRef<typeof ShadcnTabs> {
  className?: string
}

const CustomTabs = React.forwardRef<
  ElementRef<typeof ShadcnTabs>,
  TabsProps
>(({ className, ...props }, ref) => (
  <ShadcnTabs
    ref={ref}
    className={cn("w-full", className)}
    {...props}
  />
))
CustomTabs.displayName = "CustomTabs"

interface TabsListProps extends React.ComponentPropsWithoutRef<typeof ShadcnTabsList> {
  className?: string
}

const CustomTabsList = React.forwardRef<
  ElementRef<typeof ShadcnTabsList>,
  TabsListProps
>(({ className, ...props }, ref) => (
  <ShadcnTabsList
    ref={ref}
    className={cn(
      "h-10 bg-light-green/50 text-text p-1 rounded-md",
      className
    )}
    {...props}
  />
))
CustomTabsList.displayName = "CustomTabsList"

interface TabsTriggerProps extends React.ComponentPropsWithoutRef<typeof ShadcnTabsTrigger> {
  className?: string
}

const CustomTabsTrigger = React.forwardRef<
  ElementRef<typeof ShadcnTabsTrigger>,
  TabsTriggerProps
>(({ className, ...props }, ref) => (
  <ShadcnTabsTrigger
    ref={ref}
    className={cn(
      "h-8 px-4 py-2 rounded transition-colors",
      "data-[state=active]:bg-primary-green data-[state=active]:text-white",
      "data-[state=inactive]:text-text data-[state=inactive]:hover:bg-light-green/80",
      "focus:outline-none focus:ring-2 focus:ring-dark-green focus:ring-offset-2",
      className
    )}
    {...props}
  />
))
CustomTabsTrigger.displayName = "CustomTabsTrigger"

interface TabsContentProps extends React.ComponentPropsWithoutRef<typeof ShadcnTabsContent> {
  className?: string
}

const CustomTabsContent = React.forwardRef<
  ElementRef<typeof ShadcnTabsContent>,
  TabsContentProps
>(({ className, ...props }, ref) => (
  <ShadcnTabsContent
    ref={ref}
    className={cn("mt-4 rounded-md focus:outline-none", className)}
    {...props}
  />
))
CustomTabsContent.displayName = "CustomTabsContent"

export {
  CustomTabs as Tabs,
  CustomTabsList as TabsList,
  CustomTabsTrigger as TabsTrigger,
  CustomTabsContent as TabsContent
}