"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useUser as useUserHook } from "@/hooks/use-user"

// Create a context for the user
const UserContext = createContext<{
  user: any
  loading: boolean
  refreshUser: () => void
}>({
  user: null,
  loading: true,
  refreshUser: () => {},
})

// Create a provider component
export function UserProvider({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUserHook()
  const [refreshCounter, setRefreshCounter] = useState(0)

  const refreshUser = () => {
    setRefreshCounter((prev) => prev + 1)
  }

  useEffect(() => {
    console.log("UserProvider: User data updated", user?.name || "Not logged in")
  }, [user])

  return <UserContext.Provider value={{ user, loading, refreshUser }}>{children}</UserContext.Provider>
}

// Create a hook to use the user context
export function useUser() {
  return useContext(UserContext)
}
