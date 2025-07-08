import React, { useState, useEffect } from 'react'
import { useAuthStore } from '@/features/auth/stores/auth-store'
import { ProfileCompletionPrompt } from '@/features/auth/components/profile-completion-prompt'
import { DashboardLayout } from '@/shared/components/layout/DashboardLayout'
import { 
  Music, 
  Calendar, 
  Heart, 
  Users,
  MapPin,
  Clock,
  Star,
  DollarSign,
  Headphones,
  Edit3,
  ExternalLink,
  Play,
  UserPlus
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar'

interface AttendeeProfile {
  username?: string
  favorite_genres?: string[]
  music_preferences?: {
    energy_level?: 'low' | 'medium' | 'high'
    discovery_preference?: 'popular' | 'balanced' | 'underground'
  }
  location?: string
  bio?: string
}

interface Event {
  id: string
  name: string
  venue: string
  dj: string
  date: string
  time: string
  status: 'rsvp' | 'attended' | 'upcoming'
  genre: string
  image?: string
}

interface TipHistory {
  id: string
  dj: string
  song: string
  amount: number
  date: string
  venue: string
}

interface Request {
  id: string
  song: string
  artist: string
  dj: string
  venue: string
  date: string
  status: 'pending' | 'played' | 'declined'
  tokens: number
}

interface FollowedDj {
  id: string
  name: string
  avatar?: string
  genre: string
  followers: number
  next_gig?: string
}

export function AttendeeDashboard() {
  const { user } = useAuthStore()
  const [attendeeProfile, setAttendeeProfile] = useState<AttendeeProfile | null>(null)
  
  const [upcomingEvents] = useState<Event[]>([
    {
      id: '1',
      name: 'Summer Beats Festival',
      venue: 'Electric Lounge',
      dj: 'DJ Alex Rivera',
      date: '2024-07-15',
      time: '22:00',
      status: 'rsvp',
      genre: 'Electronic'
    },
    {
      id: '2',
      name: 'Saturday Night Mix',
      venue: 'Rooftop Club',
      dj: 'DJ Maya Chen',
      date: '2024-07-20',
      time: '21:00',
      status: 'upcoming',
      genre: 'House'
    }
  ])

  const [tipHistory] = useState<TipHistory[]>([
    {
      id: '1',
      dj: 'DJ Alex Rivera',
      song: 'Blinding Lights',
      amount: 15,
      date: '2024-07-10',
      venue: 'Electric Lounge'
    },
    {
      id: '2',
      dj: 'DJ Maya Chen',
      song: 'One More Time',
      amount: 20,
      date: '2024-07-08',
      venue: 'Rooftop Club'
    },
    {
      id: '3',
      dj: 'DJ Carlos Mix',
      song: 'Levels',
      amount: 12,
      date: '2024-07-05',
      venue: 'Underground'
    }
  ])

  const [recentRequests] = useState<Request[]>([
    {
      id: '1',
      song: 'Sicko Mode',
      artist: 'Travis Scott',
      dj: 'DJ Alex Rivera',
      venue: 'Electric Lounge',
      date: '2024-07-10',
      status: 'played',
      tokens: 15
    },
    {
      id: '2',
      song: 'Bad Bunny Mix',
      artist: 'Bad Bunny',
      dj: 'DJ Maya Chen',
      venue: 'Rooftop Club',
      date: '2024-07-08',
      status: 'pending',
      tokens: 18
    }
  ])

  const [followedDjs] = useState<FollowedDj[]>([
    {
      id: '1',
      name: 'DJ Alex Rivera',
      genre: 'Electronic',
      followers: 1247,
      next_gig: 'Electric Lounge - Jul 15'
    },
    {
      id: '2',
      name: 'DJ Maya Chen',
      genre: 'House',
      followers: 892,
      next_gig: 'Rooftop Club - Jul 20'
    },
    {
      id: '3',
      name: 'DJ Carlos Mix',
      genre: 'Latin',
      followers: 634,
      next_gig: 'Underground - Jul 22'
    }
  ])

  useEffect(() => {
    // Load attendee profile data from Supabase
    const loadAttendeeProfile = async () => {
      if (!user) return

      try {
        const { createClientClient } = await import('@/shared/services/client')
        const supabase = createClientClient()
        
        if (supabase) {
          const { data, error } = await supabase
            .from('attendee_profiles')
            .select('*')
            .eq('profile_id', user.id)
            .single()

          if (data && !error) {
            setAttendeeProfile(data)
          }
        }
      } catch (error) {
        console.error('Error loading attendee profile:', error)
      }
    }

    loadAttendeeProfile()
  }, [user])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'played':
        return 'bg-green-600'
      case 'pending':
        return 'bg-yellow-600'
      case 'declined':
        return 'bg-red-600'
      default:
        return 'bg-gray-600'
    }
  }

  return (
    <DashboardLayout title="Attendee Dashboard" role="attendee">
      <div className="space-y-6">
        {/* Profile Completion Prompt */}
        <ProfileCompletionPrompt />

        {/* Profile Section */}
        <Card className="bg-zinc-900 border-zinc-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Users className="w-5 h-5 text-blue-400" />
              Attendee Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-6">
              {/* Profile Image & Basic Info */}
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={user?.avatar_url} />
                  <AvatarFallback className="bg-blue-600 text-white text-lg">
                    {attendeeProfile?.username?.charAt(0) || user?.name?.charAt(0) || 'A'}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-white">
                    {attendeeProfile?.username || user?.name || 'Music Lover'}
                  </h3>
                  <p className="text-gray-400">{user?.email}</p>
                  <div className="flex items-center gap-1 text-sm text-gray-400 mt-2">
                    <MapPin className="w-3 h-3" />
                    <span>{attendeeProfile?.location || 'San Francisco, CA'}</span>
                  </div>
                </div>
              </div>

              {/* Profile Details */}
              <div className="flex-1 space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Bio</h4>
                  <p className="text-white">
                    {attendeeProfile?.bio || 'Music enthusiast who loves discovering new beats and supporting local DJs.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Favorite Genres</h4>
                    <div className="flex flex-wrap gap-2">
                      {attendeeProfile?.favorite_genres?.map((genre, index) => (
                        <Badge key={index} variant="outline" className="border-blue-500 text-blue-300">
                          {genre}
                        </Badge>
                      )) || ['Electronic', 'House', 'Hip-Hop', 'Latin'].map((genre, index) => (
                        <Badge key={index} variant="outline" className="border-blue-500 text-blue-300">
                          {genre}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Music Preferences</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">Energy Level:</span>
                        <Badge variant="secondary">
                          {attendeeProfile?.music_preferences?.energy_level || 'High'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">Discovery:</span>
                        <Badge variant="secondary">
                          {attendeeProfile?.music_preferences?.discovery_preference || 'Balanced'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button className="bg-blue-600 hover:bg-blue-700">
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
          {/* Upcoming RSVP'd Events */}
          <Card className="bg-zinc-900 border-zinc-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Calendar className="w-5 h-5 text-purple-400" />
                Upcoming Events
              </CardTitle>
              <CardDescription>Events you've RSVP'd to</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                        <Headphones className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-medium text-white">{event.name}</h4>
                        <p className="text-sm text-gray-400">{event.venue} • {event.dj}</p>
                        <p className="text-sm text-gray-400">
                          {new Date(event.date).toLocaleDateString()} at {event.time}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge 
                        variant={event.status === 'rsvp' ? 'default' : 'secondary'}
                        className="mb-2"
                      >
                        {event.status}
                      </Badge>
                      <p className="text-xs text-gray-400">{event.genre}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button className="w-full mt-4" variant="outline">
                <ExternalLink className="w-4 h-4 mr-2" />
                Browse More Events
              </Button>
            </CardContent>
          </Card>

          {/* Tip History */}
          <Card className="bg-zinc-900 border-zinc-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <DollarSign className="w-5 h-5 text-green-400" />
                Tip History
              </CardTitle>
              <CardDescription>Your recent tips to DJs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="bg-zinc-800 rounded-lg p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-400">Total Tips This Month</span>
                    <span className="text-lg font-bold text-green-400">
                      {formatCurrency(tipHistory.reduce((sum, tip) => sum + tip.amount, 0))}
                    </span>
                  </div>
                </div>
                
                {tipHistory.map((tip) => (
                  <div key={tip.id} className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                    <div>
                      <h4 className="font-medium text-white">{tip.song}</h4>
                      <p className="text-sm text-gray-400">{tip.dj} • {tip.venue}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(tip.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-green-400">
                        {formatCurrency(tip.amount)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <Button className="w-full mt-4" variant="outline">
                View All Tips
              </Button>
            </CardContent>
          </Card>

          {/* Recent Requests */}
          <Card className="bg-zinc-900 border-zinc-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Music className="w-5 h-5 text-yellow-400" />
                Recent Requests
              </CardTitle>
              <CardDescription>Your song requests to DJs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentRequests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-yellow-600 rounded-full flex items-center justify-center">
                        <Play className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h4 className="font-medium text-white">{request.song}</h4>
                        <p className="text-sm text-gray-400">by {request.artist}</p>
                        <p className="text-xs text-gray-500">
                          {request.dj} • {request.venue}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(request.status)}>
                        {request.status}
                      </Badge>
                      <p className="text-xs text-gray-400 mt-1">
                        {request.tokens} tokens
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <Button className="w-full mt-4" variant="outline">
                View All Requests
              </Button>
            </CardContent>
          </Card>

          {/* DJ Follow List */}
          <Card className="bg-zinc-900 border-zinc-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Heart className="w-5 h-5 text-pink-400" />
                Following DJs
              </CardTitle>
              <CardDescription>DJs you follow for updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {followedDjs.map((dj) => (
                  <div key={dj.id} className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={dj.avatar} />
                        <AvatarFallback className="bg-pink-600 text-white">
                          {dj.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium text-white">{dj.name}</h4>
                        <p className="text-sm text-gray-400">{dj.genre}</p>
                        <p className="text-xs text-gray-500">
                          {dj.followers.toLocaleString()} followers
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {dj.next_gig && (
                        <div className="mb-2">
                          <p className="text-xs text-gray-400">Next gig:</p>
                          <p className="text-xs text-white">{dj.next_gig}</p>
                        </div>
                      )}
                      <Button size="sm" variant="outline" className="border-pink-500 text-pink-400">
                        <Heart className="w-3 h-3 mr-1" />
                        Following
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <Button className="w-full mt-4" variant="outline">
                <UserPlus className="w-4 h-4 mr-2" />
                Discover More DJs
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
} 