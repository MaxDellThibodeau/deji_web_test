export function LandingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-white mb-6">
            DJEI
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            The ultimate DJ platform for real-time song bidding and interactive music experiences
          </p>
          <div className="flex gap-4 justify-center">
            <a href="/attendee-portal" className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors">
              Join as Attendee
            </a>
            <a href="/dj-portal" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors">
              DJ Portal
            </a>
            <a href="/venue-portal" className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors">
              Venue Portal
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
