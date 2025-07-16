import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { handleOAuthCallback, AuthService } from '@/lib/auth'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { Card, CardContent } from '@/shared/components/ui/card'

export function AuthCallback() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const processCallback = async () => {
      try {
        setStatus('loading')
        
        const result = await handleOAuthCallback()

        if (!result.success) {
          setStatus('error')
          setError(result.error || 'Authentication failed')
          return
        }

        setStatus('success')

        // Wait a moment to show success state
        setTimeout(() => {
          if (result.isNewUser) {
            // New user - redirect to role selection
            navigate('/select-role', { 
              replace: true,
              state: { user: result.user }
            })
          } else if (result.user?.role) {
            // Existing user - redirect to their dashboard
            const dashboardPath = AuthService.getDashboardPath(result.user.role)
            navigate(dashboardPath, { replace: true })
          } else {
            // User exists but no role set - redirect to role selection
            navigate('/select-role', { 
              replace: true,
              state: { user: result.user }
            })
          }
        }, 1500)

      } catch (err) {
        setStatus('error')
        setError(err instanceof Error ? err.message : 'Authentication failed')
      }
    }

    processCallback()
  }, [navigate])

  const statusConfig = {
    loading: {
      icon: <Loader2 className="w-16 h-16 animate-spin text-blue-500" />,
      title: 'Completing sign in...',
      description: 'Please wait while we set up your account',
      bgColor: 'bg-blue-50',
    },
    success: {
      icon: <CheckCircle className="w-16 h-16 text-green-500" />,
      title: 'Success!',
      description: 'Redirecting you to your dashboard',
      bgColor: 'bg-green-50',
    },
    error: {
      icon: <AlertCircle className="w-16 h-16 text-red-500" />,
      title: 'Authentication failed',
      description: error || 'Something went wrong during sign in',
      bgColor: 'bg-red-50',
    },
  }

  const config = statusConfig[status]

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          <div className={`text-center space-y-4 p-6 rounded-lg ${config.bgColor}`}>
            <div className="flex justify-center">
              {config.icon}
            </div>
            
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-gray-900">
                {config.title}
              </h2>
              <p className="text-gray-600">
                {config.description}
              </p>
            </div>

            {status === 'error' && (
              <button
                onClick={() => navigate('/signin', { replace: true })}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default AuthCallback 