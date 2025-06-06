import { cookies } from "next/headers"
import Link from "next/link"
import Image from "next/image"
import { Music, Calendar, Users, Linkedin, Github, Instagram } from "lucide-react"
import { Button } from "@/ui/button"
import { AppLayout } from "@/shared/components/layout/app-layout"
import { PublicHeader } from "@/shared/components/layout/public-header"

export default async function AboutPage() {
  // Check if user is logged in
  const cookieStore = await cookies()
  const isLoggedIn = cookieStore.has("session") || cookieStore.has("supabase-auth-token")

  const content = (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">About DJ AI</h1>
        <p className="text-gray-400 max-w-3xl mx-auto">
          Revolutionizing the DJ and event experience through AI technology
        </p>
      </div>

      {/* Hero Image Section */}
      <div className="relative w-full h-[400px] md:h-[500px] rounded-xl overflow-hidden mb-16 hero-glow">
        <Image src="/dj-performance-hero.jpg" alt="DJ performing at an event" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1e1e28] to-transparent opacity-70"></div>
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">Experience the Future</h2>
          <p className="text-lg md:text-xl max-w-2xl">Where technology meets music to create unforgettable moments</p>
        </div>
      </div>

      {/* Mission Section */}
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">Our Mission</h2>
        <p className="text-gray-400 mb-4 max-w-3xl mx-auto">
          At DJ AI, we're on a mission to transform how people experience music at events. We believe that everyone
          should have a say in the music they hear, and DJs should have powerful tools to create unforgettable
          experiences.
        </p>
        <p className="text-gray-400 mb-6 max-w-3xl mx-auto">
          Our platform connects attendees, DJs, and venues in a seamless ecosystem where music preferences are
          understood, song requests are democratized through bidding, and AI helps create the perfect playlist for any
          crowd.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button asChild className="bg-purple-600 hover:bg-purple-700">
            <Link href="/events">Explore Events</Link>
          </Button>
          <Button asChild variant="outline" className="border-gray-700 text-white hover:bg-gray-800">
            <Link href="/djs">Meet Our DJs</Link>
          </Button>
        </div>
      </div>

      {/* Login CTA for non-logged in users */}
      {!isLoggedIn && (
        <div className="bg-gradient-to-r from-purple-900 to-blue-900 rounded-lg p-8 mb-16">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0 md:mr-8">
              <h2 className="text-2xl font-bold text-white mb-2">Ready to join the revolution?</h2>
              <p className="text-gray-200">
                Create an account to start bidding on songs, saving your music preferences, and connecting with DJs for
                your next event.
              </p>
            </div>
            <Link href={`/signup?redirectTo=${encodeURIComponent("/about")}`}>
              <Button className="create-event-btn relative gradient-border" size="lg">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* How It Works Section */}
      <div className="mb-16">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-8 text-center">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="card-highlight p-6 rounded-lg">
            <div className="w-12 h-12 bg-purple-900/50 rounded-full flex items-center justify-center mb-4">
              <Music className="text-purple-400" size={24} />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Music Preferences</h3>
            <p className="text-gray-400">
              Tell us about your music taste and preferences. Our AI system learns what you like and makes personalized
              recommendations.
            </p>
          </div>
          <div className="card-highlight p-6 rounded-lg">
            <div className="w-12 h-12 bg-purple-900/50 rounded-full flex items-center justify-center mb-4">
              <Calendar className="text-purple-400" size={24} />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Events & Venues</h3>
            <p className="text-gray-400">
              Browse and join upcoming events in your area. Connect with venues and DJs to stay updated on the latest
              happenings.
            </p>
          </div>
          <div className="card-highlight p-6 rounded-lg">
            <div className="w-12 h-12 bg-purple-900/50 rounded-full flex items-center justify-center mb-4">
              <Users className="text-purple-400" size={24} />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Song Bidding</h3>
            <p className="text-gray-400">
              Use tokens to bid on songs you want to hear. The more tokens you bid, the higher your song moves in the
              queue.
            </p>
          </div>
        </div>
      </div>

      {/* Impact Section */}
      <div className="mb-16">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-8 text-center">Our Impact</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card-highlight p-6 rounded-lg text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">500+</div>
            <p className="text-gray-400">Events Powered</p>
          </div>
          <div className="card-highlight p-6 rounded-lg text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">200+</div>
            <p className="text-gray-400">Professional DJs</p>
          </div>
          <div className="card-highlight p-6 rounded-lg text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">50,000+</div>
            <p className="text-gray-400">Song Requests</p>
          </div>
          <div className="card-highlight p-6 rounded-lg text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">4M+</div>
            <p className="text-gray-400">Happy Users</p>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="mb-16">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-8 text-center">Our Team</h2>
        <div className="flex justify-center">
          <div className="card-highlight p-8 rounded-lg text-center max-w-md">
            <div className="w-32 h-32 rounded-full overflow-hidden mx-auto mb-6 relative">
              <Image src="/max-dell-thibodeau.jpg" alt="Max Dell-Thibodeau" fill className="object-cover" />
            </div>
            <h3 className="text-2xl font-semibold text-white mb-1">Max Dell-Thibodeau</h3>
            <p className="text-purple-400 mb-4">Lead Full Stack AI Engineer</p>
            <p className="text-gray-400">
              Combining expertise in full-stack development with advanced AI knowledge to create innovative music
              technology solutions that transform the DJ and event experience.
            </p>
            <div className="flex justify-center gap-4 mt-6">
              <a
                href="https://www.linkedin.com/in/max-dell-thibodeau/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-400 hover:text-purple-300"
              >
                <Linkedin size={24} />
              </a>
              <a
                href="https://github.com/Aacgectyuoki"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-400 hover:text-purple-300"
              >
                <Github size={24} />
              </a>
              <a
                href="https://www.instagram.com/dtwebsolutions/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-400 hover:text-purple-300"
              >
                <Instagram size={24} />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-8 text-center">Get In Touch</h2>
        <div className="card-highlight p-8 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">Contact Information</h3>
              <p className="text-gray-400 mb-6">
                Have questions or feedback? We'd love to hear from you. Reach out to our team using the contact
                information below.
              </p>
              <div className="space-y-4">
                <div>
                  <p className="text-white font-medium">Email</p>
                  <p className="text-gray-400">info@djaiplatform.com</p>
                </div>
                <div>
                  <p className="text-white font-medium">Phone</p>
                  <p className="text-gray-400">+1 (555) 123-4567</p>
                </div>
                <div>
                  <p className="text-white font-medium">Address</p>
                  <p className="text-gray-400">123 Music Street, San Francisco, CA 94103</p>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">Send Us a Message</h3>
              <form className="space-y-4">
                <div>
                  <input
                    type="text"
                    placeholder="Your Name"
                    className="w-full px-4 py-2 bg-[#1e1e28]/60 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <input
                    type="email"
                    placeholder="Your Email"
                    className="w-full px-4 py-2 bg-[#1e1e28]/60 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <textarea
                    placeholder="Your Message"
                    rows={4}
                    className="w-full px-4 py-2 bg-[#1e1e28]/60 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  ></textarea>
                </div>
                <Button className="create-event-btn w-full relative gradient-border">Send Message</Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  // Return the appropriate layout based on login status
  return isLoggedIn ? (
    <AppLayout>{content}</AppLayout>
  ) : (
    <>
      <PublicHeader />
      <div className="bg-[#1e1e28] pt-16">{content}</div>
    </>
  )
}
