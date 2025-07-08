import { useState } from "react"
import { Button } from "@/shared/components/ui/button"
import { toast } from "sonner"
import { createClientClient } from "@/shared/services/client"

export type OAuthProvider = 'google' | 'facebook' | 'github' | 'apple'

interface OAuthButtonProps {
  provider: OAuthProvider
  className?: string
  variant?: "default" | "outline" | "secondary" | "ghost"
  size?: "default" | "sm" | "lg"
  redirectTo?: string
  disabled?: boolean
  children?: React.ReactNode
}

const providerConfig = {
  google: {
    name: 'Google',
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24">
        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      </svg>
    ),
    options: { queryParams: { access_type: 'offline', prompt: 'consent' } }
  },
  facebook: {
    name: 'Facebook',
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
    options: { scopes: 'email,public_profile' }
  },
  github: {
    name: 'GitHub',
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
      </svg>
    ),
    options: { scopes: 'user:email' }
  },
  apple: {
    name: 'Apple',
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
      </svg>
    ),
    options: { scopes: 'name email' }
  },
}

export function OAuthButton({
  provider,
  className = "",
  variant = "outline",
  size = "default",
  redirectTo = "/dashboard",
  disabled = false,
  children,
}: OAuthButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const config = providerConfig[provider]

  const handleOAuthSignIn = async () => {
    if (isLoading || disabled) return
    setIsLoading(true)
    
    try {
      const supabase = createClientClient()
      if (!supabase) throw new Error("Authentication service not available")

      const currentUrl = window.location.origin
      const redirectUrl = `${currentUrl}/auth/callback`

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: redirectUrl, ...config.options },
      })

      if (error) {
        toast.error(`Failed to sign in with ${config.name}`, { description: error.message })
        return
      }

      if (!data.url) throw new Error(`No OAuth URL received for ${config.name}`)

      sessionStorage.setItem('oauth_redirect_to', redirectTo)
      sessionStorage.setItem('oauth_provider', provider)
      window.location.href = data.url
      
    } catch (error) {
      toast.error(`Failed to sign in with ${config.name}`, {
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
      onClick={handleOAuthSignIn}
      disabled={isLoading || disabled}
    >
      {isLoading ? (
        <>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          </div>
          <span className="opacity-0">{children || `Continue with ${config.name}`}</span>
        </>
      ) : (
        <>
          <span className="mr-2">{config.icon}</span>
          {children || `Continue with ${config.name}`}
        </>
      )}
    </Button>
  )
}

// Convenience components for specific providers
export const GoogleOAuthButton = (props: Omit<OAuthButtonProps, 'provider'>) => (
  <OAuthButton provider="google" {...props} />
)

export const FacebookOAuthButton = (props: Omit<OAuthButtonProps, 'provider'>) => (
  <OAuthButton provider="facebook" {...props} />
)

export const GitHubOAuthButton = (props: Omit<OAuthButtonProps, 'provider'>) => (
  <OAuthButton provider="github" {...props} />
)

export const AppleOAuthButton = (props: Omit<OAuthButtonProps, 'provider'>) => (
  <OAuthButton provider="apple" {...props} />
) 