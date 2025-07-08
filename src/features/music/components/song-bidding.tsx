"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Slider } from "@/shared/components/ui/slider"
import { Music, Coins, ArrowRight, Minus, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface SongBiddingProps {
  userId: string
  eventId: string
  userTokens: number
  onBid: () => void
  isPreviewMode?: boolean
  setUserTokens: React.Dispatch<React.SetStateAction<number>>
}

export function SongBidding({
  userId,
  eventId,
  userTokens,
  onBid,
  isPreviewMode = false,
  setUserTokens,
}: SongBiddingProps) {
  const [songTitle, setSongTitle] = useState("")
  const [artist, setArtist] = useState("")
  const [bidAmount, setBidAmount] = useState(10) // Default bid amount
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  // Save pending token updates to cookies for persistence
  const savePendingTokenUpdate = useCallback(
    (newBalance: number) => {
      try {
        // Use the userId prop instead of reading from cookies
        if (userId) {
          // Save the pending token update to localStorage instead of cookies
          const pendingUpdate = {
            profileId: userId,
            amount: newBalance,
            previousAmount: userTokens,
            timestamp: new Date().toISOString(),
          }

          localStorage.setItem('pending_token_update', JSON.stringify(pendingUpdate))
          console.log("Saved pending token update:", pendingUpdate)
        }
      } catch (error) {
        console.error("Error saving pending token update:", error)
      }
    },
    [userId, userTokens],
  )

  const handleBidSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId || !eventId) return

    if (!songTitle || !artist) {
      toast({
        title: "Missing information",
        description: "Please enter both song title and artist",
        variant: "destructive",
      })
      return
    }

    if (bidAmount > userTokens) {
      toast({
        title: "Insufficient tokens",
        description: "You don't have enough tokens for this bid",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      if (isPreviewMode) {
        // In preview mode, just call onBid directly
        console.log(
          `[USER ACTION] User ${userId} bid ${bidAmount} tokens on "${songTitle}" by ${artist} for event ${eventId}`,
        )

        setTimeout(() => {
          toast({
            title: "Bid placed successfully!",
            description: `You bid ${bidAmount} tokens on "${songTitle}" by ${artist}`,
          })
          setSongTitle("")
          setArtist("")
          setBidAmount(10)
          setUserTokens((prev) => {
            const newBalance = prev - bidAmount
            savePendingTokenUpdate(newBalance)
            return newBalance
          })
          onBid()
          setIsSubmitting(false)
        }, 500) // Add a small delay to simulate processing
      } else {
        // In normal mode, call the server action
        const { bidOnSong } = await import("@/features/payments/actions/token-actions")
        const result = await bidOnSong(userId, eventId, songTitle, artist, bidAmount)

        console.log(
          `[USER ACTION] User ${userId} bid ${bidAmount} tokens on "${songTitle}" by ${artist} for event ${eventId}`,
        )
        console.log(
          `[DATA STORED] Bid data: ${JSON.stringify({
            userId,
            eventId,
            songTitle,
            artist,
            bidAmount,
            timestamp: new Date().toISOString(),
          })}`,
        )

        toast({
          title: "Bid placed successfully!",
          description: `You bid ${bidAmount} tokens on "${songTitle}" by ${artist}`,
        })
        setSongTitle("")
        setArtist("")
        setBidAmount(10)
        setUserTokens((prev) => {
          const newBalance = prev - bidAmount
          savePendingTokenUpdate(newBalance)
          return newBalance
        })
        onBid()
        setIsSubmitting(false)
      }
    } catch (error) {
      console.error("Error placing bid:", error)
      toast({
        title: "Error placing bid",
        description: "There was an error placing your bid. Please try again.",
        variant: "destructive",
      })
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Music className="h-5 w-5 text-purple-500" />
          <span>Request a Song</span>
        </CardTitle>
        <CardDescription>
          Bid tokens to get your song played at the event. Tokens are refunded if your song isn't played.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleBidSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="song-title">Song Title</Label>
            <Input
              id="song-title"
              placeholder="Enter song title"
              value={songTitle}
              onChange={(e) => setSongTitle(e.target.value)}
              className="bg-zinc-800 border-zinc-700"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="artist">Artist</Label>
            <Input
              id="artist"
              placeholder="Enter artist name"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              className="bg-zinc-800 border-zinc-700"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="bid-amount">Bid Amount</Label>
              <span className="text-sm text-zinc-400 flex items-center">
                <Coins className="h-3 w-3 mr-1 text-yellow-500" />
                {bidAmount} Tokens
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full bg-zinc-800 border-zinc-700"
                onClick={() => setBidAmount(Math.max(1, bidAmount - 1))}
                disabled={bidAmount <= 1}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <Slider
                id="bid-amount"
                min={1}
                max={Math.max(100, userTokens || 0)}
                step={1}
                value={[bidAmount || 1]}
                onValueChange={(value) => setBidAmount(value[0] || 1)}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full bg-zinc-800 border-zinc-700"
                onClick={() => setBidAmount(Math.min(userTokens, bidAmount + 1))}
                disabled={bidAmount >= userTokens}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            <div className="w-full bg-zinc-800 h-2 rounded-full mt-2">
              <div
                className="bg-gradient-to-r from-purple-600 to-blue-500 h-2 rounded-full"
                style={{ width: `${((bidAmount || 0) / Math.max(100, userTokens || 1)) * 100}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-zinc-500 mt-1">
              <span>1</span>
              <span>{Math.max(100, userTokens || 0)}</span>
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Button
          type="submit"
          onClick={handleBidSubmit}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600"
          disabled={isSubmitting || !songTitle || !artist || bidAmount <= 0 || bidAmount > userTokens}
        >
          {isSubmitting ? (
            "Submitting..."
          ) : (
            <>
              Place Bid <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
