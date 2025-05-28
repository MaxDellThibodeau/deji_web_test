import type { ReactNode } from "react"

export function SimpleLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-black text-white">{children}</div>
}
