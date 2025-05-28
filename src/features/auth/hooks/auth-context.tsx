"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"
import { createClientClient } from "@/shared/services/client"

// Define user types
export type UserRole = "attendee" | "dj" | "venue" | "admin"

export interface User {
  id: string
  name: string | null
  email: string | null
  avatar_url: string | null
  role: UserRole | null
  token_balance: number
}

// Define auth context state
interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string, redirectTo?: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Navigation history tracking
interface NavigationState {
  history: string[]
  currentIndex: number
}

// Create a provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [navigationState, setNavigationState] = useState<NavigationState>({
    history: [],
    currentIndex: -1,
  })

  const router = useRouter()
  const pathname = usePathname()
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

  // Get user from cookies helper
  const getUserFromCookies = useCallback(() => {
    if (typeof document === "undefined") return null

    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`
      const parts = value.split(`; ${name}=`)
      if (parts.length === 2) return parts.pop()?.split(";").shift()
      return null
    }

    const userId = getCookie("user_id")
    const userName = getCookie("user_name")
    const userRole = getCookie("user_role") as UserRole | null
    const userEmail = getCookie("user_email")
    const tokenBalance = Number.parseInt(getCookie("token_balance") || "0", 10)

    if (!userId) return null

    return {
      id: userId,
      name: userName || "User",
      role: userRole || "attendee",
      email: userEmail || "",
      avatar_url: null,
      token_balance: tokenBalance,
    }
  }, [])

  // Refresh user data
  const refreshUser = useCallback(async () => {
    try {
      // First check cookies for user data
      const cookieUser = getUserFromCookies()

      if (cookieUser) {
        setUser(cookieUser)
        setIsAuthenticated(true)
        setIsLoading(false)
        return
      }

      // If no cookie user, check Supabase session
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session) {
        // Get user profile from database
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

        const userData: User = {
          id: session.user.id,
          name: profile?.name || session.user.user_metadata?.name || session.user.email?.split("@")[0] || "User",
          email: session.user.email,
          avatar_url: profile?.avatar_url || session.user.user_metadata?.avatar_url || null,
          role: (profile?.role as UserRole) || "attendee",
          token_balance: profile?.token_balance || 0,
        }

        setUser(userData)
        setIsAuthenticated(true)
      } else {
        setUser(null)
        setIsAuthenticated(false)
      }
    } catch (error) {
      console.error("Error refreshing user:", error)
      setUser(null)
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }, [getUserFromCookies, supabase])

  // Initialize auth state
  useEffect(() => {
    refreshUser()

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      refreshUser()
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [refreshUser, supabase])

  // Login function
  const login = async (email: string, password: string, redirectTo?: string) => {
    try {
      // For demo purposes, use the dummy accounts
      const findUserByEmail = (email: string) => {
        const dummyAccounts = [
          { id: "1", name: "Alex", email: "alex@example.com", password: "password123", role: "attendee" },
          { id: "2", name: "DJ Pulse", email: "dj@example.com", password: "password123", role: "dj" },
          { id: "3", name: "Venue Manager", email: "venue@example.com", password: "password123", role: "venue" },
          { id: "4", name: "Admin User", email: "admin@example.com", password: "password123", role: "admin" },
        ]
        return dummyAccounts.find((account) => account.email === email)
      }

      const user = findUserByEmail(email)

      if (!user || user.password !== password) {
        return { success: false, error: "Invalid email or password" }
      }

      // Set session cookies with user info
      document.cookie = `session=mock-session; path=/; max-age=86400`
      document.cookie = `user_id=${user.id}; path=/; max-age=86400`
      document.cookie = `user_role=${user.role}; path=/; max-age=86400`
      document.cookie = `user_name=${user.name}; path=/; max-age=86400`
      document.cookie = `user_email=${user.email}; path=/; max-age=86400`
      document.cookie = `token_balance=10; path=/; max-age=86400`

      // Update auth state
      await refreshUser()

      // Determine redirect path based on role
      let dashboardPath = "/dashboard"
      if (user.role === "dj") {
        dashboardPath = "/dj-portal/dashboard"
      } else if (user.role === "venue") {
        dashboardPath = "/venue-portal/dashboard"
      } else if (user.role === "admin") {
        dashboardPath = "/admin-portal/dashboard"
      } else {
        dashboardPath = "/attendee-portal/dashboard"
      }

      // Use the redirectTo param if it exists, otherwise use the dashboard path
      const finalRedirect = redirectTo || dashboardPath

      return { success: true, redirectTo: finalRedirect }
    } catch (error) {
      console.error("Login error:", error)
      return { success: false, error: "An unexpected error occurred" }
    }
  }

  // Logout function
  const logout = async () => {
    console.log("[Auth] Logout initiated")
    // Clear all cookies
    document.cookie = "session=; path=/; max-age=0"
    document.cookie = "user_id=; path=/; max-age=0"
    document.cookie = "user_role=; path=/; max-age=0"
    document.cookie = "user_name=; path=/; max-age=0"
    document.cookie = "user_email=; path=/; max-age=0"
    document.cookie = "token_balance=; path=/; max-age=0"

    console.log("[Auth] Cookies cleared")
    // Update auth state
    setUser(null)
    setIsAuthenticated(false)
    console.log("[Auth] Auth state updated, redirecting to /landing")

    // Redirect to landing page
    router.push("/landing")
  }

  // Create the context value
  const contextValue: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    refreshUser,
  }

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
