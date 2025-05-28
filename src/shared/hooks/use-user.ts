"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export type UserProfile = {
  id: string
  name: string | null
  email: string | null
  avatar_url: string | null
  role: "attendee" | "dj" | "venue" | "admin" | null
  token_balance: number
}

// Create a singleton for the Supabase client
let supabaseInstance: ReturnType<typeof createClientComponentClient> | null = null

function getSupabaseClient() {
  if (!supabaseInstance) {
    supabaseInstance = createClientComponentClient()
  }
  return supabaseInstance
}

// Global auth subscription to prevent multiple listeners
let globalAuthSubscription: { unsubscribe: () => void } | null = null
const authSubscribers: Set<() => void> = new Set()

// Cache user data to prevent excessive database queries
let userCache: {
  user: UserProfile | null
  timestamp: number
} | null = null

const CACHE_TTL = 60000 // 1 minute

export function useUser() {
  const [state, setState] = useState<{
    user: UserProfile | null
    isLoading: boolean
  }>({
    user: null,
    isLoading: true,
  })

  // Use refs to prevent unnecessary effect runs
  const isMounted = useRef(false)
  const fetchingUser = useRef(false)
  const effectCleanedUp = useRef(false)

  const getUser = useCallback(async (skipCache = false) => {
    // Prevent concurrent fetches
    if (fetchingUser.current) return null

    try {
      fetchingUser.current = true

      // Check cache first unless skipCache is true
      if (!skipCache && userCache && Date.now() - userCache.timestamp < CACHE_TTL) {
        setState({ user: userCache.user, isLoading: false })
        return userCache.user
      }

      const supabase = getSupabaseClient()

      // Get the current session
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      if (sessionError) {
        setState({ user: null, isLoading: false })
        return null
      }

      if (!session) {
        // Update cache
        userCache = { user: null, timestamp: Date.now() }
        setState({ user: null, isLoading: false })
        return null
      }

      // Get the user profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single()

      if (profileError && profileError.code !== "PGRST116") {
        console.error("Error fetching profile:", profileError)
      }

      const userData: UserProfile = {
        id: session.user.id,
        name: profile?.name || session.user.user_metadata?.name || session.user.email?.split("@")[0] || "User",
        email: session.user.email,
        avatar_url: profile?.avatar_url || session.user.user_metadata?.avatar_url || null,
        role: profile?.role || "attendee",
        token_balance: profile?.token_balance || 0,
      }

      // Update cache
      userCache = { user: userData, timestamp: Date.now() }

      setState({ user: userData, isLoading: false })
      return userData
    } catch (error) {
      console.error("Error in getUser:", error)
      setState({ user: null, isLoading: false })
      return null
    } finally {
      fetchingUser.current = false
    }
  }, [])

  // Setup global auth listener if it doesn't exist
  useEffect(() => {
    if (!globalAuthSubscription) {
      const supabase = getSupabaseClient()
      globalAuthSubscription = supabase.auth.onAuthStateChange((event) => {
        if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
          // Invalidate cache on sign in or token refresh
          userCache = null
          // Notify all subscribers
          authSubscribers.forEach((callback) => callback())
        } else if (event === "SIGNED_OUT") {
          // Clear cache on sign out
          userCache = { user: null, timestamp: Date.now() }
          // Notify all subscribers
          authSubscribers.forEach((callback) => callback())
        }
      })
    }
  }, [])

  useEffect(() => {
    // Only run once
    if (isMounted.current) return
    isMounted.current = true

    // Initial fetch
    getUser()

    // Add this component as a subscriber
    const refreshUser = () => {
      getUser(true) // Skip cache on auth changes
    }
    authSubscribers.add(refreshUser)

    return () => {
      // Prevent cleanup from running multiple times
      if (effectCleanedUp.current) return
      effectCleanedUp.current = true

      // Remove this component as a subscriber
      authSubscribers.delete(refreshUser)
    }
  }, [getUser])

  return state
}
