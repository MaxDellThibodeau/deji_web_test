import api from '@api'
import { apiService } from '@api'
import type { User, AuthSession } from '../types'

export interface LoginPayload {
  email: string
  password: string
}

export interface SignupPayload {
  name: string
  email: string
  password: string
  role: 'attendee' | 'dj' | 'venue'
}

export interface ResetPasswordPayload {
  email: string
}

export interface ChangePasswordPayload {
  currentPassword: string
  newPassword: string
}

export interface UpdateProfilePayload {
  name?: string
  avatar_url?: string
  bio?: string
  location?: string
  website?: string
}

// Auth API service
export const authService = {
  // Login user
  login: async (payload: LoginPayload): Promise<{ user: User; session: AuthSession }> => {
    const response = await apiService.post<{ user: User; session: AuthSession }>('/auth/login', payload)
    
    // Store tokens in localStorage for persistence
    if (response.session) {
      localStorage.setItem('djei_access_token', response.session.access_token)
      localStorage.setItem('djei_refresh_token', response.session.refresh_token)
      localStorage.setItem('djei_expires_at', response.session.expires_at.toString())
    }
    
    return response
  },

  // Register new user
  signup: async (payload: SignupPayload): Promise<{ user: User; session: AuthSession }> => {
    const response = await apiService.post<{ user: User; session: AuthSession }>('/auth/signup', payload)
    
    // Store tokens in localStorage for persistence
    if (response.session) {
      localStorage.setItem('djei_access_token', response.session.access_token)
      localStorage.setItem('djei_refresh_token', response.session.refresh_token)
      localStorage.setItem('djei_expires_at', response.session.expires_at.toString())
    }
    
    return response
  },

  // Logout user
  logout: async (): Promise<void> => {
    try {
      await apiService.post('/auth/logout')
    } catch (error) {
      console.warn('Logout API call failed, continuing with local cleanup')
    }
    
    // Clear stored tokens
    localStorage.removeItem('djei_access_token')
    localStorage.removeItem('djei_refresh_token')
    localStorage.removeItem('djei_expires_at')
  },

  // Refresh access token
  refreshToken: async (): Promise<{ session: AuthSession }> => {
    const refreshToken = localStorage.getItem('djei_refresh_token')
    if (!refreshToken) {
      throw new Error('No refresh token available')
    }

    const response = await apiService.post<{ session: AuthSession }>('/auth/refresh', {
      refresh_token: refreshToken
    })

    // Update stored tokens
    if (response.session) {
      localStorage.setItem('djei_access_token', response.session.access_token)
      localStorage.setItem('djei_refresh_token', response.session.refresh_token)
      localStorage.setItem('djei_expires_at', response.session.expires_at.toString())
    }

    return response
  },

  // Get current user profile
  getProfile: async (): Promise<User> => {
    return apiService.get<User>('/auth/profile')
  },

  // Update user profile
  updateProfile: async (payload: UpdateProfilePayload): Promise<User> => {
    return apiService.patch<User>('/auth/profile', payload)
  },

  // Upload avatar
  uploadAvatar: async (file: File): Promise<{ avatar_url: string }> => {
    return apiService.upload<{ avatar_url: string }>('/auth/upload-avatar', file)
  },

  // Send password reset email
  requestPasswordReset: async (payload: ResetPasswordPayload): Promise<{ message: string }> => {
    return apiService.post<{ message: string }>('/auth/request-password-reset', payload)
  },

  // Reset password with token
  resetPassword: async (token: string, newPassword: string): Promise<{ message: string }> => {
    return apiService.post<{ message: string }>('/auth/reset-password', {
      token,
      password: newPassword
    })
  },

  // Change password (when logged in)
  changePassword: async (payload: ChangePasswordPayload): Promise<{ message: string }> => {
    return apiService.post<{ message: string }>('/auth/change-password', payload)
  },

  // Verify email
  verifyEmail: async (token: string): Promise<{ message: string }> => {
    return apiService.post<{ message: string }>('/auth/verify-email', { token })
  },

  // Resend verification email
  resendVerification: async (): Promise<{ message: string }> => {
    return apiService.post<{ message: string }>('/auth/resend-verification')
  },

  // Check if tokens are stored and valid
  hasValidTokens: (): boolean => {
    const accessToken = localStorage.getItem('djei_access_token')
    const expiresAt = localStorage.getItem('djei_expires_at')
    
    if (!accessToken || !expiresAt) {
      return false
    }

    const now = Math.floor(Date.now() / 1000)
    const expiry = parseInt(expiresAt)
    
    // Consider token valid if it expires more than 5 minutes from now
    return expiry > (now + 300)
  },

  // Get stored tokens
  getStoredTokens: (): { accessToken: string | null; refreshToken: string | null; expiresAt: number | null } => {
    return {
      accessToken: localStorage.getItem('djei_access_token'),
      refreshToken: localStorage.getItem('djei_refresh_token'),
      expiresAt: localStorage.getItem('djei_expires_at') ? parseInt(localStorage.getItem('djei_expires_at')!) : null,
    }
  },
}

export default authService 