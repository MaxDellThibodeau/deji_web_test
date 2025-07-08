"use client"

import { type ReactNode, useState, useTransition, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import Image from "next/image"
import {
  Home,
  Music,
  Calendar,
  User,
  Settings,
  Headphones,
  Award,
  PlusCircle,
  Menu,
  X,
  LogOut,
  Users,
  Info,
  Ticket,
  LinkIcon,
} from "lucide-react"
import { cn } from "@/shared/utils/utils"
import { Button } from "@/shared/components/ui/button"
import { LogoutConfirmationDialog } from "@/features/auth/components/logout-confirmation-dialog"
import { useUser } from "@/hooks/use-user"
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { checkAuthClient } from "@/shared/utils/auth-utils"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Music Preferences", href: "/music-preferences", icon: Music },
  { name: "Events", href: "/events", icon: Calendar },
  { name: "Create Event", href: "/create-event", icon: PlusCircle },
  { name: "Token Bidding", href: "/token-bidding", icon: LinkIcon },
  { name: "My Tickets", href: "/tickets", icon: Ticket },
  { name: "DJ Sets", href: "/dj-sets", icon: Headphones },
  { name: "Rewards", href: "/rewards", icon: Award },
  { name: "Profile", href: "/profile", icon: User },
  { name: "Settings", href: "/settings", icon: Settings },
]

// Public navigation items
const publicNavigation = [
  { name: "Explore Events", href: "/events", icon: Calendar },
  { name: "Find DJs", href: "/djs", icon: Users },
  { name: "About", href: "/about", icon: Info },
]

export function MainSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, loading, logout } = useUser()
  const [mounted, setMounted] = useState(false)

  // This ensures we only render user data on the client side
  useEffect(() => {
    setMounted(true)
    console.log("Sidebar mounted, user:", user?.name || "Not logged in")
  }, [user])

  const handleNavClick = (name: string, href: string) => {
    console.log(`Navigation clicked: ${name}`)
    // We don't need to navigate here as the Link component handles that
  }

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  return (
    <div className="flex flex-col h-full bg-black border-r border-zinc-800/50 w-[240px]">
      {/* Logo */}
      <div className="p-4">
        <Link
          href="/dashboard"
          className="flex items-center space-x-2"
          onClick={() => console.log("Logo clicked: Navigate to Home")}
        >
          <Image src="/logo.svg" alt="DJ AI" width={32} height={32} className="rounded-full" />
          <span className="text-xl font-bold">DJ AI</span>
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-2">
        <nav className="px-2 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md",
                  isActive ? "bg-purple-900/50 text-purple-200" : "text-zinc-400 hover:bg-zinc-800 hover:text-white",
                )}
                onClick={() => handleNavClick(item.name, item.href)}
              >
                <item.icon className="mr-3 h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* User profile */}
      <div className="border-t border-zinc-800 p-4">
        {!mounted || loading ? (
          <div className="flex items-center">
            <Skeleton className="h-5 w-5 rounded-full mr-3" />
            <div>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16 mt-1" />
            </div>
          </div>
        ) : (
          <div className="flex items-center">
            <Avatar className="h-6 w-6 mr-3">
              <AvatarImage src={user?.profileImage || "/placeholder.svg"} alt={user?.name || "User"} />
              <AvatarFallback className="text-xs bg-purple-700">
                {user?.name
                  ? user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .substring(0, 2)
                  : "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{user?.name || "Guest"}</p>
              <p className="text-xs text-zinc-400">{user?.role || "Not logged in"}</p>
            </div>
          </div>
        )}
      </div>

      {/* Exit Dashboard button */}
      <div className="px-4 pb-2">
        <Link href="/landing">
          <Button
            variant="outline"
            className="w-full bg-zinc-800/30 border-zinc-700/50 hover:bg-zinc-800 hover:border-zinc-700 flex items-center justify-start"
            onClick={() => console.log("Button clicked: Exit Dashboard")}
          >
            <LogOut className="mr-3 h-5 w-5" />
            <span>Exit Dashboard</span>
          </Button>
        </Link>
      </div>

      {/* Logout button */}
      <div className="px-4 pb-4">
        <LogoutConfirmationDialog
          currentPath={pathname}
          className="bg-zinc-800/30 border-zinc-700/50 w-full"
          fullWidth
        />
      </div>
    </div>
  )
}

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const { user, loading } = useUser()
  const [mounted, setMounted] = useState(false)

  // This ensures we only render user data on the client side
  useEffect(() => {
    setMounted(true)
    console.log("Mobile nav mounted, user:", user?.name || "Not logged in")
  }, [user])

  // Add a logout button to the mobile navigation
  const isLoggedIn = !!user // Check if user exists

  const handleNavClick = (name: string, href: string) => {
    console.log(`Mobile navigation clicked: ${name}`)
    setOpen(false)
    // We don't need to navigate here as the Link component handles that
  }

  return (
    <div className="md:hidden">
      <div className="flex items-center justify-between p-4 border-b border-zinc-800/50">
        <Link
          href="/landing"
          className="flex items-center space-x-2"
          onClick={() => console.log("Mobile logo clicked: Navigate to Home")}
        >
          <div className="relative h-8 w-8 overflow-hidden rounded-full bg-gradient-to-br from-purple-600 to-blue-400">
            <Headphones className="absolute inset-0 h-full w-full p-1 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            DJ AI
          </span>
        </Link>
        <div className="flex items-center space-x-2">
          {isLoggedIn && (
            <LogoutConfirmationDialog 
              currentPath={pathname} 
              className="text-zinc-400"
            />
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              console.log(`Mobile menu ${open ? "closed" : "opened"}`)
              setOpen(!open)
            }}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 top-[73px] z-50 bg-background">
          <nav className="flex flex-col p-4 space-y-2">
            {/* User profile at the top of mobile menu */}
            {mounted && !loading && user && (
              <div className="flex items-center p-3 mb-2 bg-zinc-800/30 rounded-md">
                <Avatar className="h-8 w-8 mr-3">
                  <AvatarImage src={user?.profileImage || "/placeholder.svg"} alt={user?.name || "User"} />
                  <AvatarFallback className="text-xs bg-purple-700">
                    {user?.name
                      ? user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .substring(0, 2)
                      : "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{user?.name || "Guest"}</p>
                  <p className="text-xs text-zinc-400">{user?.role || "Not logged in"}</p>
                </div>
              </div>
            )}

            {/* Exit Dashboard button at the top */}
            <Link
              href="/landing"
              className="flex items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium bg-zinc-800/50 border border-zinc-700/50"
              onClick={() => handleNavClick("Exit Dashboard", "/landing")}
            >
              <LogOut className="h-5 w-5" />
              <span>Exit Dashboard</span>
            </Link>

            {/* App navigation for logged-in users */}
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium",
                  pathname === item.href ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                )}
                onClick={() => handleNavClick(item.name, item.href)}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            ))}

            {/* Divider */}
            <div className="border-t border-zinc-800/50 my-2 pt-2">
              <p className="text-xs text-zinc-500 px-3 mb-2">Public Pages</p>
            </div>

            {/* Public navigation */}
            {publicNavigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium",
                  pathname === item.href ? "bg-purple-900/30 text-purple-400" : "hover:bg-muted",
                )}
                onClick={() => handleNavClick(item.name, item.href)}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>
        </div>
      )}
    </div>
  )
}

export function AppLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useUser()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  // Check authentication status on client side
  useEffect(() => {
    setMounted(true)
    const checkAuth = async () => {
      const isAuth = await checkAuthClient()
      setIsAuthenticated(isAuth)

      // If not authenticated and on a protected route, redirect to login
      if (
        !isAuth &&
        !pathname.startsWith("/login") &&
        !pathname.startsWith("/signup") &&
        !pathname.startsWith("/landing")
      ) {
        console.log("Not authenticated, redirecting to login")
        router.push(`/login?redirectTo=${encodeURIComponent(pathname)}`)
      }
    }

    checkAuth()
  }, [pathname, router])

  // Show loading state or public layout if not authenticated
  if (!mounted || loading) {
    return (
      <div className="flex min-h-screen bg-black text-white">
        <div className="flex flex-col flex-1 items-center justify-center">
          <div className="animate-pulse">
            <div className="h-12 w-12 rounded-full bg-purple-600/30 mb-4"></div>
            <div className="h-4 w-32 bg-zinc-700/50 rounded mb-2"></div>
            <div className="h-3 w-24 bg-zinc-700/30 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  // If not authenticated, don't show the dashboard layout
  if (!isAuthenticated) {
    return <div className="min-h-screen bg-black text-white">{children}</div>
  }

  // Show dashboard layout for authenticated users
  return (
    <div className="flex min-h-screen bg-black text-white">
      <div className="hidden md:block">
        <MainSidebar />
      </div>
      <div className="flex flex-col flex-1">
        <MobileNav />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}

// Different dashboard paths based on role
const getRoleDashboardPath = () => {
  switch (userRole) {
    case "dj": return "/dj-portal/dashboard"
    case "venue": return "/venue-portal/dashboard" 
    case "admin": return "/admin-portal/dashboard"
    case "attendee": return "/attendee-portal/dashboard"
    default: return "/dashboard"
  }
}
