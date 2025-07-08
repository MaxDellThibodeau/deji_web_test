"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { getUserFromCookies } from "@/shared/utils/auth-utils"

export function AuthDebug() {
  const [isVisible, setIsVisible] = useState(false)
  const [cookies, setCookies] = useState<Record<string, string>>({})
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    // Parse cookies
    const cookieObj: Record<string, string> = {}
    document.cookie.split(";").forEach((cookie) => {
      const [key, value] = cookie.trim().split("=")
      if (key && value) cookieObj[key] = value
    })
    setCookies(cookieObj)

    // Get user from cookies
    const cookieUser = getUserFromCookies()
    setUser(cookieUser)
  }, [])

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsVisible(true)}
          className="bg-zinc-900/80 text-zinc-300 border-zinc-700 hover:bg-zinc-800"
        >
          Debug Auth
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80">
      <Card className="bg-zinc-900/90 border-zinc-700 text-zinc-300">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex justify-between items-center">
            <span>Auth Debug</span>
            <Button variant="ghost" size="sm" onClick={() => setIsVisible(false)} className="h-6 w-6 p-0">
              ✕
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs space-y-2">
          <div>
            <p className="font-semibold mb-1">User:</p>
            {user ? (
              <pre className="bg-zinc-800 p-2 rounded overflow-auto max-h-20">{JSON.stringify(user, null, 2)}</pre>
            ) : (
              <p className="text-red-400">No user found</p>
            )}
          </div>
          <div>
            <p className="font-semibold mb-1">Cookies:</p>
            <pre className="bg-zinc-800 p-2 rounded overflow-auto max-h-40">{JSON.stringify(cookies, null, 2)}</pre>
          </div>
          <div className="pt-2 flex justify-between">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                // Clear all cookies
                document.cookie.split(";").forEach((cookie) => {
                  const [key] = cookie.trim().split("=")
                  document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`
                })
                window.location.reload()
              }}
              className="text-xs"
            >
              Clear Cookies
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.location.reload()} className="text-xs">
              Refresh Page
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
