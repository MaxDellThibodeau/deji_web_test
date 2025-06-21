"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card"
import { Badge } from "@/ui/badge"
import { Button } from "@/ui/button"
import { Trophy, Music, TrendingUp, Clock, Star, ExternalLink } from "lucide-react"
import Image from "next/image"

interface SongRankingProps {
  songs: Array<{
    id: string
    title: string
    artist: string
    tokens: number
    bidders: number
    ranking_score?: number
    album_art_url?: string
    music_source?: 'spotify' | 'soundcloud' | 'manual'
    duration_ms?: number
    popularity_score?: number
    external_url?: string
    album?: string
    genre?: string
  }>
  onSongClick?: (song: any) => void
}

export function SongRanking({ songs, onSongClick }: SongRankingProps) {
  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const getRankingColor = (rank: number) => {
    if (rank === 1) return "bg-yellow-500 text-black"
    if (rank === 2) return "bg-gray-400 text-black"
    if (rank === 3) return "bg-amber-600 text-white"
    return "bg-zinc-700 text-white"
  }

  const getSourceIcon = (source?: string) => {
    switch (source) {
      case 'spotify':
        return <div className="w-4 h-4 bg-green-500 rounded-full" />
      case 'soundcloud':
        return <div className="w-4 h-4 bg-orange-500 rounded-full" />
      default:
        return <Music className="w-4 h-4 text-zinc-400" />
    }
  }

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Song Rankings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {songs.map((song, index) => (
            <div
              key={song.id}
              className="flex items-center p-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors cursor-pointer border border-zinc-700"
              onClick={() => onSongClick?.(song)}
            >
              {/* Ranking Badge */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3 ${getRankingColor(index + 1)}`}>
                {index + 1}
              </div>

              {/* Album Art */}
              <div className="relative h-12 w-12 rounded overflow-hidden mr-3 flex-shrink-0">
                <Image
                  src={song.album_art_url || "/placeholder-album.png"}
                  alt={`${song.title} album art`}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Song Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium truncate">{song.title}</h3>
                  {getSourceIcon(song.music_source)}
                </div>
                <p className="text-sm text-zinc-400 truncate">{song.artist}</p>
                {song.album && (
                  <p className="text-xs text-zinc-500 truncate">{song.album}</p>
                )}
                
                {/* Metadata Row */}
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center gap-1 text-xs text-zinc-400">
                    <TrendingUp className="w-3 h-3" />
                    <span>{song.tokens} tokens</span>
                  </div>
                  
                  {song.bidders > 0 && (
                    <div className="flex items-center gap-1 text-xs text-zinc-400">
                      <Music className="w-3 h-3" />
                      <span>{song.bidders} bidders</span>
                    </div>
                  )}
                  
                  {song.duration_ms && (
                    <div className="flex items-center gap-1 text-xs text-zinc-400">
                      <Clock className="w-3 h-3" />
                      <span>{formatDuration(song.duration_ms)}</span>
                    </div>
                  )}
                  
                  {song.popularity_score && (
                    <div className="flex items-center gap-1 text-xs text-zinc-400">
                      <Star className="w-3 h-3" />
                      <span>{song.popularity_score}</span>
                    </div>
                  )}
                  
                  {song.genre && (
                    <Badge variant="outline" className="text-xs">
                      {song.genre}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Ranking Score */}
              {song.ranking_score && (
                <div className="text-right ml-3">
                  <div className="text-lg font-bold text-purple-400">
                    {song.ranking_score}
                  </div>
                  <div className="text-xs text-zinc-500">score</div>
                </div>
              )}

              {/* External Link */}
              {song.external_url && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    window.open(song.external_url, '_blank')
                  }}
                  className="ml-2 h-8 w-8 p-0"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>

        {songs.length === 0 && (
          <div className="text-center py-8">
            <Music className="mx-auto h-12 w-12 text-zinc-600 mb-3" />
            <h3 className="text-lg font-medium text-zinc-300">No songs ranked yet</h3>
            <p className="text-zinc-500 mt-1">Be the first to request a song!</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 