import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Headphones, User, Music, Building, ArrowLeft, ArrowRight } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { toast } from "sonner"
import { useAuthStore } from "../stores/auth-store"
import { ProfileImageUpload } from "../components/profile-image-upload"

interface Role {
  id: string
  name: string
  icon: React.ComponentType<any>
  description: string
}

export function OnboardingScreen() {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedRole, setSelectedRole] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [hasUploadedImage, setHasUploadedImage] = useState(false)
  const navigate = useNavigate()
  const { user, refreshUser } = useAuthStore()

  const totalSteps = 3

  const roles: Role[] = [
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

  const handleNextStep = () => {
    if (currentStep === 1 && !selectedRole) {
      toast.error("Please select a role to continue")
      return
    }
    
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleImageUploadSuccess = (avatarUrl: string) => {
    console.log('✅ Profile image uploaded:', avatarUrl)
    setHasUploadedImage(true)
    toast.success("Profile image uploaded successfully!")
  }

  const handleImageUploadError = (error: string) => {
    console.error('❌ Profile image upload failed:', error)
    toast.error("Failed to upload image", { description: error })
  }

  const handleCompleteSetup = async () => {
    if (!selectedRole) {
      toast.error("Please select a role first")
      setCurrentStep(1)
      return
    }

    if (!user) {
      toast.error("User session not found")
      navigate("/login")
      return
    }

    setIsLoading(true)

    try {
      // Update user role in your backend/database here
      console.log(`Setting user role to: ${selectedRole}`)
      
      // TODO: Add API call to update user role in database
      // await updateUserRole(selectedRole)
      
      // Refresh user data
      await refreshUser()
      
      // Show success message
      toast.success("Welcome to DJEI! Your account has been set up.")
      
      // Redirect based on selected role
      switch (selectedRole) {
        case "dj":
          navigate("/dj-portal/dashboard")
          break
        case "venue":
          navigate("/venue-portal/dashboard")
          break
        case "attendee":
          navigate("/attendee-portal/dashboard")
          break
        default:
          navigate("/attendee-portal/dashboard")
      }
      
    } catch (error) {
      console.error("Onboarding error:", error)
      toast.error("Failed to complete setup. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-4">Choose your role</h2>
              <p className="text-gray-400">What best describes you on DJEI?</p>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {roles.map((role) => {
                const IconComponent = role.icon
                return (
                  <button
                    key={role.id}
                    onClick={() => setSelectedRole(role.id)}
                    className={`p-6 rounded-xl border-2 transition-all text-center hover:scale-105 ${
                      selectedRole === role.id
                        ? "border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/20"
                        : "border-zinc-700 bg-zinc-900 hover:border-zinc-600 hover:bg-zinc-800"
                    }`}
                  >
                    <IconComponent className="h-12 w-12 mb-4 mx-auto text-purple-400" />
                    <div className="text-lg font-semibold text-white mb-2">{role.name}</div>
                    <div className="text-sm text-gray-400">{role.description}</div>
                  </button>
                )
              })}
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-4">Add a profile picture</h2>
              <p className="text-gray-400">Help others recognize you (optional)</p>
            </div>

            <Card className="bg-zinc-900 border-zinc-700">
              <CardHeader>
                <CardTitle className="text-white">Profile Image</CardTitle>
                <CardDescription className="text-gray-400">
                  Upload a photo to personalize your profile
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProfileImageUpload
                  onUploadSuccess={handleImageUploadSuccess}
                  onUploadError={handleImageUploadError}
                  className="max-w-md mx-auto"
                />
              </CardContent>
            </Card>
          </div>
        )

      case 3:
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-4">You're all set!</h2>
              <p className="text-gray-400">Review your information and complete setup</p>
            </div>

            <Card className="bg-zinc-900 border-zinc-700">
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Name:</span>
                    <span className="text-white">{user?.name || user?.email}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Email:</span>
                    <span className="text-white">{user?.email}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Role:</span>
                    <span className="text-white capitalize">{selectedRole}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Profile Image:</span>
                    <span className="text-white">
                      {hasUploadedImage || user?.avatar_url ? "✅ Added" : "⏭️ Skipped"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="flex items-center justify-center mb-8">
          <div className="relative h-12 w-12 overflow-hidden rounded-full bg-gradient-to-br from-purple-600 to-blue-400 mr-3">
            <Headphones className="absolute inset-0 h-full w-full p-2 text-white" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            DJEI
          </span>
        </div>

        {/* Welcome Text */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome to DJEI!</h1>
          <p className="text-lg text-gray-400">
            Hi {user?.name || user?.email}, let's get your account set up.
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div key={i} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                    i + 1 <= currentStep
                      ? "bg-purple-600 text-white"
                      : "bg-zinc-700 text-gray-400"
                  }`}
                >
                  {i + 1}
                </div>
                {i < totalSteps - 1 && (
                  <div
                    className={`w-16 h-1 mx-2 transition-colors ${
                      i + 1 < currentStep ? "bg-purple-600" : "bg-zinc-700"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="text-center mt-2 text-sm text-gray-500">
            Step {currentStep} of {totalSteps}
          </div>
        </div>

        {/* Step Content */}
        <div className="mb-8">
          {renderStep()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center">
          <Button
            onClick={handlePreviousStep}
            disabled={currentStep === 1}
            variant="outline"
            className="border-zinc-700 hover:bg-zinc-800 text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          {currentStep < totalSteps ? (
            <Button
              onClick={handleNextStep}
              disabled={currentStep === 1 && !selectedRole}
              className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600"
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleCompleteSetup}
              disabled={!selectedRole || isLoading}
              className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600"
            >
              {isLoading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Setting up...
                </>
              ) : (
                "Complete Setup"
              )}
            </Button>
          )}
        </div>

        {/* Additional Info */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>You can change these settings later in your profile.</p>
        </div>
      </div>
    </div>
  )
} 