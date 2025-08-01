'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { AuthService } from '../services/auth-service'
import type { User } from '../types/user'
import type { AuthContextType } from '../types/auth'
import { useAuthStore } from '../stores/auth-store'
import { createClientClient } from "@/shared/services/client"

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: React.ReactNode
}

// Navigation state for auth flows
interface NavigationState {
  history: string[]
  currentIndex: number
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [navigationState, setNavigationState] = useState<NavigationState>({
    history: [],
    currentIndex: -1,
  })

  const navigate = useNavigate()
  const location = useLocation()
  const pathname = location.pathname

  // Track navigation history
  useEffect(() => {
    if (pathname) {
      setNavigationState((prev) => {
        if (prev.history[prev.currentIndex] === pathname) {
          return prev
        }

        const newHistory = prev.history.slice(0, prev.currentIndex + 1)
        newHistory.push(pathname)

        return {
          history: newHistory,
          currentIndex: newHistory.length - 1,
        }
      })
    }
  }, [pathname])

  // Refresh user data
  const refreshUser = useCallback(async () => {
    try {
      const cookieUser = AuthService.getUserFromCookies()

      if (cookieUser) {
        setUser(cookieUser)
        setIsAuthenticated(true)
        setIsLoading(false)
        return
      }

      setUser(null)
      setIsAuthenticated(false)
    } catch (error) {
      console.error("Error refreshing user:", error)
      setUser(null)
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Initialize auth state
  useEffect(() => {
    refreshUser()
  }, [refreshUser])

  // Login function
  const login = async (email: string, password: string, redirectTo?: string) => {
    const result = await AuthService.login(email, password, redirectTo)
    
    if (result.success) {
      await refreshUser()
    }
    
    return result
  }

  // Logout function
  const logout = async () => {
    await AuthService.logout()
    setUser(null)
    setIsAuthenticated(false)
    navigate("/")
  }

  const contextValue: AuthContextType = {
    user,
    session: null, // Will implement later
    isLoading,
    isAuthenticated,
    login,
    logout,
    refreshUser,
  }

  return React.createElement(
    AuthContext.Provider,
    { value: contextValue },
    children
  )
}

export const useAuth = () => {
  const store = useAuthStore()
  
  return {
    user: store.user,
    session: store.session,
    isLoading: store.isLoading,
    isAuthenticated: store.isAuthenticated,
    
    // Auth actions
    login: store.login,
    logout: store.logout,
    refreshUser: store.refreshUser,
    
    // Profile completion features
    profileCompletion: store.profileCompletion,
    roleSpecificData: store.roleSpecificData,
    getCompletionPercentage: store.getCompletionPercentage,
    shouldShowCompletionPrompt: store.shouldShowCompletionPrompt,
    getMissingFields: store.getMissingFields,
    isProfileComplete: store.isProfileComplete,
    updateProfileCompletion: store.updateProfileCompletion,
    setRoleSpecificData: store.setRoleSpecificData,
    loadRoleSpecificData: store.loadRoleSpecificData,
  }
}