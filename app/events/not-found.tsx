import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/ui/button"
import { PublicHeader } from "@/shared/components/layout/public-header"

export default function EventNotFound() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <PublicHeader currentPath="/events" />
      <div className="flex-1 flex items-center justify-center pt-16">
        <div className="text-center max-w-md px-4">
          <h1 className="text-3xl font-bold mb-4">Event Not Found</h1>
          <p className="text-zinc-400 mb-8">The event you're looking for doesn't exist or has been removed.</p>
          <Link href="/events">
            <Button className="bg-gradient-to-r from-purple-600 to-blue-500">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Events
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
