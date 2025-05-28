import { AppLayout } from "@/ui/sidebar"
import { Skeleton } from "@/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card"
import { RefreshCw } from "lucide-react"

export default function RewardsLoading() {
  return (
    <AppLayout>
      <div className="container mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold mb-6">Rewards</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="bg-zinc-900 border-zinc-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">
                  <Skeleton className="h-6 w-32" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Skeleton className="h-5 w-5 mr-2 rounded-full" />
                  <Skeleton className="h-8 w-32" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold mb-4">Your Challenges</h2>

          <div className="flex justify-center items-center py-12">
            <RefreshCw className="h-8 w-8 text-purple-500 animate-spin" />
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
