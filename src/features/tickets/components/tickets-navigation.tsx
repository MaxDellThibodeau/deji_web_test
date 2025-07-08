
import { Link } from "react-router-dom"
import { useNavigate } from "react-router-dom"
import { Button } from "@/shared/components/ui/button"
import { ChevronLeft, Home, Calendar, User, Ticket } from "lucide-react"

export function TicketsNavigation() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <Button
        variant="outline"
        size="sm"
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 w-full sm:w-auto"
      >
        <ChevronLeft className="h-4 w-4" />
        Back
      </Button>

      <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto justify-between sm:justify-end">
        <Link to="/dashboard">
          <Button variant="ghost" size="sm" className="flex items-center gap-1">
            <Home className="h-4 w-4" />
            <span className="hidden md:inline">Dashboard</span>
          </Button>
        </Link>

        <Link to="/events">
          <Button variant="ghost" size="sm" className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span className="hidden md:inline">Events</span>
          </Button>
        </Link>

        <Link to="/tickets">
          <Button variant="ghost" size="sm" className="flex items-center gap-1">
            <Ticket className="h-4 w-4" />
            <span className="hidden md:inline">Tickets</span>
          </Button>
        </Link>

        <Link to="/profile">
          <Button variant="ghost" size="sm" className="flex items-center gap-1">
            <User className="h-4 w-4" />
            <span className="hidden md:inline">Profile</span>
          </Button>
        </Link>
      </div>
    </div>
  )
}
