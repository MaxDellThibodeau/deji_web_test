"use server"

import { kv } from "@vercel/kv"
import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"
import { put } from "@vercel/blob"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

// Initialize Supabase client
const supabase = createServerComponentClient({ cookies })

// Cache key for Redis
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

// Function to save user music preferences to Neon PostgreSQL
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
    // Try to save to Supabase database
    try {
      // Use upsert to insert or update preferences
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: userId,
          genre: preferences.genre,
          mood: preferences.mood,
          danceability: preferences.danceability,
          energy: preferences.energy,
          popularity: preferences.popularity,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        })

      if (error) {
        console.error("Supabase error:", error)
        throw error
      }

      console.log("Saved user preferences to Supabase")
    } catch (error) {
      console.error("Error saving to database, falling back to cache:", error)
      // Continue anyway, we'll use the cache
    }

    // Always update the cache
    await kv.set(`${USER_PREFERENCES_CACHE_KEY}:${userId}`, preferences, { ex: 86400 }) // Cache for 24 hours
    console.log("Saved user preferences to cache")

    return { success: true }
  } catch (error) {
    console.error("Error saving user preferences:", error)
    throw new Error("Failed to save preferences")
  }
}

// Function to get user music preferences
export async function getUserPreferences(userId: string) {
  try {
    console.log("Getting preferences for user:", userId)

    // Check cache first
    const cachedPreferences = await kv.get(`${USER_PREFERENCES_CACHE_KEY}:${userId}`)

    if (cachedPreferences) {
      console.log("Using cached user preferences")
      return cachedPreferences
    }

    // Try to get from Supabase database
    try {
      const { data: preferences, error } = await supabase
        .from('user_preferences')
        .select('genre, mood, danceability, energy, popularity')
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
        console.error("Supabase error:", error)
        throw error
      }

      if (preferences) {
        console.log("Found preferences in Supabase")
        // Cache the preferences
        await kv.set(`${USER_PREFERENCES_CACHE_KEY}:${userId}`, preferences, { ex: 86400 }) // Cache for 24 hours
        return preferences
      }

      console.log("No preferences found in database, using defaults")
    } catch (dbError) {
      console.error("Database error, using default preferences:", dbError)
      // Continue to default preferences
    }

    // Return default preferences
    const defaultPreferences = {
      genre: "electronic",
      mood: "energetic",
      danceability: 80,
      energy: 70,
      popularity: 60,
    }

    // Cache the default preferences
    await kv.set(`${USER_PREFERENCES_CACHE_KEY}:${userId}`, defaultPreferences, { ex: 86400 }) // Cache for 24 hours
    console.log("Saved default preferences to cache")

    return defaultPreferences
  } catch (error) {
    console.error("Error getting user preferences:", error)
    // Return default preferences
    return {
      genre: "electronic",
      mood: "energetic",
      danceability: 80,
      energy: 70,
      popularity: 60,
    }
  }
}

// Function to upload event image to Vercel Blob
export async function uploadEventImage(file: File) {
  try {
    const { url } = await put(`events/${Date.now()}-${file.name}`, file, {
      access: "public",
    })
    return url
  } catch (error) {
    console.error("Error uploading image:", error)
    throw new Error("Failed to upload image")
  }
}

// Function to generate event description using Groq
export async function generateEventDescription(eventName: string, eventType: string, dj: string) {
  try {
    const prompt = `Generate an engaging description for a ${eventType} event called "${eventName}" featuring DJ ${dj}. 
    The description should be exciting, about 2-3 sentences long, and highlight the atmosphere and music style.`

    const { text } = await generateText({
      model: groq("llama3-70b-8192"),
      prompt,
      temperature: 0.7,
      maxTokens: 200,
    })

    return text.trim()
  } catch (error) {
    console.error("Error generating event description:", error)
    return `Join us for an unforgettable night at ${eventName} featuring the amazing DJ ${dj}. Experience the best ${eventType} music in an electric atmosphere that will keep you dancing all night long.`
  }
}
