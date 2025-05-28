import { getSubscriptionPlans } from "@/features/payments/actions/subscription-actions"
import { Button } from "@/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/ui/card"
import { CheckCircle, Shield, ArrowRight } from "lucide-react"

export default async function SubscriptionPlansPage({ searchParams }: { searchParams: { selected?: string } }) {
  const { plans, error } = await getSubscriptionPlans()
  const selectedPlanId = searchParams.selected ? Number.parseInt(searchParams.selected) : null

  if (error) {
    return (
      <div className="container max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Subscription Plans</h1>
        <p className="text-gray-400 mb-8">Choose the right plan for your DJ career</p>

        <div className="bg-red-900/20 border border-red-800/30 text-red-100 px-6 py-5 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Error Loading Plans</h3>
          <p>We encountered an issue while loading subscription plans. Please try again later.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Subscription Plans</h1>
      <p className="text-gray-400 mb-8">Choose the right plan for your DJ career</p>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        {plans.map((plan) => {
          const isSelected = selectedPlanId === plan.id

          return (
            <Card key={plan.id} className={`bg-gray-800 border-gray-700 ${isSelected ? "ring-2 ring-blue-500" : ""}`}>
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <div className="text-3xl font-bold">
                    ${(plan.price_monthly / 100).toFixed(2)}
                    <span className="text-sm font-normal text-gray-400">/month</span>
                  </div>
                  <p className="text-gray-400 text-sm">
                    or ${(plan.price_yearly / 1200).toFixed(2)}/month billed annually
                  </p>
                </div>

                <ul className="space-y-2 mb-6">
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
                          <Shield className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{featureText}</span>
                        </li>
                      )
                    })}
                </ul>
              </CardContent>
              <CardFooter>
                <form action="/api/create-subscription" method="POST" className="w-full">
                  <input type="hidden" name="planId" value={plan.id} />
                  <Button type="submit" className="w-full" variant={isSelected ? "default" : "outline"}>
                    {isSelected ? (
                      <>
                        Subscribe Now <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    ) : (
                      "Select Plan"
                    )}
                  </Button>
                </form>
              </CardFooter>
            </Card>
          )
        })}
      </div>

      <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-800">
        <h3 className="text-xl font-semibold mb-4">All Plans Include</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex items-start">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
            <div>
              <h4 className="font-medium">Song Request System</h4>
              <p className="text-sm text-gray-400">Let attendees request and bid on songs</p>
            </div>
          </div>
          <div className="flex items-start">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
            <div>
              <h4 className="font-medium">Event Management</h4>
              <p className="text-sm text-gray-400">Create and manage your DJ events</p>
            </div>
          </div>
          <div className="flex items-start">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
            <div>
              <h4 className="font-medium">Basic Analytics</h4>
              <p className="text-sm text-gray-400">Track your performance and audience</p>
            </div>
          </div>
          <div className="flex items-start">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
            <div>
              <h4 className="font-medium">Mobile App Access</h4>
              <p className="text-sm text-gray-400">Manage your events on the go</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
