# DJEI Authentication System

## Overview

Complete authentication system with email/password, social login, demo accounts, and role-based access control.

## Features

### ✅ Authentication Methods
- **Email/Password** - Traditional signup and login
- **Social Login** - Google, Facebook OAuth integration  
- **Demo Accounts** - Pre-configured test accounts
- **Role-Based Access** - Attendee, DJ, Venue Manager roles

### ✅ User Experience
- **Enhanced Error Handling** - User-friendly error messages
- **Loading States** - Visual feedback during auth processes
- **Progressive Onboarding** - Step-by-step guided setup
- **Profile Completion** - Automatic tracking and guidance

## Quick Start

### Login Screen
```typescript
import { LoginScreen } from "@/features/auth/screens/LoginScreen"

// Features:
// - Email/password login with validation
// - Social login buttons (Google, Facebook)
// - Demo account section with one-click login
// - Enhanced error handling
// - Loading states and visual feedback
```

### OAuth Integration
```typescript
import { OAuthButton } from "@/features/auth/components/oauth-button"

<OAuthButton 
  provider="google"          // google | facebook | github | apple
  variant="outline"          
  size="lg"                  
  redirectTo="/dashboard"    
>
  Continue with Google
</OAuthButton>
```

### Demo Accounts
```typescript
const demoAccounts = [
  {
    role: "dj",
    email: "dj@djei.demo",
    password: "demo123!",
    name: "Alex Rivera",
    description: "Experience the DJ portal"
  },
  {
    role: "attendee", 
    email: "attendee@djei.demo",
    password: "demo123!",
    name: "Sam Chen",
    description: "Explore event discovery"
  },
  {
    role: "venue",
    email: "venue@djei.demo",
    password: "demo123!",
    name: "Marina Rodriguez",
    description: "Manage venue bookings"
  }
]
```

## Components

### Enhanced Onboarding
```typescript
import { EnhancedOnboarding } from "@/features/auth/components/enhanced-onboarding"

<EnhancedOnboarding
  onComplete={(role) => {
    console.log(`User selected role: ${role}`)
  }}
  initialRole="dj"  // Optional pre-selected role
/>
```

### Role-Based Access
```typescript
import { RoleGuard } from "@/features/auth/components/role-based-router"

<RoleGuard allowedRoles={['dj', 'venue']}>
  <AdminPanel />
</RoleGuard>
```

## Error Handling

User-friendly error messages:
- "Invalid email or password. Please check your credentials."
- "Please check your email and click the confirmation link."
- "Too many login attempts. Please wait a few minutes."

## Configuration

### Environment Variables
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_FACEBOOK_APP_ID=your_facebook_app_id
```

## Future Enhancements

### Planned Features
- GitHub and Apple OAuth providers
- Multi-factor authentication
- Password reset flow
- Advanced security features

### Implementation Stubs
```typescript
// Future OAuth components
export const GitHubOAuthButton = (props: Omit<OAuthButtonProps, 'provider'>) => (
  <OAuthButton provider="github" {...props} />
)

export const AppleOAuthButton = (props: Omit<OAuthButtonProps, 'provider'>) => (
  <OAuthButton provider="apple" {...props} />
)
```

## Testing

Use demo accounts for development:
```typescript
const testAccounts = {
  dj: { email: "dj@djei.demo", password: "demo123!" },
  attendee: { email: "attendee@djei.demo", password: "demo123!" },
  venue: { email: "venue@djei.demo", password: "demo123!" }
}
```

## API Reference

### AuthService
```typescript
class AuthService {
  static async login(email: string, password: string, redirectTo?: string)
  static async register(email: string, password: string, userData: UserData)
  static async logout()
  static async getCurrentUser()
}
```

### DemoAccountsService
```typescript
class DemoAccountsService {
  static getDemoAccounts(): DemoAccount[]
  static getDemoAccountByRole(role: UserRole): DemoAccount | undefined
  static isDemoAccount(email: string): boolean
  static validateDemoCredentials(email: string, password: string): DemoAccount | null
}
``` 