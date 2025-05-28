"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/ui/button"
import { CheckCircle, Ticket, ArrowLeft, Loader2 } from "lucide-react"
import { handleSuccessfulPayment } from "@/features/payments/actions/payment-actions"
import { PublicHeader } from "@/shared/components/layout/public-header"
import { getUserFromCookies } from "@/shared/utils/auth-utils"

// Detect preview mode outside of component to avoid re-renders
const isPreviewMode =
  typeof window !== "undefined" &&
  (process.env.NODE_ENV === "development" ||
    window.location.hostname.includes("localhost") ||
    window.location.hostname.includes("vusercontent"))

export default function TicketPurchaseSuccessPage() {
  const searchParams = useSearchParams()
  const [isProcessing, setIsProcessing] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const processedRef = useRef(false)
  const router = useRouter()

  // Only run this effect once
  useEffect(() => {
    // Prevent the effect from running twice in development mode
    if (processedRef.current) return
    processedRef.current = true

    console.log("[SUCCESS PAGE] Preview mode:", isPreviewMode)

    // Get user from cookies - only once
    const cookieUser = getUserFromCookies()
    if (cookieUser) {
      setUser(cookieUser)
    }

    // Process the payment - only once
    const processPayment = async () => {
      try {
        const paymentIntent = searchParams.get("payment_intent")
        const paymentIntentClientSecret = searchParams.get("payment_intent_client_secret")

        // If no payment intent in URL and we're in preview mode, simulate success
        if (!paymentIntent && isPreviewMode) {
          console.log("[SUCCESS PAGE] No payment intent found in URL, but in preview mode. Simulating success.")
          setTimeout(() => {
            setIsProcessing(false)
          }, 1500)
          return
        }

        if (!paymentIntent) {
          console.error("[SUCCESS PAGE] No payment intent found in URL")
          setError("No payment information found. Please contact support if you believe this is an error.")
          setIsProcessing(false)
          return
        }

        console.log("[SUCCESS PAGE] Processing payment:", paymentIntent)

        // Call the server action to handle the successful payment
        const result = await handleSuccessfulPayment(paymentIntent)

        if (result.error) {
          console.error("[SUCCESS PAGE] Error processing payment:", result.error)
          setError(result.error)
        }

        if (result.previewMode) {
          console.log("[SUCCESS PAGE] Preview mode detected, simulating success")
        }
      } catch (err) {
        console.error("[SUCCESS PAGE] Unexpected error:", err)
        setError("An unexpected error occurred. Please contact support.")
      } finally {
        setIsProcessing(false)
      }
    }

    processPayment()

    // Clean up function to prevent memory leaks
    return () => {
      processedRef.current = true
    }
  }, []) // Empty dependency array to run only once

  // Determine if we should show success state
  const showSuccess = !error && (!isProcessing || isPreviewMode)

  // Handle manual navigation to tickets
  const handleViewTickets = (e: React.MouseEvent) => {
    e.preventDefault()
    router.push("/tickets")
  }

  // Handle manual navigation to events
  const handleBackToEvents = (e: React.MouseEvent) => {
    e.preventDefault()
    router.push("/events")
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <PublicHeader currentPath="/ticket-purchase-success" user={user} />

      <div className="container mx-auto py-16 px-4 max-w-md text-center flex-1 flex items-center justify-center">
        <div className="bg-zinc-900 dark:bg-zinc-900 rounded-lg shadow-lg p-8 w-full">
          {isProcessing && !isPreviewMode ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-12 w-12 text-purple-500 animate-spin mb-4" />
              <h1 className="text-2xl font-bold mb-2">Processing Your Purchase</h1>
              <p className="text-zinc-400">Please wait while we confirm your payment...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="rounded-full bg-red-900/30 p-3 mb-6">
                <CheckCircle className="h-12 w-12 text-red-500" />
              </div>
              <h1 className="text-2xl font-bold mb-2">Something Went Wrong</h1>
              <p className="text-zinc-400 mb-8">{error}</p>
              <div className="space-y-4">
                <Button
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2"
                  onClick={handleBackToEvents}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Events
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex justify-center mb-6">
                <div className="rounded-full bg-green-900/30 p-3">
                  <CheckCircle className="h-12 w-12 text-green-500" />
                </div>
              </div>

              <h1 className="text-2xl font-bold mb-2">Purchase Successful!</h1>
              <p className="text-zinc-400 mb-8">
                {isPreviewMode
                  ? "This is a preview. In a real environment, your tickets would be added to your account."
                  : "Your tickets have been added to your account and are ready to use."}
              </p>

              <div className="space-y-4">
                <Button
                  className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700"
                  onClick={handleViewTickets}
                >
                  <Ticket className="h-4 w-4" />
                  View My Tickets
                </Button>

                <Button
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2"
                  onClick={handleBackToEvents}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Events
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
