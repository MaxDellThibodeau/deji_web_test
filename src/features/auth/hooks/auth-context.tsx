
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { createClientClient } from "@/shared/services/client"
import type { User, UserRole } from "../types/user"
import type { AuthContextType, AuthSession } from "../types/auth"
import type { Event, EventCode } from '@/features/events/types'
import type { DJProfile } from '@/features/dj/types'
import type { Profile, WebSocketMessage } from '@/shared/types'

// Navigation state for auth flows
interface NavigationState {
  history: string[]
  currentIndex: number
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Create a provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<AuthSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [navigationState, setNavigationState] = useState<NavigationState>({
    history: [],
    currentIndex: -1,
  })

  const navigate = useNavigate()
  const location = useLocation(); const pathname = location.pathname
  const supabase = createClientClient()

  // Track navigation history
  useEffect(() => {
    if (pathname) {
      setNavigationState((prev) => {
        // Don't add duplicate consecutive entries
        if (prev.history[prev.currentIndex] === pathname) {
          return prev
        }

        // Remove forward history if we're navigating from a back state
        const newHistory = prev.history.slice(0, prev.currentIndex + 1)
        newHistory.push(pathname)

        return {
          history: newHistory,
          currentIndex: newHistory.length - 1,
        }
      })
    }
  }, [pathname])

  // Refresh user data
  const refreshUser = useCallback(async () => {
    try {
      if (!supabase) {
        setUser(null)
        setSession(null)
        setIsAuthenticated(false)
        setIsLoading(false)
        return
      }

      const {
        data: { session: supabaseSession },
      } = await supabase.auth.getSession()

      if (supabaseSession) {
        // Get user profile from database
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", supabaseSession.user.id).single()

        const userData: User = {
          id: supabaseSession.user.id,
          name: profile?.first_name || supabaseSession.user.user_metadata?.first_name || supabaseSession.user.email?.split("@")[0] || "User",
          email: supabaseSession.user.email || null,
          avatar_url: profile?.avatar_url || supabaseSession.user.user_metadata?.avatar_url || null,
          role: (profile?.role as UserRole) || "attendee",
          token_balance: 0, // Will be loaded separately from user_tokens table
          created_at: (profile?.created_at as string) || supabaseSession.user.created_at,
          updated_at: (profile?.updated_at as string) || supabaseSession.user.updated_at || supabaseSession.user.created_at,
        }

        const sessionData: AuthSession = {
          access_token: supabaseSession.access_token,
          refresh_token: supabaseSession.refresh_token,
          expires_at: supabaseSession.expires_at || Math.floor(Date.now() / 1000) + 3600,
          user: userData,
        }

        setUser(userData)
        setSession(sessionData)
        setIsAuthenticated(true)

        console.log(`✅ Context refreshed user: ${userData.email}`)
      } else {
        setUser(null)
        setSession(null)
        setIsAuthenticated(false)
      }
    } catch (error) {
      console.error("Error refreshing user:", error)
      setUser(null)
      setSession(null)
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  // Initialize auth state
  useEffect(() => {
    refreshUser()

    // Set up auth state change listener
    if (!supabase) return

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔐 Auth state changed:', event)
      refreshUser()
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [refreshUser, supabase])

  // Login function
  const login = async (email: string, password: string, redirectTo?: string) => {
    try {
      console.log(`🔐 Context login attempt for: ${email}`)
      
      if (!supabase) {
        return { success: false, error: "Authentication service not available" }
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        console.error("Login error:", error.message)
        return { success: false, error: error.message }
      }

      if (!data.user) {
        return { success: false, error: "No user data returned" }
      }

      console.log(`✅ Context login successful for: ${email}`)

      // Refresh user data will be triggered by auth state change listener
      await refreshUser()

      return { success: true }
    } catch (error) {
      console.error("Login error:", error)
      return { success: false, error: "An unexpected error occurred" }
    }
  }

  // Logout function
  const logout = async () => {
    try {
      console.log("🔐 Context logout initiated")

      if (supabase) {
        const { error } = await supabase.auth.signOut()
        if (error) {
          console.error("Supabase logout error:", error.message)
        }
      }

      // Clear state
      setUser(null)
      setSession(null)
      setIsAuthenticated(false)

      console.log("✅ Context logout successful")
    } catch (error) {
      console.error("Logout error:", error)
      // Still clear state even if logout fails
      setUser(null)
      setSession(null)
      setIsAuthenticated(false)
    }
  }

  const value: AuthContextType = {
    user,
    session,
    isLoading,
    isAuthenticated,
    login,
    logout,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
