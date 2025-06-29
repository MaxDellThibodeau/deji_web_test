"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import { Button } from "@/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card"
import { Coins, CreditCard, Check, AlertCircle } from "lucide-react"

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "")

interface TokenPackage {
  amount: number
  price: number
}

const TOKEN_PACKAGES: TokenPackage[] = [
  { amount: 50, price: 4.99 },
  { amount: 100, price: 9.99 },
  { amount: 250, price: 19.99 },
  { amount: 500, price: 34.99 },
]

interface CheckoutFormProps {
  clientSecret: string
  selectedPackage: TokenPackage
  onSuccess: () => void
}

function CheckoutForm({ clientSecret, selectedPackage, onSuccess }: CheckoutFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

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
        return_url: `${window.location.origin}/token-purchase-success`,
      },
      redirect: "if_required",
    })

    if (error) {
      setMessage(error.message || "An unexpected error occurred.")
      setIsProcessing(false)
    } else if (paymentIntent && paymentIntent.status === "succeeded") {
      setIsSuccess(true)
      setMessage("Payment successful! Your tokens will be added to your account.")
      setTimeout(() => {
        onSuccess()
      }, 2000)
    } else {
      setMessage("Something went wrong. Please try again.")
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-zinc-800 p-4 rounded-md">
        <PaymentElement />
      </div>

      <div className="flex items-center justify-between bg-zinc-800 p-4 rounded-md">
        <div>
          <p className="text-sm text-zinc-400">Purchase Summary</p>
          <p className="font-medium">{selectedPackage.amount} Tokens</p>
        </div>
        <p className="font-bold">${selectedPackage.price.toFixed(2)}</p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-md ${isSuccess ? "bg-green-900/30 text-green-400" : "bg-red-900/30 text-red-400"} flex items-center`}
        >
          {isSuccess ? <Check className="h-5 w-5 mr-2" /> : <AlertCircle className="h-5 w-5 mr-2" />}
          {message}
        </div>
      )}

      <Button
        type="submit"
        disabled={!stripe || isProcessing || isSuccess}
        className="w-full bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600"
      >
        <CreditCard className="mr-2 h-4 w-4" />
        {isProcessing ? "Processing..." : `Pay $${selectedPackage.price.toFixed(2)}`}
      </Button>
    </form>
  )
}

interface TokenPurchaseFormProps {
  userId: string
  onSuccess: () => void
}

export function TokenPurchaseForm({ userId, onSuccess }: TokenPurchaseFormProps) {
  const [selectedPackage, setSelectedPackage] = useState<number>(1) // Default to 100 tokens
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createPaymentIntent = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const tokenPackage = TOKEN_PACKAGES[selectedPackage]

      const response = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: tokenPackage.price,
          userId,
          tokenAmount: tokenPackage.amount,
        }),
      })

      if (!response.ok) {
        throw new Error("Network response was not ok")
      }

      const data = await response.json()
      setClientSecret(data.clientSecret)
    } catch (error) {
      console.error("Error creating payment intent:", error)
      setError("Failed to initialize payment. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (userId) {
      createPaymentIntent()
    }
  }, [userId, selectedPackage])

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="h-5 w-5 text-yellow-500" />
          <span>Purchase Tokens</span>
        </CardTitle>
        <CardDescription>Select a token package and complete your purchase</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-6">
          <div className="space-y-3">
            <p className="text-sm text-zinc-400">Select a token package:</p>
            <div className="grid grid-cols-2 gap-2">
              {TOKEN_PACKAGES.map((pkg, index) => (
                <Button
                  key={index}
                  variant={selectedPackage === index ? "default" : "outline"}
                  className={`flex flex-col items-center justify-center h-20 ${
                    selectedPackage === index ? "bg-purple-600 border-purple-500" : "bg-zinc-800 border-zinc-700"
                  }`}
                  onClick={() => setSelectedPackage(index)}
                  disabled={isLoading || !!clientSecret}
                >
                  <span className="text-lg font-bold flex items-center">
                    <Coins className="h-4 w-4 mr-1 text-yellow-500" />
                    {pkg.amount}
                  </span>
                  <span className="text-sm">${pkg.price.toFixed(2)}</span>
                </Button>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-md bg-red-900/30 text-red-400">
              <AlertCircle className="h-5 w-5 inline mr-2" />
              {error}
            </div>
          )}

          {clientSecret && (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <CheckoutForm
                clientSecret={clientSecret}
                selectedPackage={TOKEN_PACKAGES[selectedPackage]}
                onSuccess={onSuccess}
              />
            </Elements>
          )}

          {!clientSecret && !error && (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
