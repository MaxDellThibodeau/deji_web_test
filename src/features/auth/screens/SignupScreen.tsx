import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Headphones, User, Music, Building, Shield, ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { toast } from "sonner"
import { AuthService } from "../services/auth-service"
import { UserRole } from "../types/user"

export function SignupScreen() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [selectedRole, setSelectedRole] = useState<UserRole | "">("")
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      toast.error("Passwords don't match!")
      return
    }

    if (!selectedRole) {
      toast.error("Please select a role")
      return
    }

    setIsLoading(true)

    try {
      const [firstName, ...lastNameParts] = name.split(' ')
      const lastName = lastNameParts.join(' ')

      const result = await AuthService.register(email, password, {
        firstName,
        lastName,
        role: selectedRole as UserRole
      })

      if (result.success) {
        toast.success(result.message || "Registration successful!")
        
        if (result.needsConfirmation) {
          navigate("/auth/confirm-email", { 
            state: { email, role: selectedRole } 
          })
        } else {
          // Direct to profile completion
          navigate("/auth/profile-setup", { 
            state: { role: selectedRole } 
          })
        }
      } else {
        toast.error(result.error || "Registration failed")
      }
    } catch (error) {
      console.error("Registration error:", error)
      toast.error("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoBack = () => {
    navigate(-1)
  }

  const roles = [
    {
      id: "attendee",
      name: "Attendee",
      icon: User,
      description: "Attend events and bid on songs"
    },
    {
      id: "dj",
      name: "DJ",
      icon: Music,
      description: "Create playlists and host events"
    },
    {
      id: "venue",
      name: "Venue",
      icon: Building,
      description: "Host events and manage venues"
    }
  ]

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <button
          onClick={handleGoBack}
          className="flex items-center text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </button>

        {/* Logo */}
        <div className="flex items-center justify-center mb-8">
          <div className="relative h-12 w-12 overflow-hidden rounded-full bg-gradient-to-br from-purple-600 to-blue-400 mr-3">
            <Headphones className="absolute inset-0 h-full w-full p-2 text-white" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            DJ AI
          </span>
        </div>

        {/* Welcome Text */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Sign Up</h1>
          <p className="text-gray-400">Create your account to get started</p>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Field */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="John Doe"
              required
              disabled={isLoading}
            />
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-white mb-3">Select Role</label>
            <div className="grid grid-cols-1 gap-3">
              {roles.map((role) => {
                const IconComponent = role.icon
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => setSelectedRole(role.id as UserRole)}
                    disabled={isLoading}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      selectedRole === role.id
                        ? "border-purple-500 bg-purple-500/10"
                        : "border-zinc-700 bg-zinc-800 hover:border-zinc-600"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <div className="flex items-center">
                      <IconComponent className="h-5 w-5 mr-3 text-purple-400" />
                      <div>
                    <div className="text-sm font-medium text-white">{role.name}</div>
                    <div className="text-xs text-gray-400 mt-1">{role.description}</div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="your@email.com"
              required
              disabled={isLoading}
            />
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="••••••••"
              required
              disabled={isLoading}
              minLength={8}
            />
          </div>

          {/* Confirm Password Field */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="••••••••"
              required
              disabled={isLoading}
              minLength={8}
            />
          </div>

          <Button
            type="submit"
            disabled={!selectedRole || isLoading}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white py-3 px-4 rounded-lg font-semibold border-0 disabled:opacity-50 disabled:cursor-not-allowed"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating Account...
              </>
            ) : (
              "Create Account"
            )}
          </Button>
        </form>

        {/* Sign in link */}
        <div className="text-center mt-6">
          <span className="text-gray-400">Already have an account? </span>
          <Link to="/login" className="text-purple-400 hover:text-purple-300 font-medium">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
