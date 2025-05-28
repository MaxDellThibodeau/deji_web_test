"use client"

import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"

interface StripeCheckoutRedirectProps {
  checkoutUrl: string
  onCancel: () => void
}

export default function StripeCheckoutRedirect({ checkoutUrl, onCancel }: StripeCheckoutRedirectProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Extract the session ID from the URL
    const sessionId = checkoutUrl.split("/").pop()?.split("#")[0]

    if (!sessionId) {
      setError("Invalid checkout URL")
      setIsLoading(false)
      return
    }

    // Create a timer to show loading state for max 10 seconds
    const loadingTimer = setTimeout(() => {
      if (isLoading) {
        setError("Checkout is taking longer than expected. Please try again.")
        setIsLoading(false)
      }
    }, 10000)

    // Set up iframe load event listener
    const handleIframeLoad = () => {
      setIsLoading(false)
      clearTimeout(loadingTimer)
    }

    // Find the iframe once it's in the DOM
    const checkForIframe = setInterval(() => {
      const iframe = document.getElementById("stripe-checkout-iframe") as HTMLIFrameElement
      if (iframe) {
        clearInterval(checkForIframe)
        iframe.addEventListener("load", handleIframeLoad)
      }
    }, 100)

    return () => {
      clearTimeout(loadingTimer)
      clearInterval(checkForIframe)
      const iframe = document.getElementById("stripe-checkout-iframe") as HTMLIFrameElement
      if (iframe) {
        iframe.removeEventListener("load", handleIframeLoad)
      }
    }
  }, [checkoutUrl, isLoading, onCancel])

  // Direct link as fallback
  const handleDirectLink = () => {
    window.open(checkoutUrl, "_blank")
  }

  if (error) {
    return (
      <div className="p-6 bg-zinc-800 border border-zinc-700 rounded-lg text-center">
        <p className="text-zinc-300 mb-4">{error}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={handleDirectLink}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            Open Checkout in New Tab
          </button>
          <button onClick={onCancel} className="px-4 py-2 bg-zinc-700 text-white rounded-md hover:bg-zinc-600">
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full relative bg-zinc-900 rounded-lg overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-zinc-900 bg-opacity-90">
          <Loader2 className="h-10 w-10 animate-spin text-purple-500" />
          <p className="mt-4 text-zinc-300">Loading secure checkout...</p>
          <p className="mt-2 text-zinc-500 text-sm">This may take a few moments</p>
          <button
            onClick={handleDirectLink}
            className="mt-6 px-4 py-2 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700"
          >
            Open in New Tab Instead
          </button>
        </div>
      )}

      <div className="h-[600px]">
        <iframe
          id="stripe-checkout-iframe"
          src={checkoutUrl}
          className="w-full h-full border-0"
          allow="payment"
          title="Secure Stripe Checkout"
        />
      </div>

      <div className="absolute bottom-4 right-4">
        <button onClick={onCancel} className="px-4 py-2 bg-zinc-700 text-white rounded-md hover:bg-zinc-600">
          Cancel
        </button>
      </div>
    </div>
  )
}
