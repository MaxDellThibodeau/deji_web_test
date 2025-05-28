"use client"

import { useState, useEffect } from "react"
import { notFound, useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Star, MapPin, Calendar, Instagram, Twitter, Globe, Mail, Phone } from "lucide-react"
import { Button } from "@/ui/button"
import { Badge } from "@/ui/badge"
import { Card, CardContent } from "@/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs"
import { PublicHeader } from "@/shared/components/layout/public-header"
import { useUser } from "@/hooks/use-user"

// Mock data for DJs
const DJS = [
  {
    id: "dj-pulse",
    name: "DJ Pulse",
    fullName: "Alex Johnson",
    genres: ["Electronic", "House", "Techno"],
    rating: 4.9,
    reviews: 124,
    location: "Los Angeles, CA",
    image: "/hip-hop-dj-in-action.png",
    bio: "DJ Pulse is known for energetic sets that blend house and techno with unexpected samples and remixes. With over 10 years of experience performing at clubs, festivals, and private events across the country, Alex has developed a unique style that keeps the dance floor moving all night long.",
    experience: "10+ years",
    equipment: ["Pioneer CDJ-3000", "DJM-900NXS2 Mixer", "Custom lighting rig", "Premium sound system"],
    upcomingEvents: [
      {
        id: "event-1",
        name: "Summer Beats Festival",
        date: "June 15, 2023",
        venue: "Skyline Venue, Downtown",
      },
      {
        id: "event-2",
        name: "Neon Nights",
        date: "July 3, 2023",
        venue: "The Warehouse, East Side",
      },
      {
        id: "event-3",
        name: "Private Corporate Event",
        date: "July 22, 2023",
        venue: "Confidential, Los Angeles",
      },
    ],
    pastEvents: [
      {
        id: "past-1",
        name: "Electric Dreams Festival",
        date: "April 8, 2023",
        venue: "Beachfront Arena, Santa Monica",
      },
      {
        id: "past-2",
        name: "Club Zenith Opening Night",
        date: "March 15, 2023",
        venue: "Club Zenith, Hollywood",
      },
    ],
    priceRange: "$500-1500",
    featured: true,
    contact: {
      email: "booking@djpulse.com",
      phone: "+1 (323) 555-1234",
      website: "www.djpulse.com",
      instagram: "@dj_pulse",
      twitter: "@dj_pulse",
    },
    testimonials: [
      {
        id: "testimonial-1",
        name: "Sarah M.",
        event: "Wedding Reception",
        text: "DJ Pulse made our wedding reception unforgettable! He read the crowd perfectly and kept everyone dancing all night. Highly recommended!",
        rating: 5,
      },
      {
        id: "testimonial-2",
        name: "Club Zenith",
        event: "Club Opening",
        text: "Alex is a true professional. His set for our opening night exceeded all expectations and set the perfect tone for our venue.",
        rating: 5,
      },
      {
        id: "testimonial-3",
        name: "Michael T.",
        event: "Corporate Event",
        text: "Great music selection and very professional. Worked with our specific requirements and delivered exactly what we needed.",
        rating: 4.5,
      },
    ],
  },
  // More DJs...
]

export default function DJProfilePage() {
  const { id } = useParams()
  const { user, isLoading } = useUser()
  const [dj, setDj] = useState<any>(null)

  useEffect(() => {
    const foundDj = DJS.find((d) => d.id === id)
    if (foundDj) {
      setDj(foundDj)
    }
  }, [id])

  if (isLoading) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>
  }

  if (!dj) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <PublicHeader currentPath={`/djs/${id}`} user={user} />
      <div className="pt-16 flex-1">
        {/* Hero Section */}
        <div className="relative h-[40vh] md:h-[50vh]">
          <Image
            src={dj.image || "/placeholder.svg"}
            alt={dj.name}
            fill
            className="object-cover brightness-75"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
          <div className="absolute top-4 left-4 z-10">
            <Link href="/djs">
              <Button variant="ghost" className="bg-black/30 hover:bg-black/50 text-white">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to DJs
              </Button>
            </Link>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 -mt-20 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - DJ Details */}
            <div className="lg:col-span-2">
              <div className="mb-6">
                <div className="flex flex-wrap gap-2 mb-3">
                  {dj.genres.map((genre: string) => (
                    <Badge key={genre} className="bg-purple-600 hover:bg-purple-700">
                      {genre}
                    </Badge>
                  ))}
                  {dj.featured && <Badge className="bg-yellow-600 hover:bg-yellow-700">Featured</Badge>}
                </div>

                <h1 className="text-4xl md:text-5xl font-bold mb-2">{dj.name}</h1>
                <p className="text-xl text-zinc-400 mb-4">{dj.fullName}</p>

                <div className="flex items-center mb-4">
                  <div className="flex items-center mr-4">
                    <Star className="h-5 w-5 text-yellow-400 mr-1" />
                    <span className="font-medium">{dj.rating}</span>
                    <span className="text-zinc-400 text-sm ml-1">({dj.reviews} reviews)</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 text-purple-400 mr-1" />
                    <span className="text-zinc-300">{dj.location}</span>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-900 rounded-xl overflow-hidden mb-8">
                <Tabs defaultValue="about" className="w-full">
                  <div className="px-6 pt-6">
                    <TabsList className="grid w-full grid-cols-4 bg-zinc-800">
                      <TabsTrigger value="about">About</TabsTrigger>
                      <TabsTrigger value="events">Events</TabsTrigger>
                      <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
                      <TabsTrigger value="contact">Contact</TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="about" className="p-6">
                    <h2 className="text-xl font-bold mb-4">About {dj.name}</h2>
                    <p className="text-zinc-300 mb-6">{dj.bio}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <h3 className="text-lg font-bold mb-3">Experience</h3>
                        <p className="text-zinc-300">{dj.experience}</p>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold mb-3">Price Range</h3>
                        <p className="text-zinc-300">{dj.priceRange}</p>
                      </div>
                    </div>

                    <h3 className="text-lg font-bold mb-3">Equipment</h3>
                    <ul className="list-disc list-inside text-zinc-300 mb-6">
                      {dj.equipment.map((item: string, index: number) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </TabsContent>

                  <TabsContent value="events" className="p-6">
                    <h2 className="text-xl font-bold mb-4">Upcoming Events</h2>
                    <div className="space-y-4 mb-8">
                      {dj.upcomingEvents.map((event: any) => (
                        <div key={event.id} className="bg-zinc-800 p-4 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-medium">{event.name}</h3>
                              <div className="flex items-center text-sm text-zinc-400">
                                <Calendar className="h-3 w-3 mr-1" />
                                <span>{event.date}</span>
                                <span className="mx-2">•</span>
                                <MapPin className="h-3 w-3 mr-1" />
                                <span>{event.venue}</span>
                              </div>
                            </div>
                            <Link href={`/events/${event.id}`}>
                              <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                                Details
                              </Button>
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>

                    <h2 className="text-xl font-bold mb-4">Past Events</h2>
                    <div className="space-y-4">
                      {dj.pastEvents.map((event: any) => (
                        <div key={event.id} className="bg-zinc-800/50 p-4 rounded-lg">
                          <h3 className="font-medium">{event.name}</h3>
                          <div className="flex items-center text-sm text-zinc-400">
                            <Calendar className="h-3 w-3 mr-1" />
                            <span>{event.date}</span>
                            <span className="mx-2">•</span>
                            <MapPin className="h-3 w-3 mr-1" />
                            <span>{event.venue}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="testimonials" className="p-6">
                    <h2 className="text-xl font-bold mb-4">Client Testimonials</h2>
                    <div className="space-y-6">
                      {dj.testimonials.map((testimonial: any) => (
                        <div key={testimonial.id} className="bg-zinc-800 p-5 rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h3 className="font-medium">{testimonial.name}</h3>
                              <p className="text-sm text-zinc-400">{testimonial.event}</p>
                            </div>
                            <div className="flex items-center">
                              <Star className="h-4 w-4 text-yellow-400" />
                              <span className="ml-1 font-medium">{testimonial.rating}</span>
                            </div>
                          </div>
                          <p className="text-zinc-300">"{testimonial.text}"</p>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="contact" className="p-6">
                    <h2 className="text-xl font-bold mb-4">Contact Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center bg-zinc-800 p-4 rounded-lg">
                        <Mail className="h-5 w-5 text-purple-400 mr-3" />
                        <div>
                          <p className="text-sm text-zinc-400">Email</p>
                          <p className="font-medium">{dj.contact.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center bg-zinc-800 p-4 rounded-lg">
                        <Phone className="h-5 w-5 text-purple-400 mr-3" />
                        <div>
                          <p className="text-sm text-zinc-400">Phone</p>
                          <p className="font-medium">{dj.contact.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-center bg-zinc-800 p-4 rounded-lg">
                        <Globe className="h-5 w-5 text-purple-400 mr-3" />
                        <div>
                          <p className="text-sm text-zinc-400">Website</p>
                          <p className="font-medium">{dj.contact.website}</p>
                        </div>
                      </div>
                      <div className="flex items-center bg-zinc-800 p-4 rounded-lg">
                        <Instagram className="h-5 w-5 text-purple-400 mr-3" />
                        <div>
                          <p className="text-sm text-zinc-400">Instagram</p>
                          <p className="font-medium">{dj.contact.instagram}</p>
                        </div>
                      </div>
                      <div className="flex items-center bg-zinc-800 p-4 rounded-lg">
                        <Twitter className="h-5 w-5 text-purple-400 mr-3" />
                        <div>
                          <p className="text-sm text-zinc-400">Twitter</p>
                          <p className="font-medium">{dj.contact.twitter}</p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>

            {/* Right Column - Booking */}
            <div>
              <Card className="bg-zinc-900 border-zinc-800 overflow-hidden sticky top-4">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-2">Book {dj.name}</h2>
                  <p className="text-zinc-400 mb-6">Available for clubs, festivals, and private events</p>

                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Price range:</span>
                      <span className="font-medium">{dj.priceRange}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Experience:</span>
                      <span className="font-medium">{dj.experience}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Location:</span>
                      <span className="font-medium">{dj.location}</span>
                    </div>
                  </div>

                  <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 mb-4">
                    Contact for Booking
                  </Button>

                  <p className="text-center text-sm text-zinc-400">
                    Or call directly: <span className="text-white">{dj.contact.phone}</span>
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
