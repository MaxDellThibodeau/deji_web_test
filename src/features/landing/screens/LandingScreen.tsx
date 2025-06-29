import { useAuth } from "@/features/auth/hooks/use-auth"
import { useNavigate } from "react-router-dom"
import { Button } from "@/shared/components/ui/button"

export function LandingScreen() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const handleCreateEvent = () => {
    if (isAuthenticated) {
      // Redirect to create event page (you can update this route as needed)
      navigate("/events/create")
    } else {
      // Redirect to login with redirect back to create event
      navigate("/login?redirectTo=/events/create")
    }
  }

  const handleExploreEvents = () => {
    navigate("/events")
  }

  return (
    <div className="relative min-h-screen flex flex-col">
        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="text-center max-w-6xl mx-auto">
            {/* Main Heading */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
              The future of{" "}
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-600 bg-clip-text text-transparent">
                social
              </span>
              <br />
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-600 bg-clip-text text-transparent">
                experiences
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              Join thousands of music lovers, DJs, and venues in the most advanced AI-powered
              <br className="hidden md:block" />
              music event platform.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Button
                onClick={handleCreateEvent}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 text-lg font-semibold rounded-lg border-0 min-w-[200px]"
                size="lg"
              >
                Create Event
              </Button>
              <Button
                onClick={handleExploreEvents}
                variant="outline"
                className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-black px-8 py-4 text-lg font-semibold rounded-lg min-w-[200px]"
                size="lg"
              >
                Explore Events
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Stats Section */}
        <div className="pb-8 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-center gap-6">
              {/* User Avatars */}
              <div className="flex -space-x-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 border-2 border-black flex items-center justify-center text-white font-semibold text-sm">
                  DJ
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 border-2 border-black flex items-center justify-center text-white font-semibold text-sm">
                  MU
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-blue-500 border-2 border-black flex items-center justify-center text-white font-semibold text-sm">
                  VE
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 border-2 border-black flex items-center justify-center text-white font-semibold text-sm">
                  FN
                </div>
              </div>

              {/* Stats Text */}
              <div className="text-center">
                <span className="text-2xl md:text-3xl font-bold">4 million+</span>
                <span className="text-gray-400 ml-2">users on the platform</span>
              </div>
            </div>
          </div>
        </div>
      </div>
  )
}
