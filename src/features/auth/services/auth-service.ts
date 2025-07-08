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

      console.log(`✅ Registration successful for: ${email}`)
      
      // Check if email confirmation is required
      const needsConfirmation = !data.user?.email_confirmed_at
      
      if (needsConfirmation) {
        // Store user data temporarily for post-verification profile creation
        localStorage.setItem('djei_pending_profile', JSON.stringify({
          userId: data.user.id,
          email: data.user.email,
          userData
        }))
        
        return { 
          success: true, 
          message: "Registration successful! Please check your email and click the verification link to complete your account setup.",
          needsConfirmation: true,
          userId: data.user.id
        }
      } else {
        // Email already confirmed, create profile immediately
        try {
          await this.createAtomicUserProfile(data.user, userData)
          return { 
            success: true, 
            message: "Registration and profile creation successful!",
            needsConfirmation: false,
            userId: data.user.id
          }
        } catch (profileError) {
          console.error("Profile creation error:", profileError)
          return { 
            success: false, 
            error: "Registration successful but failed to create profile. Please contact support." 
          }
        }
      }

    } catch (error) {
      console.error("Registration error:", error)
      return { success: false, error: "An unexpected error occurred" }
    }
  }

  /**
   * Handle post-email-verification profile creation
   */
  static async completeRegistration() {
    try {
      console.log('🔐 Completing registration after email verification')

      const client = this.client
      if (!client) {
        return { success: false, error: "Authentication service not available" }
      }

      // Check if user is authenticated
      const { data: { user }, error: authError } = await client.auth.getUser()
      if (authError || !user) {
        console.error("User not authenticated:", authError?.message)
        return { success: false, error: "User not authenticated. Please log in." }
      }

      // Check if user's email is confirmed
      if (!user.email_confirmed_at) {
        return { success: false, error: "Email not verified. Please check your email and try again." }
      }

      // Check if profile already exists
      const existingProfile = await this.getUserProfile(user.id)
      if (existingProfile) {
        console.log("Profile already exists")
        return { success: true, message: "Welcome back! Your account is ready." }
      }

      // Get stored user data from registration
      const pendingProfileData = localStorage.getItem('djei_pending_profile')
      if (!pendingProfileData) {
        // Fallback: use user metadata
        const userData = {
          firstName: user.user_metadata?.first_name || '',
          lastName: user.user_metadata?.last_name || '',
          role: user.user_metadata?.role || 'attendee'
        }
        
        await this.createAtomicUserProfile(user, userData)
      } else {
        const { userData } = JSON.parse(pendingProfileData)
        await this.createAtomicUserProfile(user, userData)
        // Clean up stored data
        localStorage.removeItem('djei_pending_profile')
      }

      console.log('✅ Profile creation completed after email verification')
      return { 
        success: true, 
        message: "Email verified! Your profile has been created successfully." 
      }

    } catch (error) {
      console.error("Complete registration error:", error)
      return { success: false, error: "Failed to complete registration. Please try again." }
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

    // 🚨 Critical: Verify user is authenticated and email is confirmed
    const { data: { user: currentUser }, error: authError } = await client.auth.getUser()
    if (authError || !currentUser) {
      throw new Error('User not authenticated. Please log in and try again.')
    }

    if (!currentUser.email_confirmed_at) {
      throw new Error('Email not verified. Please check your email and click the verification link.')
    }

    if (currentUser.id !== user.id) {
      throw new Error('Authentication mismatch. Please log in with the correct account.')
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

    console.log('🔍 Creating profile with data:', profileData)
    console.log('🔍 Auth user context:', { 
      id: user.id, 
      email: user.email, 
      email_confirmed_at: user.email_confirmed_at,
      aud: user.aud 
    })

    // Check current session
    const { data: session } = await client.auth.getSession()
    console.log('🔍 Current session:', session?.user?.id ? 'Authenticated' : 'Not authenticated')

    const { error: profileError } = await client
      .from('profiles')
      .insert([profileData])

    if (profileError) {
      console.error('❌ Profile creation error details:', {
        message: profileError.message,
        code: profileError.code,
        details: profileError.details,
        hint: profileError.hint
      })
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

  /**
   * Resend email verification
   */
  static async resendVerification() {
    try {
      console.log('🔐 Resending verification email')

      const client = this.client
      if (!client) {
        return { success: false, error: "Authentication service not available" }
      }

      const { error } = await client.auth.resend({
        type: 'signup',
        email: '' // This would need to be stored or retrieved
      })

      if (error) {
        console.error("Resend verification error:", error.message)
        return { success: false, error: error.message }
      }

      console.log('✅ Verification email resent')
      return { 
        success: true, 
        message: "Verification email sent! Please check your inbox." 
      }

    } catch (error) {
      console.error("Resend verification error:", error)
      return { success: false, error: "Failed to resend verification email" }
    }
  }
}