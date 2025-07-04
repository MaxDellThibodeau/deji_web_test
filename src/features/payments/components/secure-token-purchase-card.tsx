"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { Coins, CreditCard, RefreshCw } from "lucide-react"
import { tokenService, type TokenPurchaseResponse } from "../../../services/token-service"
import { useAuth } from "@/features/auth/hooks/use-auth"
import { toast } from "sonner"

interface SecureTokenPurchaseCardProps {
  onPurchaseSuccess?: (newBalance: number) => void
  isPreviewMode?: boolean
}

const TOKEN_PACKAGES = [
  { amount: 50, price: 4.99, packageType: '50' as const },
  { amount: 100, price: 9.99, packageType: '100' as const },
  { amount: 250, price: 19.99, packageType: '250' as const },
  { amount: 500, price: 34.99, packageType: '500' as const },
]

export function SecureTokenPurchaseCard({
  onPurchaseSuccess,
  isPreviewMode = false,
}: SecureTokenPurchaseCardProps) {
  const { user } = useAuth()
  const [selectedPackage, setSelectedPackage] = useState(1) // Default to 100 tokens
  const [isProcessing, setIsProcessing] = useState(false)
  const [isLoadingBalance, setIsLoadingBalance] = useState(true)
  const [currentBalance, setCurrentBalance] = useState(0)

  // Load token balance on mount and when user changes
  useEffect(() => {
    if (user) {
      loadTokenBalance()
    }
  }, [user])

  const loadTokenBalance = async () => {
    setIsLoadingBalance(true)
    try {
      const balance = await tokenService.getTokenBalance()
      setCurrentBalance(balance)
    } catch (error) {
      console.error('Error loading token balance:', error)
      // tokenService already shows error toast
    } finally {
      setIsLoadingBalance(false)
    }
  }

  const handlePurchase = async () => {
    if (!user) {
      toast.error('Please log in to purchase tokens')
      return
    }

    const selectedTokenPackage = TOKEN_PACKAGES[selectedPackage]

    if (isPreviewMode) {
      // In preview mode, simulate the purchase
      setIsProcessing(true)
      setTimeout(() => {
        const newBalance = currentBalance + selectedTokenPackage.amount
        setCurrentBalance(newBalance)
        toast.success(`Preview: Purchased ${selectedTokenPackage.amount} tokens!`)
        onPurchaseSuccess?.(newBalance)
        setIsProcessing(false)
      }, 1500)
      return
    }

    // Real purchase flow
    setIsProcessing(true)

    try {
      // TODO: In a real implementation, you would integrate with Stripe here
      // to get the payment intent ID. For now, we'll simulate it.
      const mockPaymentIntentId = `pi_mock_${Date.now()}_${user.id}`

      console.log('🔐 Starting secure token purchase:', {
        amount: selectedTokenPackage.amount,
        packageType: selectedTokenPackage.packageType,
        price: selectedTokenPackage.price,
        userId: user.id
      })

      // Call secure backend API
      const result: TokenPurchaseResponse | null = await tokenService.purchaseTokens(
        selectedTokenPackage.amount,
        selectedTokenPackage.packageType,
        mockPaymentIntentId
      )

      if (result) {
        // Update local state with new balance
        setCurrentBalance(result.newBalance)
        
        // Notify parent component
        onPurchaseSuccess?.(result.newBalance)
        
        console.log('✅ Token purchase completed:', result)
      }

    } catch (error) {
      console.error('Purchase failed:', error)
      toast.error('Purchase failed. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const refreshBalance = async () => {
    await loadTokenBalance()
    toast.success('Token balance refreshed')
  }

  if (!user) {
    return (
      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Please log in to view your tokens.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="h-5 w-5 text-yellow-500" />
          <span>Token Balance</span>
        </CardTitle>
        <CardDescription>
          {isPreviewMode ? 'Preview Mode - Purchase tokens to influence the playlist' : 'Purchase tokens to influence the playlist'}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Current Balance Display */}
        <div className="flex items-center justify-center">
          <div className="text-4xl font-bold text-center flex items-center">
            <Coins className="h-8 w-8 mr-2 text-yellow-500" />
            {isLoadingBalance ? (
              <div className="animate-pulse bg-zinc-700 h-10 w-20 rounded"></div>
            ) : (
              <span>{currentBalance}</span>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={refreshBalance}
            disabled={isLoadingBalance}
            className="ml-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoadingBalance ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* Package Selection */}
        <div className="space-y-3">
          <p className="text-sm text-zinc-400">Select a token package:</p>
          <div className="grid grid-cols-2 gap-2">
            {TOKEN_PACKAGES.map((pkg, index) => (
              <Button
                key={index}
                variant={selectedPackage === index ? "default" : "outline"}
                className={`flex flex-col items-center justify-center h-20 ${
                  selectedPackage === index 
                    ? "bg-purple-600 border-purple-500" 
                    : "bg-zinc-800 border-zinc-700 hover:bg-zinc-700"
                }`}
                onClick={() => setSelectedPackage(index)}
                disabled={isProcessing}
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

        {/* Preview Mode Indicator */}
        {isPreviewMode && (
          <div className="p-3 bg-blue-900/30 border border-blue-500/30 rounded-lg">
            <p className="text-blue-300 text-sm font-medium">
              🚀 Preview Mode: Purchases are simulated
            </p>
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Button
          className="w-full bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600"
          onClick={handlePurchase}
          disabled={isProcessing || isLoadingBalance}
        >
          <CreditCard className="mr-2 h-4 w-4" />
          {isProcessing 
            ? "Processing..." 
            : `Purchase ${TOKEN_PACKAGES[selectedPackage].amount} Tokens`
          }
        </Button>
      </CardFooter>
    </Card>
  )
}

export default SecureTokenPurchaseCard 