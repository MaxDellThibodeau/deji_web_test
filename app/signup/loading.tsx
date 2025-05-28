import { Skeleton } from "@/ui/skeleton"

export default function SignupLoading() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="flex justify-center mb-8">
          <Skeleton className="h-10 w-40" />
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800/50 backdrop-blur-sm text-white rounded-lg">
          <div className="p-6 space-y-4">
            <div className="space-y-2 flex flex-col items-center">
              <Skeleton className="h-8 w-40" />
              <Skeleton className="h-4 w-60" />
            </div>
            <div className="space-y-6 pt-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-4 w-40 mx-auto" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
