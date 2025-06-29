"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { createClient } from "@/shared/services/server"
import { redirect } from "next/navigation"

// Fallback subscription plans in case the database query fails
const FALLBACK_PLANS = [
  {
    id: 1,
    name: "Basic",
    description: "Essential tools for new DJs",
    price_monthly: 999, // $9.99
    price_yearly: 9990, // $99.90 (save ~16%)
    is_active: true,
    features: {
      events_per_month: 5,
      song_requests: true,
      analytics_basic: true,
      custom_branding: false,
      priority_support: false,
      advanced_analytics: false,
    },
    stripe_price_id_monthly: "price_1234basic_monthly",
    stripe_price_id_yearly: "price_1234basic_yearly",
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    name: "Pro",
    description: "Perfect for regular performing DJs",
    price_monthly: 1999, // $19.99
    price_yearly: 19990, // $199.90 (save ~16%)
    is_active: true,
    features: {
      events_per_month: 15,
      song_requests: true,
      analytics_basic: true,
      custom_branding: true,
      priority_support: false,
      advanced_analytics: true,
    },
    stripe_price_id_monthly: "price_1234pro_monthly",
    stripe_price_id_yearly: "price_1234pro_yearly",
    created_at: new Date().toISOString(),
  },
  {
    id: 3,
    name: "Premium",
    description: "For professional DJs and venues",
    price_monthly: 2999, // $29.99
    price_yearly: 29990, // $299.90 (save ~16%)
    is_active: true,
    features: {
      events_per_month: -1, // unlimited
      song_requests: true,
      analytics_basic: true,
      custom_branding: true,
      priority_support: true,
      advanced_analytics: true,
    },
    stripe_price_id_monthly: "price_1234premium_monthly",
    stripe_price_id_yearly: "price_1234premium_yearly",
    created_at: new Date().toISOString(),
  },
]

// Mock subscription for development - with secure payment data handling
const MOCK_SUBSCRIPTION = {
  id: 1,
  profile_id: "user-123",
  plan_id: 2, // Pro plan
  status: "active",
  current_period_start: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
  current_period_end: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days from now
  cancel_at_period_end: false,
  created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(), // 45 days ago
  updated_at: new Date().toISOString(),
  stripe_customer_id: "cus_mock123",
  stripe_subscription_id: "sub_mock123",
  billing_cycle: "monthly",
  subscription_plans: FALLBACK_PLANS[1], // Pro plan
  // Only include last 4 digits of payment method
  payment_method: {
    last4: "4242",
    brand: "visa",
    exp_month: 12,
    exp_year: 2025,
  },
}

// Get the current user's subscription
export async function getCurrentSubscription() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  // Try to get user from session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Also check cookies as fallback
  const getCookie = (name: string) => {
    const cookie = cookieStore.get(name)
    return cookie?.value
  }

  const userId = session?.user?.id || getCookie("user_id")

  if (!userId) {
    return { subscription: null, error: "Not authenticated" }
  }

  try {
    // For demo purposes, return mock subscription
    return { subscription: MOCK_SUBSCRIPTION, error: null }

    // In a real app, you would query the database and sanitize sensitive data:
    /*
    // Check if the user_subscriptions table exists
    const { error: tableCheckError } = await supabase.from("user_subscriptions").select("id").limit(1)

    // If the table doesn't exist or there's an error, return mock data for development
    if (tableCheckError) {
      console.log("Using mock subscription data - table may not exist yet:", tableCheckError.message)
      return { subscription: MOCK_SUBSCRIPTION, error: null }
    }

    // Try to get the real subscription
    const { data, error } = await supabase
      .from("user_subscriptions")
      .select(`
        id,
        profile_id,
        plan_id,
        status,
        current_period_start,
        current_period_end,
        cancel_at_period_end,
        created_at,
        updated_at,
        billing_cycle,
        subscription_plans (*)
      `)
      .eq("profile_id", userId)
      .single()

    if (error) {
      console.log("Error fetching user subscription, using mock data:", error.message)
      return { subscription: MOCK_SUBSCRIPTION, error: null }
    }

    // Get payment method separately and only include safe data
    const { data: paymentMethod, error: paymentError } = await supabase
      .from("payment_methods")
      .select("last4, brand, exp_month, exp_year")
      .eq("profile_id", userId)
      .eq("is_default", true)
      .single()

    // Add sanitized payment method to subscription data
    const subscriptionWithPayment = {
      ...data,
      payment_method: paymentError ? { last4: "4242", brand: "visa", exp_month: 12, exp_year: 2025 } : paymentMethod,
    }

    return { subscription: subscriptionWithPayment, error: null }
    */
  } catch (error) {
    console.error("Exception in getCurrentSubscription:", error)
    return { subscription: MOCK_SUBSCRIPTION, error: null }
  }
}

// Create a checkout session for a new subscription
export async function createCheckoutSession(formData: FormData) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  // Try to get user from session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Also check cookies as fallback
  const getCookie = (name: string) => {
    const cookie = cookieStore.get(name)
    return cookie?.value
  }

  const userId = session?.user?.id || getCookie("user_id")

  if (!userId) {
    return { error: "Not authenticated" }
  }

  const planId = Number(formData.get("planId"))
  const billingCycle = formData.get("billingCycle") as "monthly" | "yearly"

  if (!planId || !billingCycle) {
    return { error: "Missing required fields" }
  }

  try {
    // For now, just redirect to success page since we don't have Stripe set up yet
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
    redirect(`${baseUrl}/dj-portal/subscription/success?session_id=mock_session_id`)
  } catch (error) {
    console.error("Error creating checkout:", error)
    return { error: "Failed to create checkout session" }
  }
}

// Cancel the current subscription
export async function cancelCurrentSubscription() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  // Try to get user from session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Also check cookies as fallback
  const getCookie = (name: string) => {
    const cookie = cookieStore.get(name)
    return cookie?.value
  }

  const userId = session?.user?.id || getCookie("user_id")

  if (!userId) {
    return { success: false, error: "Not authenticated" }
  }

  try {
    // Mock cancellation for now
    revalidatePath("/dj-portal/subscription")
    return { success: true, error: null }
  } catch (error) {
    console.error("Error cancelling subscription:", error)
    return { success: false, error: "Failed to cancel subscription" }
  }
}

// Resume a cancelled subscription
export async function resumeCurrentSubscription() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  // Try to get user from session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Also check cookies as fallback
  const getCookie = (name: string) => {
    const cookie = cookieStore.get(name)
    return cookie?.value
  }

  const userId = session?.user?.id || getCookie("user_id")

  if (!userId) {
    return { success: false, error: "Not authenticated" }
  }

  try {
    // Mock resumption for now
    revalidatePath("/dj-portal/subscription")
    return { success: true, error: null }
  } catch (error) {
    console.error("Error resuming subscription:", error)
    return { success: false, error: "Failed to resume subscription" }
  }
}

// Get all available subscription plans
export async function getSubscriptionPlans() {
  try {
    // For demo purposes, return fallback plans
    return { plans: FALLBACK_PLANS, error: null }

    // In a real app, you would query the database:
    /*
    const supabase = createClient(cookies())

    // Check if the subscription_plans table exists
    const { error: tableCheckError } = await supabase.from("subscription_plans").select("id").limit(1)

    // If the table doesn't exist or there's an error, return fallback data
    if (tableCheckError) {
      console.log("Using fallback plans - table may not exist yet:", tableCheckError.message)
      return { plans: FALLBACK_PLANS, error: null }
    }

    // Try to get the real plans
    const { data, error } = await supabase
      .from("subscription_plans")
      .select("*")
      .eq("is_active", true)
      .order("price_monthly", { ascending: true })

    if (error) {
      console.log("Error fetching plans, using fallback data:", error.message)
      return { plans: FALLBACK_PLANS, error: null }
    }

    return { plans: data.length > 0 ? data : FALLBACK_PLANS, error: null }
    */
  } catch (error) {
    console.error("Exception in getSubscriptionPlans:", error)
    return { plans: FALLBACK_PLANS, error: null }
  }
}
