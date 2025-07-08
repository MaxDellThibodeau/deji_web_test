"use client"

import { useState } from "react"
import { Button } from "@/shared/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/radio-group"
import { Label } from "@/shared/components/ui/label"
import { Separator } from "@/shared/components/ui/separator"
import { CreditCard, Ticket, Users, Info } from "lucide-react"
import { StripeElementsCheckout } from "@/features/payments/components/stripe-elements-checkout"
import { useRouter } from "next/navigation"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/components/ui/tooltip"

type TicketType = {
  id: string
  name: string
  price: number
  available: number
  description?: string
}

interface EventTicketPurchaseProps {
  eventId: string
  eventName: string
  ticketTypes: TicketType[]
  userId: string
}

export default function EventTicketPurchase({ eventId, eventName, ticketTypes, userId }: EventTicketPurchaseProps) {
  const [selectedTicketType, setSelectedTicketType] = useState<string>(ticketTypes.length > 0 ? ticketTypes[0].id : "")
  const [quantity, setQuantity] = useState(1)
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const router = useRouter()

  const selectedTicket = ticketTypes.find((ticket) => ticket.id === selectedTicketType)

  const handleStartCheckout = () => {
    console.log("[CHECKOUT] Starting checkout process for:", {
      eventId,
      eventName,
      ticketType: selectedTicket?.name,
      quantity,
      unitPrice: selectedTicket?.price,
      userId,
    })
    setIsCheckingOut(true)
  }

  const handleCancelCheckout = () => {
    console.log("[CHECKOUT] Checkout cancelled")
    setIsCheckingOut(false)
  }

  const handleCheckoutSuccess = () => {
    console.log("[CHECKOUT] Checkout successful, redirecting to success page")
    router.push("/ticket-purchase-success")
  }

  if (isCheckingOut && selectedTicket) {
    return (
      <StripeElementsCheckout
        eventId={eventId}
        eventName={eventName}
        ticketType={selectedTicket.name}
        quantity={quantity}
        unitPrice={selectedTicket.price}
        userId={userId}
        onSuccess={handleCheckoutSuccess}
        onCancel={handleCancelCheckout}
      />
    )
  }

  if (ticketTypes.length === 0) {
    return (
      <div className="text-center p-6 bg-zinc-800 rounded-lg">
        <p className="text-zinc-300">No tickets available for this event.</p>
      </div>
    )
  }

  const subtotal = selectedTicket ? selectedTicket.price * quantity : 0
  const fees = subtotal * 0.1 // 10% service fee
  const total = subtotal + fees

  return (
    <div className="space-y-6">
      <RadioGroup value={selectedTicketType} onValueChange={setSelectedTicketType} className="space-y-3">
        {ticketTypes.map((ticket) => (
          <div
            key={ticket.id}
            className={`border rounded-lg p-4 transition-colors ${
              selectedTicketType === ticket.id
                ? "border-purple-500 bg-purple-900/20"
                : "border-zinc-700 hover:border-zinc-600"
            }`}
          >
            <RadioGroupItem value={ticket.id} id={ticket.id} className="sr-only" />
            <Label htmlFor={ticket.id} className="flex justify-between items-start cursor-pointer">
              <div>
                <p className="font-medium">{ticket.name}</p>
                {ticket.description && <p className="text-sm text-zinc-400 mt-1">{ticket.description}</p>}
                <div className="flex items-center text-sm text-zinc-400 mt-1">
                  <Users className="h-3 w-3 mr-1" />
                  <span>{ticket.available} available</span>
                </div>
              </div>
              <p className="font-bold text-lg">${ticket.price.toFixed(2)}</p>
            </Label>
          </div>
        ))}
      </RadioGroup>

      <div>
        <label className="block text-sm font-medium mb-2">Quantity</label>
        <div className="flex items-center">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-r-none border-zinc-700"
            onClick={() => quantity > 1 && setQuantity(quantity - 1)}
            disabled={quantity <= 1}
          >
            -
          </Button>
          <div className="h-10 px-4 flex items-center justify-center border-y border-zinc-700 bg-zinc-800">
            {quantity}
          </div>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-l-none border-zinc-700"
            onClick={() => quantity < (selectedTicket?.available || 10) && setQuantity(quantity + 1)}
            disabled={!selectedTicket || quantity >= selectedTicket.available}
          >
            +
          </Button>
        </div>
      </div>

      <Separator className="bg-zinc-800" />

      <div className="space-y-2">
        <div className="flex justify-between text-zinc-300">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-zinc-300">
          <div className="flex items-center">
            <span>Service Fee</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-4 w-4 ml-1 p-0">
                    <Info className="h-3 w-3 text-zinc-500" />
                    <span className="sr-only">Fee Info</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Service fee helps cover payment processing and platform costs</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <span>${fees.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-bold text-lg">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>

      <Button
        onClick={handleStartCheckout}
        disabled={!selectedTicket || selectedTicket.available < 1}
        className="w-full bg-purple-600 hover:bg-purple-700 text-white"
      >
        <CreditCard className="mr-2 h-4 w-4" />
        Checkout
      </Button>

      <div className="flex items-center justify-center text-xs text-zinc-500 space-x-2">
        <Ticket className="h-3 w-3" />
        <p>Tickets will be added to your account after purchase</p>
      </div>
    </div>
  )
}
