import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { createClientClient } from "@/shared/services/client"
import { useAuthStore } from "../stores/auth-store"

interface OAuthCallbackHandlerProps {
  onSuccess?: (isNewUser: boolean) => void
  onError?: (error: Error) => void
}

export function OAuthCallbackHandler({ onSuccess, onError }: OAuthCallbackHandlerProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const { refreshUser } = useAuthStore()

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        console.log("🔐 Processing OAuth callback...")
        
        const supabase = createClientClient()
        if (!supabase) {
          throw new Error("Authentication service not available")
        }

        // Get the session from the URL hash
        const { data, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error("Session error:", sessionError)
          throw sessionError
        }

        if (!data.session) {
          console.log("No session found, checking URL for OAuth response...")
          
          // Try to get session from URL (for OAuth callbacks)
          const { data: authData, error: authError } = await supabase.auth.getUser()
          
          if (authError) {
            console.error("Auth error:", authError)
            throw authError
          }

          if (!authData.user) {
            throw new Error("No user data found after OAuth callback")
          }
        }

        const session = data.session
        if (!session) {
          throw new Error("No session available after OAuth")
        }

        console.log("✅ OAuth callback successful")

        // Refresh the user data in the store
        await refreshUser()

        // Check if this is a new user
        const isNewUser = session.user.created_at === session.user.updated_at

        // Get intended redirect URL from sessionStorage
        const intendedRedirect = sessionStorage.getItem('oauth_redirect_to')
        sessionStorage.removeItem('oauth_redirect_to')

        // Call success callback if provided
        if (onSuccess) {
          onSuccess(isNewUser)
        }

        // Show success toast
        toast.success("Successfully signed in with Google!")

        // Redirect based on whether it's a new user or not
        if (isNewUser) {
          navigate("/onboarding")
        } else {
          // Get user role and redirect to appropriate dashboard
          const { user } = useAuthStore.getState()
          let redirectPath = intendedRedirect || "/dashboard"
          
          if (user?.role) {
            switch (user.role) {
              case "dj":
                redirectPath = "/dj-portal/dashboard"
                break
              case "venue":
                redirectPath = "/venue-portal/dashboard"
                break
              case "attendee":
                redirectPath = "/attendee-portal/dashboard"
                break
              default:
                redirectPath = "/attendee-portal/dashboard"
            }
          }
          
          navigate(redirectPath)
        }

      } catch (error) {
        console.error("OAuth callback error:", error)
        const errorMessage = error instanceof Error ? error.message : "OAuth authentication failed"
        
        setError(errorMessage)
        
        // Call error callback if provided
        if (onError) {
          onError(error instanceof Error ? error : new Error(errorMessage))
        }

        // Show error toast
        toast.error("Authentication failed", {
          description: errorMessage,
        })

        // Redirect to login with error message
        navigate("/login?error=oauth_failed")
      } finally {
        setIsLoading(false)
      }
    }

    handleOAuthCallback()
  }, [navigate, refreshUser, onSuccess, onError])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-2 border-purple-500 border-t-transparent"></div>
          <h2 className="mb-2 text-xl font-semibold text-white">Completing sign in...</h2>
          <p className="text-gray-400">Please wait while we set up your account</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="text-center">
          <div className="mb-4 text-red-500">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="mb-2 text-xl font-semibold text-white">Authentication Error</h2>
          <p className="mb-4 text-gray-400">{error}</p>
          <button
            onClick={() => navigate("/login")}
            className="rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-700"
          >
            Return to Login
          </button>
        </div>
      </div>
    )
  }

  return null
} 