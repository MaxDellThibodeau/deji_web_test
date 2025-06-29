"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight, Home } from "lucide-react"

interface BreadcrumbItem {
  label: string
  href: string
  isCurrentPage: boolean
}

// Map path segments to user-friendly labels
const pathToLabel: Record<string, string> = {
  dashboard: "Dashboard",
  schedule: "Schedule",
  library: "Music Library",
  earnings: "Earnings",
  profile: "Profile",
  settings: "Settings",
  analytics: "Analytics",
}

// Paths to exclude from breadcrumbs
const excludePaths = ["dj-portal"]

export function BreadcrumbNavigation() {
  const pathname = usePathname()
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([])

  useEffect(() => {
    if (!pathname) return

    // Split the pathname into segments
    const pathSegments = pathname.split("/").filter(Boolean)

    // Create breadcrumb items
    const breadcrumbItems: BreadcrumbItem[] = []

    // Add home
    breadcrumbItems.push({
      label: "Home",
      href: "/",
      isCurrentPage: pathname === "/",
    })

    // Build up the breadcrumb path
    let currentPath = ""

    pathSegments.forEach((segment, index) => {
      // Skip excluded paths (like "dj-portal")
      if (excludePaths.includes(segment)) return

      currentPath += `/${segment}`

      // Get a user-friendly label for the segment
      const label = pathToLabel[segment] || segment.charAt(0).toUpperCase() + segment.slice(1)

      breadcrumbItems.push({
        label,
        href: currentPath,
        isCurrentPage: currentPath === pathname,
      })
    })

    setBreadcrumbs(breadcrumbItems)
  }, [pathname])

  if (breadcrumbs.length <= 1) return null

  return (
    <nav aria-label="Breadcrumb" className="border-b border-gray-800 bg-gray-900/50 px-4 py-2">
      <ol className="flex items-center text-sm text-gray-400">
        {breadcrumbs.map((breadcrumb, index) => (
          <li key={breadcrumb.href} className="flex items-center">
            {index > 0 && <ChevronRight className="mx-2 h-3 w-3" />}

            {breadcrumb.isCurrentPage ? (
              <span className="text-white">{breadcrumb.label}</span>
            ) : (
              <Link href={breadcrumb.href} className="hover:text-white transition-colors">
                {index === 0 ? (
                  <span className="flex items-center">
                    <Home className="mr-1 h-3 w-3" />
                    {breadcrumb.label}
                  </span>
                ) : (
                  breadcrumb.label
                )}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
