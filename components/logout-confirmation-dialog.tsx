"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"
import { Button } from "@/src/shared/components/ui/button"
import { DropdownMenuItem } from "@/src/shared/components/ui/dropdown-menu"

interface LogoutConfirmationDialogProps {
  currentPath: string
  className?: string
  fullWidth?: boolean
  asDropdownItem?: boolean
  children?: React.ReactNode
}

export function LogoutConfirmationDialog({
  currentPath,
  className,
  fullWidth,
  asDropdownItem = false,
  children,
}: LogoutConfirmationDialogProps) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  // Complete logout function that handles all auth states
  const handleLogout = async () => {
    try {
      console.log("[LOGOUT] Starting logout process...")

      // Step 1: Try to use Supabase logout first
      try {
        const { createClientClient } = await import("@/shared/services/client")
        const supabase = createClientClient()
        if (supabase) {
          const { error } = await supabase.auth.signOut()
          if (error) {
            console.error("Supabase logout error:", error.message)
          } else {
            console.log("[LOGOUT] Supabase logout successful")
          }
        }
      } catch (supabaseError) {
        console.error("[LOGOUT] Supabase logout failed:", supabaseError)
      }

      // Step 2: Update Zustand store if available
      try {
        const { useAuthStore } = await import("@/features/auth/stores/auth-store")
        const store = useAuthStore.getState()
        if (store.logout) {
          await store.logout()
          console.log("[LOGOUT] Auth store logout successful")
        }
      } catch (storeError) {
        console.error("[LOGOUT] Auth store logout failed:", storeError)
      }

      // Step 3: Clear all auth cookies systematically
      const authCookies = [
        "session",
        "supabase-auth-token", 
        "user_id",
        "user_role",
        "user_name",
        "user_email",
        "token_balance",
        "first_login",
        "pending_token_update",
        "is_admin"
      ]

      authCookies.forEach(cookieName => {
        document.cookie = `${cookieName}=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT`
        console.log(`[LOGOUT] Cleared cookie: ${cookieName}`)
      })

      // Also clear any other potential auth cookies
      const allCookies = document.cookie.split(";")
      allCookies.forEach(cookie => {
        const cookieName = cookie.split("=")[0].trim()
        if (cookieName.includes("supabase") || cookieName.includes("auth")) {
          document.cookie = `${cookieName}=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT`
          console.log(`[LOGOUT] Cleared additional cookie: ${cookieName}`)
        }
      })

      console.log("[LOGOUT] All cookies cleared, setting hasSession to false...")
      
      // Step 4: Dispatch auth state change event
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("auth-state-change", { 
          detail: { hasSession: false, isAuthenticated: false } 
        }))
      }
      
      // Step 5: Force a hard reload to ensure middleware sees the cleared state
      console.log("[LOGOUT] Redirecting to landing page...")
      window.location.href = "/landing"
      
    } catch (error) {
      console.error("[LOGOUT] Error during logout:", error)
      // Still try to redirect even if there's an error
      window.location.href = "/landing"
    }
  }

  const triggerButton = (
    <Button
      variant="outline"
      className={className}
      style={fullWidth ? { width: "100%" } : undefined}
      onClick={() => {
        console.log("[LOGOUT] Logout button clicked!")
        setOpen(true)
      }}
    >
      {children || (
        <>
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </>
      )}
    </Button>
  )

  const dropdownTrigger = (
    <DropdownMenuItem
      onSelect={(e) => {
        e.preventDefault()
        setOpen(true)
      }}
    >
      <LogOut className="h-4 w-4 mr-2" />
      <span>Logout</span>
    </DropdownMenuItem>
  )

  return (
    <>
      {asDropdownItem ? dropdownTrigger : triggerButton}

      {/* Custom modal replacement for the problematic Dialog component */}
      {open && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}
          onClick={() => setOpen(false)}
        >
          <div 
            style={{
              backgroundColor: '#18181b',
              border: '2px solid #ef4444',
              borderRadius: '8px',
              padding: '24px',
              maxWidth: '400px',
              color: 'white'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
              Confirm Logout
            </h2>
            <p style={{ color: '#a1a1aa', marginBottom: '20px' }}>
              Are you sure you want to log out of your account?
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <Button 
                variant="outline" 
                onClick={() => setOpen(false)}
                style={{ border: '1px solid #52525b', backgroundColor: 'transparent' }}
              >
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  console.log("[LOGOUT] Logout confirmed")
                  handleLogout()
                }}
                style={{ backgroundColor: '#dc2626', color: 'white' }}
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
