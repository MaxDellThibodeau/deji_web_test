import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/shared/components/common/theme-provider"
import { Toaster } from "@/ui/toaster"
// import { AuthProvider } from "@/features/auth/hooks/auth-context"
import { AuthProvider } from '@/src/features/auth'

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "DJ AI Platform",
  description: "AI-powered platform for DJs and music enthusiasts",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
