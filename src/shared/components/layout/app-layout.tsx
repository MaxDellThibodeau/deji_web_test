"use client"

import { type ReactNode } from "react"
import { PublicHeader } from "@/shared/components/layout/public-header"
import { usePathname } from "next/navigation"
import { useAuth } from "@/features/auth/hooks/use-auth"

export function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const { user, isAuthenticated: isLoggedIn, isLoading } = useAuth()

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <PublicHeader />
      <main className="flex-1">{children}</main>
    </div>
  )
}
