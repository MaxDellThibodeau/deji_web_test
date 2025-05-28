import { Skeleton } from "@/ui/skeleton"

export default function MyBidsLoading() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-10 w-48 bg-zinc-800 mb-6" />

        <div className="space-y-4">
          {Array(5)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="bg-zinc-900 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Skeleton className="h-6 w-40 bg-zinc-800" />
                    <Skeleton className="h-4 w-32 mt-1 bg-zinc-800" />
                    <Skeleton className="h-4 w-24 mt-1 bg-zinc-800" />
                  </div>
                  <Skeleton className="h-8 w-20 rounded-md bg-zinc-800" />
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}
