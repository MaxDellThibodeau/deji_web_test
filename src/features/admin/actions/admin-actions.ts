"use server"
import { findUserByEmail } from "@/features/auth/services/dummy-accounts"

// Add tokens to a specific user by email
export async function addTokensToUser(email: string, amount: number) {
  try {
    // For demo purposes, we'll use the dummy accounts
    const user = findUserByEmail(email)

    if (!user) {
      return { success: false, message: `User with email ${email} not found` }
    }

    // In a real app, we would update the database
    // For our demo, we'll just return success
    return {
      success: true,
      message: `Added ${amount} tokens to ${email}`,
      userId: user.id,
    }
  } catch (error) {
    console.error("Error adding tokens to user:", error)
    return { success: false, message: "An error occurred" }
  }
}
