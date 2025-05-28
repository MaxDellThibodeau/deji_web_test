"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card"
import { Badge } from "@/ui/badge"
import { Coins, ArrowUpRight, ArrowDownRight, Clock } from "lucide-react"
import { useUser } from "@/hooks/use-user"

// Mock transaction data for preview mode
const MOCK_TRANSACTIONS = [
  {
    id: "mock-tx-1",
    profile_id: "mock-user-id",
    amount: 100,
    transaction_type: "purchase",
    description: "Purchased 100 tokens",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
  },
  {
    id: "mock-tx-2",
    profile_id: "mock-user-id",
    amount: -45,
    transaction_type: "bid",
    description: "Bid 45 tokens on \"Don't Stop Believin'\" by Journey",
    created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
  },
  {
    id: "mock-tx-3",
    profile_id: "mock-user-id",
    amount: -30,
    transaction_type: "bid",
    description: 'Bid 30 tokens on "Billie Jean" by Michael Jackson',
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
  },
  {
    id: "mock-tx-4",
    profile_id: "mock-user-id",
    amount: -25,
    transaction_type: "bid",
    description: "Bid 25 tokens on \"Sweet Child O' Mine\" by Guns N' Roses",
    created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 minutes ago
  },
  {
    id: "mock-tx-5",
    profile_id: "mock-user-id",
    amount: 50,
    transaction_type: "reward",
    description: "Reward for attending 5 events",
    created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
  },
]

export default function TokenHistoryPage() {
  const { user, loading: userLoading } = useUser()
  const [transactions, setTransactions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isPreviewMode, setIsPreviewMode] = useState(true) // Default to preview mode
  const [userTokens, setUserTokens] = useState(100) // Default token balance

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)

      // Always use mock data for now to avoid database errors
      setUserTokens(100)
      setTransactions(MOCK_TRANSACTIONS)
      setIsPreviewMode(true)
      setIsLoading(false)
    }

    if (!userLoading) {
      loadData()
    }
  }, [user, userLoading])

  // Format date to a readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  // Calculate total tokens spent on bids
  const totalBidTokens = transactions
    .filter((tx) => tx.transaction_type === "bid")
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0)

  // Calculate total tokens purchased
  const totalPurchasedTokens = transactions
    .filter((tx) => tx.transaction_type === "purchase")
    .reduce((sum, tx) => sum + tx.amount, 0)

  // Calculate total tokens from rewards
  const totalRewardTokens = transactions
    .filter((tx) => tx.transaction_type === "reward")
    .reduce((sum, tx) => sum + tx.amount, 0)

  // If user is not logged in, show login prompt
  if (!userLoading && !user && !isPreviewMode) {
    return (
      <div className="container mx-auto max-w-6xl py-8">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <h1 className="text-3xl font-bold mb-4">Token Transaction History</h1>
          <p className="text-xl mb-8">Please log in to view your token transaction history.</p>
          <a
            href="/login"
            className="px-6 py-3 rounded-md bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white font-medium"
          >
            Log In
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-6xl py-8">
      <h1 className="text-3xl font-bold mb-6">Token Transaction History</h1>

      {isPreviewMode && (
        <div className="mb-4 p-3 bg-yellow-900/30 border border-yellow-700/50 rounded-md">
          <p className="text-yellow-300 text-sm">
            Preview Mode: Using mock data since database tables are not available.
          </p>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-xl text-zinc-400">Loading...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Current Balance */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Current Balance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Coins className="h-8 w-8 mr-3 text-yellow-500" />
                  <span className="text-3xl font-bold">{userTokens}</span>
                </div>
              </CardContent>
            </Card>

            {/* Total Spent */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Total Spent on Bids</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <ArrowDownRight className="h-8 w-8 mr-3 text-red-500" />
                  <span className="text-3xl font-bold">{totalBidTokens}</span>
                </div>
              </CardContent>
            </Card>

            {/* Total Purchased */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Total Purchased</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <ArrowUpRight className="h-8 w-8 mr-3 text-green-500" />
                  <span className="text-3xl font-bold">{totalPurchasedTokens}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Transaction History */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>Your recent token transactions</CardDescription>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-zinc-400">No transactions found.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-3 rounded-md bg-zinc-800 border border-zinc-700"
                    >
                      <div className="flex items-center">
                        {tx.amount > 0 ? (
                          <div className="h-10 w-10 rounded-full bg-green-900/30 flex items-center justify-center mr-3">
                            <ArrowUpRight className="h-5 w-5 text-green-500" />
                          </div>
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-red-900/30 flex items-center justify-center mr-3">
                            <ArrowDownRight className="h-5 w-5 text-red-500" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{tx.description}</p>
                          <div className="flex items-center text-xs text-zinc-400">
                            <Clock className="h-3 w-3 mr-1" />
                            <span>{formatDate(tx.created_at)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge
                          variant="outline"
                          className={`${
                            tx.transaction_type === "purchase"
                              ? "bg-green-900/30 text-green-400 border-green-700"
                              : tx.transaction_type === "bid"
                                ? "bg-red-900/30 text-red-400 border-red-700"
                                : "bg-blue-900/30 text-blue-400 border-blue-700"
                          }`}
                        >
                          {tx.transaction_type}
                        </Badge>
                        <div
                          className={`flex items-center font-medium ${
                            tx.amount > 0 ? "text-green-500" : "text-red-500"
                          }`}
                        >
                          <Coins className="h-3 w-3 mr-1" />
                          <span>{tx.amount > 0 ? `+${tx.amount}` : tx.amount}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
