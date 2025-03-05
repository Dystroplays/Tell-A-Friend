"use client"

/**
 * Custom Select Component
 * 
 * A branded wrapper around the Shadcn Select component with green-themed styling.
 * Maintains all functionality of the original component while applying consistent 
 * brand styling.
 * 
 * @component
 */

import * as React from "react"
import { ElementRef } from "react"
import { cn } from "@/lib/utils"
import {
  Select as ShadcnSelect,
  SelectContent as ShadcnSelectContent,
  SelectGroup as ShadcnSelectGroup,
  SelectItem as ShadcnSelectItem,
  SelectLabel as ShadcnSelectLabel,
  SelectTrigger as ShadcnSelectTrigger,
  SelectValue as ShadcnSelectValue,
  SelectSeparator as ShadcnSelectSeparator,
  SelectScrollUpButton as ShadcnSelectScrollUpButton,
  SelectScrollDownButton as ShadcnSelectScrollDownButton
} from "@/components/ui/select"

type SelectProps = React.ComponentPropsWithoutRef<typeof ShadcnSelect> & {
  className?: string
}

const CustomSelect = React.forwardRef<
  ElementRef<typeof ShadcnSelect>,
  SelectProps
>(({ className, ...props }, ref) => {
  return <ShadcnSelect {...props} />
})
CustomSelect.displayName = "CustomSelect"

interface SelectTriggerProps extends React.ComponentPropsWithoutRef<typeof ShadcnSelectTrigger> {
  className?: string
}

const CustomSelectTrigger = React.forwardRef<
  ElementRef<typeof ShadcnSelectTrigger>,
  SelectTriggerProps
>(({ className, ...props }, ref) => (
  <ShadcnSelectTrigger
    ref={ref}
    className={cn(
      "border-primary-green focus:ring-1 focus:ring-dark-green",
      "h-10 px-3 py-2 rounded-md",
      "text-text bg-white",
      "focus:outline-none focus:ring-2 focus:ring-dark-green focus:ring-offset-1",
      className
    )}
    {...props}
  />
))
CustomSelectTrigger.displayName = "CustomSelectTrigger"

interface SelectValueProps extends React.ComponentPropsWithoutRef<typeof ShadcnSelectValue> {
  className?: string
}

const CustomSelectValue = React.forwardRef<
  ElementRef<typeof ShadcnSelectValue>,
  SelectValueProps
>(({ className, ...props }, ref) => (
  <ShadcnSelectValue
    ref={ref}
    className={cn("text-text", className)}
    {...props}
  />
))
CustomSelectValue.displayName = "CustomSelectValue"

interface SelectContentProps extends React.ComponentPropsWithoutRef<typeof ShadcnSelectContent> {
  className?: string
}

const CustomSelectContent = React.forwardRef<
  ElementRef<typeof ShadcnSelectContent>,
  SelectContentProps
>(({ className, ...props }, ref) => (
  <ShadcnSelectContent
    ref={ref}
    className={cn(
      "bg-white border-light-green",
      "rounded-md shadow-md min-w-[8rem]",
      "focus:outline-none",
      className
    )}
    {...props}
  />
))
CustomSelectContent.displayName = "CustomSelectContent"

interface SelectGroupProps extends React.ComponentPropsWithoutRef<typeof ShadcnSelectGroup> {
  className?: string
}

const CustomSelectGroup = React.forwardRef<
  ElementRef<typeof ShadcnSelectGroup>,
  SelectGroupProps
>(({ className, ...props }, ref) => (
  <ShadcnSelectGroup ref={ref} className={cn(className)} {...props} />
))
CustomSelectGroup.displayName = "CustomSelectGroup"

interface SelectLabelProps extends React.ComponentPropsWithoutRef<typeof ShadcnSelectLabel> {
  className?: string
}

const CustomSelectLabel = React.forwardRef<
  ElementRef<typeof ShadcnSelectLabel>,
  SelectLabelProps
>(({ className, ...props }, ref) => (
  <ShadcnSelectLabel
    ref={ref}
    className={cn("text-text font-medium text-sm px-2 py-1.5", className)}
    {...props}
  />
))
CustomSelectLabel.displayName = "CustomSelectLabel"

interface SelectItemProps extends React.ComponentPropsWithoutRef<typeof ShadcnSelectItem> {
  className?: string
}

const CustomSelectItem = React.forwardRef<
  ElementRef<typeof ShadcnSelectItem>,
  SelectItemProps
>(({ className, ...props }, ref) => (
  <ShadcnSelectItem
    ref={ref}
    className={cn(
      "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5",
      "text-sm text-text outline-none transition-colors",
      "data-[highlighted]:bg-light-green data-[highlighted]:text-text",
      "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      "cursor-pointer hover:bg-light-green focus:bg-light-green",
      className
    )}
    {...props}
  />
))
CustomSelectItem.displayName = "CustomSelectItem"

interface SelectSeparatorProps extends React.ComponentPropsWithoutRef<typeof ShadcnSelectSeparator> {
  className?: string
}

const CustomSelectSeparator = React.forwardRef<
  ElementRef<typeof ShadcnSelectSeparator>,
  SelectSeparatorProps
>(({ className, ...props }, ref) => (
  <ShadcnSelectSeparator
    ref={ref}
    className={cn("bg-light-green my-1 h-px", className)}
    {...props}
  />
))
CustomSelectSeparator.displayName = "CustomSelectSeparator"

const CustomSelectScrollUpButton = React.forwardRef<
  ElementRef<typeof ShadcnSelectScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof ShadcnSelectScrollUpButton>
>(({ className, ...props }, ref) => (
  <ShadcnSelectScrollUpButton
    ref={ref}
    className={cn("flex cursor-default items-center justify-center py-1 text-primary-green", className)}
    {...props}
  />
))
CustomSelectScrollUpButton.displayName = "CustomSelectScrollUpButton"

const CustomSelectScrollDownButton = React.forwardRef<
  ElementRef<typeof ShadcnSelectScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof ShadcnSelectScrollDownButton>
>(({ className, ...props }, ref) => (
  <ShadcnSelectScrollDownButton
    ref={ref}
    className={cn("flex cursor-default items-center justify-center py-1 text-primary-green", className)}
    {...props}
  />
))
CustomSelectScrollDownButton.displayName = "CustomSelectScrollDownButton"

export {
  CustomSelect as Select,
  CustomSelectTrigger as SelectTrigger,
  CustomSelectValue as SelectValue,
  CustomSelectContent as SelectContent,
  CustomSelectGroup as SelectGroup,
  CustomSelectLabel as SelectLabel,
  CustomSelectItem as SelectItem,
  CustomSelectSeparator as SelectSeparator,
  CustomSelectScrollUpButton as SelectScrollUpButton,
  CustomSelectScrollDownButton as SelectScrollDownButton
}