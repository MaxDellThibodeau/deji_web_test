
import type React from "react"

import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Bell, Search, LogOut, Home } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar"
import { getDefaultBackDestination } from "@/shared/utils/navigation-utils"

interface NavbarHeaderProps {
  title: string
  userName?: string
  userEmail?: string
  onLogout?: () => void
}

export function NavbarHeader({
  title,
  userName = "DJ User",
  userEmail = "dj@example.com",
  onLogout,
}: NavbarHeaderProps) {
  const navigate = useNavigate()
  const location = useLocation(); const pathname = location.pathname || ""
  const [searchQuery, setSearchQuery] = useState("")

  const handleBackNavigation = () => {
    // Try browser back first
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      // If no history, use default back destination
      const defaultDestination = getDefaultBackDestination(pathname)
      navigate(defaultDestination)
    }
  }

  const handleHomeNavigation = () => {
    navigate("/")
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Implement search functionality
    console.log("Searching for:", searchQuery)
  }

  const handleLogout = () => {
    if (onLogout) {
      onLogout()
    } else {
      // Default logout behavior
      document.cookie = "session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
      document.cookie = "user_id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
      document.cookie = "user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
      navigate("/login")
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-gray-800 bg-gray-900 px-4 sm:px-6">
      <Button variant="ghost" size="icon" onClick={handleBackNavigation} className="mr-1" aria-label="Go back">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-6 w-6"
        >
          <path d="m15 18-6-6 6-6" />
        </svg>
      </Button>

      <Button variant="ghost" size="icon" onClick={handleHomeNavigation} className="mr-2" aria-label="Go to home page">
        <Home className="h-5 w-5" />
      </Button>

      <h1 className="text-xl font-semibold text-white">{title}</h1>

      <form onSubmit={handleSearch} className="ml-auto flex-1 sm:flex-initial md:w-80 lg:w-96">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Search..."
            className="w-full bg-gray-800 pl-8 text-sm text-white placeholder-gray-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </form>

      <Button variant="ghost" size="icon" className="relative">
        <Bell className="h-5 w-5" />
        <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-purple-600" />
      </Button>

      <div className="flex items-center gap-4">
        <Avatar>
          <AvatarImage src="/diverse-avatars.png" />
          <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="hidden md:block">
          <div className="text-sm font-medium text-white">{userName}</div>
          <div className="text-xs text-gray-400">{userEmail}</div>
        </div>
      </div>

      <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Log out">
        <LogOut className="h-5 w-5" />
      </Button>
    </header>
  )
}
