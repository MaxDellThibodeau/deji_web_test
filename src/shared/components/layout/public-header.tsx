"use client"

import { useState, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import { Headphones, Menu, X, User, LogOut, Home, LayoutDashboard } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { LogoutConfirmationDialog } from "@/features/auth/components/logout-confirmation-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu"
import { useAuthStore } from "@/features/auth/stores/auth-store"

export function PublicHeader() {
  console.log("🔍 PublicHeader: Component is rendering")
  
  const location = useLocation()
  const pathname = location.pathname
  
  // Safely get auth state with fallbacks
  let user = null
  let isLoggedIn = false
  let isLoading = true
  
  try {
    const authState = useAuthStore()
    user = authState.user
    isLoggedIn = authState.isAuthenticated
    isLoading = authState.isLoading
    console.log("🔍 PublicHeader: Auth state -", { isLoggedIn, user: user?.email, isLoading })
  } catch (error) {
    console.error("🔍 PublicHeader: Error getting auth state:", error)
    isLoading = false // Don't show loading if there's an error
  }
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showLoadingTimeout, setShowLoadingTimeout] = useState(true)

  // Don't show loading state for too long
  useEffect(() => {
    const timeout = setTimeout(() => {
      setShowLoadingTimeout(false)
      console.log("🔍 PublicHeader: Loading timeout, showing login buttons")
    }, 2000) // Show login buttons after 2 seconds max

    return () => clearTimeout(timeout)
  }, [])

  // Function to get the correct dashboard path based on user role
  const getRoleDashboardPath = () => {
    if (user && user.role) {
      switch (user.role) {
        case "dj":
          return "/dj-portal/dashboard"
        case "venue":
          return "/venue-portal/dashboard"
        case "admin" as any:
          return "/admin-portal/dashboard"
        case "attendee":
          return "/attendee-portal/dashboard"
        default:
          return "/dashboard"
      }
    }
    return "/dashboard"
  }

  console.log("🔍 PublicHeader: About to render, isLoading:", isLoading, "showLoadingTimeout:", showLoadingTimeout)

  // Determine if we should show loading state
  const shouldShowLoading = isLoading && showLoadingTimeout

  // Always render the header, even during loading
  return (
    <header className="border-b border-zinc-800/50 backdrop-blur-sm bg-black/50 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <div className="relative h-8 w-8 overflow-hidden rounded-full bg-gradient-to-br from-purple-600 to-blue-400">
            <Headphones className="absolute inset-0 h-full w-full p-1 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            DJEI
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link
            to="/landing"
            className={`text-sm font-medium transition-colors ${
              pathname === "/landing" || pathname === "/" ? "text-white" : "text-gray-300 hover:text-white"
            }`}
          >
            Home
          </Link>
          <Link
            to="/events"
            className={`text-sm font-medium transition-colors ${
              pathname === "/events" ? "text-white" : "text-gray-300 hover:text-white"
            }`}
          >
            Explore Events
          </Link>
          <Link
            to="/djs"
            className={`text-sm font-medium transition-colors ${
              pathname?.startsWith("/djs") ? "text-white" : "text-gray-300 hover:text-white"
            }`}
          >
            Find DJs
          </Link>
          <Link
            to="/about"
            className={`text-sm font-medium transition-colors ${
              pathname === "/about" ? "text-white" : "text-gray-300 hover:text-white"
            }`}
          >
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

          {/* Show loading state or auth buttons */}
          {shouldShowLoading ? (
            <div className="hidden md:flex items-center space-x-3">
              <div className="w-16 h-8 bg-gray-700 animate-pulse rounded"></div>
              <div className="w-20 h-8 bg-gray-700 animate-pulse rounded"></div>
            </div>
          ) : isLoggedIn ? (
            <div className="hidden md:flex items-center space-x-2">
              <Link to={getRoleDashboardPath()}>
                <Button variant="outline" className="bg-zinc-800/70 hover:bg-zinc-700 text-white border-zinc-700">
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>

              {user && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.avatar_url || ""} alt={user?.name || "User avatar"} />
                        <AvatarFallback>{user?.name?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.name || "User"}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user.email || ""}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/profile">Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to={getRoleDashboardPath()}>Dashboard</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <LogoutConfirmationDialog
                      currentPath={pathname || ""}
                      className="w-full bg-zinc-800/70 hover:bg-zinc-700 text-white border-zinc-700"
                      asDropdownItem={true}
                    />
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          ) : (
            <div className="hidden md:flex items-center space-x-3">
              <Link to={`/login?redirectTo=${pathname || ""}`}>
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 px-6 py-2 rounded-full">
                  Login
                </Button>
              </Link>
              <Link to={`/signup?redirectTo=${pathname || ""}`}>
                <Button variant="outline" className="bg-white text-black hover:bg-gray-100 border-0 px-6 py-2 rounded-full">
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
              to="/landing"
              className={`text-sm font-medium py-2 px-3 rounded-md ${
                pathname === "/landing" || pathname === "/" ? "bg-purple-900/30 text-purple-400" : "text-white hover:bg-zinc-800/50"
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <Home className="inline-block mr-2 h-4 w-4" />
              Home
            </Link>
            <Link
              to="/events"
              className={`text-sm font-medium py-2 px-3 rounded-md ${
                pathname === "/events" ? "bg-purple-900/30 text-purple-400" : "text-white hover:bg-zinc-800/50"
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Explore Events
            </Link>
            <Link
              to="/djs"
              className={`text-sm font-medium py-2 px-3 rounded-md ${
                pathname?.startsWith("/djs") ? "bg-purple-900/30 text-purple-400" : "text-white hover:bg-zinc-800/50"
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Find DJs
            </Link>
            <Link
              to="/about"
              className={`text-sm font-medium py-2 px-3 rounded-md ${
                pathname === "/about" ? "bg-purple-900/30 text-purple-400" : "text-white hover:bg-zinc-800/50"
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </Link>

            <div className="pt-2 border-t border-zinc-800/50">
              {isLoggedIn ? (
                <div className="flex flex-col space-y-3">
                  <Link to={getRoleDashboardPath()} onClick={() => setMobileMenuOpen(false)}>
                    <Button
                      variant="outline"
                      className="w-full bg-zinc-800/70 hover:bg-zinc-700 text-white border-zinc-700"
                    >
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      Dashboard
                    </Button>
                  </Link>

                  <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>
                    <Button
                      variant="outline"
                      className="w-full bg-zinc-800/70 hover:bg-zinc-700 text-white border-zinc-700"
                    >
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </Button>
                  </Link>

                  <LogoutConfirmationDialog
                    currentPath={pathname || ""}
                    className="w-full bg-zinc-800/70 hover:bg-zinc-700 text-white border-zinc-700"
                    fullWidth={true}
                  />
                </div>
              ) : (
                <div className="flex flex-col space-y-3">
                  <Link
                    to={`/login?redirectTo=${pathname || ""}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 px-6 py-2">
                      Login
                    </Button>
                  </Link>
                  <Link
                    to={`/signup?redirectTo=${pathname || ""}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Button variant="outline" className="w-full bg-white text-black hover:bg-gray-100 border-0 px-6 py-2">
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
  )
}
