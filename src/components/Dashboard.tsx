import React from 'react'
import { useAuthStore } from '@/features/auth/stores/auth-store'
import { DjDashboard } from './dashboards/DjDashboard'
import { AttendeeDashboard } from './dashboards/AttendeeDashboard'
import { VenueDashboard } from './dashboards/VenueDashboard'
import { Loader2 } from 'lucide-react'

export function Dashboard() {
  const { user, isLoading } = useAuthStore()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500 mx-auto mb-4" />
          <p className="text-white">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-lg">Please log in to access your dashboard</p>
        </div>
      </div>
    )
  }

  // Route to appropriate dashboard based on user role
  switch (user.role) {
    case 'dj':
      return <DjDashboard />
    case 'attendee':
      return <AttendeeDashboard />
    case 'venue':
      return <VenueDashboard />
    default:
      return (
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-center">
            <p className="text-white text-lg">Unknown user role: {user.role}</p>
          </div>
        </div>
      )
  }
} 