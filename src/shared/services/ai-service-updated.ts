"use server"

import { kv } from "@vercel/kv"
import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"
import { put } from "@vercel/blob"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

// Use Supabase instead of Neon - eliminates secondary database need
const supabase = createServerComponentClient({ cookies })

// Cache keys for Redis
const RECOMMENDATIONS_CACHE_KEY = "song_recommendations"
const USER_PREFERENCES_CACHE_KEY = "user_preferences"

// Function to get song recommendations using Groq
export async function getSongRecommendations(genre: string, mood: string) {
  try {
    // Check cache first
    const cacheKey = `${RECOMMENDATIONS_CACHE_KEY}:${genre}:${mood}`
    const cachedRecommendations = await kv.get(cacheKey)

    if (cachedRecommendations) {
      console.log("Using cached recommendations")
      return cachedRecommendations
    }

    // Generate recommendations with Groq
    const prompt = `Generate 5 song recommendations for ${genre} music with a ${mood} mood. 
    Return the result as a JSON array with each song having 'title' and 'artist' properties. 
    Only return the JSON array, no other text.`

    const { text } = await generateText({
      model: groq("llama3-70b-8192"),
      prompt,
      temperature: 0.7,
      maxTokens: 1000,
    })

    // Parse the response
    let recommendations
    try {
      // Extract JSON array from the response if needed
      const jsonMatch = text.match(/\[[\s\S]*\]/)
      const jsonString = jsonMatch ? jsonMatch[0] : text
      recommendations = JSON.parse(jsonString)
    } catch (error) {
      console.error("Error parsing AI response:", error)
      // Fallback recommendations
      recommendations = [
        { title: "Tsunami", artist: "Dash Berlin" },
        { title: "One", artist: "Veracocha" },
        { title: "Airwave", artist: "Rank 1" },
        { title: "Silence", artist: "Delerium ft. Sarah McLachlan" },
        { title: "For an Angel", artist: "Paul van Dyk" },
      ]
    }

    // Cache the recommendations for 1 hour
    await kv.set(cacheKey, recommendations, { ex: 3600 })

    return recommendations
  } catch (error) {
    console.error("Error getting song recommendations:", error)
    // Return fallback recommendations
    return [
      { title: "Tsunami", artist: "Dash Berlin" },
      { title: "One", artist: "Veracocha" },
      { title: "Airwave", artist: "Rank 1" },
      { title: "Silence", artist: "Delerium ft. Sarah McLachlan" },
      { title: "For an Angel", artist: "Paul van Dyk" },
    ]
  }
}

// Function to save user music preferences to Supabase (NOT Neon)
export async function saveUserPreferences(
  userId: string,
  preferences: {
    genre: string
    mood: string
    danceability: number
    energy: number
    popularity: number
  },
) {
  try {
    // Use Supabase instead of Neon
    const { data: existingPrefs, error: selectError } = await supabase
      .from("user_preferences")
      .select("*")
      .eq("user_id", userId)
      .single()

    if (existingPrefs) {
      // Update existing preferences
      const { error } = await supabase
        .from("user_preferences")
        .update({
          genre: preferences.genre,
          mood: preferences.mood,
          danceability: preferences.danceability,
          energy: preferences.energy,
          popularity: preferences.popularity,
          updated_at: new Date().toISOString()
        })
        .eq("user_id", userId)

      if (error) {
        console.error("Error updating user preferences:", error)
        throw new Error("Failed to update preferences")
      }
    } else {
      // Insert new preferences
      const { error } = await supabase
        .from("user_preferences")
        .insert({
          user_id: userId,
          genre: preferences.genre,
          mood: preferences.mood,
          danceability: preferences.danceability,
          energy: preferences.energy,
          popularity: preferences.popularity
        })

      if (error) {
        console.error("Error inserting user preferences:", error)
        throw new Error("Failed to save preferences")
      }
    }

    console.log("Saved user preferences to Supabase")

    // Update the cache
    await kv.set(`${USER_PREFERENCES_CACHE_KEY}:${userId}`, preferences, { ex: 86400 }) // Cache for 24 hours
    console.log("Updated user preferences cache")

    return { success: true }
  } catch (error) {
    console.error("Error saving user preferences:", error)
    throw new Error("Failed to save preferences")
  }
}

// Function to get user music preferences from Supabase (NOT Neon)
export async function getUserPreferences(userId: string) {
  try {
    console.log("Getting preferences for user:", userId)

    // Check cache first
    const cachedPreferences = await kv.get(`${USER_PREFERENCES_CACHE_KEY}:${userId}`)

    if (cachedPreferences) {
      console.log("Using cached user preferences")
      return cachedPreferences
    }

    // Get from Supabase instead of Neon
    const { data: preferences, error } = await supabase
      .from("user_preferences")
      .select("genre, mood, danceability, energy, popularity")
      .eq("user_id", userId)
      .single()

    if (error) {
      console.log("No preferences found, returning defaults")
      // Return default preferences
      const defaultPrefs = {
        genre: "electronic",
        mood: "energetic", 
        danceability: 80,
        energy: 70,
        popularity: 60
      }

      // Cache the defaults
      await kv.set(`${USER_PREFERENCES_CACHE_KEY}:${userId}`, defaultPrefs, { ex: 86400 })
      return defaultPrefs
    }

    // Cache the preferences
    await kv.set(`${USER_PREFERENCES_CACHE_KEY}:${userId}`, preferences, { ex: 86400 })
    console.log("Cached user preferences from Supabase")

    return preferences
  } catch (error) {
    console.error("Error getting user preferences:", error)
    // Return default preferences as fallback
    return {
      genre: "electronic",
      mood: "energetic",
      danceability: 80,
      energy: 70,
      popularity: 60
    }
  }
}

// Generate personalized recommendations based on user preferences
export async function getPersonalizedRecommendations(userId: string) {
  try {
    const userPrefs = await getUserPreferences(userId)
    return await getSongRecommendations(userPrefs.genre, userPrefs.mood)
  } catch (error) {
    console.error("Error getting personalized recommendations:", error)
    // Fallback to general electronic recommendations
    return await getSongRecommendations("electronic", "energetic")
  }
}

// Upload event image function (unchanged)
export async function uploadEventImage(file: File) {
  try {
    const { url } = await put(file.name, file, {
      access: "public",
    })
    return { success: true, url }
  } catch (error) {
    console.error("Error uploading image:", error)
    return { success: false, error: "Failed to upload image" }
  }
}

// Generate event description (unchanged) 
export async function generateEventDescription(eventName: string, eventType: string, dj: string) {
  try {
    const prompt = `Generate an exciting event description for a ${eventType} event called "${eventName}" featuring DJ ${dj}. Make it engaging and highlight the music experience. Keep it under 200 words.`

    const { text } = await generateText({
      model: groq("llama3-70b-8192"),
      prompt,
      temperature: 0.7,
      maxTokens: 300,
    })

    return { success: true, description: text }
  } catch (error) {
    console.error("Error generating description:", error)
    return { 
      success: false, 
      description: `Join us for an incredible ${eventType} experience with ${dj}! Get ready for an unforgettable night of music and dancing.` 
    }
  }
} 