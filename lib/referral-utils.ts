/**
 * Utility functions for the referral system
 *
 * This file contains helper functions for generating and validating
 * referral codes and handling referral-related operations.
 */

/**
 * Generates a unique referral code
 *
 * Creates an 8-character alphanumeric code that excludes ambiguous characters
 * to make the code easier to read and share.
 *
 * @returns A unique referral code string
 */
export function generateReferralCode(): string {
  // Exclude ambiguous characters like 0, O, 1, I, etc.
  const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let result = ""

  // Generate 8 character code
  for (let i = 0; i < 8; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length)
    result += characters.charAt(randomIndex)
  }

  return result
}

/**
 * Validates a referral code format
 *
 * Checks if a given string matches the expected referral code format.
 *
 * @param code - The referral code to validate
 * @returns Boolean indicating if the code format is valid
 */
export function isValidReferralCodeFormat(code: string): boolean {
  // Check if code is valid format - 8 uppercase alphanumeric characters
  // with excluded ambiguous characters
  const referralCodeRegex = /^[A-HJKMNP-Z2-9]{8}$/
  return referralCodeRegex.test(code)
}

/**
 * Formats a referral code for display
 *
 * Adds formatting to make the referral code more readable.
 *
 * @param code - The raw referral code
 * @returns Formatted referral code
 */
export function formatReferralCode(code: string): string {
  if (!code || code.length !== 8) return code

  // Add a hyphen in the middle for readability
  return `${code.substring(0, 4)}-${code.substring(4)}`
}
