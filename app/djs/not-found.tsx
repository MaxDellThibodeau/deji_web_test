import Link from "next/link"
import { ArrowLeft, Headphones } from "lucide-react"
import { Button } from "@/ui/button"

export default function DJNotFound() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      <div className="bg-zinc-900/70 border border-zinc-800/50 rounded-lg p-12 text-center max-w-md w-full">
        <Headphones className="h-16 w-16 mx-auto mb-4 text-zinc-700" />
        <h1 className="text-2xl font-bold mb-2">DJ Not Found</h1>
        <p className="text-zinc-400 mb-6">The DJ you're looking for doesn't exist or has been removed.</p>
        <Link href="/djs">
          <Button className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to DJ List
          </Button>
        </Link>
      </div>
    </div>
  )
}
