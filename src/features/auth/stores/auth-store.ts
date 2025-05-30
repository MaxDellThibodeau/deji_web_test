import { create } from 'zustand'
import { createClientClient } from "@/shared/services/client"
import type { User, UserRole, AuthSession, AuthState } from '../types'
import type { StateCreator } from 'zustand'

interface AuthStore extends AuthState {
  login: (email: string, password: string, redirectTo?: string) => Promise<{ success: boolean; error?: string; redirectTo?: string }>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

type AuthStoreCreator = StateCreator<AuthStore>

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  session: null,
  isLoading: true,
  isAuthenticated: false,

  refreshUser: async () => {
    try {
      // First check cookies for user data
      const cookieUser = getUserFromCookies()

      if (cookieUser) {
        set({ 
          user: cookieUser, 
          isAuthenticated: true, 
          isLoading: false 
        })
        return
      }

      // If no cookie user, check Supabase session
      const supabase = createClientClient()
      if (!supabase) {
        set({ 
          user: null, 
          session: null, 
          isAuthenticated: false, 
          isLoading: false 
        })
        return
      }

      const {
        data: { session: supabaseSession },
      } = await supabase.auth.getSession()

      if (supabaseSession) {
        // Get user profile from database
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", supabaseSession.user.id)
          .single()

        const userData: User = {
          id: supabaseSession.user.id,
          name: profile?.name || supabaseSession.user.user_metadata?.name || supabaseSession.user.email?.split("@")[0] || "User",
          email: supabaseSession.user.email || null,
          avatar_url: profile?.avatar_url || supabaseSession.user.user_metadata?.avatar_url || null,
          role: (profile?.role as UserRole) || "attendee",
          token_balance: Number(profile?.token_balance || 0),
          created_at: (profile?.created_at as string) || new Date().toISOString(),
          updated_at: (profile?.updated_at as string) || new Date().toISOString(),
        }

        const sessionData: AuthSession = {
          access_token: supabaseSession.access_token,
          refresh_token: supabaseSession.refresh_token,
          expires_at: supabaseSession.expires_at || Math.floor(Date.now() / 1000) + 3600,
          user: userData,
        }

        set({
          user: userData,
          session: sessionData,
          isAuthenticated: true,
          isLoading: false,
        })
      } else {
        set({
          user: null,
          session: null,
          isAuthenticated: false,
          isLoading: false,
        })
      }
    } catch (error) {
      console.error("Error refreshing user:", error)
      set({
        user: null,
        session: null,
        isAuthenticated: false,
        isLoading: false,
      })
    }
  },

  login: async (email: string, password: string, redirectTo?: string) => {
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
      await get().refreshUser()

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
  },

  logout: async () => {
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
    set({
      user: null,
      session: null,
      isAuthenticated: false,
    })
    console.log("[Auth] Auth state updated")
  },
}))

// Helper function to get user from cookies
function getUserFromCookies() {
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
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
} 