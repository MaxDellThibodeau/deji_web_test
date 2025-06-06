import { createClientClient } from "@/shared/services/client"
import type { User, UserRole } from '../types/user'

export class AuthService {
  static client = createClientClient()

  static async login(email: string, password: string, redirectTo?: string) {
    try {
      console.log(`🔐 Attempting login for: ${email}`)

      const { data, error } = await this.client.auth.signInWithPassword({
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

      const { data, error } = await this.client.auth.signUp({
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

      console.log(`✅ Registration successful for: ${email}`)
      
      return { 
        success: true, 
        message: "Registration successful! Please check your email for confirmation.",
        needsConfirmation: !data.user?.email_confirmed_at
      }
    } catch (error) {
      console.error("Registration error:", error)
      return { success: false, error: "An unexpected error occurred" }
    }
  }

  static async logout() {
    try {
      console.log("🔐 Logging out user")
      
      const { error } = await this.client.auth.signOut()
      
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
      const { data: { session }, error } = await this.client.auth.getSession()
      
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
      admin: "/admin-portal/dashboard",
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
  static getUserFromCookies(): User | null {
    console.warn("getUserFromCookies is deprecated - use getCurrentUser() instead")
    return null
  }
}