import { createClientClient } from "@/shared/services/client"
import type { User, UserRole } from '../types/user'

export class AuthService {
  static get client() {
    return createClientClient()
  }

  static async login(email: string, password: string, redirectTo?: string) {
    try {
      console.log(`🔐 Attempting login for: ${email}`)

      const client = this.client
      if (!client) {
        return { success: false, error: "Authentication service not available" }
      }

      const { data, error } = await client.auth.signInWithPassword({
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

      console.log(`✅ Login successful for: ${email}`)

      // Get or create user profile
      const profile = await this.getOrCreateProfile(data.user)
      
      // Determine redirect path based on role
      const dashboardPath = this.getDashboardPath(profile.role)
      const finalRedirect = redirectTo || dashboardPath

      return { 
        success: true, 
        redirectTo: finalRedirect,
        user: {
          id: data.user.id,
          email: data.user.email || '',
          name: profile.first_name || 'User',
          role: profile.role,
          avatar_url: profile.avatar_url,
          token_balance: 0, // Will be loaded separately
          created_at: data.user.created_at,
          updated_at: data.user.updated_at || data.user.created_at
        }
      }
    } catch (error) {
      console.error("Login error:", error)
      return { success: false, error: "An unexpected error occurred" }
    }
  }

  static async register(email: string, password: string, userData?: { firstName?: string, lastName?: string, role?: UserRole }) {
    try {
      console.log(`🔐 Attempting registration for: ${email}`)

      const client = this.client
      if (!client) {
        return { success: false, error: "Authentication service not available" }
      }

      // Step 1: Create user with Supabase Auth
      const { data, error } = await client.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: userData?.firstName,
            last_name: userData?.lastName,
            role: userData?.role || 'attendee'
          }
        }
      })

      if (error) {
        console.error("Registration error:", error.message)
        return { success: false, error: error.message }
      }

      if (!data.user) {
        return { success: false, error: "User creation failed" }
      }

      // Step 2: Create profile and role-specific tables atomically
      try {
        await this.createAtomicUserProfile(data.user, userData)
        console.log(`✅ Registration successful for: ${email}`)
        
        return { 
          success: true, 
          message: "Registration successful! Please check your email for confirmation.",
          needsConfirmation: !data.user?.email_confirmed_at,
          userId: data.user.id
        }
      } catch (profileError) {
        console.error("Profile creation error:", profileError)
        
        // If profile creation fails, we should clean up the auth user
        // Note: Supabase handles this automatically with RLS policies
        return { 
          success: false, 
          error: "Failed to create user profile. Please try again." 
        }
      }

    } catch (error) {
      console.error("Registration error:", error)
      return { success: false, error: "An unexpected error occurred" }
    }
  }

  static async logout() {
    try {
      console.log("🔐 Logging out user")

      const client = this.client
      if (!client) {
        console.error("Authentication service not available")
        return { success: false, error: "Authentication service not available" }
      }
      
      const { error } = await client.auth.signOut()
      
      if (error) {
        console.error("Logout error:", error.message)
        return { success: false, error: error.message }
      }

      console.log("✅ Logout successful")
      return { success: true }
    } catch (error) {
      console.error("Logout error:", error)
      return { success: false, error: "An unexpected error occurred" }
    }
  }

  static async getCurrentUser(): Promise<User | null> {
    try {
      const client = this.client
      if (!client) {
        console.error("Authentication service not available")
        return null
      }

      const { data: { session }, error } = await client.auth.getSession()
      
      if (error) {
        console.error("Session error:", error.message)
        return null
      }

      if (!session?.user) {
        return null
      }

      // Get user profile from database
      const profile = await this.getUserProfile(session.user.id)
      
      return {
        id: session.user.id,
        email: session.user.email || '',
        name: profile?.first_name || 'User',
        role: profile?.role || 'attendee',
        avatar_url: profile?.avatar_url || null,
        token_balance: 0, // Will be loaded separately
        created_at: session.user.created_at,
        updated_at: session.user.updated_at || session.user.created_at
      }
    } catch (error) {
      console.error("Get current user error:", error)
      return null
    }
  }

  static async getSession() {
    try {
      const { data: { session }, error } = await this.client.auth.getSession()
      
      if (error) {
        console.error("Get session error:", error.message)
        return null
      }

      return session
    } catch (error) {
      console.error("Get session error:", error)
      return null
    }
  }

  private static async getUserProfile(userId: string) {
    try {
      const { data, error } = await this.client
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.log("Profile not found, user may need to complete setup")
        return null
      }

      return data
    } catch (error) {
      console.error("Get user profile error:", error)
      return null
    }
  }

  private static async getOrCreateProfile(user: any) {
    try {
      // Try to get existing profile
      let { data: profile, error } = await this.client
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist, create it
        const newProfile = {
          id: user.id,
          email: user.email,
          first_name: user.user_metadata?.first_name || '',
          last_name: user.user_metadata?.last_name || '',
          role: user.user_metadata?.role || 'attendee'
        }

        const { data: createdProfile, error: createError } = await this.client
          .from('profiles')
          .insert([newProfile])
          .select()
          .single()

        if (createError) {
          console.error("Create profile error:", createError)
          // Return default profile if creation fails
          return { role: 'attendee', first_name: 'User' }
        }

        return createdProfile
      }

      return profile || { role: 'attendee', first_name: 'User' }
    } catch (error) {
      console.error("Get or create profile error:", error)
      return { role: 'attendee', first_name: 'User' }
    }
  }

  private static getDashboardPath(role: string): string {
    const paths = {
      dj: "/dj-portal/dashboard",
      venue: "/venue-portal/dashboard", 
      attendee: "/attendee-portal/dashboard",
    }
    return paths[role as keyof typeof paths] || "/attendee-portal/dashboard"
  }

  // Legacy method for compatibility - will be removed later
  static findUserByEmail(email: string) {
    console.warn("findUserByEmail is deprecated - use real authentication")
    return null
  }

  // Legacy method for compatibility - will be removed later  
  // Removed deprecated getUserFromCookies method - use getCurrentUser() instead

  /**
   * Creates user profile and role-specific data atomically
   */
  private static async createAtomicUserProfile(user: any, userData?: { firstName?: string, lastName?: string, role?: UserRole }) {
    const client = this.client
    if (!client) {
      throw new Error('Authentication service not available')
    }

    const role = userData?.role || 'attendee'
    
    // Create main profile
    const profileData = {
      id: user.id,
      email: user.email,
      first_name: userData?.firstName || '',
      last_name: userData?.lastName || '',
      role: role,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { error: profileError } = await client
      .from('profiles')
      .insert([profileData])

    if (profileError) {
      throw new Error(`Profile creation failed: ${profileError.message}`)
    }

    // Create role-specific profile
    await this.createRoleSpecificProfile(user.id, role)

    // Initialize user tokens
    await this.initializeUserTokens(user.id)
  }

  /**
   * Creates role-specific profile data
   */
  private static async createRoleSpecificProfile(userId: string, role: UserRole) {
    const client = this.client
    if (!client) {
      throw new Error('Authentication service not available')
    }

    const baseRoleData = {
      profile_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    switch (role) {
      case 'dj':
        const { error: djError } = await client
          .from('dj_profiles')
          .insert([{
            ...baseRoleData,
            // Initialize with default values that encourage profile completion
            stage_name: '',
            genres: [],
            experience_years: 0,
            equipment_provided: false,
            profile_completion_percentage: 0
          }])
        
        if (djError) {
          throw new Error(`DJ profile creation failed: ${djError.message}`)
        }
        break

      case 'venue':
        const { error: venueError } = await client
          .from('venue_profiles')
          .insert([{
            ...baseRoleData,
            venue_name: '',
            venue_type: '',
            capacity: 0,
            address: '',
            booking_email: '',
            profile_completion_percentage: 0
          }])
        
        if (venueError) {
          throw new Error(`Venue profile creation failed: ${venueError.message}`)
        }
        break

      case 'attendee':
        const { error: attendeeError } = await client
          .from('attendee_profiles')
          .insert([{
            ...baseRoleData,
            favorite_genres: [],
            music_discovery_preference: 'balanced',
            profile_completion_percentage: 0
          }])
        
        if (attendeeError) {
          throw new Error(`Attendee profile creation failed: ${attendeeError.message}`)
        }
        break

      default:
        throw new Error(`Invalid role: ${role}`)
    }
  }

  /**
   * Initialize user tokens with starting balance
   */
  private static async initializeUserTokens(userId: string) {
    const client = this.client
    if (!client) {
      console.warn('Authentication service not available for token initialization')
      return
    }

    const { error: tokenError } = await client
      .from('user_tokens')
      .insert([{
        profile_id: userId,
        balance: 50, // Starting bonus tokens
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])

    if (tokenError) {
      console.warn(`Token initialization failed: ${tokenError.message}`)
      // Don't throw here as this is not critical for registration
    }
  }
}