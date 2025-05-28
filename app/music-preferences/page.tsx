"use client"

import { useState, useEffect } from "react"
import { AppLayout } from "@/ui/sidebar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/ui/card"
import { Button } from "@/ui/button"
import { Label } from "@/ui/label"
import { RadioGroup, RadioGroupItem } from "@/ui/radio-group"
import { Slider } from "@/ui/slider"
import { Music, Save, RefreshCw } from "lucide-react"
import { useUser } from "@/hooks/use-user"
import { toast } from "@/shared/hooks/use-toast"
import { SongRecommendations } from "@/features/songs/components/song-recommendations"
import { getUserPreferences, saveUserPreferences } from "@/shared/actions/ai-actions"

const GENRES = [
  { value: "electronic", label: "Electronic" },
  { value: "pop", label: "Pop" },
  { value: "rock", label: "Rock" },
  { value: "hip-hop", label: "Hip-Hop" },
  { value: "rnb", label: "R&B" },
  { value: "latin", label: "Latin" },
  { value: "jazz", label: "Jazz" },
  { value: "classical", label: "Classical" },
]

const MOODS = [
  { value: "energetic", label: "Energetic" },
  { value: "chill", label: "Chill" },
  { value: "happy", label: "Happy" },
  { value: "melancholic", label: "Melancholic" },
  { value: "romantic", label: "Romantic" },
  { value: "dark", label: "Dark" },
]

export default function MusicPreferencesPage() {
  const { user, loading: userLoading } = useUser()
  const [selectedGenre, setSelectedGenre] = useState("electronic")
  const [selectedMood, setSelectedMood] = useState("energetic")
  const [danceability, setDanceability] = useState(80)
  const [energy, setEnergy] = useState(70)
  const [popularity, setPopularity] = useState(60)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    async function loadUserPreferences() {
      if (!user) return

      setIsLoading(true)
      try {
        const prefs = await getUserPreferences(user.id)
        if (prefs) {
          setSelectedGenre(prefs.genre || "electronic")
          setSelectedMood(prefs.mood || "energetic")
          setDanceability(prefs.danceability || 80)
          setEnergy(prefs.energy || 70)
          setPopularity(prefs.popularity || 60)
        }
      } catch (error) {
        console.error("Error loading user preferences:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (!userLoading && user) {
      loadUserPreferences()
    }
  }, [user, userLoading])

  const handleSavePreferences = async () => {
    if (!user) {
      toast({
        title: "Not logged in",
        description: "Please log in to save your preferences.",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)

    try {
      await saveUserPreferences(user.id, {
        genre: selectedGenre,
        mood: selectedMood,
        danceability,
        energy,
        popularity,
      })

      toast({
        title: "Preferences Saved",
        description: "Your music preferences have been updated.",
      })
    } catch (error) {
      console.error("Error saving preferences:", error)
      toast({
        title: "Error",
        description: "Failed to save preferences. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <AppLayout>
      <div className="container mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold mb-6">Music Preferences</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Music className="h-5 w-5 text-purple-500" />
                  <span>Your Music Preferences</span>
                </CardTitle>
                <CardDescription>Customize your music preferences for better recommendations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {isLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <RefreshCw className="h-8 w-8 text-purple-500 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-base">Preferred Genre</Label>
                      <RadioGroup
                        value={selectedGenre}
                        onValueChange={setSelectedGenre}
                        className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2"
                      >
                        {GENRES.map((genre) => (
                          <div key={genre.value} className="flex items-center space-x-2">
                            <RadioGroupItem
                              value={genre.value}
                              id={`genre-${genre.value}`}
                              className="text-purple-500"
                            />
                            <Label htmlFor={`genre-${genre.value}`} className="cursor-pointer">
                              {genre.label}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>

                    <div>
                      <Label className="text-base">Preferred Mood</Label>
                      <RadioGroup
                        value={selectedMood}
                        onValueChange={setSelectedMood}
                        className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2"
                      >
                        {MOODS.map((mood) => (
                          <div key={mood.value} className="flex items-center space-x-2">
                            <RadioGroupItem value={mood.value} id={`mood-${mood.value}`} className="text-purple-500" />
                            <Label htmlFor={`mood-${mood.value}`} className="cursor-pointer">
                              {mood.label}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label>Danceability</Label>
                          <span className="text-sm text-zinc-400">{danceability}%</span>
                        </div>
                        <Slider
                          value={[danceability]}
                          onValueChange={(value) => setDanceability(value[0])}
                          min={0}
                          max={100}
                          step={1}
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label>Energy</Label>
                          <span className="text-sm text-zinc-400">{energy}%</span>
                        </div>
                        <Slider
                          value={[energy]}
                          onValueChange={(value) => setEnergy(value[0])}
                          min={0}
                          max={100}
                          step={1}
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label>Popularity</Label>
                          <span className="text-sm text-zinc-400">{popularity}%</span>
                        </div>
                        <Slider
                          value={[popularity]}
                          onValueChange={(value) => setPopularity(value[0])}
                          min={0}
                          max={100}
                          step={1}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button
                  onClick={handleSavePreferences}
                  disabled={isLoading || isSaving}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Preferences
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>

          <div className="space-y-6">
            <SongRecommendations genre={selectedGenre} mood={selectedMood} />

            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-lg">Why This Matters</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-zinc-400">
                  Your music preferences help our AI system recommend songs that match your taste. These recommendations
                  will be used to suggest songs for you to bid on at events, and to help DJs create playlists that
                  appeal to the audience.
                </p>
                <div className="mt-4 p-3 bg-purple-900/20 border border-purple-800/30 rounded-md">
                  <p className="text-sm text-purple-300">
                    <strong>Pro Tip:</strong> Update your preferences regularly to get better recommendations as your
                    music taste evolves.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
