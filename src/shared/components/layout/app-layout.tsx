
import { type ReactNode } from "react"
import { PublicHeader } from "@/shared/components/layout/public-header"
import { useLocation } from "react-router-dom"
import { useAuth } from "@/features/auth/hooks/use-auth"

export function AppLayout({ children }: { children: ReactNode }) {
  const location = useLocation(); const pathname = location.pathname
  const { user, isAuthenticated: isLoggedIn, isLoading } = useAuth()

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <PublicHeader />
      <main className="flex-1">{children}</main>
    </div>
  )
}
