import React, { useState, useEffect } from 'react'
import { useAuthStore } from '@/features/auth/stores/auth-store'
import { ProfileCompletionPrompt } from '@/features/auth/components/profile-completion-prompt'
import { DashboardLayout } from '@/shared/components/layout/DashboardLayout'
import { 
  Building, 
  Calendar, 
  Users, 
  TrendingUp,
  MapPin,
  Clock,
  Star,
  DollarSign,
  Settings,
  Edit3,
  Music,
  Phone,
  Mail,
  Wifi,
  Volume2,
  Lightbulb,
  MessageSquare
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar'

interface VenueProfile {
  venue_name?: string
  description?: string
  location?: string
  address?: string
  hours_of_operation?: {
    [key: string]: { open: string; close: string }
  }
  equipment_list?: string[]
  capacity?: number
  contact_info?: {
    phone?: string
    email?: string
    website?: string
  }
  amenities?: string[]
  venue_type?: string
}

interface BookedDj {
  id: string
  name: string
  event_name: string
  date: string
  time: string
  duration: string
  payment: number
  status: 'confirmed' | 'pending' | 'completed'
  genre: string
  avatar?: string
}

interface EventStats {
  id: string
  event_name: string
  date: string
  attendance: number
  total_tips: number
  total_requests: number
  avg_rating: number
  dj: string
}

interface Feedback {
  id: string
  customer_name: string
  rating: number
  comment: string
  date: string
  event: string
}

export function VenueDashboard() {
  const { user } = useAuthStore()
  const [venueProfile, setVenueProfile] = useState<VenueProfile | null>(null)
  
  const [bookedDjs] = useState<BookedDj[]>([
    {
      id: '1',
      name: 'DJ Alex Rivera',
      event_name: 'Summer Beats Festival',
      date: '2024-07-15',
      time: '22:00',
      duration: '4 hours',
      payment: 800,
      status: 'confirmed',
      genre: 'Electronic'
    },
    {
      id: '2',
      name: 'DJ Maya Chen',
      event_name: 'Saturday Night Mix',
      date: '2024-07-20',
      time: '21:00',
      duration: '3 hours',
      payment: 650,
      status: 'pending',
      genre: 'House'
    },
    {
      id: '3',
      name: 'DJ Carlos Mix',
      event_name: 'Latin Night',
      date: '2024-07-25',
      time: '20:00',
      duration: '5 hours',
      payment: 900,
      status: 'confirmed',
      genre: 'Latin'
    }
  ])

  const [eventStats] = useState<EventStats[]>([
    {
      id: '1',
      event_name: 'Summer Beats Festival',
      date: '2024-07-10',
      attendance: 347,
      total_tips: 1240,
      total_requests: 89,
      avg_rating: 4.8,
      dj: 'DJ Alex Rivera'
    },
    {
      id: '2',
      event_name: 'House Music Night',
      date: '2024-07-08',
      attendance: 298,
      total_tips: 876,
      total_requests: 67,
      avg_rating: 4.6,
      dj: 'DJ Maya Chen'
    }
  ])

  const [recentFeedback] = useState<Feedback[]>([
    {
      id: '1',
      customer_name: 'Sarah M.',
      rating: 5,
      comment: 'Amazing atmosphere and great sound system!',
      date: '2024-07-10',
      event: 'Summer Beats Festival'
    },
    {
      id: '2',
      customer_name: 'Mike R.',
      rating: 4,
      comment: 'Love the vibe, could use more seating areas.',
      date: '2024-07-09',
      event: 'House Music Night'
    },
    {
      id: '3',
      customer_name: 'Lisa K.',
      rating: 5,
      comment: 'Perfect venue for electronic music events!',
      date: '2024-07-08',
      event: 'Summer Beats Festival'
    }
  ])

  useEffect(() => {
    // Load venue profile data from Supabase
    const loadVenueProfile = async () => {
      if (!user) return

      try {
        const { createClientClient } = await import('@/shared/services/client')
        const supabase = createClientClient()
        
        if (supabase) {
          const { data, error } = await supabase
            .from('venue_profiles')
            .select('*')
            .eq('profile_id', user.id)
            .single()

          if (data && !error) {
            setVenueProfile(data)
          }
        }
      } catch (error) {
        console.error('Error loading venue profile:', error)
      }
    }

    loadVenueProfile()
  }, [user])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-600'
      case 'pending':
        return 'bg-yellow-600'
      case 'completed':
        return 'bg-blue-600'
      default:
        return 'bg-gray-600'
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`}
      />
    ))
  }

  const defaultHours = {
    'Monday': { open: '18:00', close: '02:00' },
    'Tuesday': { open: '18:00', close: '02:00' },
    'Wednesday': { open: '18:00', close: '02:00' },
    'Thursday': { open: '18:00', close: '03:00' },
    'Friday': { open: '18:00', close: '03:00' },
    'Saturday': { open: '18:00', close: '03:00' },
    'Sunday': { open: '18:00', close: '01:00' }
  }

  return (
    <DashboardLayout title="Venue Dashboard" role="venue">
      <div className="space-y-6">
        {/* Profile Completion Prompt */}
        <ProfileCompletionPrompt />

        {/* Venue Profile Section */}
        <Card className="bg-zinc-900 border-zinc-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Building className="w-5 h-5 text-purple-400" />
              Venue Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-6">
              {/* Venue Image & Basic Info */}
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={user?.avatar_url} />
                  <AvatarFallback className="bg-purple-600 text-white text-lg">
                    {venueProfile?.venue_name?.charAt(0) || 'V'}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-white">
                    {venueProfile?.venue_name || 'Electric Lounge'}
                  </h3>
                  <p className="text-gray-400">
                    {venueProfile?.venue_type || 'Nightclub'}
                  </p>
                  <div className="flex items-center gap-1 text-sm text-gray-400 mt-2">
                    <MapPin className="w-3 h-3" />
                    <span>{venueProfile?.location || 'San Francisco, CA'}</span>
                  </div>
                </div>
              </div>

              {/* Venue Details */}
              <div className="flex-1 space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Description</h4>
                  <p className="text-white">
                    {venueProfile?.description || 'Modern nightclub with state-of-the-art sound system and lighting. Perfect venue for electronic music events and DJ performances.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Capacity & Contact</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-white">{venueProfile?.capacity || 500} people</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-white">{venueProfile?.contact_info?.phone || '+1 (555) 123-4567'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-white">{venueProfile?.contact_info?.email || 'info@electriclounge.com'}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Hours of Operation</h4>
                    <div className="space-y-1 text-sm">
                      {Object.entries(venueProfile?.hours_of_operation || defaultHours).slice(0, 3).map(([day, hours]) => (
                        <div key={day} className="flex justify-between">
                          <span className="text-gray-400">{day}:</span>
                          <span className="text-white">{hours.open} - {hours.close}</span>
                        </div>
                      ))}
                      <div className="text-gray-400 text-xs">+ 4 more days</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Equipment & Amenities</h4>
                  <div className="flex flex-wrap gap-2">
                    {venueProfile?.equipment_list?.map((item, index) => (
                      <Badge key={index} variant="outline" className="border-purple-500 text-purple-300">
                        {item}
                      </Badge>
                    )) || [
                      { icon: Volume2, label: 'Professional Sound System' },
                      { icon: Lightbulb, label: 'LED Lighting' },
                      { icon: Wifi, label: 'High-Speed WiFi' },
                      { icon: Settings, label: 'DJ Booth' }
                    ].map((item, index) => (
                      <Badge key={index} variant="outline" className="border-purple-500 text-purple-300 flex items-center gap-1">
                        <item.icon className="w-3 h-3" />
                        {item.label}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit Venue Profile
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dashboard Widgets Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Booked DJs */}
          <Card className="bg-zinc-900 border-zinc-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Music className="w-5 h-5 text-blue-400" />
                Booked DJs
              </CardTitle>
              <CardDescription>Upcoming and confirmed DJ bookings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {bookedDjs.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={booking.avatar} />
                        <AvatarFallback className="bg-blue-600 text-white">
                          {booking.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium text-white">{booking.name}</h4>
                        <p className="text-sm text-gray-400">{booking.event_name}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(booking.date).toLocaleDateString()} • {booking.time} • {booking.duration}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(booking.status)}>
                        {booking.status}
                      </Badge>
                      <p className="text-sm font-medium text-green-400 mt-1">
                        {formatCurrency(booking.payment)}
                      </p>
                      <p className="text-xs text-gray-400">{booking.genre}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button className="w-full mt-4" variant="outline">
                View All Bookings
              </Button>
            </CardContent>
          </Card>

          {/* Event Calendar */}
          <Card className="bg-zinc-900 border-zinc-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Calendar className="w-5 h-5 text-purple-400" />
                Event Calendar
              </CardTitle>
              <CardDescription>Upcoming events at your venue</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="grid grid-cols-7 gap-1 text-xs text-gray-400 mb-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center py-1">{day}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: 35 }, (_, i) => {
                    const date = i + 1
                    const hasEvent = [15, 20, 25].includes(date)
                    return (
                      <div
                        key={i}
                        className={`aspect-square flex items-center justify-center text-xs rounded ${
                          hasEvent
                            ? 'bg-purple-600 text-white'
                            : date > 31
                            ? 'text-gray-600'
                            : 'text-gray-400 hover:bg-zinc-800'
                        }`}
                      >
                        {date <= 31 ? date : ''}
                      </div>
                    )
                  })}
                </div>
                <div className="space-y-2 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                    <span className="text-sm text-gray-400">Event scheduled</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Crowd Engagement Stats */}
          <Card className="bg-zinc-900 border-zinc-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <TrendingUp className="w-5 h-5 text-green-400" />
                Crowd Engagement
              </CardTitle>
              <CardDescription>Tip and request statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-blue-400">347</p>
                    <p className="text-xs text-gray-400">Avg Attendance</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-400">$1,058</p>
                    <p className="text-xs text-gray-400">Avg Tips/Event</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-purple-400">78</p>
                    <p className="text-xs text-gray-400">Avg Requests</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {eventStats.map((event) => (
                    <div key={event.id} className="flex justify-between items-center p-2 bg-zinc-800 rounded">
                      <div>
                        <p className="text-sm text-white">{event.event_name}</p>
                        <p className="text-xs text-gray-400">{event.dj}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1">
                          {renderStars(Math.floor(event.avg_rating))}
                          <span className="text-xs text-gray-400 ml-1">
                            {event.avg_rating}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400">
                          {event.attendance} people • {formatCurrency(event.total_tips)} tips
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Feedback */}
          <Card className="bg-zinc-900 border-zinc-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <MessageSquare className="w-5 h-5 text-yellow-400" />
                Recent Feedback
              </CardTitle>
              <CardDescription>Customer reviews and ratings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentFeedback.map((feedback) => (
                  <div key={feedback.id} className="p-3 bg-zinc-800 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6">
                          <AvatarFallback className="bg-yellow-600 text-white text-xs">
                            {feedback.customer_name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium text-white">
                          {feedback.customer_name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {renderStars(feedback.rating)}
                      </div>
                    </div>
                    <p className="text-sm text-gray-300 mb-1">{feedback.comment}</p>
                    <p className="text-xs text-gray-500">
                      {feedback.event} • {new Date(feedback.date).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
              <Button className="w-full mt-4" variant="outline">
                View All Reviews
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
} 