import type { ReactNode } from "react"

export default function TicketsLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen flex flex-col bg-black text-white">{children}</div>
}
