"use client"

import { useState, useEffect } from "react"
import { Button } from "@/ui/button"
import { useUser } from "@/hooks/use-user"
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/avatar"

export function DebugUser() {
  const { user, loading } = useUser()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center space-x-2 bg-zinc-900 p-2 rounded-md border border-zinc-800">
      <Avatar className="h-6 w-6">
        <AvatarImage src={user?.profileImage || "/placeholder.svg"} alt={user?.name || "User"} />
        <AvatarFallback className="text-xs bg-purple-700">
          {user?.name
            ? user.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .substring(0, 2)
            : "U"}
        </AvatarFallback>
      </Avatar>
      <div className="text-xs">
        <p className="font-medium">{user?.name || "Guest"}</p>
        <p className="text-zinc-400">{user?.role || "Not logged in"}</p>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="text-xs h-6 px-2 ml-2"
        onClick={() => {
          document.cookie = "user_id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
          document.cookie = "user_name=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
          document.cookie = "user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
          document.cookie = "user_email=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
          window.location.href = "/login"
        }}
      >
        Reset
      </Button>
    </div>
  )
}
