import { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { Headphones, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { toast } from "sonner"
import { AuthService } from "../services/auth-service"

export function EmailVerificationCallback() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const handleVerification = async () => {
      try {
        // Get tokens from URL params (Supabase auth callback)
        const accessToken = searchParams.get('access_token')
        const refreshToken = searchParams.get('refresh_token')
        const error = searchParams.get('error')
        const errorDescription = searchParams.get('error_description')

        if (error || errorDescription) {
          setStatus('error')
          setMessage(errorDescription || error || 'Email verification failed')
          return
        }

        if (!accessToken) {
          setStatus('error')
          setMessage('Invalid verification link. Please try again.')
          return
        }

        // Set the session with the tokens
        const client = AuthService.client
        if (client) {
          const { error: sessionError } = await client.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || ''
          })

          if (sessionError) {
            setStatus('error')
            setMessage('Failed to establish session. Please try logging in.')
            return
          }
        }

        // Wait a moment for the session to be established
        await new Promise(resolve => setTimeout(resolve, 1000))

        // Complete registration (create profile)
        const result = await AuthService.completeRegistration()

        if (result.success) {
          setStatus('success')
          setMessage(result.message || 'Email verified successfully!')
          
          // Redirect after a short delay
          setTimeout(() => {
            navigate('/auth/profile-setup', { replace: true })
          }, 2000)
        } else {
          setStatus('error')
          setMessage(result.error || 'Failed to complete registration')
        }

      } catch (error) {
        console.error('Verification callback error:', error)
        setStatus('error')
        setMessage('An unexpected error occurred during verification')
      }
    }

    handleVerification()
  }, [searchParams, navigate])

  const handleTryAgain = () => {
    navigate('/signup')
  }

  const handleLogin = () => {
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        {/* Logo */}
        <div className="flex items-center justify-center mb-8">
          <div className="relative h-12 w-12 overflow-hidden rounded-full bg-gradient-to-br from-purple-600 to-blue-400 mr-3">
            <Headphones className="absolute inset-0 h-full w-full p-2 text-white" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            DJ AI
          </span>
        </div>

        {/* Status Content */}
        {status === 'loading' && (
          <div className="space-y-6">
            <div className="mx-auto w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-purple-400 animate-spin" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">Verifying Your Email</h1>
              <p className="text-gray-400">Please wait while we set up your account...</p>
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-6">
            <div className="mx-auto w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">Email Verified!</h1>
              <p className="text-gray-400 mb-4">{message}</p>
              <p className="text-sm text-purple-400">Redirecting you to complete your profile...</p>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-6">
            <div className="mx-auto w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-red-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">Verification Failed</h1>
              <p className="text-gray-400 mb-6">{message}</p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleTryAgain}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600"
              >
                Try Again
              </Button>
              <Button
                onClick={handleLogin}
                variant="outline"
                className="w-full border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-white"
              >
                Go to Login
              </Button>
            </div>
          </div>
        )}

        {/* Help Text */}
        <div className="mt-8 p-4 bg-zinc-900/50 rounded-lg border border-zinc-800">
          <p className="text-xs text-gray-500">
            Having trouble? Contact support if the problem persists.
          </p>
        </div>
      </div>
    </div>
  )
} 