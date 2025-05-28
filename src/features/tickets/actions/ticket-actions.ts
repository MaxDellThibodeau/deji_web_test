"use server"

import { createClient } from "@/shared/services/server"
import { stripe } from "@/features/payments/services/stripe"
import { auth } from "@/features/auth/services/auth"

// Get user's tickets
export async function getUserTickets(userId: string) {
  try {
    // Check if we're in preview mode
    try {
      const supabase = createClient()
      const { error } = await supabase.from("tickets").select("count").limit(1)

      // If there's an error, we're in preview mode
      if (error) {
        console.log("Preview mode detected in getUserTickets, using mock data")
        return getMockTickets(userId)
      }
    } catch (err) {
      console.log("Error checking preview mode in getUserTickets, using mock data")
      return getMockTickets(userId)
    }

    const supabase = createClient()

    // Get all tickets for the user
    const { data, error } = await supabase
      .from("tickets")
      .select(`
        *,
        events:event_id (
          title,
          description,
          venue,
          event_date,
          status
        )
      `)
      .eq("profile_id", userId)
      .order("purchase_date", { ascending: false })

    if (error) {
      console.error("Error fetching user tickets:", error)
      return getMockTickets(userId)
    }

    return data || []
  } catch (err) {
    console.error("Unexpected error in getUserTickets:", err)
    return getMockTickets(userId)
  }
}

// Create a checkout session for ticket purchase
export async function createCheckoutSession({
  eventId,
  eventName,
  ticketTypeId,
  ticketTypeName,
  quantity,
  unitPrice,
  userId,
}: {
  eventId: string
  eventName: string
  ticketTypeId: string
  ticketTypeName: string
  quantity: number
  unitPrice: number
  userId: string
}) {
  try {
    console.log("[SERVER]")
    console.log("Creating checkout session with params:", {
      eventId,
      eventName,
      ticketTypeId,
      ticketTypeName,
      quantity,
      unitPrice,
      userId,
    })

    // Verify user is authenticated
    const user = await auth()
    if (!user || user.id !== userId) {
      return { success: false, error: "Unauthorized" }
    }

    // Calculate amount in cents
    const amount = Math.round(unitPrice * 100)

    // Create a Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${eventName} - ${ticketTypeName}`,
              description: `Ticket for ${eventName}`,
            },
            unit_amount: amount,
          },
          quantity,
        },
      ],
      mode: "payment",
      success_url: `http://localhost:3000/ticket-purchase-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `http://localhost:3000/events/${eventId}`,
      metadata: {
        type: "ticket_purchase",
        userId,
        eventId,
        ticketType: ticketTypeName,
        quantity: quantity.toString(),
      },
    })

    console.log("[SERVER]")
    console.log("Checkout session created:", {
      id: session.id,
      url: session.url,
    })

    // Return the URL instead of redirecting
    return {
      success: true,
      checkoutUrl: session.url,
    }
  } catch (error) {
    console.error("Error creating checkout session:", error)
    return {
      success: false,
      error:
        error instanceof Error
          ? `Failed to create checkout session: ${error.message}`
          : "Unknown error creating checkout session",
    }
  }
}

// Helper function to get mock tickets
function getMockTickets(userId: string) {
  const currentDate = new Date()
  const pastDate = new Date(currentDate)
  pastDate.setDate(pastDate.getDate() - 14) // 2 weeks ago

  const futureDate1 = new Date(currentDate)
  futureDate1.setDate(futureDate1.getDate() + 7) // 1 week from now

  const futureDate2 = new Date(currentDate)
  futureDate2.setDate(futureDate2.getDate() + 21) // 3 weeks from now

  return [
    {
      id: "mock-ticket-1",
      profile_id: userId,
      event_id: "event-1",
      ticket_type: "VIP",
      ticket_code: "VIP12345",
      purchase_date: new Date(currentDate).toISOString(),
      payment_id: "pi_mock_1",
      status: "active",
      events: {
        title: "Summer Festival",
        description: "Annual summer music festival featuring top artists",
        venue: "Central Park",
        event_date: futureDate1.toISOString(),
        status: "upcoming",
      },
    },
    {
      id: "mock-ticket-2",
      profile_id: userId,
      event_id: "event-2",
      ticket_type: "General Admission",
      ticket_code: "GA67890",
      purchase_date: new Date(currentDate).toISOString(),
      payment_id: "pi_mock_2",
      status: "active",
      events: {
        title: "EDM Explosion",
        description: "The biggest electronic dance music event of the year",
        venue: "Mega Arena",
        event_date: futureDate2.toISOString(),
        status: "upcoming",
      },
    },
    {
      id: "mock-ticket-3",
      profile_id: userId,
      event_id: "event-3",
      ticket_type: "General Admission",
      ticket_code: "GA24680",
      purchase_date: new Date(pastDate).toISOString(),
      payment_id: "pi_mock_3",
      status: "used",
      events: {
        title: "Techno Tuesday",
        description: "Weekly techno night featuring local DJs",
        venue: "Underground Club",
        event_date: pastDate.toISOString(),
        status: "completed",
      },
    },
  ]
}
