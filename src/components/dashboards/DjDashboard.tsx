import React, { useState, useEffect } from 'react'
import { useAuthStore } from '@/features/auth/stores/auth-store'
import { ProfileCompletionPrompt } from '@/features/auth/components/profile-completion-prompt'
import { DashboardLayout } from '@/shared/components/layout/DashboardLayout'
import { 
  Music, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Headphones,
  MapPin,
  Clock,
  Users,
  Play,
  Share2,
  Edit3,
  Star
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar'

interface DjProfile {
  stage_name?: string
  bio?: string
  genres?: string[]
  social_links?: {
    instagram?: string
    twitter?: string
    soundcloud?: string
    spotify?: string
  }
  availability?: 'available' | 'busy' | 'booked'
  hourly_rate?: number
  location?: string
  experience_years?: number
}

interface Gig {
  id: string
  event_name: string
  venue: string
  date: string
  time: string
  status: 'confirmed' | 'pending' | 'completed'
  payment: number
}

interface Request {
  id: string
  song: string
  artist: string
  requester: string
  tokens: number
  timestamp: string
}

interface Track {
  id: string
  title: string
  artist: string
  plays: number
  tips: number
}

export function DjDashboard() {
  const { user } = useAuthStore()
  const [djProfile, setDjProfile] = useState<DjProfile | null>(null)
  const [upcomingGigs] = useState<Gig[]>([
    {
      id: '1',
      event_name: 'Summer Beats Festival',
      venue: 'Electric Lounge',
      date: '2024-07-15',
      time: '22:00',
      status: 'confirmed',
      payment: 800
    },
    {
      id: '2',
      event_name: 'Saturday Night Mix',
      venue: 'Rooftop Club',
      date: '2024-07-20',
      time: '21:00',
      status: 'pending',
      payment: 650
    }
  ])

  const [requestQueue] = useState<Request[]>([
    {
      id: '1',
      song: 'Blinding Lights',
      artist: 'The Weeknd',
      requester: 'Sarah M.',
      tokens: 15,
      timestamp: '2 min ago'
    },
    {
      id: '2',
      song: 'One More Time',
      artist: 'Daft Punk',
      requester: 'Alex R.',
      tokens: 12,
      timestamp: '5 min ago'
    }
  ])

  const [topTracks] = useState<Track[]>([
    {
      id: '1',
      title: 'Electronic Vibes Mix',
      artist: 'DJ Alex Rivera',
      plays: 2847,
      tips: 124
    },
    {
      id: '2',
      title: 'Midnight House Session',
      artist: 'DJ Alex Rivera',
      plays: 1923,
      tips: 89
    }
  ])

  useEffect(() => {
    // Load DJ profile data from Supabase
    const loadDjProfile = async () => {
      if (!user) return

      try {
        const { createClientClient } = await import('@/shared/services/client')
        const supabase = createClientClient()
        
        if (supabase) {
          const { data, error } = await supabase
            .from('dj_profiles')
            .select('*')
            .eq('profile_id', user.id)
            .single()

          if (data && !error) {
            setDjProfile(data)
          }
        }
      } catch (error) {
        console.error('Error loading DJ profile:', error)
      }
    }

    loadDjProfile()
  }, [user])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100)
  }

  return (
    <DashboardLayout title="DJ Dashboard" role="dj">
      <div className="space-y-6">
        {/* Profile Completion Prompt */}
        <ProfileCompletionPrompt />

        {/* Profile Section */}
        <Card className="bg-zinc-900 border-zinc-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Headphones className="w-5 h-5 text-purple-400" />
              DJ Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-6">
              {/* Profile Image & Basic Info */}
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={user?.avatar_url} />
                  <AvatarFallback className="bg-purple-600 text-white text-lg">
                    {djProfile?.stage_name?.charAt(0) || user?.name?.charAt(0) || 'DJ'}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-white">
                    {djProfile?.stage_name || `${user?.name || 'DJ'}`}
                  </h3>
                  <p className="text-gray-400">{user?.email}</p>
                  <Badge 
                    variant={djProfile?.availability === 'available' ? 'default' : 'secondary'}
                    className="mt-2"
                  >
                    {djProfile?.availability || 'Available'}
                  </Badge>
                </div>
              </div>

              {/* Profile Details */}
              <div className="flex-1 space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Bio</h4>
                  <p className="text-white">
                    {djProfile?.bio || 'Professional DJ specializing in electronic and dance music.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Genres</h4>
                    <div className="flex flex-wrap gap-2">
                      {djProfile?.genres?.map((genre, index) => (
                        <Badge key={index} variant="outline" className="border-purple-500 text-purple-300">
                          {genre}
                        </Badge>
                      )) || ['Electronic', 'House', 'Techno'].map((genre, index) => (
                        <Badge key={index} variant="outline" className="border-purple-500 text-purple-300">
                          {genre}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Experience</h4>
                    <div className="flex items-center gap-4 text-white">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span>{djProfile?.experience_years || 5}+ years</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span>{djProfile?.location || 'San Francisco, CA'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Social Links</h4>
                  <div className="flex gap-3">
                    <Button size="sm" variant="outline" className="border-zinc-600">
                      <Share2 className="w-4 h-4 mr-1" />
                      Instagram
                    </Button>
                    <Button size="sm" variant="outline" className="border-zinc-600">
                      <Music className="w-4 h-4 mr-1" />
                      SoundCloud
                    </Button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dashboard Widgets Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Gigs */}
          <Card className="bg-zinc-900 border-zinc-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Calendar className="w-5 h-5 text-blue-400" />
                Upcoming Gigs
              </CardTitle>
              <CardDescription>Your confirmed and pending events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingGigs.map((gig) => (
                  <div key={gig.id} className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                    <div>
                      <h4 className="font-medium text-white">{gig.event_name}</h4>
                      <p className="text-sm text-gray-400">{gig.venue}</p>
                      <p className="text-sm text-gray-400">
                        {new Date(gig.date).toLocaleDateString()} at {gig.time}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge 
                        variant={gig.status === 'confirmed' ? 'default' : 'secondary'}
                        className="mb-1"
                      >
                        {gig.status}
                      </Badge>
                      <p className="text-sm font-medium text-green-400">
                        {formatCurrency(gig.payment)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <Button className="w-full mt-4" variant="outline">
                View All Bookings
              </Button>
            </CardContent>
          </Card>

          {/* Request Queue */}
          <Card className="bg-zinc-900 border-zinc-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Music className="w-5 h-5 text-green-400" />
                Request Queue
              </CardTitle>
              <CardDescription>Live song requests from the audience</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {requestQueue.map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                    <div>
                      <h4 className="font-medium text-white">{request.song}</h4>
                      <p className="text-sm text-gray-400">by {request.artist}</p>
                      <p className="text-xs text-gray-500">Requested by {request.requester} • {request.timestamp}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-yellow-600">
                        {request.tokens} tokens
                      </Badge>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">
                        <Play className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <Button className="w-full mt-4" variant="outline">
                View Full Queue
              </Button>
            </CardContent>
          </Card>

          {/* Recent Tips / Payments */}
          <Card className="bg-zinc-900 border-zinc-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <DollarSign className="w-5 h-5 text-yellow-400" />
                Recent Tips & Payments
              </CardTitle>
              <CardDescription>Your earnings this week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-green-400">$1,247</p>
                    <p className="text-xs text-gray-400">This Week</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-400">$284</p>
                    <p className="text-xs text-gray-400">Tips</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-purple-400">$963</p>
                    <p className="text-xs text-gray-400">Gig Pay</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {[
                    { type: 'Tip', amount: 25, from: 'Sarah M.', time: '2h ago' },
                    { type: 'Gig Payment', amount: 800, from: 'Electric Lounge', time: '1d ago' },
                    { type: 'Tip', amount: 15, from: 'Mike R.', time: '2d ago' }
                  ].map((payment, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-zinc-800 rounded">
                      <div>
                        <p className="text-sm text-white">{payment.type}</p>
                        <p className="text-xs text-gray-400">from {payment.from}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-green-400">+{formatCurrency(payment.amount)}</p>
                        <p className="text-xs text-gray-400">{payment.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Track Analytics */}
          <Card className="bg-zinc-900 border-zinc-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <TrendingUp className="w-5 h-5 text-purple-400" />
                Track Analytics
              </CardTitle>
              <CardDescription>Your most popular tracks this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topTracks.map((track, index) => (
                  <div key={track.id} className="flex items-center gap-3 p-3 bg-zinc-800 rounded-lg">
                    <div className="w-8 h-8 bg-purple-600 rounded flex items-center justify-center">
                      <span className="text-white font-bold">{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-white">{track.title}</h4>
                      <p className="text-sm text-gray-400">{track.artist}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3 text-gray-400" />
                          <span className="text-white">{track.plays.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-400" />
                          <span className="text-white">{track.tips}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Button className="w-full mt-4" variant="outline">
                View Detailed Analytics
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
} 