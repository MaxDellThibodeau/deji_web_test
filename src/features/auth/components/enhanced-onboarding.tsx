import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Headphones, User, Music, Building, CheckCircle, Loader2, ArrowRight, ArrowLeft } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { toast } from "sonner"
import { UserRole } from "../types/user"

interface EnhancedOnboardingProps {
  onComplete: (role: UserRole) => void
  initialRole?: UserRole
}

const roles = [
  {
    id: 'attendee' as UserRole,
    title: 'Music Lover',
    description: 'Discover events, request songs, and connect with DJs',
    icon: <User className="h-8 w-8" />,
    features: ['Find local events', 'Request songs with tokens', 'Build music preferences', 'Connect with DJs'],
    color: 'from-blue-600 to-purple-600'
  },
  {
    id: 'dj' as UserRole,
    title: 'DJ Artist',
    description: 'Showcase your music, book gigs, and grow your fanbase',
    icon: <Music className="h-8 w-8" />,
    features: ['Upload music samples', 'Get booked for events', 'Manage playlists', 'Track earnings'],
    color: 'from-purple-600 to-pink-600'
  },
  {
    id: 'venue' as UserRole,
    title: 'Venue Manager',
    description: 'Host events, book DJs, and manage your space',
    icon: <Building className="h-8 w-8" />,
    features: ['List your venue', 'Book DJs', 'Manage events', 'Set pricing'],
    color: 'from-pink-600 to-red-600'
  }
]

export function EnhancedOnboarding({ onComplete, initialRole }: EnhancedOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(initialRole || null)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleComplete = async () => {
    if (!selectedRole) {
      toast.error("Please select a role first")
      return
    }

    setIsLoading(true)
    try {
      await onComplete(selectedRole)
      toast.success("Welcome to DJEI!")
    } catch (error) {
      toast.error("Setup failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Choose Your Role</h2>
          <p className="text-gray-400">Select how you'll be using DJEI</p>
        </div>
        
        <div className="grid gap-4 mb-8">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => setSelectedRole(role.id)}
              className={`p-6 rounded-lg border transition-all hover:scale-[1.02] ${
                selectedRole === role.id
                  ? 'border-purple-500 bg-gradient-to-r from-purple-600/10 to-blue-600/10'
                  : 'border-zinc-700 bg-zinc-800 hover:border-zinc-600'
              }`}
            >
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-full bg-gradient-to-r ${role.color} text-white`}>
                  {role.icon}
                </div>
                <div className="flex-1 text-left">
                  <h3 className="text-lg font-semibold text-white mb-1">{role.title}</h3>
                  <p className="text-gray-400 text-sm mb-3">{role.description}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {role.features.map((feature, index) => (
                      <div key={index} className="flex items-center text-xs text-gray-500">
                        <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {selectedRole === role.id && (
                <div className="absolute top-4 right-4">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </div>
              )}
            </button>
          ))}
        </div>

        <div className="flex justify-center">
          <Button
            onClick={handleComplete}
            disabled={!selectedRole || isLoading}
            className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Setting up...
              </>
            ) : (
              <>
                Complete Setup
                <CheckCircle className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
} 