import Stripe from "stripe"

// Initialize Stripe with the secret key
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-04-30.basil", // Use the latest API version
})

/**
 * Convert a dollar amount to the smallest currency unit (cents for USD)
 * This is required for Stripe as they work with the smallest currency unit
 */
export function formatAmountForStripe(amount: number): number {
  // Convert dollars to cents
  return Math.round(amount * 100)
}

/**
 * Format an amount for display with currency symbol
 */
export function formatAmountForDisplay(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}
