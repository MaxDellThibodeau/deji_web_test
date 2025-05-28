import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Store recent redirects to prevent loops
const recentRedirects = new Map<string, number>()
const REDIRECT_COOLDOWN = 2000 // 2 seconds

// Define role-based access paths
const ROLE_PATHS = {
  dj: "/dj-portal",
  venue: "/venue-portal",
  admin: "/admin-portal",
  attendee: "/attendee-portal",
}

// Define public paths that don't require authentication
const PUBLIC_PATHS = ["/", "/about", "/events", "/djs", "/landing"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for static assets and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".") ||
    pathname.startsWith("/public")
  ) {
    return NextResponse.next()
  }

  // Check for session cookies
  const hasSession =
    request.cookies.has("session") || request.cookies.has("user_id") || request.cookies.has("supabase-auth-token")

  // Get user role from cookies
  const userRole = (request.cookies.get("user_role")?.value as keyof typeof ROLE_PATHS) || "attendee"

  // Create a unique key for this request path
  const requestKey = `${pathname}-${hasSession ? "auth" : "noauth"}-${userRole}`

  // Check if we've recently redirected this same request
  const lastRedirectTime = recentRedirects.get(requestKey)
  const now = Date.now()

  if (lastRedirectTime && now - lastRedirectTime < REDIRECT_COOLDOWN) {
    // Skip redirect if we've recently redirected this same request
    return NextResponse.next()
  }

  // Handle public paths - always accessible
  if (PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
    return NextResponse.next()
  }

  // Handle auth pages (login/signup)
  if (pathname.startsWith("/login") || pathname.startsWith("/signup")) {
    if (hasSession) {
      // User is already logged in, redirect to appropriate dashboard
      const redirectUrl = new URL(ROLE_PATHS[userRole] + "/dashboard", request.url)

      // Store this redirect
      recentRedirects.set(requestKey, now)

      // Clean up old entries
      for (const [key, time] of recentRedirects.entries()) {
        if (now - time > REDIRECT_COOLDOWN * 2) {
          recentRedirects.delete(key)
        }
      }

      // Add a cache-control header to prevent caching
      const response = NextResponse.redirect(redirectUrl)
      response.headers.set("Cache-Control", "no-store, max-age=0")
      return response
    }

    return NextResponse.next()
  }

  // Handle protected routes
  const matchingRolePath = Object.entries(ROLE_PATHS).find(([_, path]) => pathname.startsWith(path))

  if (matchingRolePath) {
    const [requiredRole, path] = matchingRolePath

    // Check if user is authenticated
    if (!hasSession) {
      // User is not logged in, redirect to login
      const redirectUrl = new URL(`/login?redirectTo=${pathname}`, request.url)

      // Store this redirect
      recentRedirects.set(requestKey, now)

      // Add a cache-control header to prevent caching
      const response = NextResponse.redirect(redirectUrl)
      response.headers.set("Cache-Control", "no-store, max-age=0")
      return response
    }

    // Check if user has the correct role
    if (userRole !== requiredRole) {
      // User doesn't have the right role, redirect to their dashboard
      const redirectUrl = new URL(ROLE_PATHS[userRole] + "/dashboard", request.url)

      // Store this redirect
      recentRedirects.set(requestKey, now)

      // Add a cache-control header to prevent caching
      const response = NextResponse.redirect(redirectUrl)
      response.headers.set("Cache-Control", "no-store, max-age=0")
      return response
    }
  }

  // Add auth info to headers for debugging
  const response = NextResponse.next()
  response.headers.set("x-user-authenticated", hasSession.toString())
  response.headers.set("x-user-role", userRole)
  response.headers.set("Cache-Control", "no-store, max-age=0")

  return response
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
