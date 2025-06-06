import { create } from 'zustand'
import { createClientClient } from "@/shared/services/client"
import type { User, UserRole } from '../types/user'
import type { AuthSession, AuthState } from '../types/auth'
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

        set({
          user: userData,
          session: sessionData,
          isAuthenticated: true,
          isLoading: false,
        })

        console.log(`✅ User session refreshed: ${userData.email}`)
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
      console.log(`🔐 Store login attempt for: ${email}`)
      
      const supabase = createClientClient()
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

      console.log(`✅ Store login successful for: ${email}`)

      // Refresh user data
      await get().refreshUser()

      // Get user role for redirect
      const currentState = get()
      const userRole = currentState.user?.role || 'attendee'

      // Determine redirect path based on role
      let dashboardPath = "/attendee-portal/dashboard"
      if (userRole === "dj") {
        dashboardPath = "/dj-portal/dashboard"
      } else if (userRole === "venue") {
        dashboardPath = "/venue-portal/dashboard"
      } else if (userRole === "admin") {
        dashboardPath = "/admin-portal/dashboard"
      }

      const finalRedirect = redirectTo || dashboardPath

      return { success: true, redirectTo: finalRedirect }
    } catch (error) {
      console.error("Login error:", error)
      return { success: false, error: "An unexpected error occurred" }
    }
  },

  logout: async () => {
    try {
      console.log("🔐 Store logout initiated")
      
      const supabase = createClientClient()
      if (supabase) {
        const { error } = await supabase.auth.signOut()
        if (error) {
          console.error("Supabase logout error:", error.message)
        }
      }

      // Update auth state
      set({
        user: null,
        session: null,
        isAuthenticated: false,
        isLoading: false,
      })
      
      console.log("✅ Store logout successful")
    } catch (error) {
      console.error("Logout error:", error)
      // Still clear state even if logout fails
      set({
        user: null,
        session: null,
        isAuthenticated: false,
        isLoading: false,
      })
    }
  },
}))

// Initialize auth state on store creation
if (typeof window !== 'undefined') {
  // Delay initialization to avoid hydration issues
  setTimeout(() => {
    useAuthStore.getState().refreshUser()
  }, 100)
} 