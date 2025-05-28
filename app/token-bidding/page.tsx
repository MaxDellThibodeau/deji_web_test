"use client"

import { useState, useEffect } from "react"
import { TokenPurchaseCard } from "@/features/payments/components/token-purchase-card"
import { SongBidding } from "@/features/songs/components/song-bidding"
import { CurrentEvent } from "@/features/events/components/current-event"
import { useUser } from "@/hooks/use-user"
import { PublicHeader } from "@/shared/components/layout/public-header"

// Mock data for preview mode
const MOCK_USER_TOKENS = 100
const MOCK_EVENT = {
  id: "00000000-0000-0000-0000-000000000000", // Valid UUID format for mock
  title: "Saturday Night Dance Party",
  description: "Join us for an unforgettable night of music and dancing!",
  venue: "Club Neon",
  event_date: new Date().toISOString(),
  status: "live",
  attendees: 120,
  dj_name: "DJ Max",
}

export default function TokenBiddingPage() {
  const { user, loading: userLoading } = useUser()
  const [userTokens, setUserTokens] = useState(MOCK_USER_TOKENS)
  const [currentEvent, setCurrentEvent] = useState(MOCK_EVENT)
  const [isLoading, setIsLoading] = useState(true)
  const [isPreviewMode, setIsPreviewMode] = useState(true) // Default to preview mode

  useEffect(() => {
    // Always use mock data to avoid database errors
    const loadData = async () => {
      setUserTokens(MOCK_USER_TOKENS)
      setCurrentEvent(MOCK_EVENT)
      setIsPreviewMode(true)
      setIsLoading(false)
    }

    if (!userLoading) {
      loadData()
    }
  }, [user, userLoading])

  const handleTokenUpdate = async () => {
    // In preview mode, just update the state directly
    setUserTokens((prev) => prev + 50) // Assume they bought 50 tokens
  }

  const handleBid = async () => {
    // In preview mode, just update the state directly
    setUserTokens((prev) => Math.max(0, prev - 10)) // Assume they bid 10 tokens
  }

  // If user is not logged in, show login prompt
  if (!userLoading && !user && !isPreviewMode) {
    return (
      <>
        <PublicHeader />
        <div className="container mx-auto max-w-6xl px-4 py-8">
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <h1 className="text-3xl font-bold mb-4">Token Bidding System</h1>
            <p className="text-xl mb-8">Please log in to access the token bidding system.</p>
            <a
              href="/login"
              className="px-6 py-3 rounded-md bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white font-medium"
            >
              Log In
            </a>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <PublicHeader user={user} />
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Token Bidding System</h1>

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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Token Purchase Card */}
              <div className="md:col-span-1">
                <TokenPurchaseCard
                  userId={user?.id || "mock-user-id"}
                  currentBalance={userTokens}
                  onPurchase={handleTokenUpdate}
                  isPreviewMode={isPreviewMode}
                />
              </div>

              {/* Song Bidding Section */}
              <div className="md:col-span-2">
                <SongBidding
                  userId={user?.id || "mock-user-id"}
                  eventId={currentEvent?.id || "00000000-0000-0000-0000-000000000000"}
                  userTokens={userTokens}
                  onBid={handleBid}
                  isPreviewMode={isPreviewMode}
                />
              </div>
            </div>

            {/* Current Event Information */}
            <div className="mt-6">
              <CurrentEvent event={currentEvent} />
            </div>
          </>
        )}
      </div>
    </>
  )
}
