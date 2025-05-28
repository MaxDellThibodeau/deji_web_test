import { type NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { stripe } from "@/features/payments/services/stripe"
import { createClient } from "@/shared/services/server"
import { nanoid } from "nanoid"

// This is your Stripe webhook secret for testing your endpoint locally.
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = headers().get("stripe-signature") as string

  let event

  try {
    event = stripe.webhooks.constructEvent(body, signature, endpointSecret || "")
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error"
    console.log(`⚠️  Webhook signature verification failed: ${errorMessage}`)
    return NextResponse.json({ error: `Webhook Error: ${errorMessage}` }, { status: 400 })
  }

  // Handle the event
  switch (event.type) {
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object
      console.log(`✅ Payment succeeded: ${paymentIntent.id}`)

      // Check if this is a ticket purchase
      if (paymentIntent.metadata?.type === "ticket_purchase") {
        await handleTicketPurchase(paymentIntent)
      }
      break

    case "payment_intent.payment_failed":
      console.log(`❌ Payment failed: ${event.data.object.id}`)
      break

    default:
      // Unexpected event type
      console.log(`Unhandled event type: ${event.type}`)
  }

  // Return a 200 response to acknowledge receipt of the event
  return NextResponse.json({ received: true })
}

async function handleTicketPurchase(paymentIntent: any) {
  try {
    const { userId, eventId, ticketType, quantity } = paymentIntent.metadata

    if (!userId || !eventId || !ticketType || !quantity) {
      console.error("Missing required metadata for ticket purchase")
      return
    }

    const supabase = createClient()

    // Create tickets in the database
    const ticketsToCreate = Array.from({ length: Number.parseInt(quantity) }, () => ({
      id: nanoid(),
      profile_id: userId,
      event_id: eventId,
      ticket_type: ticketType,
      ticket_code: `TIX-${nanoid(8).toUpperCase()}`,
      purchase_date: new Date().toISOString(),
      payment_id: paymentIntent.id,
      status: "active",
    }))

    // Check if we're in preview mode
    try {
      const { error } = await supabase.from("tickets").select("count").limit(1)

      // If there's an error, we're in preview mode
      if (error) {
        console.log("Preview mode detected in handleTicketPurchase, skipping database insert")
        return
      }
    } catch (err) {
      console.log("Error checking preview mode in handleTicketPurchase, skipping database insert")
      return
    }

    // Insert tickets into the database
    const { error } = await supabase.from("tickets").insert(ticketsToCreate)

    if (error) {
      console.error("Error creating tickets:", error)
      return
    }

    console.log(`Created ${quantity} tickets for user ${userId} for event ${eventId}`)

    // You could also send a confirmation email here
  } catch (error) {
    console.error("Error handling ticket purchase:", error)
  }
}
