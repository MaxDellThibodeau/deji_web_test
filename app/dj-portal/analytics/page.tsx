import { RoiVisualization } from "@/shared/components/common/roi-visualization"
import { SubscriptionAnalytics } from "@/features/payments/components/subscription-analytics"

export default function AnalyticsPage() {
  return (
    <div className="space-y-12 pb-8">
      <div>
        <h1 className="text-3xl font-bold mb-6">Analytics</h1>
        <div className="mb-8">
          <RoiVisualization />
        </div>
      </div>

      <div>
        <SubscriptionAnalytics />
      </div>
    </div>
  )
}
