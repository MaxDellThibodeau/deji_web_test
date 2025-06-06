import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { stripe } from "@/features/payments/services/stripe"
import { createClient } from "@/shared/services/server"

// This is your Stripe webhook secret for testing your endpoint locally.
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET

export async function POST(req: Request) {
  const body = await req.text()
  const headersList = await headers()
  const signature = headersList.get("stripe-signature") as string

  let event

  try {
    event = stripe.webhooks.constructEvent(body, signature, endpointSecret || "")
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error"
    console.log(`⚠️  Webhook signature verification failed: ${errorMessage}`)
    return NextResponse.json({ error: `Webhook Error: ${errorMessage}` }, { status: 400 })
  }

  const supabase = createClient()

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed":
      const checkoutSession = event.data.object

      // Extract metadata
      const { userId, planId, billingCycle } = checkoutSession.metadata || {}

      if (userId && planId) {
        // Check if user already has a subscription
        const { data: existingSubscription } = await supabase
          .from("user_subscriptions")
          .select("*")
          .eq("profile_id", userId)
          .single()

        // Get subscription details from Stripe
        const subscription = await stripe.subscriptions.retrieve(checkoutSession.subscription as string)

        const subscriptionData = {
          profile_id: userId,
          plan_id: Number.parseInt(planId),
          stripe_customer_id: checkoutSession.customer as string,
          stripe_subscription_id: checkoutSession.subscription as string,
          status: subscription.status,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          cancel_at_period_end: subscription.cancel_at_period_end,
          billing_cycle: billingCycle || "monthly",
          updated_at: new Date().toISOString(),
        }

        if (existingSubscription) {
          // Update existing subscription
          await supabase.from("user_subscriptions").update(subscriptionData).eq("profile_id", userId)
        } else {
          // Create new subscription
          await supabase.from("user_subscriptions").insert({
            ...subscriptionData,
            created_at: new Date().toISOString(),
          })
        }
      }
      break

    case "invoice.payment_succeeded":
      // Update subscription status and period
      const invoice = event.data.object

      if (invoice.subscription) {
        const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string)

        // Find the user subscription
        const { data: userSubscription } = await supabase
          .from("user_subscriptions")
          .select("*")
          .eq("stripe_subscription_id", invoice.subscription)
          .single()

        if (userSubscription) {
          await supabase
            .from("user_subscriptions")
            .update({
              status: subscription.status,
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq("stripe_subscription_id", invoice.subscription)
        }
      }
      break

    case "customer.subscription.updated":
      const updatedSubscription = event.data.object

      // Update subscription in database
      await supabase
        .from("user_subscriptions")
        .update({
          status: updatedSubscription.status,
          cancel_at_period_end: updatedSubscription.cancel_at_period_end,
          current_period_end: new Date(updatedSubscription.current_period_end * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("stripe_subscription_id", updatedSubscription.id)
      break

    case "customer.subscription.deleted":
      const deletedSubscription = event.data.object

      // Update subscription status to cancelled
      await supabase
        .from("user_subscriptions")
        .update({
          status: "cancelled",
          updated_at: new Date().toISOString(),
        })
        .eq("stripe_subscription_id", deletedSubscription.id)
      break

    default:
      console.log(`Unhandled event type: ${event.type}`)
  }

  // Return a 200 response to acknowledge receipt of the event
  return NextResponse.json({ received: true })
}
