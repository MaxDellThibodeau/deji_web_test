"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { Music, RefreshCw } from "lucide-react"
import { getSongRecommendations } from "@/shared/actions/ai-actions"

interface SongRecommendationsProps {
  genre?: string
  mood?: string
}

export function SongRecommendations({ genre = "electronic", mood = "energetic" }: SongRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadRecommendations = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const songs = await getSongRecommendations(genre, mood)
      setRecommendations(songs)
    } catch (err) {
      console.error("Error loading recommendations:", err)
      setError("Failed to load recommendations. Please try again.")
      // Fallback recommendations
      setRecommendations([
        { title: "Tsunami", artist: "Dash Berlin" },
        { title: "One", artist: "Veracocha" },
        { title: "Airwave", artist: "Rank 1" },
        { title: "Silence", artist: "Delerium ft. Sarah McLachlan" },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadRecommendations()
  }, [genre, mood])

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Music className="h-5 w-5 text-purple-500" />
          <span>AI Song Recommendations</span>
        </CardTitle>
        <CardDescription>
          Personalized song suggestions based on {genre} and {mood} mood
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <RefreshCw className="h-8 w-8 text-purple-500 animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-6">
            <p className="text-red-400 mb-4">{error}</p>
            <Button variant="outline" onClick={loadRecommendations} className="bg-zinc-800 border-zinc-700">
              Try Again
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {recommendations.map((song, index) => (
              <div key={index} className="p-3 rounded-md bg-zinc-800 border border-zinc-700">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-900/50 text-purple-300">
                    <Music className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium">{song.title}</p>
                    <p className="text-sm text-zinc-400">{song.artist}</p>
                  </div>
                </div>
              </div>
            ))}
            <div className="pt-2">
              <Button variant="outline" onClick={loadRecommendations} className="w-full bg-zinc-800 border-zinc-700">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Recommendations
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
