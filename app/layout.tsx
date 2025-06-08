import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/shared/components/common/theme-provider"
import { AuthProvider } from "@/features/auth/hooks/auth-context"
import { Toaster } from "@/ui/toaster"
// Import to auto-clear legacy admin cookies
import "@/shared/utils/clear-legacy-cookies"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "DJ AI Platform",
  description: "AI-powered platform for DJs and music enthusiasts",
  generator: 'v0.dev'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <AuthProvider>
            {children}
          </AuthProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
