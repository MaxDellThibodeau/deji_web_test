import { Card, CardContent, CardFooter } from "@/ui/card"

export default function Loading() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="h-10 w-48 bg-gray-200 rounded animate-pulse mb-6" />

      <div className="h-10 w-64 bg-gray-200 rounded animate-pulse mb-6" />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="overflow-hidden">
            <div className="h-24 bg-gray-200 animate-pulse" />
            <CardContent className="p-4 pt-6">
              <div className="flex flex-col gap-4">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="flex items-start gap-2">
                    <div className="h-5 w-5 bg-gray-200 rounded animate-pulse" />
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-24 mb-2 animate-pulse" />
                      <div className="h-3 bg-gray-200 rounded w-full animate-pulse" />
                    </div>
                  </div>
                ))}
                <div className="border-t pt-4 mt-2">
                  <div className="h-3 bg-gray-200 rounded w-full animate-pulse" />
                </div>
                <div className="flex justify-center mt-2">
                  <div className="h-36 w-36 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex gap-2 p-4 pt-0">
              <div className="h-9 bg-gray-200 rounded w-full animate-pulse" />
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
