import { ReactNode } from "react"
import { PublicHeader } from "./public-header"

interface PublicLayoutProps {
  children: ReactNode
}

export function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="min-h-screen bg-black text-white">
      <PublicHeader />
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
} 