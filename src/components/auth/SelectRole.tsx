import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthService, type UserRole, type UserProfile } from '@/lib/auth'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { AlertCircle, Loader2, Music, Building, Users } from 'lucide-react'

interface SelectRoleProps {
  user: UserProfile
  onRoleSelected?: (role: UserRole) => void
}

export function SelectRole({ user, onRoleSelected }: SelectRoleProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const handleRoleSelect = async (role: UserRole) => {
    try {
      setError(null)
      setLoading(true)
      setSelectedRole(role)

      const result = await AuthService.setUserRole(user.id, role, user)

      if (!result.success) {
        setError(result.error || 'Failed to set role')
        return
      }

      // Notify parent component
      onRoleSelected?.(role)

      // Navigate to the appropriate dashboard
      const dashboardPath = AuthService.getDashboardPath(role)
      navigate(dashboardPath, { replace: true })

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to set role'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const roles: Array<{
    id: UserRole
    title: string
    description: string
    icon: React.ReactNode
    features: string[]
    bgGradient: string
    iconBg: string
  }> = [
    {
      id: 'attendee',
      title: 'Attendee',
      description: 'Discover events and connect with DJs',
      icon: <Users className="w-8 h-8" />,
      features: [
        'Browse events and venues',
        'Request songs from DJs',
        'Follow your favorite DJs',
        'Get personalized recommendations',
      ],
      bgGradient: 'from-blue-400 to-cyan-400',
      iconBg: 'bg-blue-100 text-blue-600',
    },
    {
      id: 'dj',
      title: 'DJ',
      description: 'Manage your sets and connect with fans',
      icon: <Music className="w-8 h-8" />,
      features: [
        'Create and manage your profile',
        'Handle song requests',
        'Track your performance analytics',
        'Connect with venues and fans',
      ],
      bgGradient: 'from-purple-400 to-pink-400',
      iconBg: 'bg-purple-100 text-purple-600',
    },
    {
      id: 'venue',
      title: 'Venue',
      description: 'Book DJs and manage events',
      icon: <Building className="w-8 h-8" />,
      features: [
        'Discover and book DJs',
        'Manage your event calendar',
        'Track venue analytics',
        'Engage with your audience',
      ],
      bgGradient: 'from-green-400 to-emerald-400',
      iconBg: 'bg-green-100 text-green-600',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-6xl mx-auto py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to DJEI, {user.name}!
          </h1>
          <p className="text-gray-600 text-lg">
            Choose your role to get started and customize your experience
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="max-w-md mx-auto mb-6">
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          </div>
        )}

        {/* Role Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {roles.map((role) => (
            <Card 
              key={role.id}
              className={`relative overflow-hidden transition-all duration-300 transform hover:scale-105 hover:shadow-xl cursor-pointer ${
                selectedRole === role.id ? 'ring-4 ring-blue-500 shadow-lg' : ''
              }`}
              onClick={() => !loading && handleRoleSelect(role.id)}
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${role.bgGradient} opacity-5`} />
              
              <CardHeader className="relative text-center pb-4">
                <div className={`w-16 h-16 mx-auto rounded-full ${role.iconBg} flex items-center justify-center mb-4`}>
                  {loading && selectedRole === role.id ? (
                    <Loader2 className="w-8 h-8 animate-spin" />
                  ) : (
                    role.icon
                  )}
                </div>
                <CardTitle className="text-xl font-bold text-gray-900">
                  {role.title}
                </CardTitle>
                <CardDescription className="text-gray-600">
                  {role.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="relative">
                <ul className="space-y-2 mb-6">
                  {role.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full bg-gradient-to-r ${role.bgGradient} hover:opacity-90 text-white border-0 transition-all duration-200`}
                  disabled={loading}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRoleSelect(role.id)
                  }}
                >
                  {loading && selectedRole === role.id ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Setting up...
                    </div>
                  ) : (
                    `Join as ${role.title}`
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>You can change your role later in your profile settings</p>
        </div>
      </div>
    </div>
  )
}

export default SelectRole 