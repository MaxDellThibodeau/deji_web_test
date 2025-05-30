"use client"

import type { ReactNode } from "react"
import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/features/auth/hooks/use-auth"
import Link from "next/link"
import { Bell, Search, LogOut, Home, ArrowRight, Star } from "lucide-react"
import { Button } from "@/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/avatar"
import { Suspense } from "react"
import { getCurrentSubscription } from "@/features/payments/actions/subscription-actions"

interface DJPortalLayoutProps {
  children: ReactNode
}

export default function DJPortalLayout({ children }: DJPortalLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isAuthenticated, isLoading, logout } = useAuth()

  useEffect(() => {
    // Redirect if not authenticated or not a DJ
    if (!isLoading && (!isAuthenticated || user?.role !== "dj")) {
      router.push("/login?redirectTo=/dj-portal/dashboard")
    }
  }, [isAuthenticated, isLoading, router, user?.role])

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!isAuthenticated || user?.role !== "dj") {
    return null
  }

  return (
    <div className="min-h-screen bg-black">
      <header className="border-b border-zinc-800">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dj-portal/dashboard">
                <Button variant="ghost" className="text-white hover:text-purple-400">
                  <Home className="h-5 w-5" />
                </Button>
              </Link>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <input
                  type="search"
                  placeholder="Search events..."
                  className="h-10 w-64 rounded-full bg-zinc-900 pl-10 pr-4 text-sm text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" className="relative text-white hover:text-purple-400">
                <Bell className="h-5 w-5" />
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-purple-500 text-xs">
                  3
                </span>
              </Button>
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar_url || ""} alt={user.name || "DJ"} />
                  <AvatarFallback>{user.name?.[0]?.toUpperCase() || "DJ"}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-white">{user.name}</span>
              </div>
              <Button variant="ghost" onClick={logout} className="text-white hover:text-purple-400">
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>
      <div className="container mx-auto px-4 py-8">
        <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
      </div>
    </div>
  )
}
