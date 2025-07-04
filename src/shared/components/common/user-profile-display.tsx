"use client"

import { useAuthStore } from "@/features/auth/stores/auth-store"
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar"
import { Skeleton } from "@/shared/components/ui/skeleton"

interface UserProfileDisplayProps {
  showRole?: boolean
  size?: "sm" | "md" | "lg"
  className?: string
}

export function UserProfileDisplay({ 
  showRole = true, 
  size = "sm",
  className = ""
}: UserProfileDisplayProps) {
  const { user, isLoading } = useAuthStore()

  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12", 
    lg: "h-16 w-16"
  }

  if (isLoading) {
    return (
      <div className={`flex items-center space-x-3 ${className}`}>
        <Skeleton className={`${sizeClasses[size]} rounded-full`} />
        <div>
          <Skeleton className="h-4 w-24" />
          {showRole && <Skeleton className="h-3 w-16 mt-1" />}
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className={`flex items-center space-x-3 ${className}`}>
        <Avatar className={sizeClasses[size]}>
          <AvatarFallback>?</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-medium">Not logged in</p>
          {showRole && <p className="text-xs text-muted-foreground">Guest</p>}
        </div>
      </div>
    )
  }

  // Get initials for avatar fallback
  const initials = user.name
    ? user.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2)
    : user.email?.charAt(0).toUpperCase() || "U"

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <Avatar className={sizeClasses[size]}>
        <AvatarImage 
          src={user.avatar_url || undefined} 
          alt={user.name || user.email || "User"} 
        />
        <AvatarFallback className="bg-purple-600 text-white">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div>
        <p className="text-sm font-medium">{user.name || user.email}</p>
        {showRole && (
          <p className="text-xs text-muted-foreground capitalize">
            {user.role}
          </p>
        )}
      </div>
    </div>
  )
}
