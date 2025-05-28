"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/ui/card"
import { Button } from "@/ui/button"
import { Check, Coins, ArrowRight } from "lucide-react"

export default function TokenPurchaseSuccessPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to token-bidding page after 5 seconds
    const timeout = setTimeout(() => {
      router.push("/token-bidding")
    }, 5000)

    return () => clearTimeout(timeout)
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <Card className="w-full max-w-md bg-zinc-900 border-zinc-800">
        <CardHeader className="text-center">
          <div className="mx-auto bg-green-900/30 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
            <Check className="h-8 w-8 text-green-400" />
          </div>
          <CardTitle className="text-2xl">Payment Successful!</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="flex items-center justify-center text-xl">
            <Coins className="h-6 w-6 mr-2 text-yellow-500" />
            <span>Your tokens have been added to your account</span>
          </div>
          <p className="text-zinc-400">You can now use your tokens to bid on songs at events.</p>
          <div className="animate-pulse text-sm text-zinc-500">
            Redirecting to token bidding page in a few seconds...
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={() => router.push("/token-bidding")}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-500"
          >
            Go to Token Bidding
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
