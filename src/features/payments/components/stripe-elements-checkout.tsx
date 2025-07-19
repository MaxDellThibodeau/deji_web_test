"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, PaymentElement, useStripe, useElements, AddressElement } from "@stripe/react-stripe-js"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Loader2, CheckCircle, AlertCircle, ArrowLeft, CreditCard, Lock } from "lucide-react"
import { createPaymentIntent } from "@/features/payments/actions/payment-actions"

// Initialize Stripe without exposing the key in the client
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "")

interface StripeElementsCheckoutProps {
  eventId: string
  eventName: string
  ticketType: string
  quantity: number
  unitPrice: number
  userId: string
  onSuccess: () => void
  onCancel: () => void
}

export function StripeElementsCheckout({
  eventId,
  eventName,
  ticketType,
  quantity,
  unitPrice,
  userId,
  onSuccess,
  onCancel,
}: StripeElementsCheckoutProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Create a payment intent on the server
    const fetchPaymentIntent = async () => {
      try {
        setIsLoading(true)
        console.log("[STRIPE] Creating payment intent for:", {
          eventId,
          eventName,
          ticketType,
          quantity,
          unitPrice,
          userId,
        })

        const result = await createPaymentIntent({
          eventId,
          eventName,
          ticketType,
          quantity,
          unitPrice,
          userId,
        })

        if (result.error) {
          console.error("[STRIPE] Error creating payment intent:", result.error)
          setError(result.error)
          return
        }

        if (result.clientSecret) {
          console.log("[STRIPE] Payment intent created successfully")
          setClientSecret(result.clientSecret)
        } else {
          console.error("[STRIPE] No client secret returned")
          setError("Failed to initialize payment")
        }
      } catch (err) {
        console.error("[STRIPE] Unexpected error creating payment intent:", err)
        setError("An unexpected error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    fetchPaymentIntent()
  }, [eventId, eventName, ticketType, quantity, unitPrice, userId])

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
        <p className="text-center text-zinc-300">Preparing secure checkout...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <div className="bg-red-900/20 border border-red-800 text-red-200 p-4 rounded-md flex items-start max-w-md">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
        <Button onClick={onCancel} variant="outline" className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      </div>
    )
  }

  if (!clientSecret) {
    return null
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <Elements
        stripe={stripePromise}
        options={{
          clientSecret,
          appearance: {
            theme: "night",
            variables: {
              colorPrimary: "#9333ea",
              colorBackground: "#1f1f23",
              colorText: "#ffffff",
              colorDanger: "#ef4444",
              fontFamily: "system-ui, sans-serif",
              spacingUnit: "4px",
              borderRadius: "8px",
            },
          },
        }}
      >
        <CheckoutForm
          eventName={eventName}
          ticketType={ticketType}
          quantity={quantity}
          unitPrice={unitPrice}
          onSuccess={onSuccess}
          onCancel={onCancel}
        />
      </Elements>
    </div>
  )
}

interface CheckoutFormProps {
  eventName: string
  ticketType: string
  quantity: number
  unitPrice: number
  onSuccess: () => void
  onCancel: () => void
}

function CheckoutForm({ eventName, ticketType, quantity, unitPrice, onSuccess, onCancel }: CheckoutFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isFormComplete, setIsFormComplete] = useState(false)

  const totalPrice = unitPrice * quantity
  const serviceFee = totalPrice * 0.1
  const finalTotal = totalPrice + serviceFee

  useEffect(() => {
    if (!stripe) {
      return
    }

    // Check for payment intent status on page load
    const clientSecret = new URLSearchParams(window.location.search).get("payment_intent_client_secret")

    if (!clientSecret) {
      return
    }

    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      if (!paymentIntent) return

      console.log("[STRIPE] Retrieved payment intent status:", paymentIntent.status)

      switch (paymentIntent.status) {
        case "succeeded":
          setMessage("Payment succeeded!")
          setIsSuccess(true)
          setTimeout(() => onSuccess(), 2000)
          break
        case "processing":
          setMessage("Your payment is processing.")
          break
        case "requires_payment_method":
          setMessage("Please provide your payment information.")
          break
        default:
          setMessage("Something went wrong.")
          break
      }
    })
  }, [stripe, onSuccess])

  // Add event listener for Stripe Elements form completion
  useEffect(() => {
    if (!elements) return

    const onChange = (event: any) => {
      setIsFormComplete(event.complete)
      if (event.error) {
        setMessage(event.error.message)
      } else {
        setMessage(null)
      }
    }

    const element = elements.getElement(PaymentElement)
    if (element) {
      element.on("change", onChange)
      return () => {
        element.off("change", onChange)
      }
    }
  }, [elements])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      console.log("[STRIPE] Stripe or Elements not loaded yet")
      return
    }

    // Check if form is complete
    if (!isFormComplete) {
      console.log("[STRIPE] Payment form is not complete")
      setMessage("Please complete all required payment information.")
      return
    }

    setIsProcessing(true)
    setMessage(null)

    console.log("[STRIPE] Confirming payment...")

    // For preview mode, use a simpler approach
    const isPreviewMode =
      import.meta.env.DEV ||
      window.location.hostname.includes("localhost") ||
      window.location.hostname.includes("vusercontent")

    if (isPreviewMode) {
      console.log("[STRIPE] Preview mode detected, simulating successful payment")

      // Simulate a successful payment in preview mode
      setTimeout(() => {
        setIsSuccess(true)
        setMessage("Payment successful! Your tickets will be added to your account.")
        setTimeout(() => {
          onSuccess()
        }, 2000)
        setIsProcessing(false)
      }, 2000)

      return
    }

    // For production, use the normal flow
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/ticket-purchase-success`,
      },
      redirect: "if_required",
    })

    if (error) {
      console.error("[STRIPE] Payment confirmation error:", error)
      setMessage(error.message || "An unexpected error occurred.")
    } else if (paymentIntent && paymentIntent.status === "succeeded") {
      console.log("[STRIPE] Payment succeeded:", paymentIntent)
      setIsSuccess(true)
      setMessage("Payment successful! Your tickets will be added to your account.")
      setTimeout(() => {
        onSuccess()
      }, 2000)
    } else {
      console.log("[STRIPE] Payment status:", paymentIntent?.status)
      setMessage("Something went wrong. Please try again.")
    }

    setIsProcessing(false)
  }

  return (
    <Card className="border-zinc-800 bg-zinc-900">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Complete your purchase</CardTitle>
          <div className="flex items-center text-xs text-zinc-400">
            <Lock className="h-3 w-3 mr-1" />
            <span>Secure Checkout</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form id="payment-form" onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-zinc-800 p-4 rounded-md mb-4">
            <h3 className="font-medium text-zinc-100">{eventName}</h3>
            <p className="text-sm text-zinc-400">
              {ticketType} x {quantity}
            </p>
            <div className="mt-3 pt-3 border-t border-zinc-700">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Subtotal</span>
                <span className="text-zinc-300">${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Service Fee</span>
                <span className="text-zinc-300">${serviceFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-medium mt-2">
                <span>Total</span>
                <span>${finalTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Payment Information</label>
              <div className="bg-zinc-800 p-4 rounded-md">
                <PaymentElement
                  id="payment-element"
                  options={{
                    layout: {
                      type: "tabs",
                      defaultCollapsed: false,
                    },
                  }}
                />
              </div>
              <p className="text-xs text-zinc-500 mt-2">
                In preview mode, you can use test card number: 4242 4242 4242 4242
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Billing Address</label>
              <div className="bg-zinc-800 p-4 rounded-md">
                <AddressElement
                  options={{
                    mode: "billing",
                    fields: {
                      phone: "always",
                    },
                    validation: {
                      phone: {
                        required: "always",
                      },
                    },
                  }}
                />
              </div>
            </div>
          </div>

          {message && (
            <div
              className={`p-4 rounded-md ${
                isSuccess
                  ? "bg-green-900/20 text-green-200 border border-green-800"
                  : "bg-red-900/20 text-red-200 border border-red-800"
              } flex items-center`}
            >
              {isSuccess ? <CheckCircle className="h-5 w-5 mr-2" /> : <AlertCircle className="h-5 w-5 mr-2" />}
              {message}
            </div>
          )}
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onCancel} disabled={isProcessing || isSuccess}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button
          type="submit"
          form="payment-form"
          disabled={!stripe || isProcessing || isSuccess || !isFormComplete}
          className="bg-purple-600 hover:bg-purple-700"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="mr-2 h-4 w-4" />
              Pay ${finalTotal.toFixed(2)}
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
