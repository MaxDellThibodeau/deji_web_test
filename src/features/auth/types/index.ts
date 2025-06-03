// Main auth types
export type { User, UserRole } from './user'
export type { 
  AuthSession, 
  AuthState, 
  AuthContextType, 
  LoginCredentials, 
  SignupCredentials, 
  PasswordReset, 
  EmailVerification, 
  AuthTokens, 
  AuthProvider, 
  OAuthCredentials 
} from './auth'

// Navigation state for auth flows
export interface NavigationState {
  history: string[]
  currentIndex: number
}

// Form types
export type {
  LoginFormData,
  SignupFormData,
  PasswordResetFormData,
  NewPasswordFormData,
} from './forms'

// Re-export form schemas
export {
  loginSchema,
  signupSchema,
  passwordResetSchema,
  newPasswordSchema,
} from './forms'