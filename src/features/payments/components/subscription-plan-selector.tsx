"use client"

import { useState } from "react"
import { Check, X } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/radio-group"
import { Label } from "@/shared/components/ui/label"
import { formatAmountForDisplay } from "@/features/payments/services/stripe"
import { createCheckoutSession } from "@/features/payments/actions/subscription-actions"
import { type SubscriptionPlan, type SubscriptionPlanSelectorProps } from '../types'

export function SubscriptionPlanSelector({ plans, currentPlanId }: SubscriptionPlanSelectorProps) {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly")
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubscribe = async (planId: number) => {
    setIsLoading(true)

    const formData = new FormData()
    formData.append("planId", planId.toString())
    formData.append("billingCycle", billingCycle)

    await createCheckoutSession(formData)

    setIsLoading(false)
  }

  // Feature display mapping
  const featureLabels: Record<string, string> = {
    max_events: "Events per month",
    song_library: "Song library size",
    analytics: "Advanced analytics",
    custom_branding: "Custom branding",
    priority_support: "Priority support",
    ai_recommendations: "AI song recommendations",
  }

  // Get all unique features across all plans
  const allFeatures = Array.from(new Set(plans.flatMap((plan) => Object.keys(plan.features))))

  return (
    <div className="space-y-8">
      {/* Billing cycle selector */}
      <div className="flex justify-center mb-8">
        <RadioGroup
          value={billingCycle}
          onValueChange={(value) => setBillingCycle(value as "monthly" | "yearly")}
          className="flex bg-gray-100 p-1 rounded-lg"
        >
          <div className="flex items-center space-x-2 relative">
            <RadioGroupItem value="monthly" id="monthly" className="peer sr-only" />
            <Label
              htmlFor="monthly"
              className={`px-4 py-2 rounded-md cursor-pointer ${
                billingCycle === "monthly" ? "bg-white shadow-sm text-black" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Monthly
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <RadioGroupItem value="yearly" id="yearly" className="peer sr-only" />
            <Label
              htmlFor="yearly"
              className={`px-4 py-2 rounded-md cursor-pointer flex items-center ${
                billingCycle === "yearly" ? "bg-white shadow-sm text-black" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Yearly
              <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">Save 20%</span>
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => {
          const price = billingCycle === "monthly" ? plan.price_monthly : plan.price_yearly
          const isCurrentPlan = currentPlanId === plan.id

          return (
            <Card
              key={plan.id}
              className={`border-2 ${plan.name === "Pro" ? "border-purple-500 shadow-lg" : "border-gray-200"}`}
            >
              {plan.name === "Pro" && (
                <div className="bg-purple-500 text-white text-center py-1 text-sm font-medium">MOST POPULAR</div>
              )}

              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="mt-2">
                  <span className="text-3xl font-bold">{formatAmountForDisplay(price)}</span>
                  <span className="text-gray-500">/{billingCycle === "monthly" ? "month" : "year"}</span>
                </div>
                <p className="text-gray-500 mt-2">{plan.description}</p>
              </CardHeader>

              <CardContent>
                <ul className="space-y-3">
                  {allFeatures.map((featureKey) => {
                    const featureValue = plan.features[featureKey]
                    const isIncluded = featureValue !== false

                    let featureText = featureLabels[featureKey] || featureKey

                    // Add quantity if applicable
                    if (typeof featureValue === "number") {
                      if (featureValue === -1) {
                        featureText = `${featureText}: Unlimited`
                      } else {
                        featureText = `${featureText}: ${featureValue}`
                      }
                    }

                    return (
                      <li key={featureKey} className="flex items-start">
                        <span className="mr-2 mt-1">
                          {isIncluded ? (
                            <Check className="h-5 w-5 text-green-500" />
                          ) : (
                            <X className="h-5 w-5 text-gray-300" />
                          )}
                        </span>
                        <span className={isIncluded ? "" : "text-gray-400"}>{featureText}</span>
                      </li>
                    )
                  })}
                </ul>
              </CardContent>

              <CardFooter>
                <Button
                  className="w-full"
                  variant={plan.name === "Pro" ? "default" : "outline"}
                  disabled={isCurrentPlan || isLoading}
                  onClick={() => handleSubscribe(plan.id)}
                >
                  {isLoading && selectedPlanId === plan.id ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Processing...
                    </div>
                  ) : isCurrentPlan ? (
                    "Current Plan"
                  ) : (
                    `Subscribe to ${plan.name}`
                  )}
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>

      <div className="text-center text-sm text-gray-500 mt-8">
        All plans include a 14-day free trial. No credit card required to start.
        <br />
        You can cancel your subscription at any time.
      </div>
    </div>
  )
}
