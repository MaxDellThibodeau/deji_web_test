"use client"

import { useState } from "react"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Coins, Music, TrendingUp } from "lucide-react"
import { useTokenBalance } from "@/features/payments/hooks/use-token-balance"
import { toast } from "sonner"

interface Song {
  id: string
  title: string
  artist: string
  albumArt?: string
  currentBid?: number
  topBidder?: string
}

interface SecureSongBiddingProps {
  song: Song
  eventId?: string
  onBidSuccess?: (newBalance: number) => void
}

export function SecureSongBidding({ 
  song, 
  eventId, 
  onBidSuccess 
}: SecureSongBiddingProps) {
  const {
    balance,
    isLoading: isLoadingBalance,
    placeBid,
    hasEnoughTokens,
    getFormattedBalance
  } = useTokenBalance()

  const [bidAmount, setBidAmount] = useState<string>('')
  const [isPlacingBid, setIsPlacingBid] = useState(false)

  const handleBidSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const bid = parseInt(bidAmount)
    if (isNaN(bid) || bid <= 0) {
      toast.error('Please enter a valid bid amount')
      return
    }

    if (!hasEnoughTokens(bid)) {
      toast.error(`Insufficient tokens. You have ${balance} tokens but need ${bid}.`)
      return
    }

    if (song.currentBid && bid <= song.currentBid) {
      toast.error(`Your bid must be higher than the current bid of ${song.currentBid} tokens`)
      return
    }

    setIsPlacingBid(true)

    try {
      console.log('🎵 Placing secure bid:', {
        songId: song.id,
        bidAmount: bid,
        eventId,
        currentBalance: balance
      })

      // Use the secure backend API
      const success = await placeBid(song.id, bid, eventId)

      if (success) {
        // Bid was successful, placeBid already updated the balance
        setBidAmount('')
        onBidSuccess?.(balance - bid) // New balance after deduction
        toast.success(`🎵 Bid placed successfully! ${bid} tokens spent on "${song.title}"`)
      }
      
    } catch (error) {
      console.error('Bid submission error:', error)
      toast.error('Failed to place bid. Please try again.')
    } finally {
      setIsPlacingBid(false)
    }
  }

  const suggestedBids = [
    song.currentBid ? song.currentBid + 5 : 10,
    song.currentBid ? song.currentBid + 10 : 25,
    song.currentBid ? song.currentBid + 25 : 50
  ].filter(amount => amount <= balance)

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader>
        <div className="flex items-start gap-3">
          {song.albumArt ? (
            <img 
              src={song.albumArt} 
              alt={`${song.title} album art`}
              className="w-12 h-12 rounded-md object-cover"
            />
          ) : (
            <div className="w-12 h-12 bg-zinc-700 rounded-md flex items-center justify-center">
              <Music className="h-6 w-6 text-zinc-400" />
            </div>
          )}
          
          <div className="flex-1">
            <CardTitle className="text-lg">{song.title}</CardTitle>
            <CardDescription className="text-zinc-400">
              by {song.artist}
            </CardDescription>
            
            {song.currentBid && (
              <div className="flex items-center gap-1 mt-2 text-sm">
                <TrendingUp className="h-4 w-4 text-yellow-500" />
                <span className="text-yellow-500 font-medium">
                  Current bid: {song.currentBid} tokens
                </span>
                {song.topBidder && (
                  <span className="text-zinc-400">by {song.topBidder}</span>
                )}
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Current Balance Display */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-zinc-400">Your balance:</span>
          <div className="flex items-center gap-1">
            <Coins className="h-4 w-4 text-yellow-500" />
            {isLoadingBalance ? (
              <div className="animate-pulse bg-zinc-700 h-4 w-16 rounded"></div>
            ) : (
              <span className="font-medium">{getFormattedBalance()}</span>
            )}
          </div>
        </div>

        {/* Bid Form */}
        <form onSubmit={handleBidSubmit} className="space-y-3">
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                type="number"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                placeholder="Enter bid amount"
                min="1"
                max={balance}
                className="bg-zinc-800 border-zinc-700"
                disabled={
                  isPlacingBid || 
                  isLoadingBalance || 
                  !bidAmount || 
                  parseInt(bidAmount) > balance ||
                  (song.currentBid ? parseInt(bidAmount) <= song.currentBid : false)
                }
              />
            </div>
            
            <Button
              type="submit"
              disabled={
                isPlacingBid || 
                isLoadingBalance || 
                !bidAmount || 
                parseInt(bidAmount) > balance ||
                (song.currentBid ? parseInt(bidAmount) <= song.currentBid : false)
              }
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isPlacingBid ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Bidding...
                </>
              ) : (
                <>
                  <Coins className="h-4 w-4 mr-2" />
                  Bid
                </>
              )}
            </Button>
          </div>

          {/* Quick Bid Buttons */}
          {suggestedBids.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-zinc-400">Quick bid:</p>
              <div className="flex gap-2">
                {suggestedBids.map((amount) => (
                  <Button
                    key={amount}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setBidAmount(amount.toString())}
                    disabled={isPlacingBid || !hasEnoughTokens(amount)}
                    className="text-xs bg-zinc-800 border-zinc-600 hover:bg-zinc-700"
                  >
                    {amount}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </form>

        {/* Insufficient Balance Warning */}
        {parseInt(bidAmount) > balance && bidAmount !== '' && (
          <div className="p-3 bg-red-900/30 border border-red-500/30 rounded-lg">
            <p className="text-red-300 text-sm">
              ⚠️ Insufficient tokens. You need {parseInt(bidAmount) - balance} more tokens.
            </p>
          </div>
        )}

        {/* Security Notice */}
        <div className="p-3 bg-zinc-800 rounded-lg">
          <p className="text-xs text-zinc-400">
            🔒 All transactions are processed securely through our backend API
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export default SecureSongBidding 