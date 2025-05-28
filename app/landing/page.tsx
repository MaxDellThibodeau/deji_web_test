"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Headphones, User, LayoutDashboard, Menu, X, Music } from "lucide-react"
import { Button } from "@/ui/button"
import { LogoutConfirmationDialog } from "@/features/auth/components/logout-confirmation-dialog"

export default function LandingPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [userName, setUserName] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()

  // Check if user is logged in
  useEffect(() => {
    // Function to check login status
    const checkLoginStatus = () => {
      try {
        const hasSession = document.cookie.includes("session=") || document.cookie.includes("supabase-auth-token=")

        // Get user role from cookie
        const getCookie = (name: string) => {
          const value = `; ${document.cookie}`
          const parts = value.split(`; ${name}=`)
          if (parts.length === 2) return parts.pop()?.split(";").shift()
          return null
        }

        const role = getCookie("user_role")
        const name = getCookie("user_name")

        setIsLoggedIn(hasSession)
        setUserRole(role)
        setUserName(name)

        console.log("Landing page - Login status checked:", hasSession, "Role:", role)
      } catch (error) {
        console.error("Error checking login status:", error)
        setIsLoggedIn(false)
      }
    }

    // Check initially with a slight delay to ensure cookies are properly set/cleared
    setTimeout(() => {
      checkLoginStatus()
      setIsLoading(false)
    }, 100)

    // Set up an event listener for cookie changes
    const handleStorageChange = () => {
      checkLoginStatus()
    }

    // Listen for storage events (cookies are part of storage)
    window.addEventListener("storage", handleStorageChange)

    // Create a custom event we can dispatch when cookies change
    document.addEventListener("cookieChange", handleStorageChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      document.removeEventListener("cookieChange", handleStorageChange)
    }
  }, [])

  // Function to get the correct dashboard path based on user role
  const getRoleDashboardPath = () => {
    switch (userRole) {
      case "dj":
        return "/dj-portal/dashboard"
      case "venue":
        return "/venue-portal/dashboard"
      case "admin":
        return "/admin-portal/dashboard"
      case "attendee":
        return "/attendee-portal/dashboard"
      default:
        return "/dashboard" // Fallback to the general dashboard
    }
  }

  // If still loading, show a minimal loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Navigation */}
      <header className="border-b border-zinc-800/50 backdrop-blur-sm bg-black/50 fixed w-full z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="relative h-8 w-8 overflow-hidden rounded-full bg-gradient-to-br from-purple-600 to-blue-400">
              <Headphones className="absolute inset-0 h-full w-full p-1 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              DJ AI
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/events" className="text-sm font-medium hover:text-purple-400 transition-colors">
              Explore Events
            </Link>
            <Link href="/djs" className="text-sm font-medium hover:text-purple-400 transition-colors">
              Find DJs
            </Link>
            <Link href="/about" className="text-sm font-medium hover:text-purple-400 transition-colors">
              About
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

            {isLoggedIn ? (
              <div className="hidden md:flex items-center space-x-2">
                <Link href={getRoleDashboardPath()}>
                  <Button variant="outline" className="bg-zinc-800/70 hover:bg-zinc-700 text-white border-zinc-700">
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
                <LogoutConfirmationDialog currentPath="/landing" className="bg-zinc-800 hover:bg-zinc-700 text-white" />
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Link href="/login?redirectTo=/landing">
                  <Button className="create-event-btn">Login</Button>
                </Link>
                <Link href="/signup?redirectTo=/landing">
                  <Button variant="outline" className="bg-white text-black hover:bg-gray-100">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-black/95 backdrop-blur-sm border-b border-zinc-800/50">
            <nav className="container mx-auto px-4 py-4 flex flex-col space-y-4">
              <Link
                href="/events"
                className="text-sm font-medium py-2 px-3 rounded-md hover:bg-zinc-800/50"
                onClick={() => setMobileMenuOpen(false)}
              >
                Explore Events
              </Link>
              <Link
                href="/djs"
                className="text-sm font-medium py-2 px-3 rounded-md hover:bg-zinc-800/50"
                onClick={() => setMobileMenuOpen(false)}
              >
                Find DJs
              </Link>
              <Link
                href="/about"
                className="text-sm font-medium py-2 px-3 rounded-md hover:bg-zinc-800/50"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>

              <div className="pt-2 border-t border-zinc-800/50">
                {isLoggedIn ? (
                  <div className="flex flex-col space-y-3">
                    <Link href={getRoleDashboardPath()} onClick={() => setMobileMenuOpen(false)}>
                      <Button
                        variant="outline"
                        className="w-full bg-zinc-800/70 hover:bg-zinc-700 text-white border-zinc-700"
                      >
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                        Dashboard
                      </Button>
                    </Link>
                    <LogoutConfirmationDialog
                      currentPath="/landing"
                      className="w-full bg-zinc-800 hover:bg-zinc-700 text-white"
                      fullWidth={true}
                    />
                  </div>
                ) : (
                  <div className="flex flex-col space-y-3">
                    <Link href="/login?redirectTo=/landing" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full create-event-btn">Login</Button>
                    </Link>
                    <Link href="/signup?redirectTo=/landing" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full bg-white text-black hover:bg-gray-100 border-0">
                        Sign Up
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <main className="flex-1 pt-24">
        <section className="container mx-auto px-4 py-20 md:py-32 text-center">
          {isLoggedIn && (
            <div className="mb-8 inline-flex items-center bg-purple-900/30 px-4 py-2 rounded-full border border-purple-500/30">
              <User className="h-4 w-4 mr-2 text-purple-400" />
              <span className="text-sm text-purple-300">Welcome back, {userName || "DJ"}!</span>
            </div>
          )}

          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            The future of <span className="social-gradient">social</span>
            <br />
            <span className="experiences-gradient">experiences</span>
          </h1>

          <p className="text-lg md:text-xl text-zinc-400 max-w-3xl mx-auto mb-12">
            Join thousands of music lovers, DJs, and venues in the most advanced AI-powered music event platform.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {isLoggedIn ? (
              <>
                {userRole === "dj" && (
                  <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                    <Link href={getRoleDashboardPath()}>
                      <Button className="w-full sm:w-auto create-event-btn text-lg py-6 px-8">
                        <LayoutDashboard className="h-5 w-5 mr-2" />
                        DJ Dashboard
                      </Button>
                    </Link>
                    <Link href="/events">
                      <Button
                        variant="outline"
                        className="w-full sm:w-auto bg-zinc-800/70 hover:bg-zinc-700 text-white border-zinc-700 text-lg py-6 px-8"
                      >
                        <Music className="h-5 w-5 mr-2" />
                        My Events
                      </Button>
                    </Link>
                  </div>
                )}
                {userRole !== "dj" && (
                  <Link href={getRoleDashboardPath()}>
                    <Button className="w-full sm:w-auto create-event-btn text-lg py-6 px-8">
                      <LayoutDashboard className="h-5 w-5 mr-2" />
                      Go to Dashboard
                    </Button>
                  </Link>
                )}
              </>
            ) : (
              <Link href="/login?redirectTo=/create-event">
                <Button className="w-full sm:w-auto create-event-btn text-lg py-6 px-8">Create Event</Button>
              </Link>
            )}

            {(!isLoggedIn || userRole !== "dj") && (
              <Link href="/events">
                <Button
                  variant="outline"
                  className="bg-white text-black hover:bg-gray-100 w-full sm:w-auto text-lg py-6 px-8"
                >
                  Explore Events
                </Button>
              </Link>
            )}
          </div>

          <div className="mt-24 flex items-center justify-center">
            <div className="flex -space-x-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-10 h-10 rounded-full bg-zinc-700/50 border border-zinc-600/50"></div>
              ))}
            </div>
            <div className="ml-4">
              <span className="text-2xl font-bold">4 million+</span>{" "}
              <span className="text-zinc-400">users on the platform</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
