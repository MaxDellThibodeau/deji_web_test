"use client"

import { useEffect } from "react"
import { Button } from "@/ui/button"
import { ArrowLeft, ExternalLink, Loader2 } from "lucide-react"

interface StripeRedirectProps {
  checkoutUrl: string
  onCancel: () => void
}

export default function StripeRedirect({ checkoutUrl, onCancel }: StripeRedirectProps) {
  useEffect(() => {
    // Set a timeout to redirect automatically after 3 seconds
    const redirectTimer = setTimeout(() => {
      window.location.href = checkoutUrl
    }, 3000)

    // Clean up the timer if the component unmounts
    return () => clearTimeout(redirectTimer)
  }, [checkoutUrl])

  const handleOpenInNewTab = () => {
    window.open(checkoutUrl, "_blank")
  }

  return (
    <div className="p-6 bg-zinc-800 rounded-lg text-center space-y-6">
      <div className="flex justify-center">
        <Loader2 className="h-12 w-12 text-purple-500 animate-spin" />
      </div>

      <div className="space-y-2">
        <h3 className="text-xl font-bold">Redirecting to Secure Checkout</h3>
        <p className="text-zinc-400">You'll be redirected to Stripe's secure checkout page in a few seconds...</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button variant="outline" onClick={onCancel} className="flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>

        <Button onClick={handleOpenInNewTab} className="flex items-center bg-purple-600 hover:bg-purple-700">
          <ExternalLink className="mr-2 h-4 w-4" />
          Open Checkout Now
        </Button>
      </div>
    </div>
  )
}
