"use server"
import { createClient } from "@/shared/services/server"

// Add tokens to a specific user by email
export async function addTokensToUser(email: string, amount: number) {
  try {
    const supabase = createClient()

    // Find user by email in profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single()

    if (profileError || !profile) {
      return { success: false, message: `User with email ${email} not found` }
    }

    // Get current token balance
    const { data: userTokens, error: tokenError } = await supabase
      .from("user_tokens")
      .select("balance")
      .eq("profile_id", profile.id)
      .single()

    if (tokenError && tokenError.code !== 'PGRST116') {
      console.error("Error fetching user tokens:", tokenError)
      return { success: false, message: "Could not verify user token balance" }
    }

    // If no token record exists, create one
    if (!userTokens) {
      const { error: createError } = await supabase
        .from("user_tokens")
        .insert([{ profile_id: profile.id, balance: amount }])

      if (createError) {
        console.error("Error creating user token record:", createError)
        return { success: false, message: "Could not create token record" }
      }
    } else {
      // Update existing token balance
      const newBalance = (userTokens.balance || 0) + amount
      const { error: updateError } = await supabase
        .from("user_tokens")
        .update({ balance: newBalance })
        .eq("profile_id", profile.id)

      if (updateError) {
        console.error("Error updating token balance:", updateError)
        return { success: false, message: "Could not update token balance" }
      }
    }

    // Record the transaction
    const { error: transactionError } = await supabase.from("token_transactions").insert([
      {
        profile_id: profile.id,
        amount: amount,
        transaction_type: "admin_grant",
        description: `Admin granted ${amount} tokens to ${email}`,
      },
    ])

    if (transactionError) {
      console.error("Error recording admin transaction:", transactionError)
      // Don't fail the whole operation if just the transaction record fails
    }

    console.log(`[ADMIN] Added ${amount} tokens to user ${email} (ID: ${profile.id})`)

    return {
      success: true,
      message: `Added ${amount} tokens to ${email}`,
      userId: profile.id,
    }
  } catch (error) {
    console.error("Error adding tokens to user:", error)
    return { success: false, message: "An unexpected error occurred" }
  }
}
