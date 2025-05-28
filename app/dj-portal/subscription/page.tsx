import { getCurrentSubscription, getSubscriptionPlans } from "@/features/payments/actions/subscription-actions"
import { SubscriptionDashboard } from "@/features/payments/components/subscription-dashboard"
import { Button } from "@/ui/button"
import Link from "next/link"
import { getUserFromCookies } from "@/shared/utils/auth-utils"
import { ArrowRight, CreditCard, ShieldCheck } from "lucide-react"

export default async function SubscriptionPage() {
  // Get user from cookies - this should work even if Supabase session is not available
  const user = getUserFromCookies()

  // Try to get subscription data
  const { subscription, error: subError } = await getCurrentSubscription()
  const { plans, error: plansError } = await getSubscriptionPlans()

  // If there's an error but user is logged in, show a general error
  if ((subError || plansError) && user) {
    return (
      <div className="container max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Subscription Management</h1>
        <p className="text-gray-400 mb-8">Manage your DJ subscription and billing</p>

        <div className="bg-red-900/20 border border-red-800/30 text-red-100 px-6 py-5 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Error Loading Subscription</h3>
          <p>We encountered an issue while loading your subscription information. Please try again later.</p>
          {(subError || plansError) !== "Not authenticated" && (
            <p className="text-sm mt-2 text-red-300/70">{subError || plansError}</p>
          )}
        </div>
      </div>
    )
  }

  // If no subscription, show available plans
  if (!subscription) {
    return (
      <div className="container max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Subscription Management</h1>
        <p className="text-gray-400 mb-8">Enhance your DJ experience with a premium subscription</p>

        <div className="bg-gray-800/50 rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-2">No Active Subscription</h2>
          <p className="text-gray-400 mb-6">
            You don't currently have an active subscription. Subscribe to a plan to access premium features and enhance
            your DJ experience.
          </p>

          <div className="grid gap-6 md:grid-cols-3 mb-8">
            {plans.map((plan) => (
              <div key={plan.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700 flex flex-col">
                <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                <p className="text-gray-400 text-sm mb-4">{plan.description}</p>
                <div className="text-2xl font-bold mb-1">
                  ${(plan.price_monthly / 100).toFixed(2)}
                  <span className="text-sm font-normal text-gray-400">/month</span>
                </div>
                <p className="text-gray-400 text-sm mb-4">
                  or ${(plan.price_yearly / 1200).toFixed(2)}/month billed annually
                </p>

                <ul className="space-y-2 mb-6 flex-grow">
                  {plan.features &&
                    Object.entries(plan.features).map(([key, value]) => {
                      if (!value) return null

                      const featureName = key
                        .replace(/_/g, " ")
                        .split(" ")
                        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(" ")

                      let featureText = featureName
                      if (typeof value === "number") {
                        featureText = value === -1 ? `Unlimited ${featureName}` : `${value} ${featureName}`
                      }

                      return (
                        <li key={key} className="flex items-start">
                          <ShieldCheck className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{featureText}</span>
                        </li>
                      )
                    })}
                </ul>

                <Button asChild className="w-full mt-auto">
                  <Link href={`/dj-portal/subscription/plans?selected=${plan.id}`}>
                    Choose {plan.name} <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            ))}
          </div>

          <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-800">
            <div className="flex items-start">
              <CreditCard className="h-6 w-6 text-blue-400 mr-3 mt-1" />
              <div>
                <h3 className="font-semibold mb-1">Flexible Billing Options</h3>
                <p className="text-sm text-gray-400">
                  Choose between monthly or annual billing. Save up to 16% with annual plans.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Find the current plan details
  const currentPlan = plans.find((plan) => plan.id === subscription.plan_id) || subscription.subscription_plans

  return (
    <div className="container max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Subscription Management</h1>
      <p className="text-gray-400 mb-8">Manage your DJ subscription and billing</p>

      <SubscriptionDashboard subscription={subscription} currentPlan={currentPlan} allPlans={plans} />
    </div>
  )
}
