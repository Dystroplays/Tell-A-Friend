/**
 * AccessibleFocus Component
 *
 * This component wraps elements to provide accessible focus styles and keyboard navigation.
 * It enhances accessibility by providing consistent focus indicators and ensuring
 * interactive elements can be navigated via keyboard.
 *
 * Key features:
 * - Consistent focus styles across the application
 * - Support for keyboard navigation
 * - ARIA attributes for screen readers
 *
 * @example
 * <AccessibleFocus>
 *   <Button>Click me</Button>
 * </AccessibleFocus>
 */

"use client"

import React, { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface AccessibleFocusProps {
  /** The element to be wrapped with accessible focus styles */
  children: ReactNode
  /** Additional class names to apply to the wrapper */
  className?: string
  /** Optional ID for the wrapper element */
  id?: string
  /** Optional tabIndex override (default is 0 for focusable elements) */
  tabIndex?: number
  /** Whether the element should be focusable (default true) */
  focusable?: boolean
}

/**
 * A component that provides consistent focus styles and keyboard navigation
 * to enhance accessibility throughout the application.
 */
export function AccessibleFocus({
  children,
  className,
  id,
  tabIndex = 0,
  focusable = true
}: AccessibleFocusProps) {
  return (
    <div
      id={id}
      className={cn(
        "focus-outline transition-all",
        focusable
          ? "focus-visible:ring-tell-a-friend-green focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          : "",
        className
      )}
      tabIndex={focusable ? tabIndex : -1}
      role={focusable ? "group" : undefined}
    >
      {children}
    </div>
  )
}

/**
 * A hook to handle keyboard navigation between focusable elements
 *
 * @returns Functions for handling keyboard navigation
 */
export function useKeyboardNavigation() {
  /**
   * Handle keyboard navigation between focusable elements
   *
   * @param e - The keyboard event
   * @param currentIndex - The index of the current element
   * @param totalElements - The total number of focusable elements
   * @param onNavigate - Callback function when navigation occurs
   */
  const handleKeyboardNavigation = (
    e: React.KeyboardEvent,
    currentIndex: number,
    totalElements: number,
    onNavigate: (newIndex: number) => void
  ) => {
    switch (e.key) {
      case "ArrowRight":
      case "ArrowDown":
        e.preventDefault()
        onNavigate((currentIndex + 1) % totalElements)
        break
      case "ArrowLeft":
      case "ArrowUp":
        e.preventDefault()
        onNavigate((currentIndex - 1 + totalElements) % totalElements)
        break
      case "Home":
        e.preventDefault()
        onNavigate(0)
        break
      case "End":
        e.preventDefault()
        onNavigate(totalElements - 1)
        break
      default:
        break
    }
  }

  return {
    handleKeyboardNavigation
  }
}

export default AccessibleFocus
