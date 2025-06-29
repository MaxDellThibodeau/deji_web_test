"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/ui/card"
import { Button } from "@/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs"
import { cancelCurrentSubscription, resumeCurrentSubscription } from "@/features/payments/actions/subscription-actions"
import { AlertCircle, CheckCircle, Clock, CreditCard, BarChart, Calendar, Shield, Star, Download } from "lucide-react"
import Link from "next/link"

// Format date to readable format
function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

// Format amount for display
function formatAmountForDisplay(amount: number) {
  const numberFormat = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  })
  return numberFormat.format(amount / 100)
}

// Mask credit card number for security
function maskCardNumber(cardNumber: string) {
  // Only show the last 4 digits
  return `•••• •••• •••• ${cardNumber.slice(-4)}`
}

export function SubscriptionDashboard({ subscription, currentPlan, allPlans }: any) {
  const [isLoading, setIsLoading] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [actionSuccess, setActionSuccess] = useState<string | null>(null)

  // Handle subscription cancellation
  async function handleCancelSubscription() {
    if (
      !confirm(
        "Are you sure you want to cancel your subscription? You'll still have access until the end of your billing period.",
      )
    ) {
      return
    }

    setIsLoading(true)
    setActionError(null)
    setActionSuccess(null)

    try {
      const result = await cancelCurrentSubscription()
      if (result.success) {
        setActionSuccess(
          "Your subscription has been cancelled and will end on " + formatDate(subscription.current_period_end),
        )
      } else {
        setActionError(result.error || "Failed to cancel subscription")
      }
    } catch (error) {
      setActionError("An unexpected error occurred")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle subscription resumption
  async function handleResumeSubscription() {
    setIsLoading(true)
    setActionError(null)
    setActionSuccess(null)

    try {
      const result = await resumeCurrentSubscription()
      if (result.success) {
        setActionSuccess("Your subscription has been resumed successfully")
      } else {
        setActionError(result.error || "Failed to resume subscription")
      }
    } catch (error) {
      setActionError("An unexpected error occurred")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  // Calculate days remaining in subscription
  const currentDate = new Date()
  const endDate = new Date(subscription.current_period_end)
  const daysRemaining = Math.ceil((endDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24))

  // Format price based on billing cycle
  const price = subscription.billing_cycle === "yearly" ? currentPlan?.price_yearly : currentPlan?.price_monthly

  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="billing">Billing</TabsTrigger>
        <TabsTrigger value="usage">Usage</TabsTrigger>
      </TabsList>

      {/* Success/Error Messages */}
      {actionSuccess && (
        <div className="bg-green-900/20 border border-green-800/30 text-green-100 px-4 py-3 rounded mb-4 flex items-center">
          <CheckCircle className="h-5 w-5 mr-2" />
          <p>{actionSuccess}</p>
        </div>
      )}

      {actionError && (
        <div className="bg-red-900/20 border border-red-800/30 text-red-100 px-4 py-3 rounded mb-4 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          <p>{actionError}</p>
        </div>
      )}

      {/* Overview Tab */}
      <TabsContent value="overview">
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>Your active subscription details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-2xl font-bold">{currentPlan?.name || "Unknown Plan"}</h3>
                  <p className="text-gray-400">{currentPlan?.description}</p>
                </div>

                <div className="flex items-baseline">
                  <span className="text-3xl font-bold">{formatAmountForDisplay(price || 0)}</span>
                  <span className="text-gray-400 ml-1">/{subscription.billing_cycle}</span>
                </div>

                <div className="pt-2">
                  <div className="flex items-center text-sm text-gray-400 mb-1">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>
                      Renews{" "}
                      {subscription.cancel_at_period_end
                        ? "Never"
                        : `on ${formatDate(subscription.current_period_end)}`}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-400">
                    <CreditCard className="h-4 w-4 mr-1" />
                    <span>
                      {subscription.cancel_at_period_end
                        ? `Access until ${formatDate(subscription.current_period_end)}`
                        : `${daysRemaining} days remaining in billing cycle`}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              {subscription.cancel_at_period_end ? (
                <Button onClick={handleResumeSubscription} disabled={isLoading}>
                  {isLoading ? "Processing..." : "Resume Subscription"}
                </Button>
              ) : (
                <Button variant="outline" onClick={handleCancelSubscription} disabled={isLoading}>
                  {isLoading ? "Processing..." : "Cancel Subscription"}
                </Button>
              )}
              <Button asChild>
                <Link href="/dj-portal/subscription/plans">Change Plan</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle>Plan Features</CardTitle>
              <CardDescription>What's included in your subscription</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {currentPlan?.features?.events_per_month && (
                  <li className="flex items-start">
                    <Shield className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <span>
                      {currentPlan.features.events_per_month === -1
                        ? "Unlimited events per month"
                        : `${currentPlan.features.events_per_month} events per month`}
                    </span>
                  </li>
                )}
                {currentPlan?.features?.song_requests && (
                  <li className="flex items-start">
                    <Shield className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <span>Song requests and bidding</span>
                  </li>
                )}
                {currentPlan?.features?.analytics_basic && (
                  <li className="flex items-start">
                    <Shield className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <span>Basic analytics and reporting</span>
                  </li>
                )}
                {currentPlan?.features?.custom_branding && (
                  <li className="flex items-start">
                    <Shield className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <span>Custom branding and personalization</span>
                  </li>
                )}
                {currentPlan?.features?.priority_support && (
                  <li className="flex items-start">
                    <Shield className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <span>Priority support</span>
                  </li>
                )}
                {currentPlan?.features?.advanced_analytics && (
                  <li className="flex items-start">
                    <Shield className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <span>Advanced analytics and insights</span>
                  </li>
                )}
              </ul>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      {/* Billing Tab */}
      <TabsContent value="billing">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle>Billing Information</CardTitle>
            <CardDescription>Manage your billing details and payment methods</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Subscription Details</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-gray-400">Plan:</div>
                  <div>{currentPlan?.name}</div>
                  <div className="text-gray-400">Billing Cycle:</div>
                  <div className="capitalize">{subscription.billing_cycle}</div>
                  <div className="text-gray-400">Amount:</div>
                  <div>{formatAmountForDisplay(price || 0)}</div>
                  <div className="text-gray-400">Next Billing Date:</div>
                  <div>
                    {subscription.cancel_at_period_end
                      ? "Cancelled - No further billing"
                      : formatDate(subscription.current_period_end)}
                  </div>
                  <div className="text-gray-400">Status:</div>
                  <div className="capitalize">{subscription.status}</div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Payment Method</h3>
                <div className="flex items-center p-3 border border-gray-700 rounded-md bg-gray-900">
                  <CreditCard className="h-10 w-10 text-gray-400 mr-3" />
                  <div>
                    <div className="font-medium">{maskCardNumber("4242424242424242")}</div>
                    <div className="text-sm text-gray-400">Expires 12/2025</div>
                  </div>
                  <Button variant="ghost" size="sm" className="ml-auto">
                    Update
                  </Button>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Billing History</h3>
                <div className="border border-gray-700 rounded-md divide-y divide-gray-700">
                  <div className="p-3 flex justify-between items-center">
                    <div>
                      <div className="font-medium">
                        {formatDate(new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString())}
                      </div>
                      <div className="text-sm text-gray-400">
                        {currentPlan?.name} - {subscription.billing_cycle}
                      </div>
                    </div>
                    <div className="text-right">
                      <div>{formatAmountForDisplay(price || 0)}</div>
                      <div className="text-sm text-green-500">Paid</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Download Invoices
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>

      {/* Usage Tab */}
      <TabsContent value="usage">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle>Usage & Limits</CardTitle>
            <CardDescription>Track your feature usage and limits</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <h3 className="text-lg font-medium">Events</h3>
                  <span className="text-sm text-gray-400">
                    {currentPlan?.features?.events_per_month === -1
                      ? "Unlimited"
                      : `3 / ${currentPlan?.features?.events_per_month} this month`}
                  </span>
                </div>
                {currentPlan?.features?.events_per_month !== -1 && (
                  <div className="w-full bg-gray-700 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{ width: `${(3 / currentPlan?.features?.events_per_month) * 100}%` }}
                    ></div>
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Feature Usage</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <BarChart className="h-5 w-5 text-gray-400 mr-2" />
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <span>Analytics Views</span>
                        <span className="text-sm text-gray-400">42 this month</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Star className="h-5 w-5 text-gray-400 mr-2" />
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <span>Song Requests</span>
                        <span className="text-sm text-gray-400">18 this month</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <span>Events Created</span>
                        <span className="text-sm text-gray-400">3 this month</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
