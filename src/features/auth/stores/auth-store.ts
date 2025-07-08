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
  isLoading: false, // Start with false so Login/Sign Up buttons show immediately
  isAuthenticated: false,
  profileCompletion: null,
  roleSpecificData: null,

  refreshUser: async () => {
    console.log("🔐 RefreshUser: Starting...")
    
    try {
      const supabase = createClientClient()
      if (!supabase) {
        console.log("🔐 RefreshUser: No Supabase client")
        set({ 
          user: null, 
          session: null, 
          isAuthenticated: false, 
          isLoading: false 
        })
        return
      }

      // Simple session check without timeout - let it succeed or fail naturally
      try {
        const { data: { session: supabaseSession }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.log("🔐 RefreshUser: Session error:", sessionError.message)
          throw sessionError
        }

        if (supabaseSession) {
          console.log("🔐 RefreshUser: Session found, creating user data...")
          
          // Create user data from session without database queries
          const userData: User = {
            id: supabaseSession.user.id,
            name: supabaseSession.user.user_metadata?.first_name || 
                  supabaseSession.user.email?.split("@")[0] || 
                  "User",
            email: supabaseSession.user.email || null,
            avatar_url: supabaseSession.user.user_metadata?.avatar_url || null,
            role: (supabaseSession.user.user_metadata?.role as UserRole) || "attendee",
            is_admin: Boolean(supabaseSession.user.user_metadata?.is_admin),
            token_balance: 0,
            created_at: supabaseSession.user.created_at,
            updated_at: supabaseSession.user.updated_at || supabaseSession.user.created_at,
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

          console.log(`✅ RefreshUser: Session refreshed for ${userData.email}`)

        } else {
          console.log("🔐 RefreshUser: No session found, setting unauthenticated")
          set({
            user: null,
            session: null,
            isAuthenticated: false,
            isLoading: false,
          })
        }
      } catch (sessionError) {
        console.log("🔐 RefreshUser: Session check failed, assuming unauthenticated:", sessionError)
        set({
          user: null,
          session: null,
          isAuthenticated: false,
          isLoading: false,
        })
      }
    } catch (error) {
      console.log("🔐 RefreshUser: General error, setting unauthenticated:", error)
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

      // Simple login without complex timeout handling
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

      // Create user data directly from login response
      const userData: User = {
        id: data.user.id,
        name: data.user.user_metadata?.first_name || 
              data.user.email?.split("@")[0] || 
              "User",
        email: data.user.email || null,
        avatar_url: data.user.user_metadata?.avatar_url || null,
        role: (data.user.user_metadata?.role as UserRole) || "attendee",
        is_admin: Boolean(data.user.user_metadata?.is_admin),
        token_balance: 0,
        created_at: data.user.created_at,
        updated_at: data.user.updated_at || data.user.created_at,
      }

      const sessionData: AuthSession = {
        access_token: data.session?.access_token || "",
        refresh_token: data.session?.refresh_token || "",
        expires_at: data.session?.expires_at || Math.floor(Date.now() / 1000) + 3600,
        user: userData,
      }

      // Set auth state immediately
      set({
        user: userData,
        session: sessionData,
        isAuthenticated: true,
        isLoading: false,
      })

      // Determine redirect path based on role
      const userRole = userData.role || 'attendee'
      let dashboardPath = "/attendee-portal/dashboard"
      if (userRole === "dj") {
        dashboardPath = "/dj-portal/dashboard"
      } else if (userRole === "venue") {
        dashboardPath = "/venue-portal/dashboard"
      } else if (userData.is_admin) {
        dashboardPath = "/admin-portal/dashboard"
      }

      const finalRedirect = redirectTo || dashboardPath

      return { success: true, redirectTo: finalRedirect }
    } catch (error) {
      console.error("Login error:", error)
      return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" }
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

    console.log("🔍 LoadRoleData: Skipping role-specific data loading until database is set up")
    
    // TODO: Enable this once database tables are created
    // For now, just update profile completion without role data
    try {
      get().updateProfileCompletion()
    } catch (error) {
      console.log('Non-critical: Error updating profile completion:', error)
    }
    
    return // Early return to skip database queries
    
    // DISABLED TEMPORARILY - Enable after database setup
    /*
    try {
      const supabase = createClientClient()
      if (!supabase) return

      let roleData = null

      // Safely query role-specific tables with proper error handling
      try {
      switch (user.role) {
        case 'dj':
            const { data: djData, error: djError } = await supabase
            .from('dj_profiles')
            .select('*')
            .eq('user_id', user.id)
            .single()
            
            if (!djError && djData) {
          roleData = djData
            }
          break

        case 'venue':
            const { data: venueData, error: venueError } = await supabase
            .from('venue_profiles')
            .select('*')
            .eq('user_id', user.id)
            .single()
            
            if (!venueError && venueData) {
          roleData = venueData
            }
          break

        case 'attendee':
            const { data: attendeeData, error: attendeeError } = await supabase
            .from('attendee_profiles')
            .select('*')
            .eq('user_id', user.id)
            .single()
            
            if (!attendeeError && attendeeData) {
          roleData = attendeeData
            }
          break
        }
      } catch (tableError) {
        console.log(`Role-specific table for ${user.role} not available yet:`, tableError)
      }

      if (roleData) {
        set({ roleSpecificData: roleData })
        get().updateProfileCompletion(roleData)
      } else {
        // No role-specific data exists yet - this is normal for new users
        console.log(`No role-specific data found for ${user.role} user: ${user.email}`)
        get().updateProfileCompletion()
      }
    } catch (error) {
      console.log('Non-critical: Error loading role-specific data:', error)
      // Always call updateProfileCompletion even if role data fails to load
      get().updateProfileCompletion()
    }
    */
  },
}))

// Initialize auth state on store creation
if (typeof window !== 'undefined') {
  // Simple initialization without complex listeners
  setTimeout(() => {
    console.log("🔐 Auth: Simple initialization")
    
    // Set to unauthenticated by default to show login buttons
    useAuthStore.setState({
      user: null,
      session: null,
      isAuthenticated: false,
      isLoading: false,
      profileCompletion: null,
      roleSpecificData: null,
    })
    
    // TODO: Re-enable when Supabase connection is stable
    /*
    const store = useAuthStore.getState()
    
    // Ensure we don't get stuck in loading state
    const initializeAuth = async () => {
      try {
        await store.refreshUser()
      } catch (error) {
        console.error("Auth initialization error:", error)
        useAuthStore.setState({
          user: null,
          session: null,
          isAuthenticated: false,
          isLoading: false,
          profileCompletion: null,
          roleSpecificData: null,
        })
      }
    }

    initializeAuth()
    */
  }, 100)
} 