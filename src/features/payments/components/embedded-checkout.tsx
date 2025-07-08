"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, PaymentElement, useStripe, useElements, AddressElement } from "@stripe/react-stripe-js"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Loader2, CheckCircle, AlertCircle } from "lucide-react"

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "")

interface EmbeddedCheckoutProps {
  clientSecret: string
  eventName: string
  ticketType: string
  price: number
  onSuccess: () => void
  onCancel: () => void
}

export function EmbeddedCheckout({
  clientSecret,
  eventName,
  ticketType,
  price,
  onSuccess,
  onCancel,
}: EmbeddedCheckoutProps) {
  if (!clientSecret) {
    return <div>Loading checkout...</div>
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: "stripe",
          variables: {
            colorPrimary: "#6366f1",
            colorBackground: "#ffffff",
            colorText: "#1f2937",
          },
        },
      }}
    >
      <CheckoutForm
        eventName={eventName}
        ticketType={ticketType}
        price={price}
        onSuccess={onSuccess}
        onCancel={onCancel}
      />
    </Elements>
  )
}

interface CheckoutFormProps {
  eventName: string
  ticketType: string
  price: number
  onSuccess: () => void
  onCancel: () => void
}

function CheckoutForm({ eventName, ticketType, price, onSuccess, onCancel }: CheckoutFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

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

      switch (paymentIntent.status) {
        case "succeeded":
          setMessage("Payment succeeded!")
          setIsSuccess(true)
          onSuccess()
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)
    setMessage(null)

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/ticket-purchase-success`,
      },
      redirect: "if_required",
    })

    if (error) {
      setMessage(error.message || "An unexpected error occurred.")
    } else if (paymentIntent && paymentIntent.status === "succeeded") {
      setIsSuccess(true)
      setMessage("Payment successful! Your tickets will be added to your account.")
      setTimeout(() => {
        onSuccess()
      }, 2000)
    } else {
      setMessage("Something went wrong. Please try again.")
    }

    setIsProcessing(false)
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-xl">Complete your purchase</CardTitle>
      </CardHeader>
      <CardContent>
        <form id="payment-form" onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-md mb-4">
            <h3 className="font-medium text-gray-900">{eventName}</h3>
            <p className="text-sm text-gray-600">
              {ticketType} - ${price.toFixed(2)}
            </p>
          </div>

          <PaymentElement id="payment-element" />

          <AddressElement
            options={{
              mode: "shipping",
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

          {message && (
            <div
              className={`p-4 rounded-md ${
                isSuccess ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
              } flex items-center`}
            >
              {isSuccess ? <CheckCircle className="h-5 w-5 mr-2" /> : <AlertCircle className="h-5 w-5 mr-2" />}
              {message}
            </div>
          )}
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onCancel} disabled={isProcessing}>
          Cancel
        </Button>
        <Button
          type="submit"
          form="payment-form"
          disabled={!stripe || isProcessing || isSuccess}
          className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            `Pay $${price.toFixed(2)}`
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
