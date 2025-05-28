import { Button } from "@/ui/button"
import { CheckCircle } from "lucide-react"
import Link from "next/link"

export default function SubscriptionSuccessPage() {
  return (
    <div className="container max-w-5xl mx-auto px-4 py-12">
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 text-center max-w-2xl mx-auto">
        <div className="flex justify-center mb-6">
          <div className="rounded-full bg-green-900/20 p-3">
            <CheckCircle className="h-12 w-12 text-green-500" />
          </div>
        </div>

        <h1 className="text-3xl font-bold mb-4">Subscription Activated!</h1>
        <p className="text-gray-400 mb-8 max-w-md mx-auto">
          Your subscription has been successfully activated. You now have access to all the premium features included in
          your plan.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/dj-portal/subscription">Manage Subscription</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/dj-portal/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
