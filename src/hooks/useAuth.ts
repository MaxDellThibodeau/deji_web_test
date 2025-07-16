import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthService, type UserProfile, type UserRole, type AuthState } from '@/lib/auth'

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
    isAuthenticated: false,
  })
  
  const navigate = useNavigate()

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setAuthState(prev => ({ ...prev, isLoading: true }))
        
        const user = await AuthService.getCurrentUser()
        const session = await AuthService.getSession()
        
        setAuthState({
          user,
          session,
          isLoading: false,
          isAuthenticated: !!user,
        })
      } catch (error) {
        console.error('Auth initialization error:', error)
        setAuthState({
          user: null,
          session: null,
          isLoading: false,
          isAuthenticated: false,
        })
      }
    }

    initializeAuth()
  }, [])

  // Listen to auth state changes
  useEffect(() => {
    const { unsubscribe } = AuthService.onAuthStateChange((user: UserProfile | null) => {
      setAuthState(prev => ({
        ...prev,
        user,
        isAuthenticated: !!user,
        isLoading: false,
      }))
    })

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe()
      } else if (unsubscribe && typeof unsubscribe.unsubscribe === 'function') {
        unsubscribe.unsubscribe()
      }
    }
  }, [])

  // Sign in with OAuth provider
  const signInWithOAuth = useCallback(async (provider: 'google' | 'facebook' | 'apple') => {
    setAuthState(prev => ({ ...prev, isLoading: true }))
    
    try {
      const result = await AuthService.signInWithOAuth(provider)
      if (result.success) {
        // OAuth redirect will happen automatically
        return { success: true }
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }))
        return { success: false, error: result.error }
      }
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }))
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Authentication failed' 
      }
    }
  }, [])

  // Set user role (for first-time users)
  const setUserRole = useCallback(async (role: UserRole) => {
    if (!authState.user) {
      return { success: false, error: 'User not authenticated' }
    }

    setAuthState(prev => ({ ...prev, isLoading: true }))

    try {
      const result = await AuthService.setUserRole(authState.user.id, role, authState.user)
      
      if (result.success) {
        // Update user with role
        const updatedUser = { ...authState.user, role }
        setAuthState(prev => ({ 
          ...prev, 
          user: updatedUser, 
          isLoading: false 
        }))
        
        // Navigate to appropriate dashboard
        const dashboardPath = AuthService.getDashboardPath(role)
        navigate(dashboardPath, { replace: true })
        
        return { success: true }
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }))
        return { success: false, error: result.error }
      }
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }))
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to set role' 
      }
    }
  }, [authState.user, navigate])

  // Sign out
  const signOut = useCallback(async () => {
    setAuthState(prev => ({ ...prev, isLoading: true }))

    try {
      const result = await AuthService.signOut()
      
      if (result.success) {
        setAuthState({
          user: null,
          session: null,
          isLoading: false,
          isAuthenticated: false,
        })
        
        navigate('/signin', { replace: true })
        return { success: true }
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }))
        return { success: false, error: result.error }
      }
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }))
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Sign out failed' 
      }
    }
  }, [navigate])

  // Check if user is new (no role assigned)
  const isNewUser = useCallback(async (): Promise<boolean> => {
    if (!authState.user) return false
    
    try {
      return await AuthService.isNewUser(authState.user.id)
    } catch (error) {
      console.error('Check new user error:', error)
      return false
    }
  }, [authState.user])

  // Get dashboard path for current user
  const getDashboardPath = useCallback((): string | null => {
    if (!authState.user?.role) return null
    return AuthService.getDashboardPath(authState.user.role)
  }, [authState.user?.role])

  // Redirect to appropriate page based on auth state
  const redirectBasedOnAuth = useCallback(async () => {
    if (!authState.isAuthenticated || !authState.user) {
      navigate('/signin', { replace: true })
      return
    }

    if (!authState.user.role) {
      // Check if user needs to select a role
      const isNew = await isNewUser()
      if (isNew) {
        navigate('/select-role', { replace: true })
        return
      }
    }

    // User has a role, redirect to their dashboard
    const dashboardPath = getDashboardPath()
    if (dashboardPath) {
      navigate(dashboardPath, { replace: true })
    }
  }, [authState.isAuthenticated, authState.user, navigate, isNewUser, getDashboardPath])

  return {
    // State
    ...authState,
    
    // Computed properties
    hasRole: !!authState.user?.role,
    dashboardPath: getDashboardPath(),
    
    // Actions
    signInWithOAuth,
    setUserRole,
    signOut,
    isNewUser,
    redirectBasedOnAuth,
    
    // Utilities
    getDashboardPath,
  }
}

export default useAuth 