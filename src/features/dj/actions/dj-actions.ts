"use server"

import { revalidatePath } from "next/cache"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { put } from "@vercel/blob"

// Type for DJ profile update
type DjProfileUpdate = {
  id: string
  name: string
  stageName: string
  email: string
  phone?: string
  bio: string
  location: string
  experience: string
  primaryGenre: string
  secondaryGenres?: string
  hourlyRate?: string
  equipmentProvided: boolean
  website?: string
  instagram?: string
  twitter?: string
  facebook?: string
  soundcloud?: string
  youtube?: string
  twitch?: string
  availableForBooking: boolean
  featuredOnHomepage: boolean
  notificationsEnabled: boolean
  profileImage?: string
  coverImage?: string
  audioSamples?: string[]
}

// Update DJ profile
export async function updateDjProfile(data: DjProfileUpdate) {
  try {
    const supabase = createServerComponentClient({ cookies })

    // Check if user is authenticated
    const { data: session } = await supabase.auth.getSession()
    if (!session.session || session.session.user.id !== data.id) {
      return { success: false, error: "Unauthorized" }
    }

    // Check if profile exists
    const { data: existingProfile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", data.id)
      .single()

    if (profileError && profileError.code !== "PGRST116") {
      console.error("Error checking profile:", profileError)
      return { success: false, error: "Failed to check profile" }
    }

    // Update basic profile information
    const profileUpdate = {
      name: data.name,
      email: data.email,
      avatar_url: data.profileImage,
      updated_at: new Date().toISOString(),
    }

    const { error: updateError } = await supabase.from("profiles").update(profileUpdate).eq("id", data.id)

    if (updateError) {
      console.error("Error updating profile:", updateError)
      return { success: false, error: "Failed to update profile" }
    }

    // Check if DJ profile exists
    const { data: existingDjProfile, error: djProfileError } = await supabase
      .from("dj_profiles")
      .select("*")
      .eq("profile_id", data.id)
      .single()

    // Prepare DJ profile data
    const djProfileData = {
      profile_id: data.id,
      stage_name: data.stageName,
      bio: data.bio,
      location: data.location,
      phone: data.phone || null,
      experience_level: data.experience,
      primary_genre: data.primaryGenre,
      secondary_genres: data.secondaryGenres || null,
      hourly_rate: data.hourlyRate ? Number.parseInt(data.hourlyRate) : null,
      equipment_provided: data.equipmentProvided,
      website: data.website || null,
      instagram: data.instagram || null,
      twitter: data.twitter || null,
      facebook: data.facebook || null,
      soundcloud: data.soundcloud || null,
      youtube: data.youtube || null,
      twitch: data.twitch || null,
      cover_image: data.coverImage || null,
      available_for_booking: data.availableForBooking,
      featured: data.featuredOnHomepage,
      notifications_enabled: data.notificationsEnabled,
      updated_at: new Date().toISOString(),
    }

    // Insert or update DJ profile
    let djProfileResult
    if (existingDjProfile) {
      // Update existing DJ profile
      djProfileResult = await supabase.from("dj_profiles").update(djProfileData).eq("profile_id", data.id)
    } else {
      // Insert new DJ profile
      djProfileResult = await supabase.from("dj_profiles").insert({
        ...djProfileData,
        created_at: new Date().toISOString(),
      })
    }

    if (djProfileResult.error) {
      console.error("Error updating DJ profile:", djProfileResult.error)
      return { success: false, error: "Failed to update DJ profile" }
    }

    // Handle audio samples if provided
    if (data.audioSamples && data.audioSamples.length > 0) {
      // First, delete existing audio samples
      const { error: deleteError } = await supabase.from("dj_audio_samples").delete().eq("dj_id", data.id)

      if (deleteError) {
        console.error("Error deleting existing audio samples:", deleteError)
        // Continue anyway, we'll add the new ones
      }

      // Insert new audio samples
      const audioSampleData = data.audioSamples.map((url, index) => ({
        dj_id: data.id,
        url,
        title: `Sample ${index + 1}`,
        order: index,
        created_at: new Date().toISOString(),
      }))

      const { error: insertError } = await supabase.from("dj_audio_samples").insert(audioSampleData)

      if (insertError) {
        console.error("Error inserting audio samples:", insertError)
        // Continue anyway, the profile was updated
      }
    }

    // Revalidate paths
    revalidatePath("/dj-portal/profile")
    revalidatePath("/dj-portal/dashboard")
    revalidatePath(`/djs/${data.id}`)
    revalidatePath("/djs")

    return { success: true }
  } catch (error) {
    console.error("Error in updateDjProfile:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

// Upload DJ media (profile image, cover image, audio samples)
export async function uploadDjMedia(formData: FormData) {
  try {
    const file = formData.get("file") as File
    const userId = formData.get("userId") as string
    const type = formData.get("type") as string

    if (!file || !userId || !type) {
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
    const filename = `${type}_${userId}_${timestamp}.${fileExtension}`

    // Upload to Vercel Blob
    const { url } = await put(`dj-media/${filename}`, file, {
      access: "public",
    })

    return { success: true, url }
  } catch (error) {
    console.error("Error in uploadDjMedia:", error)
    return { success: false, error: "Failed to upload media" }
  }
}
