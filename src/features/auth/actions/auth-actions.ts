"use server"

// import { cookies } from "next/headers" // Server-side only
// import { redirect } from "next/navigation" // Server-side only
import { createClient } from "@/shared/services/server"

export async function logout(formData: FormData) {
  // Get the current path from the formData
  const currentPath = (formData.get("currentPath") as string) || "/landing"

  try {
    // Save any pending token updates before logging out
    const supabase = createClient()
    const userId = cookies().get("user_id")?.value

    if (userId) {
      // Get any pending token updates from cookies if they exist
      const pendingTokens = cookies().get("pending_token_update")?.value

      if (pendingTokens) {
        try {
          const tokenData = JSON.parse(pendingTokens)
          if (tokenData.profileId === userId && tokenData.amount) {
            // Update the token balance in the database
            await supabase.from("user_tokens").upsert({
              profile_id: userId,
              balance: tokenData.amount,
              updated_at: new Date().toISOString(),
            })

            console.log(`Saved pending token update for user ${userId}: ${tokenData.amount} tokens`)

            // Also record this in transaction history
            await supabase.from("token_transactions").insert({
              profile_id: userId,
              amount: tokenData.amount - (tokenData.previousAmount || 0),
              transaction_type: "bid_adjustment",
              description: "Token balance adjustment during logout",
            })
          }
        } catch (e) {
          console.error("Error parsing or saving pending token update:", e)
        }
      }
    }

    // Clear all auth-related cookies
    const cookieStore = cookies()

    // Clear specific auth cookies
    cookieStore.delete("session")
    cookieStore.delete("supabase-auth-token")
    cookieStore.delete("user_id")
    cookieStore.delete("user_role")
    cookieStore.delete("user_name")
    cookieStore.delete("first_login")
    cookieStore.delete("pending_token_update")

    // Get all cookies and delete them
    const allCookies = cookieStore.getAll()
    for (const cookie of allCookies) {
      if (
        cookie.name.includes("supabase") ||
        cookie.name.includes("session") ||
        cookie.name.includes("user") ||
        cookie.name.includes("auth")
      ) {
        cookieStore.delete(cookie.name)
      }
    }

    // Log the logout action
    console.log(`User logged out from ${currentPath}`)

    // Always redirect to landing page after logout for consistency
    redirect("/landing")
  } catch (error) {
    console.error("Error during logout:", error)
    // Still redirect to landing page even if there's an error
    redirect("/landing")
  }
}

export async function login(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const redirectTo = (formData.get("redirectTo") as string) || "/landing"

  try {
    // Check if we're in preview mode
    const isPreviewMode = import.meta.env.DEV || !import.meta.env.VITE_SUPABASE_URL

    if (isPreviewMode) {
      // Set mock session cookies
      const cookieStore = cookies()
      cookieStore.set("session", "mock-session", { path: "/" })
      cookieStore.set("user_id", "mock-user-id", { path: "/" })
      cookieStore.set("first_login", "true", { path: "/" })

      // Log the login action
      console.log(`User logged in with email: ${email} (PREVIEW MODE)`)

      // Create a login log entry in the database
      const supabase = createClient()
      await supabase.from("login_logs").insert({
        email: email,
        status: "success",
        ip_address: "127.0.0.1", // Mock IP for preview mode
        user_agent: "Preview Mode",
        login_time: new Date().toISOString(),
      })

      // Redirect to the specified page
      redirect(redirectTo)
    }

    // Real authentication logic for production
    const supabase = createClient()

    // Log the login attempt
    console.log(`Login attempt with email: ${email}`)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      // Log failed login attempt
      await supabase.from("login_logs").insert({
        email: email,
        status: "failed",
        error_message: error.message,
        ip_address: "Unknown", // In a real app, you'd get this from the request
        user_agent: "Unknown", // In a real app, you'd get this from the request
        login_time: new Date().toISOString(),
      })

      console.log(`Login failed for email: ${email} - ${error.message}`)
      return { error: error.message }
    }

    // Log successful login
    await supabase.from("login_logs").insert({
      email: email,
      status: "success",
      user_id: data.user.id,
      ip_address: "Unknown", // In a real app, you'd get this from the request
      user_agent: "Unknown", // In a real app, you'd get this from the request
      login_time: new Date().toISOString(),
    })

    console.log(`User logged in successfully: ${email} (User ID: ${data.user.id})`)

    // Check if this is the user's first login
    const { data: userData, error: userError } = await supabase
      .from("user_logins")
      .select("login_count")
      .eq("user_id", data.user.id)
      .single()

    let isFirstLogin = false

    if (userError || !userData) {
      // No login record found, this is their first login
      isFirstLogin = true

      // Create a login record
      await supabase.from("user_logins").insert({
        user_id: data.user.id,
        login_count: 1,
        last_login: new Date().toISOString(),
      })

      // Grant 10 free tokens
      await supabase.from("user_tokens").upsert({
        profile_id: data.user.id,
        balance: 10,
      })

      // Record the token grant in transaction history
      await supabase.from("token_transactions").insert({
        profile_id: data.user.id,
        amount: 10,
        transaction_type: "welcome_bonus",
        description: "Welcome bonus - 10 free tokens",
      })

      console.log(`First login for user: ${email} - Granted 10 welcome tokens`)
    } else {
      // Update the login count
      await supabase
        .from("user_logins")
        .update({
          login_count: (userData.login_count || 0) + 1,
          last_login: new Date().toISOString(),
        })
        .eq("user_id", data.user.id)

      console.log(`Return login for user: ${email} - Login count: ${(userData.login_count || 0) + 1}`)
    }

    // Set a cookie to indicate first login status for the frontend
    if (isFirstLogin) {
      const cookieStore = cookies()
      cookieStore.set("first_login", "true", { path: "/" })
    }

    // Always redirect to the specified redirectTo parameter
    redirect(redirectTo)
  } catch (error) {
    console.error("Unexpected login error:", error)
    return { error: "An unexpected error occurred" }
  }
}
