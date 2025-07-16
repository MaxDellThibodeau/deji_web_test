import { createClientClient } from '@/shared/services/client'
import type { User, Session } from '@supabase/supabase-js'

export type UserRole = 'attendee' | 'dj' | 'venue'
export type OAuthProvider = 'google' | 'facebook' | 'apple'

export interface UserProfile {
  id: string
  email: string
  name: string
  avatar_url?: string
  role?: UserRole
  created_at: string
  updated_at: string
}

export interface AuthState {
  user: UserProfile | null
  session: Session | null
  isLoading: boolean
  isAuthenticated: boolean
}

export class AuthService {
  private static supabase = createClientClient()

  /**
   * Sign in with OAuth provider
   */
  static async signInWithOAuth(provider: OAuthProvider): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.supabase) {
        throw new Error('Supabase client not available')
      }

      const redirectUrl = `${window.location.origin}/auth/callback`

      const { data, error } = await this.supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectUrl,
          queryParams: provider === 'google' ? {
            access_type: 'offline',
            prompt: 'consent',
          } : undefined,
          scopes: provider === 'facebook' ? 'email,public_profile' : 
                 provider === 'apple' ? 'name email' : undefined,
        },
      })

      if (error) {
        console.error(`${provider} OAuth error:`, error.message)
        return { success: false, error: error.message }
      }

      if (data.url) {
        // Store the provider for callback handling
        sessionStorage.setItem('oauth_provider', provider)
        window.location.href = data.url
        return { success: true }
      }

      return { success: false, error: 'No OAuth URL received' }
    } catch (error) {
      console.error(`OAuth sign-in error:`, error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Authentication failed' 
      }
    }
  }

  /**
   * Get current session
   */
  static async getSession(): Promise<Session | null> {
    try {
      if (!this.supabase) return null

      const { data: { session }, error } = await this.supabase.auth.getSession()
      
      if (error) {
        console.error('Get session error:', error.message)
        return null
      }

      return session
    } catch (error) {
      console.error('Session retrieval error:', error)
      return null
    }
  }

  /**
   * Get current user profile with role
   */
  static async getCurrentUser(): Promise<UserProfile | null> {
    try {
      const session = await this.getSession()
      if (!session?.user) return null

      const user = session.user
      const role = await this.getUserRole(user.id)

      return {
        id: user.id,
        email: user.email || '',
        name: user.user_metadata?.full_name || 
              user.user_metadata?.name || 
              user.email?.split('@')[0] || 
              'User',
        avatar_url: user.user_metadata?.avatar_url || 
                   user.user_metadata?.picture,
        role,
        created_at: user.created_at,
        updated_at: user.updated_at || user.created_at,
      }
    } catch (error) {
      console.error('Get current user error:', error)
      return null
    }
  }

  /**
   * Get user role from database
   */
  static async getUserRole(userId: string): Promise<UserRole | undefined> {
    try {
      if (!this.supabase) return undefined

      // Check each role table
      const tables = ['attendee', 'dj', 'venue'] as const
      
      for (const table of tables) {
        const { data, error } = await this.supabase
          .from(table)
          .select('id')
          .eq('id', userId)
          .single()

        if (data && !error) {
          return table as UserRole
        }
      }

      return undefined
    } catch (error) {
      console.error('Get user role error:', error)
      return undefined
    }
  }

  /**
   * Set user role (for first-time users)
   */
  static async setUserRole(userId: string, role: UserRole, userProfile: UserProfile): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.supabase) {
        throw new Error('Supabase client not available')
      }

      // Insert into the appropriate role table
      const roleData = {
        id: userId,
        email: userProfile.email,
        name: userProfile.name,
        avatar_url: userProfile.avatar_url,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const { error } = await this.supabase
        .from(role)
        .insert([roleData])

      if (error) {
        console.error(`Set ${role} role error:`, error.message)
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      console.error('Set user role error:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to set role' 
      }
    }
  }

  /**
   * Check if user is new (no role assigned)
   */
  static async isNewUser(userId: string): Promise<boolean> {
    const role = await this.getUserRole(userId)
    return role === undefined
  }

  /**
   * Get dashboard path for role
   */
  static getDashboardPath(role: UserRole): string {
    const paths = {
      attendee: '/attendee-portal/dashboard',
      dj: '/dj-portal/dashboard',
      venue: '/venue-portal/dashboard',
    }
    return paths[role]
  }

  /**
   * Sign out user
   */
  static async signOut(): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.supabase) {
        throw new Error('Supabase client not available')
      }

      const { error } = await this.supabase.auth.signOut()

      if (error) {
        console.error('Sign out error:', error.message)
        return { success: false, error: error.message }
      }

      // Clear any stored OAuth provider
      sessionStorage.removeItem('oauth_provider')

      return { success: true }
    } catch (error) {
      console.error('Sign out error:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Sign out failed' 
      }
    }
  }

  /**
   * Listen to auth state changes
   */
  static onAuthStateChange(callback: (user: UserProfile | null) => void) {
    if (!this.supabase) return { unsubscribe: () => {} }

    const { data: { subscription } } = this.supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event)
        
        if (session?.user) {
          const userProfile = await this.getCurrentUser()
          callback(userProfile)
        } else {
          callback(null)
        }
      }
    )

    return subscription
  }
}

// OAuth callback helper
export const handleOAuthCallback = async (): Promise<{
  success: boolean
  isNewUser?: boolean
  user?: UserProfile
  error?: string
}> => {
  try {
    const supabase = createClientClient()
    if (!supabase) {
      throw new Error('Supabase client not available')
    }

    // Get session from URL hash/query params
    const { data, error } = await supabase.auth.getSession()

    if (error) {
      throw error
    }

    if (!data.session) {
      throw new Error('No session found after OAuth callback')
    }

    const user = await AuthService.getCurrentUser()
    if (!user) {
      throw new Error('Failed to get user profile')
    }

    const isNewUser = await AuthService.isNewUser(user.id)

    return {
      success: true,
      isNewUser,
      user,
    }
  } catch (error) {
    console.error('OAuth callback error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'OAuth callback failed',
    }
  }
} 