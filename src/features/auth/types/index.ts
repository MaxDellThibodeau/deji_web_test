export type UserRole = "attendee" | "dj" | "venue" | "admin"

export interface User {
  id: string
  name: string | null
  email: string | null
  avatar_url: string | null
  role: UserRole | null
  token_balance: number
}

export interface AuthSession {
  access_token: string
  refresh_token: string
  expires_at: number
  user: User
}

export interface LoginCredentials {
  email: string
  password: string
  redirectTo?: string
}

export interface AuthState {
  user: User | null
  session: AuthSession | null
  isLoading: boolean
  isAuthenticated: boolean
}

export interface AuthContextType extends AuthState {
  login: (email: string, password: string, redirectTo?: string) => Promise<{ success: boolean; error?: string; redirectTo?: string }>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

export interface NavigationState {
  history: string[]
  currentIndex: number
}