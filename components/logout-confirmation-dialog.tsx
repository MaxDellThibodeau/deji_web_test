"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"
import { Button } from "@/src/shared/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/shared/components/ui/dialog"
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

  const handleLogout = async () => {
    try {
      console.log("[LOGOUT] Starting logout process...")

      // Clear all auth cookies systematically
      const authCookies = [
        "session",
        "supabase-auth-token", 
        "user_id",
        "user_role",
        "user_name",
        "user_email",
        "token_balance",
        "first_login",
        "pending_token_update"
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

      console.log("[LOGOUT] All cookies cleared, forcing page reload...")
      
      // Force a hard reload to ensure middleware sees the cleared state
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
      onClick={() => setOpen(true)}
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px] bg-zinc-900 text-white border-zinc-800">
          <DialogHeader>
            <DialogTitle>Confirm Logout</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Are you sure you want to log out of your account?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} className="border-zinc-700 hover:bg-zinc-800">
              Cancel
            </Button>
            <Button 
              onClick={() => {
                setOpen(false)
                handleLogout()
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Logout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
