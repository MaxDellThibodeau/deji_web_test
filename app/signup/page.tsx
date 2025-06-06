"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { createClientClient } from "@/shared/services/client"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/ui/card"
import { Button } from "@/ui/button"
import { Input } from "@/ui/input"
import { Label } from "@/ui/label"
import { toast } from "@/shared/hooks/use-toast"
import { Headphones, UserRound, Music, Building, ShieldCheck } from "lucide-react"
import { type UserRole } from "@/src/features/auth/types"

export default function SignupPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [role, setRole] = useState<UserRole>("attendee")
  const [errors, setErrors] = useState<{
    name?: string
    email?: string
    password?: string
    confirmPassword?: string
    role?: string
  }>({})

  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get("redirectTo") || "/dashboard"
  const supabase = createClientClient()

  const validateForm = () => {
    const newErrors: {
      name?: string
      email?: string
      password?: string
      confirmPassword?: string
      role?: string
    } = {}
    let isValid = true

    if (!name.trim()) {
      newErrors.name = "Name is required"
      isValid = false
    }

    if (!email.trim()) {
      newErrors.email = "Email is required"
      isValid = false
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid"
      isValid = false
    }

    // Email uniqueness is now handled by Supabase auth during registration

    if (!password) {
      newErrors.password = "Password is required"
      isValid = false
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
      isValid = false
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    console.log("Signup attempt started for email:", email)
    console.log("Role selected:", role)

    try {
      // Simulate a delay
      await new Promise((resolve) => setTimeout(resolve, 800))
      console.log("Mock signup successful for:", email)

      // Generate a new user ID
      const userId = `user_${Math.random().toString(36).substring(2, 10)}`

      // Set session cookies with user info
      document.cookie = `session=mock-session; path=/; max-age=86400`
      document.cookie = `user_id=${userId}; path=/; max-age=86400`
      document.cookie = `user_role=${role}; path=/; max-age=86400`
      document.cookie = `user_name=${name}; path=/; max-age=86400`

      toast({
        title: "Signup Successful",
        description: `Welcome to DJ AI as ${role}!`,
      })

      // Redirect based on user role
      let targetRedirect = redirectTo
      if (role === "dj") {
        targetRedirect = "/dj-portal/dashboard"
      } else if (role === "venue") {
        targetRedirect = "/venue-portal/dashboard"
      } else if (role === "admin") {
        targetRedirect = "/admin-portal/dashboard"
      } else {
        targetRedirect = "/attendee-portal/dashboard"
      }

      console.log("Redirecting to:", targetRedirect)
      router.push(targetRedirect)
    } catch (error) {
      console.error("Unexpected signup error:", error)
      toast({
        title: "Signup Failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      console.log("Signup process completed")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center space-x-2">
            <div className="relative h-10 w-10 overflow-hidden rounded-full bg-gradient-to-br from-purple-600 to-blue-400">
              <Headphones className="absolute inset-0 h-full w-full p-2 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              DJ AI
            </span>
          </Link>
        </div>

        <Card className="bg-zinc-900/50 border-zinc-800/50 backdrop-blur-sm text-white">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Sign Up</CardTitle>
            <CardDescription className="text-center">Create your account to join DJ AI</CardDescription>
          </CardHeader>
          <form onSubmit={handleSignup}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Your Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-zinc-800/50 border-zinc-700/50"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label>I am a...</Label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole("attendee")}
                    className={`flex flex-col items-center justify-center p-3 rounded-md transition-all ${
                      role === "attendee"
                        ? "border-2 border-purple-500 bg-zinc-800/80"
                        : "border border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800/70"
                    }`}
                  >
                    <UserRound className="h-6 w-6 mb-1" />
                    <span className="text-sm">Attendee</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole("dj")}
                    className={`flex flex-col items-center justify-center p-3 rounded-md transition-all ${
                      role === "dj"
                        ? "border-2 border-purple-500 bg-zinc-800/80"
                        : "border border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800/70"
                    }`}
                  >
                    <Music className="h-6 w-6 mb-1" />
                    <span className="text-sm">DJ</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole("venue")}
                    className={`flex flex-col items-center justify-center p-3 rounded-md transition-all ${
                      role === "venue"
                        ? "border-2 border-purple-500 bg-zinc-800/80"
                        : "border border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800/70"
                    }`}
                  >
                    <Building className="h-6 w-6 mb-1" />
                    <span className="text-sm">Venue</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole("admin")}
                    className={`flex flex-col items-center justify-center p-3 rounded-md transition-all ${
                      role === "admin"
                        ? "border-2 border-purple-500 bg-zinc-800/80"
                        : "border border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800/70"
                    }`}
                  >
                    <ShieldCheck className="h-6 w-6 mb-1" />
                    <span className="text-sm">Admin</span>
                  </button>
                </div>
                {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-zinc-800/50 border-zinc-700/50"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-zinc-800/50 border-zinc-700/50"
                />
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-zinc-800/50 border-zinc-700/50"
                />
                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
              </div>

              <div className="bg-blue-500/20 border border-blue-500/50 text-blue-200 px-3 py-2 rounded-md text-sm">
                <p className="font-medium">Try our demo accounts instead:</p>
                <p className="mt-1">Check the login page for demo account credentials</p>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col">
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 border-0"
                disabled={isLoading}
              >
                {isLoading ? "Creating Account..." : "Sign Up"}
              </Button>
              <p className="mt-4 text-center text-sm text-zinc-400">
                Already have an account?{" "}
                <Link
                  href={`/login?redirectTo=${encodeURIComponent(redirectTo)}`}
                  className="text-blue-400 hover:text-blue-300"
                >
                  Log in
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
