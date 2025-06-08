import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Store recent redirects to prevent loops
const recentRedirects = new Map<string, number>()
const REDIRECT_COOLDOWN = 2000 // 2 seconds

// Define role-based access paths
const ROLE_PATHS = {
  dj: "/dj-portal",
  venue: "/venue-portal",
  attendee: "/attendee-portal",
}

// Define public paths that don't require authentication
const PUBLIC_PATHS = ["/", "/landing", "/about", "/events", "/djs"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  console.log("[Middleware] Processing request for:", pathname)

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
  const rawUserRole = request.cookies.get("user_role")?.value
  // Handle legacy admin role - convert to attendee but check admin flag
  const userRole = rawUserRole === "admin" ? "attendee" : (rawUserRole as keyof typeof ROLE_PATHS) || "attendee"
  const isAdmin = request.cookies.get("is_admin")?.value === "true" || rawUserRole === "admin" // Temporary fallback for old cookies

  console.log("[Middleware] Auth state:", { hasSession, userRole, isAdmin, rawUserRole, pathname })

  // Create a unique key for this request path
  const requestKey = `${pathname}-${hasSession ? "auth" : "noauth"}-${userRole}`

  // Check if we've recently redirected this same request
  const lastRedirectTime = recentRedirects.get(requestKey)
  const now = Date.now()

  if (lastRedirectTime && now - lastRedirectTime < REDIRECT_COOLDOWN) {
    console.log("[Middleware] Skipping redirect due to cooldown:", pathname)
    return NextResponse.next()
  }

  // Handle public paths - always accessible
  if (PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
    console.log("[Middleware] Public path accessed:", pathname)
    // If user is logged in and tries to access login/signup, redirect to dashboard
    if (hasSession && (pathname === "/login" || pathname === "/signup")) {
      const redirectUrl = new URL(ROLE_PATHS[userRole] + "/dashboard", request.url)
      console.log("[Middleware] Redirecting authenticated user from auth page to:", redirectUrl.pathname)
      const response = NextResponse.redirect(redirectUrl)
      response.headers.set("Cache-Control", "no-store, max-age=0")
      return response
    }
    return NextResponse.next()
  }

  // Handle auth pages (login/signup)
  if (pathname === "/login" || pathname === "/signup") {
    if (hasSession) {
      // User is already logged in, redirect to appropriate dashboard
      const redirectUrl = new URL(ROLE_PATHS[userRole] + "/dashboard", request.url)
      console.log("[Middleware] Redirecting authenticated user to dashboard:", redirectUrl.pathname)
      const response = NextResponse.redirect(redirectUrl)
      response.headers.set("Cache-Control", "no-store, max-age=0")
      return response
    }
    return NextResponse.next()
  }

  // Handle admin portal access
  if (pathname.startsWith("/admin-portal")) {
    if (!hasSession) {
      // Not logged in, redirect to landing
      const redirectUrl = new URL("/landing", request.url)
      console.log("[Middleware] Redirecting unauthenticated user to landing:", redirectUrl.pathname)
      const response = NextResponse.redirect(redirectUrl)
      response.headers.set("Cache-Control", "no-store, max-age=0")
      return response
    }
    if (!isAdmin) {
      // Logged in but not admin, redirect to their dashboard
      const redirectUrl = new URL(ROLE_PATHS[userRole] + "/dashboard", request.url)
      console.log("[Middleware] Redirecting non-admin user to their dashboard:", redirectUrl.pathname)
      const response = NextResponse.redirect(redirectUrl)
      response.headers.set("Cache-Control", "no-store, max-age=0")
      return response
    }
    // Admin accessing admin portal - allow
    return NextResponse.next()
  }

  // Handle protected routes
  if (!hasSession && pathname !== "/landing") {
    // User is not logged in, redirect to landing page
    const redirectUrl = new URL("/landing", request.url)
    console.log("[Middleware] Redirecting unauthenticated user to landing:", redirectUrl.pathname)
    const response = NextResponse.redirect(redirectUrl)
    response.headers.set("Cache-Control", "no-store, max-age=0")
    return response
  }

  const matchingRolePath = Object.entries(ROLE_PATHS).find(([_, path]) => pathname.startsWith(path))

  if (matchingRolePath) {
    const [requiredRole, path] = matchingRolePath

    // Check if user has the correct role
    if (userRole !== requiredRole) {
      // User doesn't have the right role, redirect to their dashboard
      const redirectUrl = new URL(ROLE_PATHS[userRole] + "/dashboard", request.url)
      console.log("[Middleware] Redirecting user to correct role dashboard:", redirectUrl.pathname)
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
