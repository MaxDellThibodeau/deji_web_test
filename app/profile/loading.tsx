import { Skeleton } from "@/ui/skeleton"

export default function ProfileLoading() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <Skeleton className="h-10 w-48 mb-2" />
            <Skeleton className="h-5 w-64" />
          </div>
          <div className="flex items-center space-x-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>

        <div className="w-full">
          <Skeleton className="h-10 w-96 mb-6" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-lg overflow-hidden">
                <div className="p-6">
                  <Skeleton className="h-7 w-48 mb-6" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-24 mb-2" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-24 mb-2" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-24 mb-2" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-24 mb-2" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  </div>

                  <div className="space-y-2 mb-6">
                    <Skeleton className="h-5 w-24 mb-2" />
                    <Skeleton className="h-32 w-full" />
                  </div>

                  <div className="space-y-2">
                    <Skeleton className="h-5 w-24 mb-2" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-lg overflow-hidden">
                <div className="p-6">
                  <Skeleton className="h-7 w-36 mb-6" />
                  <div className="flex flex-col items-center">
                    <Skeleton className="h-40 w-40 rounded-full mb-4" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
              </div>

              <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-lg overflow-hidden">
                <div className="p-6">
                  <Skeleton className="h-7 w-48 mb-6" />
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div>
                        <Skeleton className="h-4 w-24 mb-1" />
                        <Skeleton className="h-5 w-32" />
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div>
                        <Skeleton className="h-4 w-24 mb-1" />
                        <Skeleton className="h-5 w-32" />
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div>
                        <Skeleton className="h-4 w-24 mb-1" />
                        <Skeleton className="h-5 w-32" />
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 pt-6 border-t border-zinc-800">
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
