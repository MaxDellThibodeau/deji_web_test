"use client"

import type { ReactNode } from "react"
import { useEffect, useRef, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/features/auth/hooks/auth-context"
import Link from "next/link"
import { Bell, Search, LogOut, Home, ArrowRight, Star } from "lucide-react"
import { Button } from "@/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/avatar"
import { Suspense } from "react"
import { getCurrentSubscription } from "@/features/payments/actions/subscription-actions"

interface DJPortalLayoutProps {
  children: ReactNode
}

export default function DjPortalLayout({ children }: DJPortalLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isLoading, isAuthenticated } = useAuth?.() || {}
  const authChecked = useRef(false)
  const [subscription, setSubscription] = useState<any>(null)
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(true)

  // Get the current subscription to show upgrade banner if needed
  useEffect(() => {
    async function fetchSubscription() {
      try {
        const { subscription } = await getCurrentSubscription()
        setSubscription(subscription)
      } catch (error) {
        console.error("Error fetching subscription:", error)
      } finally {
        setIsLoadingSubscription(false)
      }
    }

    fetchSubscription()
  }, [])

  // Only show upgrade banner for Basic plan or no subscription
  const showUpgradeBanner = !isLoadingSubscription && (!subscription || subscription?.plan_id === 1)

  // Auth check
  useEffect(() => {
    // Only run auth check once
    if (!isLoading && !authChecked.current) {
      authChecked.current = true

      if (!isAuthenticated) {
        router.push(`/login?redirectTo=${pathname || "/dj-portal/dashboard"}`)
        return
      }

      if (user?.role !== "dj") {
        router.push("/dashboard")
        return
      }
    }
  }, [isLoading, isAuthenticated, user, router, pathname])

  // Get page title based on pathname
  const getPageTitle = () => {
    if (pathname?.includes("/schedule")) return "Schedule"
    if (pathname?.includes("/library")) return "Music Library"
    if (pathname?.includes("/earnings")) return "Earnings"
    if (pathname?.includes("/profile")) return "Profile"
    if (pathname?.includes("/settings")) return "Settings"
    if (pathname?.includes("/analytics")) return "Analytics"
    if (pathname?.includes("/subscription")) return "Subscription"
    return "DJ Dashboard"
  }

  const handleBackNavigation = () => {
    // If we're on a subpage, go back to dashboard
    if (pathname && pathname !== "/dj-portal/dashboard" && pathname.startsWith("/dj-portal/")) {
      router.push("/dj-portal/dashboard")
    } else {
      // If on dashboard, go to home
      router.push("/")
    }
  }

  const handleLogout = () => {
    // Clear cookies
    document.cookie = "session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    document.cookie = "user_id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    document.cookie = "user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    router.push("/login")
  }

  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      {showUpgradeBanner && (
        <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 py-3 px-4">
          <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between">
            <div className="flex items-center mb-3 sm:mb-0">
              <Star className="h-5 w-5 text-yellow-400 mr-2" />
              <span className="text-sm">
                {subscription
                  ? "Upgrade to Pro or Premium for advanced features"
                  : "Subscribe to unlock premium DJ features"}
              </span>
            </div>
            <Button asChild size="sm" className="w-full sm:w-auto">
              <Link href="/dj-portal/subscription/plans">
                {subscription ? "Upgrade Now" : "View Plans"} <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      )}

      {/* Single unified header */}
      <Suspense fallback={<div>Loading...</div>}>
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-800 bg-gray-900 px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBackNavigation}
              className="text-gray-400 hover:text-white"
              aria-label="Go back"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              asChild
              className="text-gray-400 hover:text-white"
              aria-label="Go to home"
            >
              <Link href="/">
                <Home className="h-5 w-5" />
              </Link>
            </Button>

            <h1 className="text-xl font-semibold text-white">{getPageTitle()}</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="h-9 w-64 rounded-full bg-gray-800 pl-10 pr-4 text-sm text-white placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>

            <Button variant="ghost" size="icon" className="relative text-gray-400 hover:text-white">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-purple-500"></span>
            </Button>

            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src="/diverse-avatars.png" alt={user?.name || "DJ"} />
                <AvatarFallback>{(user?.name || "DJ").charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-white">{user?.name || "DJ Pulse"}</p>
                <p className="text-xs text-gray-400">{user?.email || "dj@example.com"}</p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="text-gray-400 hover:text-white"
              aria-label="Logout"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </header>
      </Suspense>

      {/* Simplified breadcrumb navigation */}
      <nav className="flex items-center border-b border-gray-800 bg-gray-900/50 px-4 py-2 text-sm text-gray-400">
        <Link href="/" className="flex items-center hover:text-white">
          <Home className="mr-1 h-4 w-4" />
          <span>Home</span>
        </Link>
        <span className="mx-2">›</span>
        {pathname !== "/dj-portal/dashboard" && pathname?.startsWith("/dj-portal/") ? (
          <>
            <Link href="/dj-portal/dashboard" className="hover:text-white">
              Dashboard
            </Link>
            <span className="mx-2">›</span>
            <span className="text-white">{getPageTitle()}</span>
          </>
        ) : (
          <span className="text-white">Dashboard</span>
        )}
      </nav>

      {/* Main content */}
      <main className="flex-1">{children}</main>
    </div>
  )
}
