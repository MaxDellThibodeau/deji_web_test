import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/shared/components/ui/button"
import { toast } from "sonner"
import { createClientClient } from "@/shared/services/client"
import { useAuthStore } from "../stores/auth-store"

interface SignInWithFacebookButtonProps {
  className?: string
  variant?: "default" | "outline" | "secondary" | "ghost"
  size?: "default" | "sm" | "lg"
  redirectTo?: string
  disabled?: boolean
  children?: React.ReactNode
}

export function SignInWithFacebookButton({
  className = "",
  variant = "outline",
  size = "default",
  redirectTo = "/dashboard",
  disabled = false,
  children,
}: SignInWithFacebookButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { refreshUser } = useAuthStore()

  const handleFacebookSignIn = async () => {
    if (isLoading || disabled) return

    setIsLoading(true)
    
    try {
      console.log("🔐 Starting Facebook OAuth sign-in...")
      
      const supabase = createClientClient()
      if (!supabase) {
        throw new Error("Authentication service not available")
      }

      // Get current URL for redirect
      const currentUrl = window.location.origin
      const redirectUrl = `${currentUrl}/auth/callback`

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: redirectUrl,
          scopes: 'email,public_profile',
        },
      })

      if (error) {
        console.error("Facebook OAuth error:", error)
        toast.error("Failed to sign in with Facebook", {
          description: error.message,
        })
        return
      }

      if (!data.url) {
        throw new Error("No OAuth URL received from Supabase")
      }

      // Store the intended redirect URL in sessionStorage
      sessionStorage.setItem('oauth_redirect_to', redirectTo)

      // Redirect to Facebook OAuth
      window.location.href = data.url
      
    } catch (error) {
      console.error("Facebook sign-in error:", error)
      toast.error("Failed to sign in with Facebook", {
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
      onClick={handleFacebookSignIn}
      disabled={isLoading || disabled}
    >
      {isLoading ? (
        <>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          </div>
          <span className="opacity-0">Continue with Facebook</span>
        </>
      ) : (
        <>
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          {children || "Continue with Facebook"}
        </>
      )}
    </Button>
  )
} 