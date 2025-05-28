"use client"

import { useState } from "react"
import { Search, Music, Play, Pause, Clock, Plus, Filter } from "lucide-react"
import { Card, CardContent } from "@/ui/card"
import { Button } from "@/ui/button"
import { Input } from "@/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs"

export default function MusicLibraryPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null)

  // Mock tracks data
  const tracks = [
    {
      id: "track1",
      title: "Deep Groove",
      artist: "DJ Pulse",
      genre: "Deep House",
      bpm: 124,
      key: "Am",
      duration: "6:42",
      lastPlayed: "2 days ago",
    },
    {
      id: "track2",
      title: "Techno Fusion",
      artist: "DJ Pulse",
      genre: "Techno",
      bpm: 130,
      key: "Fm",
      duration: "5:18",
      lastPlayed: "1 week ago",
    },
    {
      id: "track3",
      title: "Progressive Journey",
      artist: "DJ Pulse",
      genre: "Progressive House",
      bpm: 128,
      key: "Bm",
      duration: "7:24",
      lastPlayed: "Yesterday",
    },
    {
      id: "track4",
      title: "Midnight Drive",
      artist: "DJ Pulse",
      genre: "Deep House",
      bpm: 122,
      key: "Gm",
      duration: "6:10",
      lastPlayed: "3 days ago",
    },
    {
      id: "track5",
      title: "Urban Rhythm",
      artist: "DJ Pulse",
      genre: "Tech House",
      bpm: 126,
      key: "Cm",
      duration: "5:45",
      lastPlayed: "Today",
    },
  ]

  // Mock playlists data
  const playlists = [
    {
      id: "playlist1",
      name: "Club Essentials",
      trackCount: 42,
      duration: "3h 24m",
      lastUpdated: "2 days ago",
    },
    {
      id: "playlist2",
      name: "Deep House Vibes",
      trackCount: 28,
      duration: "2h 12m",
      lastUpdated: "1 week ago",
    },
    {
      id: "playlist3",
      name: "Techno Night",
      trackCount: 35,
      duration: "2h 45m",
      lastUpdated: "Yesterday",
    },
  ]

  const filteredTracks = tracks.filter(
    (track) =>
      track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.genre.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const togglePlay = (trackId: string) => {
    if (currentlyPlaying === trackId) {
      setCurrentlyPlaying(null)
    } else {
      setCurrentlyPlaying(trackId)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="mb-8 text-3xl font-bold">Music Library</h1>

      <div className="mb-8 flex flex-col gap-4 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Search tracks, artists, or genres..."
            className="border-gray-800 bg-black pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Tracks
          </Button>
        </div>
      </div>

      <Tabs defaultValue="tracks" className="w-full">
        <TabsList className="mb-6 grid w-full grid-cols-2">
          <TabsTrigger value="tracks">Tracks</TabsTrigger>
          <TabsTrigger value="playlists">Playlists</TabsTrigger>
        </TabsList>

        <TabsContent value="tracks">
          <Card className="bg-gray-900 text-white">
            <CardContent className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800 text-left text-sm text-gray-400">
                      <th className="pb-3 pl-3"></th>
                      <th className="pb-3">Title</th>
                      <th className="pb-3">Artist</th>
                      <th className="pb-3">Genre</th>
                      <th className="pb-3">BPM</th>
                      <th className="pb-3">Key</th>
                      <th className="pb-3">
                        <Clock className="h-4 w-4" />
                      </th>
                      <th className="pb-3">Last Played</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTracks.map((track) => (
                      <tr key={track.id} className="border-b border-gray-800 text-sm hover:bg-gray-800/30">
                        <td className="py-3 pl-3">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => togglePlay(track.id)}>
                            {currentlyPlaying === track.id ? (
                              <Pause className="h-4 w-4" />
                            ) : (
                              <Play className="h-4 w-4" />
                            )}
                          </Button>
                        </td>
                        <td className="py-3 font-medium">{track.title}</td>
                        <td className="py-3">{track.artist}</td>
                        <td className="py-3">{track.genre}</td>
                        <td className="py-3">{track.bpm}</td>
                        <td className="py-3">{track.key}</td>
                        <td className="py-3">{track.duration}</td>
                        <td className="py-3">{track.lastPlayed}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="playlists">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {playlists.map((playlist) => (
              <Card key={playlist.id} className="bg-gray-900 text-white">
                <CardContent className="p-6">
                  <div className="mb-4 flex h-40 items-center justify-center rounded-lg bg-black">
                    <Music className="h-16 w-16 text-gray-700" />
                  </div>

                  <h3 className="mb-1 text-lg font-semibold">{playlist.name}</h3>

                  <div className="mb-4 flex items-center gap-2 text-sm text-gray-400">
                    <span>{playlist.trackCount} tracks</span>
                    <span>•</span>
                    <span>{playlist.duration}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Updated {playlist.lastUpdated}</span>
                    <Button size="sm">Open</Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Card className="flex h-full items-center justify-center border-2 border-dashed border-gray-800 bg-transparent p-6">
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-900/20">
                  <Plus className="h-8 w-8 text-purple-400" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">Create Playlist</h3>
                <p className="mb-4 text-sm text-gray-400">Organize your tracks into custom playlists</p>
                <Button>New Playlist</Button>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
