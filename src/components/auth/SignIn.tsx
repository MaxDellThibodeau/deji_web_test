import React, { useState } from 'react'
import { AuthService, type OAuthProvider } from '@/lib/auth'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { AlertCircle, Loader2 } from 'lucide-react'

interface SignInProps {
  onSuccess?: () => void
  onError?: (error: string) => void
}

export function SignIn({ onSuccess, onError }: SignInProps) {
  const [loadingProvider, setLoadingProvider] = useState<OAuthProvider | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleOAuthSignIn = async (provider: OAuthProvider) => {
    try {
      setError(null)
      setLoadingProvider(provider)

      const result = await AuthService.signInWithOAuth(provider)

      if (!result.success) {
        setError(result.error || 'Authentication failed')
        onError?.(result.error || 'Authentication failed')
      } else {
        onSuccess?.()
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Authentication failed'
      setError(errorMessage)
      onError?.(errorMessage)
    } finally {
      setLoadingProvider(null)
    }
  }

  const providers: Array<{
    id: OAuthProvider
    name: string
    icon: React.ReactNode
    bgColor: string
    hoverColor: string
    textColor: string
  }> = [
    {
      id: 'google',
      name: 'Google',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24">
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
      ),
      bgColor: 'bg-white',
      hoverColor: 'hover:bg-gray-50',
      textColor: 'text-gray-700',
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
      bgColor: 'bg-[#1877F2]',
      hoverColor: 'hover:bg-[#166FE5]',
      textColor: 'text-white',
    },
    {
      id: 'apple',
      name: 'Apple',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
        </svg>
      ),
      bgColor: 'bg-black',
      hoverColor: 'hover:bg-gray-800',
      textColor: 'text-white',
    },
  ]

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Welcome to DJEI
          </CardTitle>
          <CardDescription className="text-gray-600">
            Connect DJs, venues, and music lovers
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <div className="space-y-3">
            {providers.map((provider) => (
              <Button
                key={provider.id}
                variant="outline"
                size="lg"
                className={`w-full h-12 ${provider.bgColor} ${provider.hoverColor} ${provider.textColor} border-2 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]`}
                onClick={() => handleOAuthSignIn(provider.id)}
                disabled={loadingProvider !== null}
              >
                <div className="flex items-center justify-center gap-3">
                  {loadingProvider === provider.id ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    provider.icon
                  )}
                  <span className="font-medium">
                    {loadingProvider === provider.id 
                      ? 'Connecting...' 
                      : `Continue with ${provider.name}`
                    }
                  </span>
                </div>
              </Button>
            ))}
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Sign in to continue</span>
            </div>
          </div>

          <div className="text-xs text-gray-500 text-center space-y-1">
            <p>By continuing, you agree to our Terms of Service and Privacy Policy.</p>
            <p>Choose your role after signing in to get started.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default SignIn 