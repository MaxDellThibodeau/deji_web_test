import { Skeleton } from "@/ui/skeleton"
import { Card, CardContent } from "@/ui/card"

export default function TicketDetailLoading() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Skeleton className="h-6 w-32" />
      </div>

      <Card className="bg-zinc-900/50 border-zinc-800/50 overflow-hidden">
        <CardContent className="p-0">
          <Skeleton className="w-full h-48 md:h-64" />

          <div className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <div className="w-full md:w-2/3">
                <Skeleton className="h-10 w-3/4 mb-4" />
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </div>
              <div className="mt-4 md:mt-0">
                <Skeleton className="h-6 w-24" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <Skeleton className="h-8 w-48 mb-4" />
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i}>
                      <Skeleton className="h-4 w-24 mb-1" />
                      <Skeleton className="h-6 w-40" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col items-center justify-center">
                <Skeleton className="h-8 w-48 mb-4" />
                <Skeleton className="w-48 h-48 mb-4" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>

            <div className="flex flex-col md:flex-row justify-center gap-4">
              <Skeleton className="h-10 w-full md:w-40" />
              <Skeleton className="h-10 w-full md:w-40" />
              <Skeleton className="h-10 w-full md:w-40" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
