"use server"

// import { revalidatePath } from "next/cache" // Server-side only
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
// import { cookies } from "next/headers" // Server-side only
import { put } from "@vercel/blob"
import type { UserProfile } from "../types/user"

// Type for profile update
export type ProfileUpdate = {
  name?: string
  email?: string
  phone?: string
  location?: string
  bio?: string
  website?: string
  preferences?: Record<string, any>
}

// Update user profile
export async function updateUserProfile(data: ProfileUpdate) {
  try {
    const supabase = createServerComponentClient({ cookies })

    // Check if user is authenticated
    const { data: session } = await supabase.auth.getSession()
    if (!session.session) {
      return { success: false, error: "Unauthorized" }
    }

    // Update profile in database
    const { error } = await supabase
      .from("profiles")
      .update({
        name: data.name,
        phone: data.phone,
        location: data.location,
        bio: data.bio,
        website: data.website,
        preferences: data.preferences,
        updated_at: new Date().toISOString(),
      })
      .eq("id", session.session.user.id)

    if (error) {
      console.error("Error updating profile:", error)
      return { success: false, error: "Failed to update profile" }
    }

    // Update cookies
    const cookieStore = await cookies()
    const options = {
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      secure: import.meta.env.PROD,
      httpOnly: true,
      sameSite: "strict" as const,
    }

    cookieStore.set("user_name", data.name || "", options)
    cookieStore.set("user_phone", data.phone || "", options)
    cookieStore.set("user_location", data.location || "", options)
    cookieStore.set("user_bio", data.bio || "", options)
    cookieStore.set("user_website", data.website || "", options)

    // Revalidate paths
    revalidatePath("/profile")
    revalidatePath("/settings")

    return { success: true }
  } catch (error) {
    console.error("Error in updateUserProfile:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

// Upload profile image
export async function uploadProfileImage(formData: FormData) {
  try {
    const file = formData.get("file") as File
    const userId = formData.get("userId") as string

    if (!file || !userId) {
      return { success: false, error: "Missing required fields" }
    }

    // Check if user is authenticated
    const supabase = createServerComponentClient({ cookies })
    const { data: session } = await supabase.auth.getSession()

    if (!session.session || session.session.user.id !== userId) {
      return { success: false, error: "Unauthorized" }
    }

    // Generate a unique filename
    const timestamp = Date.now()
    const fileExtension = file.name.split(".").pop()
    const filename = `profile_${userId}_${timestamp}.${fileExtension}`

    // Upload to Vercel Blob
    const { url } = await put(`profile-images/${filename}`, file, {
      access: "public",
    })

    // Update profile with new image URL
    const { error } = await supabase
      .from("profiles")
      .update({
        avatar_url: url,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)

    if (error) {
      console.error("Error updating profile with image URL:", error)
      return { success: false, error: "Failed to update profile with image URL" }
    }

    // Also store in profile_images table
    const { error: imageError } = await supabase.from("profile_images").insert({
      profile_id: userId,
      url: url,
      is_primary: true,
    })

    if (imageError) {
      console.error("Error storing image record:", imageError)
      // Continue anyway since the profile was updated
    }

    // Revalidate paths
    revalidatePath("/settings")
    revalidatePath("/profile")

    // Check user role for additional revalidation
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", userId).single()

    if (profile?.role === "dj") {
      revalidatePath("/dj-portal/profile")
    } else if (profile?.role === "venue") {
      revalidatePath("/venue-portal/profile")
    }

    return { success: true, url }
  } catch (error) {
    console.error("Error in uploadProfileImage:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

// Update user settings
export async function updateUserSettings(userId: string, settings: Record<string, any>) {
  try {
    const supabase = createServerComponentClient({ cookies })

    // Check if user is authenticated
    const { data: session } = await supabase.auth.getSession()
    if (!session.session || session.session.user.id !== userId) {
      return { success: false, error: "Unauthorized" }
    }

    // Check if settings record exists
    const { data: existingSettings } = await supabase.from("user_settings").select("id").eq("id", userId).single()

    let result
    if (existingSettings) {
      // Update existing settings
      result = await supabase
        .from("user_settings")
        .update({
          ...settings,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)
    } else {
      // Insert new settings
      result = await supabase.from("user_settings").insert({
        id: userId,
        ...settings,
      })
    }

    if (result.error) {
      console.error("Error updating settings:", result.error)
      return { success: false, error: "Failed to update settings" }
    }

    // Revalidate paths
    revalidatePath("/settings")

    return { success: true }
  } catch (error) {
    console.error("Error in updateUserSettings:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}
