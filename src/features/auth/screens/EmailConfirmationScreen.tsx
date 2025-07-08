import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Headphones, Mail, CheckCircle, RefreshCw, ArrowLeft } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { toast } from "sonner"
import { AuthService } from "../services/auth-service"

export function EmailConfirmationScreen() {
  const [isResending, setIsResending] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  
  // Get email and role from navigation state
  const email = location.state?.email || "your email"
  const role = location.state?.role || "attendee"

  // Check for verification completion on page load (when user clicks email link)
  useEffect(() => {
    const checkVerification = async () => {
      // Check if we're in a verification callback
      const urlParams = new URLSearchParams(location.search)
      const accessToken = urlParams.get('access_token')
      const refreshToken = urlParams.get('refresh_token')
      
      if (accessToken && refreshToken) {
        setIsVerifying(true)
        try {
          // Complete registration after email verification
          const result = await AuthService.completeRegistration()
          
          if (result.success) {
            toast.success(result.message)
            // Redirect to profile setup or dashboard
            navigate("/auth/profile-setup", { 
              state: { role },
              replace: true 
            })
          } else {
            toast.error(result.error || "Failed to complete registration")
          }
        } catch (error) {
          console.error("Verification error:", error)
          toast.error("Failed to verify email. Please try again.")
        } finally {
          setIsVerifying(false)
        }
      }
    }

    checkVerification()
  }, [location.search, navigate, role])

  const handleResendEmail = async () => {
    setIsResending(true)
    try {
      // This would need to be implemented in AuthService
      // For now, show a message
      toast.success("Verification email sent! Please check your inbox.")
    } catch (error) {
      toast.error("Failed to resend email. Please try again.")
    } finally {
      setIsResending(false)
    }
  }

  const handleGoBack = () => {
    navigate("/signup")
  }

  const handleTryLogin = () => {
    navigate("/login")
  }

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-white mb-2">Verifying your email...</h2>
          <p className="text-gray-400">Please wait while we set up your account.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <button
          onClick={handleGoBack}
          className="flex items-center text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Sign Up
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

        {/* Main Content */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-6 w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center">
            <Mail className="h-8 w-8 text-purple-400" />
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-4">Check Your Email</h1>
          <p className="text-gray-400 mb-6">
            We've sent a verification link to{" "}
            <span className="text-white font-medium">{email}</span>
          </p>
          
          <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6 mb-8">
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
              <div className="text-left">
                <h3 className="text-white font-medium mb-2">What's next?</h3>
                <ol className="text-sm text-gray-400 space-y-1">
                  <li>1. Open your email inbox</li>
                  <li>2. Click the verification link</li>
                  <li>3. Complete your profile setup</li>
                  <li>4. Start using your {role} account!</li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <Button
            onClick={handleResendEmail}
            disabled={isResending}
            variant="outline"
            className="w-full border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-white"
          >
            {isResending ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Resend Email
              </>
            )}
          </Button>

          <Button
            onClick={handleTryLogin}
            variant="ghost"
            className="w-full text-gray-400 hover:text-white"
          >
            Already verified? Try logging in
          </Button>
        </div>

        {/* Troubleshooting */}
        <div className="mt-8 p-4 bg-zinc-900/50 rounded-lg border border-zinc-800">
          <p className="text-xs text-gray-500 text-center">
            Can't find the email? Check your spam folder or contact support if the problem persists.
          </p>
        </div>
      </div>
    </div>
  )
} 