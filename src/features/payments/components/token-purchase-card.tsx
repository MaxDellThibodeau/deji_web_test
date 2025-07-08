"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { Coins, CreditCard } from "lucide-react"
import { TokenPurchaseForm } from "./token-purchase-form"

interface TokenPurchaseCardProps {
  userId: string
  currentBalance: number
  onPurchase: () => void
  isPreviewMode?: boolean
}

const TOKEN_PACKAGES = [
  { amount: 50, price: 4.99 },
  { amount: 100, price: 9.99 },
  { amount: 250, price: 19.99 },
  { amount: 500, price: 34.99 },
]

export function TokenPurchaseCard({
  userId,
  currentBalance,
  onPurchase,
  isPreviewMode = false,
}: TokenPurchaseCardProps) {
  const [selectedPackage, setSelectedPackage] = useState(1) // Default to the second package (100 tokens)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showStripeForm, setShowStripeForm] = useState(false)

  const handlePurchase = async () => {
    if (!userId) return

    if (isPreviewMode) {
      // In preview mode, just call onPurchase directly
      setIsProcessing(true)
      setTimeout(() => {
        onPurchase()
        setIsProcessing(false)
      }, 500) // Add a small delay to simulate processing
    } else {
      // Show the Stripe form
      setShowStripeForm(true)
    }
  }

  const handlePurchaseSuccess = () => {
    setShowStripeForm(false)
    onPurchase()
  }

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="h-5 w-5 text-yellow-500" />
          <span>Token Balance</span>
        </CardTitle>
        <CardDescription>Purchase tokens to influence the playlist</CardDescription>
      </CardHeader>
      <CardContent>
        {showStripeForm ? (
          <TokenPurchaseForm userId={userId} onSuccess={handlePurchaseSuccess} />
        ) : (
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-center">
              <div className="text-4xl font-bold text-center flex items-center">
                <Coins className="h-8 w-8 mr-2 text-yellow-500" />
                <span>{currentBalance}</span>
              </div>
            </div>

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
                  >
                    <span className="text-lg font-bold flex items-center">
                      <Coins className="h-4 w-4 mr-1 text-yellow-500" />
                      {pkg.amount}
                    </span>
                    <span className="text-sm">${pkg.price}</span>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
      {!showStripeForm && (
        <CardFooter>
          <Button
            className="w-full bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600"
            onClick={handlePurchase}
            disabled={isProcessing}
          >
            <CreditCard className="mr-2 h-4 w-4" />
            {isProcessing ? "Processing..." : `Purchase ${TOKEN_PACKAGES[selectedPackage].amount} Tokens`}
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
