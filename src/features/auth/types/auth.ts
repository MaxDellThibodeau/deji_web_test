import type { User } from './user'

export interface AuthSession {
  access_token: string
  refresh_token: string
  expires_at: number
  user: User
}

export interface AuthState {
  user: User | null
  session: AuthSession | null
  isLoading: boolean
  isAuthenticated: boolean
}

export interface AuthContextType extends AuthState {
  login: (email: string, password: string, redirectTo?: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

export interface LoginCredentials {
  email: string
  password: string
  redirectTo?: string
}

export interface SignupCredentials extends LoginCredentials {
  name: string
  role: string
  terms_accepted: boolean
}

export interface PasswordReset {
  email: string
  token: string
  new_password: string
}

export interface EmailVerification {
  email: string
  token: string
}

export interface AuthTokens {
  access_token: string
  refresh_token: string
  expires_at: number
}

export type AuthProvider = 'email' | 'google' | 'facebook' | 'twitter'

export interface OAuthCredentials {
  provider: AuthProvider
  code: string
  redirectUri: string
} 