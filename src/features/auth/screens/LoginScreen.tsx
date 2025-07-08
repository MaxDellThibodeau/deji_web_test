import { useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { Headphones, ArrowLeft, Loader2, Eye, EyeOff } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { SignInWithGoogleButton } from "../components/sign-in-with-google-button"
import { SignInWithFacebookButton } from "../components/sign-in-with-facebook-button"
import { toast } from "sonner"
import { AuthService } from "../services/auth-service"
import { useAuthStore } from "../stores/auth-store"

interface DemoAccount {
  role: string
  email: string
  password: string
  description: string
}

export function LoginScreen() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isDemoLoading, setIsDemoLoading] = useState<string | null>(null)
  const navigate = useNavigate()
  const location = useLocation()
  const { login: storeLogin } = useAuthStore()

  // Get redirect URL from navigation state
  const from = location.state?.from?.pathname || "/dashboard"
  
  // Check for error from OAuth
  const urlParams = new URLSearchParams(location.search)
  const oauthError = urlParams.get('error')

  // Show OAuth error if present
  if (oauthError && oauthError === 'oauth_failed') {
    toast.error("OAuth authentication failed", {
      description: "Please try signing in with email and password instead."
    })
    // Clear the error from URL
    navigate(location.pathname, { replace: true })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      toast.error("Please fill in all fields")
      return
    }

    setIsLoading(true)

    try {
      const result = await AuthService.login(email, password, from)

      if (result.success) {
        toast.success("Welcome back!")
        
        if (result.redirectTo) {
          navigate(result.redirectTo, { replace: true })
        } else {
          navigate(from, { replace: true })
        }
      } else {
        // Handle specific error types
        const errorMessage = getErrorMessage(result.error)
        toast.error("Login failed", {
          description: errorMessage
        })
      }
    } catch (error) {
      console.error("Login error:", error)
      toast.error("Login failed", {
        description: "An unexpected error occurred. Please try again."
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoLogin = async (account: DemoAccount) => {
    setIsDemoLoading(account.role)
    
    try {
      // Auto-fill the form
      setEmail(account.email)
      setPassword(account.password)
      
      // Slight delay for visual feedback
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const result = await AuthService.login(account.email, account.password, from)

      if (result.success) {
        toast.success(`Welcome! Logged in as ${account.role}`, {
          description: `You're now using the ${account.role.toLowerCase()} demo account`
        })
        
        if (result.redirectTo) {
          navigate(result.redirectTo, { replace: true })
        } else {
          navigate(from, { replace: true })
        }
      } else {
        toast.error("Demo login failed", {
          description: "Demo account is not available. Please try manual login."
        })
      }
    } catch (error) {
      console.error("Demo login error:", error)
      toast.error("Demo login failed", {
        description: "Please try logging in manually."
      })
    } finally {
      setIsDemoLoading(null)
    }
  }

  const handleGoBack = () => {
    navigate(-1)
  }

  const demoAccounts: DemoAccount[] = [
    { 
      role: "DJ", 
      email: "dj@djei.demo", 
      password: "password123",
      description: "Experience the DJ portal with playlist management and event booking"
    },
    { 
      role: "Attendee", 
      email: "attendee@djei.demo", 
      password: "password123",
      description: "Explore event discovery and music request features"
    },
    { 
      role: "Venue", 
      email: "venue@djei.demo", 
      password: "password123",
      description: "Manage venue bookings and event hosting capabilities"
    }
  ]

  const handleSetupDemoAccounts = async () => {
    try {
      const setupModule = await import('@/scripts/setup-demo-accounts')
      toast.success("Setting up demo accounts...", {
        description: "Check the browser console for progress"
      })
      await setupModule.setupDemoAccounts()
      toast.success("Demo accounts setup complete!", {
        description: "You can now use the demo login buttons below"
      })
    } catch (error) {
      console.error("Setup failed:", error)
      toast.error("Demo setup failed", {
        description: "Please check the browser console for details"
      })
    }
  }

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
          <h1 className="text-3xl font-bold text-white mb-2">Welcome back</h1>
          <p className="text-gray-400">Sign in to your account to continue</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-white mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
              placeholder="your@email.com"
              required
              disabled={isLoading || isDemoLoading !== null}
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-white">Password</label>
              <Link to="/forgot-password" className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
            <input
                type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
              placeholder="••••••••"
              required
                disabled={isLoading || isDemoLoading !== null}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                disabled={isLoading || isDemoLoading !== null}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading || isDemoLoading !== null || !email || !password}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white py-3 px-4 rounded-lg font-semibold border-0 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center">
          <div className="flex-1 border-t border-zinc-700"></div>
          <span className="px-4 text-sm text-gray-400">or continue with</span>
          <div className="flex-1 border-t border-zinc-700"></div>
        </div>

        {/* Social Login Buttons */}
        <div className="space-y-3">
        <SignInWithGoogleButton
          className="w-full border-zinc-700 hover:bg-zinc-800 text-white"
          size="lg"
            redirectTo={from}
            disabled={isLoading || isDemoLoading !== null}
          />
          <SignInWithFacebookButton
            className="w-full border-zinc-700 hover:bg-zinc-800 text-white"
            size="lg"
            redirectTo={from}
            disabled={isLoading || isDemoLoading !== null}
        />
        </div>

        {/* Sign up link */}
        <div className="text-center mt-6">
          <span className="text-gray-400">Don't have an account? </span>
          <Link to="/signup" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
            Sign up
          </Link>
        </div>

        {/* Demo Accounts */}
        <div className="mt-8 p-4 bg-zinc-900 rounded-lg border border-zinc-800">
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
            🎭 Demo Accounts
            <span className="ml-2 text-xs bg-purple-600 text-white px-2 py-1 rounded-full">
              Try Now
            </span>
          </h3>
          <p className="text-sm text-gray-400 mb-4">
            Explore different user experiences with our demo accounts
          </p>
          
          {/* Setup Button */}
          <div className="mb-4 p-3 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-yellow-400 font-medium">Demo accounts not working?</p>
                <p className="text-xs text-yellow-300/70">Click to create demo accounts in Supabase</p>
              </div>
              <Button
                onClick={handleSetupDemoAccounts}
                size="sm"
                variant="outline"
                className="border-yellow-600 text-yellow-400 hover:bg-yellow-600/10 text-xs"
              >
                Setup Demo Accounts
              </Button>
            </div>
          </div>
          <div className="space-y-3">
            {demoAccounts.map((account, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg border border-zinc-700">
                <div className="flex-1">
                  <div className="flex items-center mb-1">
                    <span className="text-white font-medium text-sm">{account.role}</span>
                    <span className="ml-2 text-xs text-gray-400">{account.email}</span>
                  </div>
                  <p className="text-xs text-gray-500">{account.description}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDemoLogin(account)}
                  disabled={isLoading || isDemoLoading !== null}
                  className="ml-3 border-zinc-600 hover:bg-zinc-700 text-xs"
                >
                  {isDemoLoading === account.role ? (
                    <>
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    "Try Demo"
                  )}
                </Button>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-3 text-center">
            Demo accounts are reset daily and contain sample data
          </p>
        </div>
      </div>
    </div>
  )
}

// Helper function to provide user-friendly error messages
function getErrorMessage(error?: string): string {
  if (!error) return "Please check your credentials and try again"
  
  const errorLower = error.toLowerCase()
  
  if (errorLower.includes('invalid login credentials') || errorLower.includes('invalid credentials')) {
    return "Invalid email or password. Please check your credentials."
  }
  
  if (errorLower.includes('email not confirmed')) {
    return "Please check your email and click the confirmation link before signing in."
  }
  
  if (errorLower.includes('too many requests')) {
    return "Too many login attempts. Please wait a few minutes before trying again."
  }
  
  if (errorLower.includes('network') || errorLower.includes('fetch')) {
    return "Network error. Please check your connection and try again."
  }
  
  if (errorLower.includes('service not available')) {
    return "Authentication service is temporarily unavailable. Please try again later."
  }
  
  // Return the original error message if we don't have a specific mapping
  return error
}
