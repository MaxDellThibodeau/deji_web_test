"use client"

import { useUser } from "@/hooks/use-user"
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/avatar"
import { Skeleton } from "@/ui/skeleton"

export function UserProfileDisplay() {
  const { user, loading } = useUser()

  if (loading) {
    return (
      <div className="flex items-center space-x-3">
        <Skeleton className="h-8 w-8 rounded-full" />
        <div>
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16 mt-1" />
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center space-x-3">
        <Avatar className="h-8 w-8">
          <AvatarFallback>?</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-medium">Not logged in</p>
          <p className="text-xs text-muted-foreground">Guest</p>
        </div>
      </div>
    )
  }

  // Get initials for avatar fallback
  const initials = user.name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2)

  return (
    <div className="flex items-center space-x-3">
      <Avatar className="h-8 w-8">
        <AvatarImage src={user.profileImage || "/placeholder.svg"} alt={user.name} />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <div>
        <p className="text-sm font-medium">{user.name}</p>
        <p className="text-xs text-muted-foreground">{user.role}</p>
      </div>
    </div>
  )
}
