/**
 * Profile Completion Wizard Integration Examples
 * 
 * This file demonstrates how to integrate the ProfileCompletionWizard
 * into different parts of the DJEI application.
 */

import React from 'react'
import { 
  ProfileCompletionWizard, 
  ProfileCompletionProgress, 
  ProfileCompletionPrompt,
  useProfileCompletionPrompt 
} from '../components'

// Example 1: Dashboard Banner Integration
export function DashboardWithCompletionBanner() {
  return (
    <div className="p-6 space-y-6">
      {/* Profile completion banner at top of dashboard */}
      <ProfileCompletionPrompt 
        variant="banner"
        showDismiss={true}
      />

      {/* Rest of dashboard content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          {/* Main dashboard content */}
          <h2 className="text-xl font-bold text-white mb-4">Dashboard</h2>
          {/* ... other dashboard components */}
        </div>
        
        <div className="space-y-4">
          {/* Sidebar with profile completion card */}
          <ProfileCompletionPrompt 
            variant="card"
            showDismiss={false}
          />
          {/* ... other sidebar components */}
        </div>
      </div>
    </div>
  )
}

// Example 2: Profile Settings Page Integration
export function ProfileSettingsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white mb-6">Profile Settings</h1>
      
      {/* Inline completion prompt */}
      <div className="mb-6">
        <ProfileCompletionPrompt 
          variant="inline"
          showDismiss={false}
        />
      </div>

      {/* Rest of profile settings */}
      <div className="space-y-6">
        {/* Profile form components */}
      </div>
    </div>
  )
}

// Example 3: Custom Hook Usage
export function CustomDashboardWithHook() {
  const { 
    completion, 
    shouldShow, 
    isWizardOpen, 
    openWizard, 
    closeWizard, 
    WizardComponent 
  } = useProfileCompletionPrompt()

  return (
    <div className="p-6">
      {/* Custom completion UI */}
      {shouldShow && completion && (
        <div className="mb-6 p-4 bg-yellow-900/20 border border-yellow-500/50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-yellow-200">
                Complete Your Profile ({Math.round(completion.percentage)}%)
              </h3>
              <p className="text-yellow-300 text-sm">
                {completion.missingFields.length} fields remaining
              </p>
            </div>
            <button
              onClick={openWizard}
              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-md"
            >
              Continue Setup
            </button>
          </div>
        </div>
      )}

      {/* Dashboard content */}
      <div>
        <h1 className="text-2xl font-bold text-white">Welcome Back!</h1>
        {/* ... rest of dashboard */}
      </div>

      {/* Wizard component */}
      <WizardComponent />
    </div>
  )
}

// Example 4: Onboarding Integration (Step 4)
export function OnboardingWithProfileWizard() {
  const [isWizardOpen, setIsWizardOpen] = React.useState(false)
  const [currentStep, setCurrentStep] = React.useState(1)

  const handleCompleteOnboarding = () => {
    // After basic onboarding (steps 1-3), open profile wizard
    setIsWizardOpen(true)
  }

  const handleWizardComplete = () => {
    setIsWizardOpen(false)
    // Redirect to dashboard
    console.log('Profile wizard completed, redirecting to dashboard')
  }

  return (
    <div>
      {/* Basic onboarding steps 1-3 */}
      {currentStep <= 3 && (
        <div>
          {/* Role selection, image upload, review */}
          <button onClick={handleCompleteOnboarding}>
            Complete Basic Setup
          </button>
        </div>
      )}

      {/* Profile completion wizard */}
      <ProfileCompletionWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onComplete={handleWizardComplete}
      />
    </div>
  )
}

// Example 5: Navigation Menu Integration
export function NavigationWithProfileStatus() {
  const { completion, shouldShow } = useProfileCompletionPrompt()

  return (
    <nav className="bg-zinc-900 border-b border-zinc-700">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <div className="text-white font-bold">DJEI</div>
            {/* Navigation links */}
          </div>

          <div className="flex items-center space-x-4">
            {/* Profile completion indicator in nav */}
            {shouldShow && completion && (
              <ProfileCompletionProgress
                completion={completion}
                variant="minimal"
                size="sm"
              />
            )}
            {/* User menu */}
          </div>
        </div>
      </div>
    </nav>
  )
}

// Example 6: Role-Specific Dashboard Integration
export function RoleSpecificDashboard({ userRole }: { userRole: 'dj' | 'venue' | 'attendee' }) {
  const messages = {
    dj: "Complete your DJ profile to start getting bookings",
    venue: "Add venue details to attract DJs and events",
    attendee: "Set your music preferences for better recommendations"
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white mb-6">
        {userRole.charAt(0).toUpperCase() + userRole.slice(1)} Dashboard
      </h1>

      {/* Role-specific completion prompt */}
      <ProfileCompletionPrompt 
        variant="banner"
        showDismiss={true}
      />

      {/* Role-specific dashboard content */}
      <div className="mt-6">
        <p className="text-gray-300">{messages[userRole]}</p>
        {/* ... role-specific components */}
      </div>
    </div>
  )
}

// Usage Instructions:
/*

## Integration Guide

### 1. Dashboard Banner (Recommended)
```tsx
import { ProfileCompletionPrompt } from '@/features/auth/components'

function Dashboard() {
  return (
    <div>
      <ProfileCompletionPrompt variant="banner" />
      // ... rest of dashboard
    </div>
  )
}
```

### 2. Profile Settings Page
```tsx
import { ProfileCompletionPrompt } from '@/features/auth/components'

function ProfileSettings() {
  return (
    <div>
      <ProfileCompletionPrompt variant="inline" showDismiss={false} />
      // ... rest of settings
    </div>
  )
}
```

### 3. Custom Implementation
```tsx
import { useProfileCompletionPrompt } from '@/features/auth/components'

function CustomComponent() {
  const { completion, shouldShow, openWizard, WizardComponent } = useProfileCompletionPrompt()
  
  return (
    <div>
      {shouldShow && (
        <button onClick={openWizard}>
          Complete Profile ({completion?.percentage}%)
        </button>
      )}
      <WizardComponent />
    </div>
  )
}
```

### 4. Progress Indicator Only
```tsx
import { ProfileCompletionProgress } from '@/features/auth/components'
import { calculateProfileCompletion } from '@/features/auth/utils/profile-completion-tracker'

function Sidebar() {
  const { user } = useAuthStore()
  const completion = calculateProfileCompletion(user)
  
  return (
    <ProfileCompletionProgress 
      completion={completion}
      variant="compact"
    />
  )
}
```

## Customization Options

### ProfileCompletionPrompt Props:
- `variant`: 'banner' | 'card' | 'inline'
- `showDismiss`: boolean (default: true)
- `className`: string

### ProfileCompletionProgress Props:
- `completion`: ProfileCompletion object
- `variant`: 'card' | 'compact' | 'minimal'
- `size`: 'sm' | 'md' | 'lg'
- `showMissingFields`: boolean
- `onOpenWizard`: () => void

### ProfileCompletionWizard Props:
- `isOpen`: boolean
- `onClose`: () => void
- `onComplete`: () => void
- `initialStep`: string (optional)

*/ 