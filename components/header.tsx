/**
 * Header Component
 *
 * This component serves as the main navigation header for the application,
 * implementing the Tell a Friend design system with green, black, and white
 * color scheme as specified in the design requirements.
 *
 * Key features:
 * - Responsive mobile design
 * - Integration of Dunbar font
 * - Green, black, and white color scheme
 * - Language selection support
 * - Accessibility compliant navigation
 *
 * @dependencies
 * - Next.js Link: For navigation
 * - lucide-react: For icons
 * - @/components/ui: For UI components
 */

"use client"

import React, { useState } from "react"
import Link from "next/link"
import { UserButton, useAuth } from "@clerk/nextjs"
import {
  Menu,
  X,
  Home,
  Users,
  Award,
  Phone,
  LogIn,
  UserPlus
} from "lucide-react"
import { LanguageSelector } from "@/components/ui/language-selector"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface HeaderProps {
  /** Additional class names to apply to the header */
  className?: string
}

/**
 * Main application header implementing the Tell a Friend design system
 */
export default function Header({ className }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { isSignedIn } = useAuth()

  // Navigation links configuration
  const navLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/about", label: "About Us", icon: Users },
    { href: "/pricing", label: "Pricing", icon: Award },
    { href: "/contact", label: "Contact", icon: Phone }
  ]

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  return (
    <header
      className={cn(
        "bg-tell-a-friend-white sticky top-0 z-50 w-full border-b shadow-sm",
        className
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between p-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-tell-a-friend-green text-xl font-bold">
            Tell a Friend
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex md:items-center md:space-x-6">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="text-tell-a-friend-text hover:text-tell-a-friend-green flex items-center text-sm font-medium transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center space-x-4 md:flex">
          <LanguageSelector />

          {isSignedIn ? (
            <>
              <Button asChild variant="ghost">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    userButtonAvatarBox: "border-2 border-tell-a-friend-green"
                  }
                }}
              />
            </>
          ) : (
            <>
              <Button asChild variant="ghost">
                <Link href="/login" className="flex items-center gap-1">
                  <LogIn className="size-4" />
                  Login
                </Link>
              </Button>
              <Button
                asChild
                className="bg-tell-a-friend-green hover:bg-tell-a-friend-green/90"
              >
                <Link href="/signup" className="flex items-center gap-1">
                  <UserPlus className="size-4" />
                  Sign Up
                </Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center md:hidden">
          <LanguageSelector />

          {isSignedIn && (
            <div className="ml-4">
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    userButtonAvatarBox: "border-2 border-tell-a-friend-green"
                  }
                }}
              />
            </div>
          )}

          <Button
            variant="ghost"
            size="sm"
            className="ml-2 px-2"
            onClick={toggleMobileMenu}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? (
              <X className="size-6" />
            ) : (
              <Menu className="size-6" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="bg-tell-a-friend-white border-t md:hidden">
          <div className="space-y-1 px-4 py-3">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="hover:bg-tell-a-friend-green/10 flex items-center space-x-2 rounded-md px-3 py-2 text-base font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                <link.icon className="size-5" />
                <span>{link.label}</span>
              </Link>
            ))}

            {isSignedIn ? (
              <Link
                href="/dashboard"
                className="hover:bg-tell-a-friend-green/10 flex items-center space-x-2 rounded-md px-3 py-2 text-base font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Home className="size-5" />
                <span>Dashboard</span>
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hover:bg-tell-a-friend-green/10 flex items-center space-x-2 rounded-md px-3 py-2 text-base font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <LogIn className="size-5" />
                  <span>Login</span>
                </Link>
                <Link
                  href="/signup"
                  className="bg-tell-a-friend-green flex items-center space-x-2 rounded-md px-3 py-2 text-base font-medium text-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <UserPlus className="size-5" />
                  <span>Sign Up</span>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
