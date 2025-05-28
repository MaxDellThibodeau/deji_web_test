"use client"

import type React from "react"

import { useState, useEffect, memo, useRef } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Music, Calendar, DollarSign, BarChart3, User, Settings, Menu, X, CreditCard } from "lucide-react"
import { cn } from "@/shared/utils/utils"
import { useUser } from "@/hooks/use-user"
import { Button } from "@/ui/button"

// Memoize the navigation item to prevent unnecessary re-renders
const NavItem = memo(
  ({
    href,
    icon,
    label,
    isActive,
  }: {
    href: string
    icon: React.ReactNode
    label: string
    isActive: boolean
  }) => (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:text-white",
        isActive ? "bg-purple-900/50 text-white" : "text-gray-400 hover:bg-purple-900/30",
      )}
    >
      {icon}
      {label}
    </Link>
  ),
)

NavItem.displayName = "NavItem"

// Define navigation items outside component to prevent recreation on each render
const NAV_ITEMS = [
  {
    href: "/dj-portal/dashboard",
    icon: <BarChart3 className="h-5 w-5" />,
    label: "Dashboard",
  },
  {
    href: "/dj-portal/schedule",
    icon: <Calendar className="h-5 w-5" />,
    label: "Schedule",
  },
  {
    href: "/dj-portal/library",
    icon: <Music className="h-5 w-5" />,
    label: "Music Library",
  },
  {
    href: "/dj-portal/earnings",
    icon: <DollarSign className="h-5 w-5" />,
    label: "Earnings",
  },
  {
    href: "/dj-portal/subscription",
    icon: <CreditCard className="h-5 w-5" />,
    label: "Subscription",
  },
  {
    href: "/dj-portal/profile",
    icon: <User className="h-5 w-5" />,
    label: "Profile",
  },
  {
    href: "/dj-portal/settings",
    icon: <Settings className="h-5 w-5" />,
    label: "Settings",
  },
]

export const DJNavigation = memo(function DJNavigation() {
  const pathname = usePathname()
  const { user } = useUser()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const menuEffectRan = useRef(false)

  // Close mobile menu when path changes - only run once per path change
  useEffect(() => {
    if (menuEffectRan.current) return
    menuEffectRan.current = true

    setIsMobileMenuOpen(false)

    return () => {
      menuEffectRan.current = false
    }
  }, [pathname])

  if (!user) return null

  return (
    <>
      {/* Mobile Navigation Toggle */}
      <div className="flex items-center justify-between border-b border-gray-800 bg-black p-4 lg:hidden">
        <Link href="/dj-portal/dashboard" className="text-xl font-bold text-white">
          DJ Portal
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 pt-16 lg:hidden">
          <nav className="container mx-auto px-4 py-6">
            <div className="flex flex-col space-y-2">
              {NAV_ITEMS.map((item) => (
                <NavItem
                  key={item.href}
                  href={item.href}
                  icon={item.icon}
                  label={item.label}
                  isActive={pathname === item.href}
                />
              ))}
            </div>
          </nav>
        </div>
      )}

      {/* Desktop Navigation */}
      <div className="hidden h-screen w-64 flex-col border-r border-gray-800 bg-black lg:flex">
        <div className="flex h-16 items-center border-b border-gray-800 px-6">
          <Link href="/dj-portal/dashboard" className="text-xl font-bold text-white">
            DJ Portal
          </Link>
        </div>
        <div className="flex flex-col justify-between p-6">
          <nav className="space-y-2">
            {NAV_ITEMS.map((item) => (
              <NavItem
                key={item.href}
                href={item.href}
                icon={item.icon}
                label={item.label}
                isActive={pathname === item.href}
              />
            ))}
          </nav>
          <div className="mt-auto pt-6">
            <div className="flex items-center gap-3 rounded-lg bg-gray-900 p-3">
              <div className="h-10 w-10 overflow-hidden rounded-full bg-purple-700">
                <img
                  src={user.avatar_url || `/placeholder.svg?height=40&width=40&query=DJ`}
                  alt={user.name || "DJ"}
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <p className="text-sm font-medium text-white">{user.name || "DJ"}</p>
                <p className="text-xs text-gray-400">{user.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
})
