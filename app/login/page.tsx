"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Headphones, Loader2, ArrowLeft } from "lucide-react"
import { Button } from "@/ui/button"
import { Input } from "@/ui/input"
import { Label } from "@/ui/label"
import { toast } from "@/shared/hooks/use-toast"
import { useAuth } from "@/features/auth/hooks/use-auth"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isRedirecting, setIsRedirecting] = useState(false)

  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get("redirectTo") || "/dashboard"
  const formSubmitted = useRef(false)
  const redirectAttempted = useRef(false)

  const { login, isAuthenticated, isLoading: authLoading } = useAuth()

  // Redirect if already authenticated - with debounce to prevent flickering
  useEffect(() => {
    if (isAuthenticated && !authLoading && !redirectAttempted.current) {
      redirectAttempted.current = true
      setIsRedirecting(true)

      // Add a small delay before redirecting to prevent rapid state changes
      const redirectTimer = setTimeout(() => {
        router.push(redirectTo)
      }, 100)

      return () => clearTimeout(redirectTimer)
    }
  }, [isAuthenticated, authLoading, router, redirectTo])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Prevent duplicate submissions
    if (formSubmitted.current || isLoading) return
    formSubmitted.current = true

    setIsLoading(true)
    setError(null)

    try {
      const result = await login(email, password, redirectTo)

      if (result.success) {
        toast({
          title: "Login Successful",
          description: "Welcome back!",
        })

        // Set redirecting state to prevent UI flicker
        setIsRedirecting(true)
        // Redirect will happen via the useEffect
      } else {
        setError(result.error || "Login failed. Please try again.")
      }
    } catch (err) {
      console.error("Login error:", err)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
      formSubmitted.current = false
    }
  }

  // Show loading state while checking auth or redirecting
  if (authLoading || isRedirecting) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-black text-white">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
          <span>Loading...</span>
        </div>
      </div>
    )
  }

  // If already authenticated, redirect happens via useEffect

  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      <div className="p-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="flex items-center text-gray-400 hover:text-white"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-4 py-8">
        <Link href="/" className="mb-8 flex items-center space-x-2">
          <div className="relative h-10 w-10 overflow-hidden rounded-full bg-gradient-to-br from-purple-600 to-blue-400">
            <Headphones className="absolute inset-0 h-full w-full p-1.5 text-white" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            DJ AI
          </span>
        </Link>

        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold">Welcome back</h1>
            <p className="mt-2 text-zinc-400">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            {error && <div className="rounded-md bg-red-500/10 p-4 text-sm text-red-500">{error}</div>}

            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="mt-1 bg-zinc-900 border-zinc-800 text-white"
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link href="/forgot-password" className="text-sm text-purple-400 hover:text-purple-300">
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="mt-1 bg-zinc-900 border-zinc-800 text-white"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-zinc-400">
              Don't have an account?{" "}
              <Link href="/signup" className="text-purple-400 hover:text-purple-300">
                Sign up
              </Link>
            </p>
          </div>

          {/* Demo accounts section */}
          <div className="mt-8 rounded-lg bg-zinc-900/50 p-4 border border-zinc-800/50">
            <h3 className="font-medium text-zinc-300 mb-2">Demo Accounts:</h3>
            <div className="space-y-2 text-sm text-zinc-400">
              <p>
                <span className="text-zinc-300">DJ:</span> dj@example.com / password123
              </p>
              <p>
                <span className="text-zinc-300">Attendee:</span> alex@example.com / password123
              </p>
              <p>
                <span className="text-zinc-300">Venue:</span> venue@example.com / password123
              </p>
              <p>
                <span className="text-zinc-300">Admin:</span> admin@example.com / password123
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
