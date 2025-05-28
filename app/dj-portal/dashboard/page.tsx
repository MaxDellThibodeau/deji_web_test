import Link from "next/link"
import { Button } from "@/ui/button"
import { Calendar, Music, DollarSign, ArrowRight, CreditCard, BarChart3 } from "lucide-react"
import { getCurrentSubscription } from "@/features/payments/actions/subscription-actions"

export default async function DJDashboardPage() {
  // Get the current subscription to show status
  const { subscription } = await getCurrentSubscription()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="bg-gray-800/50 rounded-lg p-6 flex flex-col">
          <div className="rounded-full bg-purple-900/50 w-12 h-12 flex items-center justify-center mb-4">
            <Calendar className="h-6 w-6 text-purple-400" />
          </div>
          <h2 className="text-xl font-bold mb-2">Manage Schedule</h2>
          <p className="text-gray-400 mb-4 flex-grow">Update your availability and gigs</p>
          <Button asChild variant="outline" className="w-full">
            <Link href="/dj-portal/schedule">View Calendar</Link>
          </Button>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-6 flex flex-col">
          <div className="rounded-full bg-blue-900/50 w-12 h-12 flex items-center justify-center mb-4">
            <Music className="h-6 w-6 text-blue-400" />
          </div>
          <h2 className="text-xl font-bold mb-2">Music Library</h2>
          <p className="text-gray-400 mb-4 flex-grow">Manage your tracks and playlists</p>
          <Button asChild variant="outline" className="w-full">
            <Link href="/dj-portal/library">Open Library</Link>
          </Button>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-6 flex flex-col">
          <div className="rounded-full bg-green-900/50 w-12 h-12 flex items-center justify-center mb-4">
            <DollarSign className="h-6 w-6 text-green-400" />
          </div>
          <h2 className="text-xl font-bold mb-2">Earnings</h2>
          <p className="text-gray-400 mb-4 flex-grow">Track your revenue and payments</p>
          <Button asChild variant="outline" className="w-full">
            <Link href="/dj-portal/earnings">View Earnings</Link>
          </Button>
        </div>

        {/* New Analytics Card */}
        <div className="bg-gray-800/50 rounded-lg p-6 flex flex-col">
          <div className="rounded-full bg-indigo-900/50 w-12 h-12 flex items-center justify-center mb-4">
            <BarChart3 className="h-6 w-6 text-indigo-400" />
          </div>
          <h2 className="text-xl font-bold mb-2">Analytics</h2>
          <p className="text-gray-400 mb-4 flex-grow">View performance and ROI metrics</p>
          <Button asChild variant="outline" className="w-full">
            <Link href="/dj-portal/analytics">View Analytics</Link>
          </Button>
        </div>
      </div>

      {/* Subscription Card */}
      <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-lg p-6 mb-8 border border-blue-800/30">
        <div className="flex items-start">
          <div className="rounded-full bg-blue-900/50 w-12 h-12 flex items-center justify-center mr-4">
            <CreditCard className="h-6 w-6 text-blue-400" />
          </div>
          <div className="flex-grow">
            <h2 className="text-xl font-bold mb-1">
              {subscription ? `${subscription.subscription_plans.name} Plan` : "No Active Subscription"}
            </h2>
            <p className="text-gray-400 mb-4">
              {subscription
                ? `Your subscription renews on ${new Date(subscription.current_period_end).toLocaleDateString()}`
                : "Upgrade to access premium features"}
            </p>
            <div className="flex space-x-4">
              <Button asChild>
                <Link href="/dj-portal/subscription">
                  {subscription ? "Manage Subscription" : "Get Started"} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              {subscription && (
                <Button asChild variant="outline">
                  <Link href="/dj-portal/subscription/plans">Upgrade Plan</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold flex items-center mb-4">
        <Calendar className="mr-2 h-6 w-6 text-purple-400" />
        Upcoming Gigs
      </h2>
      <p className="text-gray-400 mb-6">Your scheduled performances</p>

      {/* Gigs would go here */}
      <div className="space-y-4 mb-8">
        <div className="bg-gray-800/50 rounded-lg overflow-hidden">
          <div className="flex">
            <div className="w-24 h-24 bg-purple-900 flex-shrink-0">
              <img src="/placeholder-q8kwb.png" alt="Techno Tuesday" className="w-full h-full object-cover" />
            </div>
            <div className="p-4 flex-grow flex justify-between items-center">
              <div>
                <h3 className="font-bold">Techno Tuesday</h3>
                <p className="text-sm text-gray-400">Mon, May 19 • Underground Club</p>
                <p className="text-green-400">$500</p>
              </div>
              <div className="text-green-400 text-sm font-medium bg-green-900/20 px-3 py-1 rounded-full">Confirmed</div>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-lg overflow-hidden">
          <div className="flex">
            <div className="w-24 h-24 bg-purple-900 flex-shrink-0">
              <img src="/placeholder-arjw2.png" alt="Weekend Party" className="w-full h-full object-cover" />
            </div>
            <div className="p-4 flex-grow flex justify-between items-center">
              <div>
                <h3 className="font-bold">Weekend Party</h3>
                <p className="text-sm text-gray-400">Sat, May 24 • Skyline Lounge</p>
                <p className="text-green-400">$750</p>
              </div>
              <div className="text-yellow-400 text-sm font-medium bg-yellow-900/20 px-3 py-1 rounded-full">Pending</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button asChild variant="outline" size="sm">
          <Link href="/dj-portal/schedule">
            View All Gigs <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  )
}
