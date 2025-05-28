"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { useUser } from "@/hooks/use-user"
import { Button } from "@/ui/button"

export function UserDebug() {
  const [isOpen, setIsOpen] = useState(false)
  const { user } = useUser()

  const getCookies = () => {
    const cookies = document.cookie.split(";").reduce(
      (acc, cookie) => {
        const [key, value] = cookie.trim().split("=")
        if (key && value) {
          acc[key] = value
        }
        return acc
      },
      {} as Record<string, string>,
    )
    return cookies
  }

  const clearCookies = () => {
    const cookies = document.cookie.split(";")
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i]
      const eqPos = cookie.indexOf("=")
      const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim()
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
    }
    window.location.reload()
  }

  const refreshPage = () => {
    window.location.reload()
  }

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="fixed bottom-4 left-4 z-50 bg-zinc-900 border-zinc-700 text-zinc-300"
        onClick={() => setIsOpen(true)}
      >
        Debug User
      </Button>
    )
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 w-80 bg-zinc-900 border border-zinc-700 rounded-md shadow-lg text-white">
      <div className="flex items-center justify-between p-3 border-b border-zinc-800">
        <h3 className="font-medium">User Debug</h3>
        <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="p-3 max-h-96 overflow-y-auto">
        <h4 className="text-sm font-medium mb-1">User from Hook:</h4>
        <pre className="text-xs bg-zinc-950 p-2 rounded overflow-x-auto mb-3">{JSON.stringify(user, null, 2)}</pre>

        <h4 className="text-sm font-medium mb-1">Auth Cookies:</h4>
        <pre className="text-xs bg-zinc-950 p-2 rounded overflow-x-auto">{JSON.stringify(getCookies(), null, 2)}</pre>
      </div>
      <div className="flex border-t border-zinc-800">
        <Button
          variant="ghost"
          size="sm"
          className="flex-1 rounded-none text-red-400 hover:text-red-300 hover:bg-red-950/30"
          onClick={clearCookies}
        >
          Clear Cookies
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="flex-1 rounded-none border-l border-zinc-800"
          onClick={refreshPage}
        >
          Refresh Page
        </Button>
      </div>
    </div>
  )
}
