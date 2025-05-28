"use client"

import type { ReactNode } from "react"
import { AppLayout } from "@/shared/components/sidebar"

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <AppLayout>{children}</AppLayout>
}
