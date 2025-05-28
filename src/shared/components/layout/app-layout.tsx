"use client"

import { type ReactNode, useState, useEffect } from "react"
import { PublicHeader } from "@/shared/components/layout/public-header"
import { usePathname } from "next/navigation"
import { checkAuthClient, getUserFromCookies } from "@/shared/utils/auth-utils"

export function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [user, setUser] = useState(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // One-time check on mount
    const isAuthenticated = checkAuthClient()
    setIsLoggedIn(isAuthenticated)

    if (isAuthenticated) {
      const cookieUser = getUserFromCookies()
      if (cookieUser) {
        setUser(cookieUser)
      }
    }

    setIsLoading(false)

    // Listen for auth state changes - only set up once
    const handleAuthChange = () => {
      const isAuthenticated = checkAuthClient()
      setIsLoggedIn(isAuthenticated)

      if (isAuthenticated) {
        const cookieUser = getUserFromCookies()
        if (cookieUser) {
          setUser(cookieUser)
        }
      } else {
        setUser(null)
      }
    }

    window.addEventListener("auth-state-change", handleAuthChange)
    return () => {
      window.removeEventListener("auth-state-change", handleAuthChange)
    }
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <PublicHeader currentPath={pathname} user={user} isLoggedIn={isLoggedIn} isLoading={isLoading} />
      <main className="flex-1">{children}</main>
    </div>
  )
}
