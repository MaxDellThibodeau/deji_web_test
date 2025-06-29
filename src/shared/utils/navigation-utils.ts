/**
 * Navigation history utility functions
 */

// Get the navigation history from session storage
export function getNavigationHistory(): string[] {
  if (typeof window === "undefined") return []

  try {
    return JSON.parse(sessionStorage.getItem("navigationHistory") || "[]")
  } catch (error) {
    console.error("Error retrieving navigation history:", error)
    return []
  }
}

// Add a page to navigation history
export function addToNavigationHistory(path: string): void {
  if (typeof window === "undefined") return

  try {
    const history = getNavigationHistory()

    // Don't add duplicate consecutive entries
    if (history.length === 0 || history[history.length - 1] !== path) {
      history.push(path)
      // Keep only the last 10 entries
      if (history.length > 10) {
        history.shift()
      }
      sessionStorage.setItem("navigationHistory", JSON.stringify(history))
    }
  } catch (error) {
    console.error("Error adding to navigation history:", error)
  }
}

// Get the previous page from navigation history
export function getPreviousPage(): string | null {
  if (typeof window === "undefined") return null

  try {
    const history = getNavigationHistory()

    // If we have at least 2 entries, return the second-to-last one
    if (history.length >= 2) {
      return history[history.length - 2]
    }

    // Default to home if no previous page
    return "/"
  } catch (error) {
    console.error("Error getting previous page:", error)
    return "/"
  }
}

// Navigate back safely, avoiding specific pages
export function safeNavigateBack(router: any, currentPath: string, avoidPaths: string[] = []): void {
  const history = getNavigationHistory()

  // Find the most recent page that isn't in the avoid list
  for (let i = history.length - 2; i >= 0; i--) {
    const previousPath = history[i]
    if (!avoidPaths.includes(previousPath) && previousPath !== currentPath) {
      router.push(previousPath)
      return
    }
  }

  // If no suitable previous page found, go to dashboard for DJ portal pages
  if (currentPath.includes("/dj-portal/")) {
    router.push("/dj-portal/dashboard")
    return
  }

  // Otherwise go to home
  router.push("/")
}

// Clear navigation history
export function clearNavigationHistory(): void {
  if (typeof window === "undefined") return

  try {
    sessionStorage.removeItem("navigationHistory")
  } catch (error) {
    console.error("Error clearing navigation history:", error)
  }
}

// Get default back destination based on current path
export function getDefaultBackDestination(currentPath: string): string {
  // For DJ portal pages, default back to dashboard
  if (currentPath.startsWith("/dj-portal/") && currentPath !== "/dj-portal/dashboard") {
    return "/dj-portal/dashboard"
  }

  // For dashboard, go to home
  if (currentPath === "/dj-portal/dashboard") {
    return "/"
  }

  // Default to home
  return "/"
}
