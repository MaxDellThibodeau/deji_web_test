"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/shared/components/ui/button"
import { ChevronLeft, Home, Calendar, User, Ticket } from "lucide-react"

export function TicketsNavigation() {
  const router = useRouter()

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <Button
        variant="outline"
        size="sm"
        onClick={() => router.back()}
        className="flex items-center gap-1 w-full sm:w-auto"
      >
        <ChevronLeft className="h-4 w-4" />
        Back
      </Button>

      <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto justify-between sm:justify-end">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="flex items-center gap-1">
            <Home className="h-4 w-4" />
            <span className="hidden md:inline">Dashboard</span>
          </Button>
        </Link>

        <Link href="/events">
          <Button variant="ghost" size="sm" className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span className="hidden md:inline">Events</span>
          </Button>
        </Link>

        <Link href="/tickets">
          <Button variant="ghost" size="sm" className="flex items-center gap-1">
            <Ticket className="h-4 w-4" />
            <span className="hidden md:inline">Tickets</span>
          </Button>
        </Link>

        <Link href="/profile">
          <Button variant="ghost" size="sm" className="flex items-center gap-1">
            <User className="h-4 w-4" />
            <span className="hidden md:inline">Profile</span>
          </Button>
        </Link>
      </div>
    </div>
  )
}
