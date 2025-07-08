import { createClientClient as createClient } from "@/shared/services/client"

// Cache the auth check result to prevent multiple checks
let authCheckCache: { isAuthenticated: boolean; timestamp: number } | null = null
const AUTH_CACHE_TTL = 5000 // 5 seconds

// Cache for user data to prevent multiple Supabase calls
let userCache: { user: any; timestamp: number } | null = null
const USER_CACHE_TTL = 5000 // 5 seconds

// Track if listeners are already set up
let listenersInitialized = false

// Track console logs to prevent duplicates
const recentLogs = new Set<string>()
const LOG_DEDUP_TIMEOUT = 2000 // 2 seconds

// Wrapper for console.log that prevents duplicate logs
const deduplicatedLog = (message: string, ...args: any[]) => {
  const now = Date.now()
  const logKey = `${message}-${now - (now % LOG_DEDUP_TIMEOUT)}`

  if (!recentLogs.has(logKey)) {
    recentLogs.add(logKey)
    console.log(message, ...args)

    // Clean up old logs
    setTimeout(() => {
      recentLogs.delete(logKey)
    }, LOG_DEDUP_TIMEOUT)
  }
}

export const checkAuth = async () => {
  // Check cache first
  if (authCheckCache && Date.now() - authCheckCache.timestamp < AUTH_CACHE_TTL) {
    return authCheckCache.isAuthenticated
  }

  try {
    const supabase = createClient()
    if (!supabase) {
      return false
    }

    const {
      data: { session },
    } = await supabase.auth.getSession()

    const isAuthenticated = !!session

    // Update cache
    authCheckCache = { isAuthenticated, timestamp: Date.now() }

    return isAuthenticated
  } catch (error) {
    deduplicatedLog("Error checking auth:", error)
    return false
  }
}

// Client-side auth check using Supabase only
export const checkAuthClient = async () => {
  try {
    const supabase = createClient()
    if (!supabase) {
      return false
    }

    const {
      data: { session },
    } = await supabase.auth.getSession()

    const hasSession = !!session

    // If we have a session, dispatch an auth event to notify components
    if (hasSession && typeof window !== "undefined") {
      window.dispatchEvent(new Event("auth-state-change"))
    }

    return hasSession
  } catch (error) {
    deduplicatedLog("Error checking client auth:", error)
    return false
  }
}

// Helper function to get user info from Supabase
export const getUserFromSupabase = async () => {
  // Check cache first to prevent multiple Supabase calls
  if (userCache && Date.now() - userCache.timestamp < USER_CACHE_TTL) {
    return userCache.user
  }

  try {
    const supabase = createClient()
    if (!supabase) {
      return null
    }

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user) {
      return null
    }

    // Get user profile from database
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()

    if (error) {
      console.warn("Could not fetch user profile:", error.message)
      // Return basic user info from session
      return {
        id: session.user.id,
        name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
        role: 'attendee',
        email: session.user.email || '',
        avatar_url: session.user.user_metadata?.avatar_url || null,
        token_balance: 0,
      }
    }

    const user = {
      id: session.user.id,
      name: profile.first_name || session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
      role: profile.role || 'attendee',
      email: session.user.email || '',
      avatar_url: profile.avatar_url || session.user.user_metadata?.avatar_url || null,
      token_balance: 0, // Will be loaded separately from user_tokens table
    }

    // Update cache
    userCache = { user, timestamp: Date.now() }

    return user
  } catch (error) {
    deduplicatedLog("Error getting user from Supabase:", error)
    return null
  }
}

// Dispatch auth state change event
export const dispatchAuthEvent = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("auth-state-change"))
  }
}

// Set up auth state listener (Supabase only)
export const setupAuthListener = () => {
  // Only set up listeners once
  if (typeof window !== "undefined" && !listenersInitialized) {
    listenersInitialized = true

    const supabase = createClient()
    if (!supabase) {
      return () => {}
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      deduplicatedLog("Auth state changed:", event)
      // Clear caches when auth state changes
      authCheckCache = null
      userCache = null
      dispatchAuthEvent()
    })

    // Check auth state periodically
    const authCheckInterval = setInterval(() => {
      checkAuthClient()
    }, 30000) // Check every 30 seconds

    // Clean up on page unload
    window.addEventListener("beforeunload", () => {
      clearInterval(authCheckInterval)
      subscription.unsubscribe()
      listenersInitialized = false
    })

    // Return cleanup function for React useEffect
    return () => {
      clearInterval(authCheckInterval)
      subscription.unsubscribe()
      listenersInitialized = false
    }
  }

  // Return empty cleanup function if not in browser or already initialized
  return () => {}
}
