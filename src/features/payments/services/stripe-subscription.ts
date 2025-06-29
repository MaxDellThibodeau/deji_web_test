import Stripe from "stripe"
import { createClient } from "@/shared/services/server"
import { cookies } from "next/headers"

// Initialize Stripe
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16",
})

// Format amount for Stripe (cents)
export const formatAmountForStripe = (amount: number) => {
  return amount
}

// Format amount for display ($X.XX)
export const formatAmountForDisplay = (amount: number) => {
  const numberFormat = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  })
  return numberFormat.format(amount / 100)
}

// Get subscription plan details
export async function getSubscriptionPlans() {
  const supabase = createClient(cookies())

  const { data, error } = await supabase
    .from("subscription_plans")
    .select("*")
    .order("price_monthly", { ascending: true })

  if (error) {
    console.error("Error fetching subscription plans:", error)
    throw new Error("Failed to fetch subscription plans")
  }

  return data
}

// Get user subscription
export async function getUserSubscription(userId: string) {
  const supabase = createClient(cookies())

  const { data, error } = await supabase
    .from("user_subscriptions")
    .select(`
      *,
      subscription_plans (*)
    `)
    .eq("profile_id", userId)
    .single()

  if (error && error.code !== "PGRST116") {
    console.error("Error fetching user subscription:", error)
    throw new Error("Failed to fetch user subscription")
  }

  return data
}

// Create a Stripe checkout session for subscription
export async function createSubscriptionCheckout({
  userId,
  planId,
  billingCycle,
  successUrl,
  cancelUrl,
}: {
  userId: string
  planId: number
  billingCycle: "monthly" | "yearly"
  successUrl: string
  cancelUrl: string
}) {
  const supabase = createClient(cookies())

  // Get the plan details
  const { data: plan, error: planError } = await supabase
    .from("subscription_plans")
    .select("*")
    .eq("id", planId)
    .single()

  if (planError) {
    console.error("Error fetching plan:", planError)
    throw new Error("Failed to fetch subscription plan")
  }

  // Get user details
  const { data: profile, error: profileError } = await supabase.from("profiles").select("*").eq("id", userId).single()

  if (profileError) {
    console.error("Error fetching profile:", profileError)
    throw new Error("Failed to fetch user profile")
  }

  // Get existing subscription if any
  const { data: existingSubscription } = await supabase
    .from("user_subscriptions")
    .select("stripe_customer_id")
    .eq("profile_id", userId)
    .single()

  let customerId = existingSubscription?.stripe_customer_id

  // Create a customer if one doesn't exist
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: profile.email,
      name: profile.name,
      metadata: {
        userId: userId,
      },
    })
    customerId = customer.id
  }

  // Determine which price ID to use
  const priceId = billingCycle === "monthly" ? plan.stripe_price_id_monthly : plan.stripe_price_id_yearly

  // Create the checkout session
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: "subscription",
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId,
      planId: planId.toString(),
      billingCycle,
    },
  })

  return { url: session.url }
}

// Cancel a subscription
export async function cancelSubscription(userId: string) {
  const supabase = createClient(cookies())

  // Get the subscription
  const { data: subscription, error } = await supabase
    .from("user_subscriptions")
    .select("stripe_subscription_id")
    .eq("profile_id", userId)
    .single()

  if (error) {
    console.error("Error fetching subscription:", error)
    throw new Error("Failed to fetch subscription")
  }

  if (!subscription?.stripe_subscription_id) {
    throw new Error("No active subscription found")
  }

  // Cancel at period end
  await stripe.subscriptions.update(subscription.stripe_subscription_id, {
    cancel_at_period_end: true,
  })

  // Update the database
  await supabase
    .from("user_subscriptions")
    .update({
      cancel_at_period_end: true,
      updated_at: new Date().toISOString(),
    })
    .eq("profile_id", userId)

  return { success: true }
}

// Resume a subscription
export async function resumeSubscription(userId: string) {
  const supabase = createClient(cookies())

  // Get the subscription
  const { data: subscription, error } = await supabase
    .from("user_subscriptions")
    .select("stripe_subscription_id")
    .eq("profile_id", userId)
    .single()

  if (error) {
    console.error("Error fetching subscription:", error)
    throw new Error("Failed to fetch subscription")
  }

  if (!subscription?.stripe_subscription_id) {
    throw new Error("No active subscription found")
  }

  // Resume subscription
  await stripe.subscriptions.update(subscription.stripe_subscription_id, {
    cancel_at_period_end: false,
  })

  // Update the database
  await supabase
    .from("user_subscriptions")
    .update({
      cancel_at_period_end: false,
      updated_at: new Date().toISOString(),
    })
    .eq("profile_id", userId)

  return { success: true }
}

// Check if a user has access to a feature
export async function hasFeatureAccess(userId: string, featureName: string) {
  const subscription = await getUserSubscription(userId)

  if (!subscription || subscription.status !== "active") {
    return false
  }

  const features = subscription.subscription_plans.features
  return !!features[featureName]
}

// Track feature usage
export async function trackFeatureUsage(userId: string, featureName: string) {
  const supabase = createClient(cookies())

  // Check if the feature exists
  const { data, error } = await supabase
    .from("subscription_feature_usage")
    .select("*")
    .eq("profile_id", userId)
    .eq("feature_name", featureName)
    .single()

  if (error && error.code !== "PGRST116") {
    console.error("Error tracking feature usage:", error)
    throw new Error("Failed to track feature usage")
  }

  if (data) {
    // Update existing record
    await supabase
      .from("subscription_feature_usage")
      .update({
        usage_count: data.usage_count + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.id)
  } else {
    // Create new record
    await supabase.from("subscription_feature_usage").insert({
      profile_id: userId,
      feature_name: featureName,
      usage_count: 1,
      reset_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    })
  }

  return { success: true }
}
