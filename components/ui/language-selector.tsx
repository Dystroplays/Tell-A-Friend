/**
 * LanguageSelector Component
 *
 * This component provides a dropdown for selecting between supported languages
 * (English and Spanish) as specified in the design requirements.
 *
 * Key features:
 * - Toggle between English and Spanish
 * - Accessible keyboard navigation
 * - Visual indication of current language
 * - Mobile responsive design
 *
 * @dependencies
 * - @/components/ui/dropdown-menu: For the dropdown interface
 * - lucide-react: For icon display
 */

"use client"

import React, { useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Globe } from "lucide-react"
import { cn } from "@/lib/utils"

// Define supported languages
type Language = "en" | "es"

interface LanguageOption {
  code: Language
  label: string
  nativeLabel: string
}

// Language options with both English and native labels
const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: "en", label: "English", nativeLabel: "English" },
  { code: "es", label: "Spanish", nativeLabel: "Español" }
]

interface LanguageSelectorProps {
  /** Additional class names to apply to the component */
  className?: string
  /** Optional initial language code */
  initialLanguage?: Language
  /** Callback when language is changed */
  onLanguageChange?: (language: Language) => void
}

/**
 * A dropdown component for selecting the application language
 * Supports English and Spanish as specified in design requirements
 */
export function LanguageSelector({
  className,
  initialLanguage = "en",
  onLanguageChange
}: LanguageSelectorProps) {
  const [currentLanguage, setCurrentLanguage] =
    useState<Language>(initialLanguage)

  /**
   * Handle language selection
   *
   * @param language - The selected language code
   */
  const handleLanguageSelect = (language: Language) => {
    setCurrentLanguage(language)

    // Call the callback if provided
    if (onLanguageChange) {
      onLanguageChange(language)
    }

    // In a real implementation, this would also update the application's
    // language context or state management system
  }

  // Find the current language details
  const currentLanguageOption =
    LANGUAGE_OPTIONS.find(lang => lang.code === currentLanguage) ||
    LANGUAGE_OPTIONS[0]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn("flex items-center gap-2 px-2", className)}
        >
          <Globe className="size-4" />
          <span className="hidden md:inline">
            {currentLanguageOption.nativeLabel}
          </span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        {LANGUAGE_OPTIONS.map(language => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageSelect(language.code)}
            className={cn(
              "cursor-pointer",
              currentLanguage === language.code && "bg-muted font-medium"
            )}
          >
            {language.nativeLabel} ({language.label})
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default LanguageSelector
