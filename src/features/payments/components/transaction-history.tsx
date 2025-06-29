"use client"

import { useState, useEffect } from "react"
import { Coins, ArrowUp, ArrowDown } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card"
import { Badge } from "@/ui/badge"
import { getTransactionHistory } from "@/features/payments/actions/token-actions"

interface TransactionHistoryProps {
  userId: string
}

export function TransactionHistory({ userId }: TransactionHistoryProps) {
  const [transactions, setTransactions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadTransactions() {
      setIsLoading(true)
      const history = await getTransactionHistory(userId)
      setTransactions(history)
      setIsLoading(false)
    }

    if (userId) {
      loadTransactions()
    }
  }, [userId])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + " " + date.toLocaleTimeString()
  }

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
        <CardDescription>Your token purchase and bidding history</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-zinc-400">Loading transactions...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-zinc-400">No transactions yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 rounded-md bg-zinc-800">
                <div className="flex items-center">
                  {transaction.amount > 0 ? (
                    <div className="h-8 w-8 rounded-full bg-green-900/30 flex items-center justify-center mr-3">
                      <ArrowUp className="h-4 w-4 text-green-500" />
                    </div>
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-red-900/30 flex items-center justify-center mr-3">
                      <ArrowDown className="h-4 w-4 text-red-500" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium">
                      {transaction.transaction_type === "purchase" ? "Token Purchase" : "Song Bid"}
                    </p>
                    <p className="text-sm text-zinc-400">{formatDate(transaction.created_at)}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Badge
                    className={transaction.amount > 0 ? "bg-green-900/50 text-green-300" : "bg-red-900/50 text-red-300"}
                  >
                    <Coins className="h-3 w-3 mr-1" />
                    {transaction.amount > 0 ? "+" : ""}
                    {transaction.amount}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
