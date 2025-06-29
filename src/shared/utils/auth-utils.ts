import { createClientClient as createClient } from "@/shared/services/client"

// Cache the auth check result to prevent multiple checks
let authCheckCache: { isAuthenticated: boolean; timestamp: number } | null = null
const AUTH_CACHE_TTL = 5000 // 5 seconds

// Cache for user data to prevent multiple cookie reads
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

    // For demo mode, also check for cookies
    const hasSessionCookie =
      typeof document !== "undefined" &&
      (document.cookie.includes("session=") ||
        document.cookie.includes("user_id=") ||
        document.cookie.includes("supabase-auth-token="))

    const isAuthenticated = !!session || hasSessionCookie

    // Update cache
    authCheckCache = { isAuthenticated, timestamp: Date.now() }

    return isAuthenticated
  } catch (error) {
    deduplicatedLog("Error checking auth:", error)
    return false
  }
}

// Client-side auth check
export const checkAuthClient = () => {
  // More comprehensive check for session cookie or token in client-side code
  const hasSession =
    typeof document !== "undefined" &&
    (document.cookie.includes("session=") ||
      document.cookie.includes("user_id=") ||
      document.cookie.includes("supabase-auth-token="))

  // If we have a session, dispatch an auth event to notify components
  if (hasSession && typeof window !== "undefined") {
    window.dispatchEvent(new Event("auth-state-change"))
  }

  return hasSession
}

// Helper function to get user info from cookies
export const getUserFromCookies = () => {
  // Check cache first to prevent multiple cookie reads
  if (userCache && Date.now() - userCache.timestamp < USER_CACHE_TTL) {
    return userCache.user
  }

  if (typeof document === "undefined") return null

  const getCookie = (name: string) => {
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) return parts.pop()?.split(";").shift()
    return null
  }

  const userId = getCookie("user_id")
  const userName = getCookie("user_name")
  const userRole = getCookie("user_role")
  const userEmail = getCookie("user_email")
  const tokenBalance = Number.parseInt(getCookie("token_balance") || "0", 10)

  if (!userId) return null

  const user = {
    id: userId,
    name: userName || "User",
    role: userRole || "attendee",
    email: userEmail || "",
    avatar_url: null,
    token_balance: tokenBalance,
  }

  // Update cache
  userCache = { user, timestamp: Date.now() }

  return user
}

// Dispatch auth state change event
export const dispatchAuthEvent = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("auth-state-change"))
  }
}

// Set up auth state listener
export const setupAuthListener = () => {
  // Only set up listeners once
  if (typeof window !== "undefined" && !listenersInitialized) {
    listenersInitialized = true

    // Listen for Supabase auth changes
    const supabase = createClient()
    if (!supabase) {
      return () => {}
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      deduplicatedLog("Auth state changed:", event)
      dispatchAuthEvent()
    })

    // Use a polling approach to check for cookie changes instead of redefining document.cookie
    let previousCookieValue = document.cookie

    // Check for cookie changes periodically
    const cookieCheckInterval = setInterval(() => {
      if (document.cookie !== previousCookieValue) {
        previousCookieValue = document.cookie
        document.dispatchEvent(new Event("cookieChange"))
        dispatchAuthEvent()
      }
    }, 2000) // Check every 2 seconds (reduced frequency)

    // Check auth state periodically
    const authCheckInterval = setInterval(() => {
      checkAuthClient()
    }, 30000) // Check every 30 seconds (reduced frequency)

    // Clean up on page unload
    window.addEventListener("beforeunload", () => {
      clearInterval(cookieCheckInterval)
      clearInterval(authCheckInterval)
      subscription.unsubscribe()
      listenersInitialized = false
    })

    // Return cleanup function for React useEffect
    return () => {
      clearInterval(cookieCheckInterval)
      clearInterval(authCheckInterval)
      subscription.unsubscribe()
      listenersInitialized = false
    }
  }

  // Return empty cleanup function if not in browser or already initialized
  return () => {}
}
