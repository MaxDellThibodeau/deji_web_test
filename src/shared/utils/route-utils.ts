// Check if a route is a dashboard route
export function isDashboardRoute(pathname: string): boolean {
  const dashboardRoutes = [
    "/dashboard",
    "/music-preferences",
    "/events",
    "/create-event",
    "/token-bidding",
    "/tickets",
    "/dj-sets",
    "/rewards",
    "/profile",
    "/settings",
    "/attendee-portal",
    "/token-history",
    "/token-purchase",
    "/dj-portal",
    "/venue-portal",
    "/admin-portal",
  ]

  return dashboardRoutes.some((route) => pathname.startsWith(route))
}

// Check if a route is a public route
export function isPublicRoute(pathname: string): boolean {
  const publicRoutes = ["/landing", "/about", "/"]

  return publicRoutes.some((route) => pathname === route || pathname.startsWith(route + "/"))
}

// Check if a route is an auth route
export function isAuthRoute(pathname: string): boolean {
  const authRoutes = ["/login", "/signup", "/forgot-password", "/reset-password"]

  return authRoutes.some((route) => pathname === route || pathname.startsWith(route + "/"))
}
