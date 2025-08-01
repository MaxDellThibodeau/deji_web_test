import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/shared/components/ui/button"
import { toast } from "sonner"
import { createClientClient } from "@/shared/services/client"
import { useAuthStore } from "../stores/auth-store"

interface SignInWithGoogleButtonProps {
  className?: string
  variant?: "default" | "outline" | "secondary" | "ghost"
  size?: "default" | "sm" | "lg"
  redirectTo?: string
  disabled?: boolean
  children?: React.ReactNode
}

export function SignInWithGoogleButton({
  className = "",
  variant = "outline",
  size = "default",
  redirectTo = "/dashboard",
  disabled = false,
  children,
}: SignInWithGoogleButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { refreshUser } = useAuthStore()

  const handleGoogleSignIn = async () => {
    if (isLoading || disabled) return

    setIsLoading(true)
    
    try {
      console.log("🔐 Starting Google OAuth sign-in...")
      
      const supabase = createClientClient()
      if (!supabase) {
        throw new Error("Authentication service not available")
      }

      // Get current URL for redirect
      const currentUrl = window.location.origin
      const redirectUrl = `${currentUrl}/auth/callback`

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })

      if (error) {
        console.error("Google OAuth error:", error)
        toast.error("Failed to sign in with Google", {
          description: error.message,
        })
        return
      }

      if (!data.url) {
        throw new Error("No OAuth URL received from Supabase")
      }

      // Store the intended redirect URL in sessionStorage
      sessionStorage.setItem('oauth_redirect_to', redirectTo)

      // Redirect to Google OAuth
      window.location.href = data.url
      
    } catch (error) {
      console.error("Google sign-in error:", error)
      toast.error("Failed to sign in with Google", {
        description: error instanceof Error ? error.message : "An unexpected error occurred",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={`relative ${className}`}
      onClick={handleGoogleSignIn}
      disabled={isLoading || disabled}
    >
      {isLoading ? (
        <>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          </div>
          <span className="opacity-0">Continue with Google</span>
        </>
      ) : (
        <>
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          {children || "Continue with Google"}
        </>
      )}
    </Button>
  )
} 