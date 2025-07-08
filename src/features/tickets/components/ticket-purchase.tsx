
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Link } from "react-router-dom"
import { Ticket, LogIn } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { toast } from "@/shared/hooks/use-toast"

interface TicketPurchaseProps {
  eventId: string
  eventName: string
  price?: number
  ticketsRemaining?: number
}

export function TicketPurchase({ eventId, eventName, price = 0, ticketsRemaining = 0 }: TicketPurchaseProps) {
  const navigate = useNavigate()
  const [ticketQuantity, setTicketQuantity] = useState(1)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Check if user is logged in
  useEffect(() => {
    // Check for session cookie
    const hasSession = document.cookie.includes("session=") || document.cookie.includes("supabase-auth-token=")
    setIsAuthenticated(hasSession)
  }, [])

  const handlePurchase = () => {
    if (!isAuthenticated) {
      // Redirect to login with return URL
      navigate(`/login?redirectTo=${encodeURIComponent(`/events/${eventId}`)}`)
      return
    }

    // Handle purchase logic
    toast({
      title: "Tickets Reserved!",
      description: `You've reserved ${ticketQuantity} ticket${ticketQuantity > 1 ? "s" : ""} for ${eventName}.`,
    })

    // Redirect to tickets page after successful purchase
    setTimeout(() => {
      navigate("/tickets")
    }, 1500)
  }

  const subtotal = price * ticketQuantity || 0
  const serviceFee = (price * ticketQuantity * 0.1 || 0).toFixed(2)
  const total = (price * ticketQuantity * 1.1 || 0).toFixed(2)

  return (
    <div className="bg-navy-900 rounded-lg p-6 sticky top-20">
      <h2 className="text-xl font-bold mb-4">Get Your Tickets</h2>

      {!isAuthenticated ? (
        <div className="text-center py-6">
          <p className="text-zinc-300 mb-4">Please log in to purchase tickets for this event.</p>
          <Link to={`/login?redirectTo=${encodeURIComponent(`/events/${eventId}`)}`}>
            <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600">
              <LogIn className="mr-2 h-5 w-5" />
              Login to Purchase
            </Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-zinc-400">Price per ticket</span>
              <span className="font-bold text-xl">${price}</span>
            </div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-zinc-400">Quantity</span>
              <div className="flex items-center">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-l-md bg-zinc-800 border-zinc-700"
                  onClick={() => setTicketQuantity(Math.max(1, ticketQuantity - 1))}
                >
                  -
                </Button>
                <div className="h-8 w-12 flex items-center justify-center bg-zinc-800 border-y border-zinc-700">
                  {ticketQuantity}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-r-md bg-zinc-800 border-zinc-700"
                  onClick={() => setTicketQuantity(Math.min(10, ticketQuantity + 1))}
                >
                  +
                </Button>
              </div>
            </div>
            <div className="h-px bg-zinc-800 my-4"></div>
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">Subtotal</span>
              <span className="font-bold">${(price * ticketQuantity || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-zinc-400">Service fee</span>
              <span>${serviceFee}</span>
            </div>
            <div className="h-px bg-zinc-800 my-4"></div>
            <div className="flex justify-between items-center mb-6">
              <span className="font-medium">Total</span>
              <span className="font-bold text-xl">${total}</span>
            </div>
          </div>

          <Button
            onClick={handlePurchase}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 py-6"
          >
            <Ticket className="mr-2 h-5 w-5" />
            Purchase Tickets
          </Button>
        </>
      )}

      <div className="mt-4 text-center text-xs text-zinc-500">
        By purchasing tickets, you agree to our Terms of Service and Privacy Policy.
      </div>
    </div>
  )
}
