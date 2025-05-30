// User types
export type { UserRole, User, UserProfile, UserPreferences, UserStats } from './user'

// Auth types
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
  OAuthCredentials,
} from './auth'

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

export interface NavigationState {
  history: string[]
  currentIndex: number
}