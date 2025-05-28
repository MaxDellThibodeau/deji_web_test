"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"
import { Button } from "@/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/ui/dialog"
import { DropdownMenuItem } from "@/ui/dropdown-menu"

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
      console.log("Logging out user...")

      // Clear all possible auth cookies
      const cookies = document.cookie.split(";")

      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i]
        const eqPos = cookie.indexOf("=")
        const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim()

        // Set expiration to past date to remove the cookie
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
        console.log(`Cleared cookie: ${name}`)
      }

      // Specifically target auth cookies
      document.cookie = "session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
      document.cookie = "supabase-auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
      document.cookie = "user_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
      document.cookie = "user_role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
      document.cookie = "user_name=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
      document.cookie = "first_login=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"

      // Dispatch events to notify other components
      const cookieEvent = new Event("cookieChange")
      document.dispatchEvent(cookieEvent)

      const authEvent = new CustomEvent("auth-state-change", {
        detail: { state: "SIGNED_OUT" },
      })
      document.dispatchEvent(authEvent)

      window.localStorage.setItem("auth-state", "SIGNED_OUT")

      // Force a window reload to clear any cached state
      window.location.href = "/landing"

      console.log("Logout complete, redirecting to landing page")
    } catch (error) {
      console.error("Error during logout:", error)
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
            <form
              action={async (formData) => {
                try {
                  setOpen(false)
                  await handleLogout() // Changed to call the existing handleLogout function
                } catch (error) {
                  console.error("Error during logout:", error)
                  // Fallback to client-side redirect if server action fails
                  window.location.href = "/landing"
                }
              }}
            >
              <Button type="submit" className="bg-red-600 hover:bg-red-700">
                Logout
              </Button>
            </form>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
