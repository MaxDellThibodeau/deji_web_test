import { createClientClient } from "@/shared/services/client"
import type { User, UserRole } from '../types/user'

export class AuthService {
  static client = createClientClient()

  // Dummy accounts for demo
  static dummyAccounts = [
    { id: "1", name: "Alex", email: "alex@example.com", password: "password123", role: "attendee" },
    { id: "2", name: "DJ Pulse", email: "dj@example.com", password: "password123", role: "dj" },
    { id: "3", name: "Venue Manager", email: "venue@example.com", password: "password123", role: "venue" },
    { id: "4", name: "Admin User", email: "admin@example.com", password: "password123", role: "admin" },
  ]

  static findUserByEmail(email: string) {
    return this.dummyAccounts.find((account) => account.email === email)
  }

  static async login(email: string, password: string, redirectTo?: string) {
    try {
      const user = this.findUserByEmail(email)

      if (!user || user.password !== password) {
        return { success: false, error: "Invalid email or password" }
      }

      // Set session cookies with user info
      document.cookie = `session=mock-session; path=/; max-age=86400`
      document.cookie = `user_id=${user.id}; path=/; max-age=86400`
      document.cookie = `user_role=${user.role}; path=/; max-age=86400`
      document.cookie = `user_name=${user.name}; path=/; max-age=86400`
      document.cookie = `user_email=${user.email}; path=/; max-age=86400`
      document.cookie = `token_balance=10; path=/; max-age=86400`

      // Determine redirect path based on role
      const dashboardPath = this.getDashboardPath(user.role)
      const finalRedirect = redirectTo || dashboardPath

      return { success: true, redirectTo: finalRedirect }
    } catch (error) {
      console.error("Login error:", error)
      return { success: false, error: "An unexpected error occurred" }
    }
  }

  static async logout() {
    // Clear all cookies
    document.cookie = "session=; path=/; max-age=0"
    document.cookie = "user_id=; path=/; max-age=0"
    document.cookie = "user_role=; path=/; max-age=0"
    document.cookie = "user_name=; path=/; max-age=0"
    document.cookie = "user_email=; path=/; max-age=0"
    document.cookie = "token_balance=; path=/; max-age=0"
  }

  static getUserFromCookies(): User | null {
    if (typeof document === "undefined") return null

    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`
      const parts = value.split(`; ${name}=`)
      if (parts.length === 2) return parts.pop()?.split(";").shift()
      return null
    }

    const userId = getCookie("user_id")
    const userName = getCookie("user_name")
    const userRole = getCookie("user_role") as UserRole | null
    const userEmail = getCookie("user_email")
    const tokenBalance = Number.parseInt(getCookie("token_balance") || "0", 10)

    if (!userId) return null

    return {
      id: userId,
      name: userName || "User",
      role: userRole || "attendee",
      email: userEmail || "",
      avatar_url: null,
      token_balance: tokenBalance,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  }

  private static getDashboardPath(role: string): string {
    const paths = {
      dj: "/dj-portal/dashboard",
      venue: "/venue-portal/dashboard", 
      admin: "/admin-portal/dashboard",
      attendee: "/attendee-portal/dashboard",
    }
    return paths[role as keyof typeof paths] || "/dashboard"
  }
}