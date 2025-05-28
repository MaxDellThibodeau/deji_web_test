import { Skeleton } from "@/ui/skeleton"
import { Button } from "@/ui/button"
import { ArrowLeft } from "lucide-react"

export default function EventSongsLoading() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" className="hover:bg-zinc-800" disabled>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Event
          </Button>
        </div>

        <div className="mb-8">
          <Skeleton className="h-10 w-2/3 bg-zinc-800" />
          <Skeleton className="h-5 w-full mt-2 bg-zinc-800" />
        </div>

        <div className="space-y-4">
          {Array(5)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="bg-zinc-900 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Skeleton className="h-10 w-10 rounded-md bg-zinc-800" />
                    <div className="ml-3">
                      <Skeleton className="h-5 w-40 bg-zinc-800" />
                      <Skeleton className="h-4 w-24 mt-1 bg-zinc-800" />
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Skeleton className="h-8 w-20 rounded-md bg-zinc-800 mr-2" />
                    <Skeleton className="h-8 w-16 rounded-md bg-zinc-800" />
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}
