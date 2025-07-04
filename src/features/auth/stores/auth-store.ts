import { create } from 'zustand'
import { createClientClient } from "@/shared/services/client"
import type { User, UserRole, UserProfile } from '../types/user'
import type { AuthSession, AuthState } from '../types/auth'
import type { ProfileCompletion } from '../types/profile-completion'
import type { StateCreator } from 'zustand'
import { 
  calculateProfileCompletion, 
  calculateProfileCompletionWithRoleData,
  shouldShowCompletionPrompt 
} from '../utils/profile-completion-tracker'

// Extended AuthState interface with profile completion
interface ExtendedAuthState extends AuthState {
  profileCompletion: ProfileCompletion | null
  roleSpecificData: any | null
}

interface AuthStore extends ExtendedAuthState {
  login: (email: string, password: string, redirectTo?: string) => Promise<{ success: boolean; error?: string; redirectTo?: string }>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  
  // Profile completion methods
  updateProfileCompletion: (roleData?: any) => void
  getCompletionPercentage: () => number
  shouldShowCompletionPrompt: () => boolean
  getMissingFields: () => string[]
  isProfileComplete: () => boolean
  
  // Role-specific data methods
  setRoleSpecificData: (data: any) => void
  loadRoleSpecificData: () => Promise<void>
}

type AuthStoreCreator = StateCreator<AuthStore>

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  session: null,
  isLoading: true,
  isAuthenticated: false,
  profileCompletion: null,
  roleSpecificData: null,

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
          is_admin: Boolean(profile?.is_admin),  // NEW: Admin flag
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

        // Update profile completion after user refresh
        get().updateProfileCompletion()
        
        // Load role-specific data
        await get().loadRoleSpecificData()

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

      // Get user data for redirect
      const currentState = get()
      const user = currentState.user
      
      // Check if user is admin first
      if (user?.is_admin) {
        return { success: true, redirectTo: redirectTo || "/admin-portal/dashboard" }
      }

      // Otherwise, redirect based on role
      const userRole = user?.role || 'attendee'
      let dashboardPath = "/attendee-portal/dashboard"
      if (userRole === "dj") {
        dashboardPath = "/dj-portal/dashboard"
      } else if (userRole === "venue") {
        dashboardPath = "/venue-portal/dashboard"
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
        profileCompletion: null,
        roleSpecificData: null,
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
        profileCompletion: null,
        roleSpecificData: null,
      })
    }
  },

  // Profile completion methods
  updateProfileCompletion: (roleData?: any) => {
    const { user, roleSpecificData } = get()
    if (!user) {
      set({ profileCompletion: null })
      return
    }

    // UserProfile extends User, so we can use user directly
    // For missing profile fields, we'll get defaults from user object or empty strings
    const userProfile: UserProfile = {
      ...user,
      bio: (user as any).bio || '',
      phone: (user as any).phone || '',
      location: (user as any).location || '',
      website: (user as any).website || ''
    }

    let completion: ProfileCompletion
    
    if (roleData || roleSpecificData) {
      completion = calculateProfileCompletionWithRoleData(userProfile, roleData || roleSpecificData)
    } else {
      completion = calculateProfileCompletion(userProfile)
    }

    set({ profileCompletion: completion })
  },

  getCompletionPercentage: () => {
    const { profileCompletion } = get()
    return profileCompletion?.percentage || 0
  },

  shouldShowCompletionPrompt: () => {
    const { profileCompletion } = get()
    if (!profileCompletion) return false
    return shouldShowCompletionPrompt(profileCompletion)
  },

  getMissingFields: () => {
    const { profileCompletion } = get()
    return profileCompletion?.missingFields || []
  },

  isProfileComplete: () => {
    const { profileCompletion } = get()
    return (profileCompletion?.percentage || 0) >= 100
  },

  setRoleSpecificData: (data: any) => {
    set({ roleSpecificData: data })
    get().updateProfileCompletion(data)
  },

  loadRoleSpecificData: async () => {
    const { user } = get()
    if (!user) return

    try {
      const supabase = createClientClient()
      if (!supabase) return

      let roleData = null

      switch (user.role) {
        case 'dj':
          const { data: djData } = await supabase
            .from('dj_profiles')
            .select('*')
            .eq('user_id', user.id)
            .single()
          roleData = djData
          break

        case 'venue':
          const { data: venueData } = await supabase
            .from('venue_profiles')
            .select('*')
            .eq('user_id', user.id)
            .single()
          roleData = venueData
          break

        case 'attendee':
          const { data: attendeeData } = await supabase
            .from('attendee_profiles')
            .select('*')
            .eq('user_id', user.id)
            .single()
          roleData = attendeeData
          break
      }

      if (roleData) {
        set({ roleSpecificData: roleData })
        get().updateProfileCompletion(roleData)
      } else {
        // No role-specific data exists yet
        get().updateProfileCompletion()
      }
    } catch (error) {
      console.error('Error loading role-specific data:', error)
      get().updateProfileCompletion()
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