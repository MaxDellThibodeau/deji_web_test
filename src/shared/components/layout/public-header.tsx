"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Headphones, Menu, X, User, LogOut, Home, LayoutDashboard } from "lucide-react"
import { Button } from "@/ui/button"
import { LogoutConfirmationDialog } from "@/features/auth/components/logout-confirmation-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/ui/dropdown-menu"
import { useAuth } from "@/features/auth/hooks/use-auth"
import type { UserRole } from "@/features/auth/types"

export function PublicHeader() {
  const pathname = usePathname()
  const { user, isAuthenticated: isLoggedIn, isLoading } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  // Debug logging
  console.log("[PublicHeader] isLoggedIn:", isLoggedIn, "user:", user, "isLoading:", isLoading)

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
          return "/dashboard" // Fallback to the general dashboard
      }
    }
    return "/dashboard" // Fallback to the general dashboard
  }

  if (isLoading) {
    return <div className="h-16 border-b border-zinc-800/50 backdrop-blur-sm bg-black/50"></div>
  }

  return (
    <header className="border-b border-zinc-800/50 backdrop-blur-sm bg-black/50 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <div className="relative h-8 w-8 overflow-hidden rounded-full bg-gradient-to-br from-purple-600 to-blue-400">
            <Headphones className="absolute inset-0 h-full w-full p-1 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            DJ AI
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link
            href="/landing"
            className={`text-sm font-medium transition-colors ${
              pathname === "/landing" ? "text-purple-400" : "text-white hover:text-purple-400"
            }`}
          >
            Home
          </Link>
          <Link
            href="/events"
            className={`text-sm font-medium transition-colors ${
              pathname === "/events" ? "text-purple-400" : "text-white hover:text-purple-400"
            }`}
          >
            Explore Events
          </Link>
          <Link
            href="/djs"
            className={`text-sm font-medium transition-colors ${
              pathname?.startsWith("/djs") ? "text-purple-400" : "text-white hover:text-purple-400"
            }`}
          >
            Find DJs
          </Link>
          <Link
            href="/about"
            className={`text-sm font-medium transition-colors ${
              pathname === "/about" ? "text-purple-400" : "text-white hover:text-purple-400"
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

          {isLoggedIn ? (
            <div className="hidden md:flex items-center space-x-2">
              <Link href="/dj-portal/dashboard">
                <Button className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white border-0">
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  DJ Dashboard
                </Button>
              </Link>

              <Link href={getRoleDashboardPath()}>
                <Button variant="outline" className="bg-zinc-800/70 hover:bg-zinc-700 text-white border-zinc-700">
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>

              {/* Always show Logout button when logged in */}
              <div style={{ border: '2px solid yellow', padding: '2px' }}>
                <LogoutConfirmationDialog
                  currentPath={pathname || ""}
                  className="bg-zinc-800/70 hover:bg-zinc-700 text-white border-zinc-700"
                />
              </div>

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
                      <Link href="/profile">Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={getRoleDashboardPath()}>Dashboard</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/landing">Landing Page</Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          ) : (
            <div className="hidden md:flex items-center space-x-2">
              <Link href={`/login?redirectTo=${pathname || ""}`}>
                <Button className="create-event-btn">Login</Button>
              </Link>
              <Link href={`/signup?redirectTo=${pathname || ""}`}>
                <Button variant="outline" className="bg-white text-black hover:bg-gray-100 border-0">
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
              href="/landing"
              className={`text-sm font-medium py-2 px-3 rounded-md ${
                pathname === "/landing" ? "bg-purple-900/30 text-purple-400" : "text-white hover:bg-zinc-800/50"
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <Home className="inline-block mr-2 h-4 w-4" />
              Home
            </Link>
            <Link
              href="/events"
              className={`text-sm font-medium py-2 px-3 rounded-md ${
                pathname === "/events" ? "bg-purple-900/30 text-purple-400" : "text-white hover:bg-zinc-800/50"
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Explore Events
            </Link>
            <Link
              href="/djs"
              className={`text-sm font-medium py-2 px-3 rounded-md ${
                pathname?.startsWith("/djs") ? "bg-purple-900/30 text-purple-400" : "text-white hover:bg-zinc-800/50"
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Find DJs
            </Link>
            <Link
              href="/about"
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
                  <Link href="/dj-portal/dashboard" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white border-0">
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      DJ Dashboard
                    </Button>
                  </Link>

                  <Link href={getRoleDashboardPath()} onClick={() => setMobileMenuOpen(false)}>
                    <Button
                      variant="outline"
                      className="w-full bg-zinc-800/70 hover:bg-zinc-700 text-white border-zinc-700"
                    >
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      Dashboard
                    </Button>
                  </Link>

                  <Link href="/profile" onClick={() => setMobileMenuOpen(false)}>
                    <Button
                      variant="outline"
                      className="w-full bg-zinc-800/70 hover:bg-zinc-700 text-white border-zinc-700"
                    >
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </Button>
                  </Link>

                  {/* Always show Logout button in mobile menu when logged in */}
                  <LogoutConfirmationDialog
                    currentPath={pathname || ""}
                    className="w-full bg-zinc-800/70 hover:bg-zinc-700 text-white border-zinc-700"
                    fullWidth={true}
                  />
                </div>
              ) : (
                <div className="flex flex-col space-y-3">
                  <Link
                    href={`/login?redirectTo=${pathname || ""}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Button className="w-full create-event-btn">Login</Button>
                  </Link>
                  <Link
                    href={`/signup?redirectTo=${pathname || ""}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
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
  )
}
