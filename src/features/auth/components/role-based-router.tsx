import React, { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../stores/auth-store'
import { ProfileCompletionService } from '../services/profile-completion.service'
import { UserRole } from '../types/user'
import { Loader2 } from 'lucide-react'

interface RoleBasedRouterProps {
  children: React.ReactNode
  allowedRoles: UserRole[]
  requireCompleteProfile?: boolean
}

interface ProfileCompletionStatus {
  isComplete: boolean
  percentage: number
  missingFields: string[]
}

export function RoleBasedRouter({ 
  children, 
  allowedRoles, 
  requireCompleteProfile = false 
}: RoleBasedRouterProps) {
  const { user, isAuthenticated } = useAuthStore()
  const location = useLocation()
  const [profileStatus, setProfileStatus] = useState<ProfileCompletionStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkProfileCompletion = async () => {
      if (!user || !isAuthenticated) {
        setIsLoading(false)
        return
      }

      try {
        const completion = await ProfileCompletionService.getProfileCompletion(user.id)
        
        if (completion.success) {
          setProfileStatus({
            isComplete: completion.isComplete,
            percentage: completion.percentage,
            missingFields: completion.missingFields
          })
        }
      } catch (error) {
        console.error('Failed to check profile completion:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkProfileCompletion()
  }, [user, isAuthenticated])

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500 mx-auto mb-4" />
          <p className="text-white">Loading...</p>
        </div>
      </div>
    )
  }

  // Not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Role not allowed
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={getRoleBasedDashboard(user.role)} replace />
  }

  // Profile completion required but not complete
  if (requireCompleteProfile && profileStatus && !profileStatus.isComplete) {
    return (
      <Navigate 
        to="/auth/profile-setup" 
        state={{ 
          from: location,
          completionStatus: profileStatus 
        }} 
        replace 
      />
    )
  }

  return <>{children}</>
}

/**
 * Get the appropriate dashboard URL based on user role
 */
function getRoleBasedDashboard(role: UserRole): string {
  const dashboardMap = {
    'attendee': '/attendee-portal/dashboard',
    'dj': '/dj-portal/dashboard',
    'venue': '/venue-portal/dashboard',
    'admin': '/admin/dashboard'
  }

  return dashboardMap[role] || '/attendee-portal/dashboard'
}

/**
 * Hook to check if user has required role
 */
export function useRoleAccess(requiredRoles: UserRole[]): {
  hasAccess: boolean
  userRole: UserRole | null
  isLoading: boolean
} {
  const { user, isAuthenticated } = useAuthStore()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simple loading simulation - in real app this might check auth state
    const timer = setTimeout(() => setIsLoading(false), 100)
    return () => clearTimeout(timer)
  }, [])

  return {
    hasAccess: isAuthenticated && user ? requiredRoles.includes(user.role) : false,
    userRole: user?.role || null,
    isLoading
  }
}

/**
 * Component to conditionally render content based on user role
 */
export function RoleGuard({ 
  allowedRoles, 
  children, 
  fallback = null 
}: {
  allowedRoles: UserRole[]
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  const { hasAccess, isLoading } = useRoleAccess(allowedRoles)

  if (isLoading) {
    return <div className="animate-pulse bg-gray-800 h-4 rounded"></div>
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>
}

/**
 * Enhanced navigation guard with profile completion check
 */
export function NavigationGuard({ 
  children,
  requiredCompletionPercentage = 100 
}: {
  children: React.ReactNode
  requiredCompletionPercentage?: number
}) {
  const { user, isAuthenticated } = useAuthStore()
  const [completionStatus, setCompletionStatus] = useState<ProfileCompletionStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const location = useLocation()

  useEffect(() => {
    const checkCompletion = async () => {
      if (!user || !isAuthenticated) {
        setIsLoading(false)
        return
      }

      try {
        const completion = await ProfileCompletionService.getProfileCompletion(user.id)
        
        if (completion.success) {
          setCompletionStatus({
            isComplete: completion.isComplete,
            percentage: completion.percentage,
            missingFields: completion.missingFields
          })
        }
      } catch (error) {
        console.error('Failed to check profile completion:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkCompletion()
  }, [user, isAuthenticated])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500 mx-auto mb-4" />
          <p className="text-white">Checking profile...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (completionStatus && completionStatus.percentage < requiredCompletionPercentage) {
    return (
      <Navigate 
        to="/auth/profile-setup" 
        state={{ 
          from: location,
          completionStatus,
          requiredPercentage: requiredCompletionPercentage
        }} 
        replace 
      />
    )
  }

  return <>{children}</>
}

/**
 * Profile completion banner component
 */
export function ProfileCompletionBanner() {
  const { user } = useAuthStore()
  const [completionStatus, setCompletionStatus] = useState<ProfileCompletionStatus | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const checkCompletion = async () => {
      if (!user) return

      try {
        const completion = await ProfileCompletionService.getProfileCompletion(user.id)
        
        if (completion.success && !completion.isComplete) {
          setCompletionStatus({
            isComplete: completion.isComplete,
            percentage: completion.percentage,
            missingFields: completion.missingFields
          })
          setIsVisible(true)
        }
      } catch (error) {
        console.error('Failed to check profile completion:', error)
      }
    }

    checkCompletion()
  }, [user])

  if (!isVisible || !completionStatus) return null

  return (
    <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-lg mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Complete Your Profile</h3>
          <p className="text-sm opacity-90">
            Your profile is {completionStatus.percentage}% complete. 
            {completionStatus.missingFields.length > 0 && (
              <span> Missing: {completionStatus.missingFields.join(', ')}</span>
            )}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="w-16 h-2 bg-white bg-opacity-20 rounded-full">
            <div 
              className="h-2 bg-white rounded-full transition-all duration-300"
              style={{ width: `${completionStatus.percentage}%` }}
            />
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="text-white hover:text-gray-200 transition-colors"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  )
} 