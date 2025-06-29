import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuthStore } from '@/shared/stores/auth-store'
import { PublicLayout } from '@/shared/components/layout/public-layout'
import './App.css'

// Import actual screen components
import { LandingScreen } from '@/features/landing/screens/LandingScreen'
import { LoginScreen } from '@/features/auth/screens/LoginScreen'
import { SignupScreen } from '@/features/auth/screens/SignupScreen'

// Create React Query client
const queryClient = new QueryClient()

// Public page components with proper styling
const AboutScreen = () => (
  <div className="container mx-auto px-4 py-16">
    <div className="max-w-4xl mx-auto text-center">
      <h1 className="text-4xl md:text-6xl font-bold mb-8 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
        About DJ AI
      </h1>
      <p className="text-lg text-gray-300 mb-8 leading-relaxed">
        DJ AI is revolutionizing the music event experience with cutting-edge artificial intelligence 
        and real-time song bidding. Connect music lovers, DJs, and venues in an unprecedented way.
      </p>
      <div className="grid md:grid-cols-3 gap-8 mt-12">
        <div className="p-6 bg-zinc-900 rounded-lg">
          <h3 className="text-xl font-semibold mb-4 text-purple-400">For Attendees</h3>
          <p className="text-gray-400">Bid on songs, influence playlists, and enjoy personalized music experiences.</p>
        </div>
        <div className="p-6 bg-zinc-900 rounded-lg">
          <h3 className="text-xl font-semibold mb-4 text-purple-400">For DJs</h3>
          <p className="text-gray-400">Get real-time audience feedback and create unforgettable sets.</p>
        </div>
        <div className="p-6 bg-zinc-900 rounded-lg">
          <h3 className="text-xl font-semibold mb-4 text-purple-400">For Venues</h3>
          <p className="text-gray-400">Increase engagement and create more interactive events.</p>
        </div>
      </div>
    </div>
  </div>
)

const EventsScreen = () => (
  <div className="container mx-auto px-4 py-16">
    <div className="max-w-6xl mx-auto">
      <h1 className="text-4xl md:text-6xl font-bold mb-8 text-center bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
        Explore Events
      </h1>
      <p className="text-lg text-gray-300 mb-12 text-center leading-relaxed">
        Discover amazing music events powered by AI and real-time interaction.
      </p>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-zinc-900 rounded-lg overflow-hidden">
            <div className="h-48 bg-gradient-to-br from-purple-600 to-blue-500"></div>
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-2">Event {i}</h3>
              <p className="text-gray-400 mb-4">An amazing DJ experience with AI-powered music selection.</p>
              <div className="flex justify-between items-center">
                <span className="text-purple-400 font-medium">Tonight 9PM</span>
                <button className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg text-sm font-medium">
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
)

const DjsScreen = () => (
  <div className="container mx-auto px-4 py-16">
    <div className="max-w-6xl mx-auto">
      <h1 className="text-4xl md:text-6xl font-bold mb-8 text-center bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
        Find DJs
      </h1>
      <p className="text-lg text-gray-300 mb-12 text-center leading-relaxed">
        Connect with talented DJs who create unforgettable musical experiences.
      </p>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { name: "DJ Alex", genre: "Electronic", rating: "4.9" },
          { name: "DJ Sarah", genre: "Hip Hop", rating: "4.8" },
          { name: "DJ Mike", genre: "House", rating: "4.7" },
          { name: "DJ Emma", genre: "Techno", rating: "4.9" },
          { name: "DJ Chris", genre: "Progressive", rating: "4.6" },
          { name: "DJ Lisa", genre: "Trance", rating: "4.8" },
          { name: "DJ Tom", genre: "Dubstep", rating: "4.7" },
          { name: "DJ Anna", genre: "Deep House", rating: "4.9" }
        ].map((dj, i) => (
          <div key={i} className="bg-zinc-900 rounded-lg p-6 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl font-bold text-white">{dj.name.split(' ')[1][0]}</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">{dj.name}</h3>
            <p className="text-purple-400 mb-2">{dj.genre}</p>
            <p className="text-gray-400 mb-4">★ {dj.rating}</p>
            <button className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg text-sm font-medium w-full">
              View Profile
            </button>
          </div>
        ))}
      </div>
    </div>
  </div>
)

// Dashboard placeholder components
const DjPortalScreen = () => <div className="p-8 text-center">DJ Portal</div>
const VenuePortalScreen = () => <div className="p-8 text-center">Venue Portal</div>
const AttendeePortalScreen = () => <div className="p-8 text-center">Attendee Portal</div>
const AdminPortalScreen = () => <div className="p-8 text-center">Admin Portal</div>
const DjDashboardScreen = () => <div className="p-8 text-center">DJ Dashboard</div>
const VenueDashboardScreen = () => <div className="p-8 text-center">Venue Dashboard</div>
const AttendeeDashboardScreen = () => <div className="p-8 text-center">Attendee Dashboard</div>
const AdminDashboardScreen = () => <div className="p-8 text-center">Admin Dashboard</div>

// Protected route wrapper
function ProtectedRoute({ children, requiredRole }: { children: React.ReactNode, requiredRole?: string }) {
  const { isAuthenticated, user } = useAuthStore()
  
  if (!isAuthenticated) {
    return <Navigate to="/landing" />
  }
  
  if (requiredRole && user?.role !== requiredRole) {
    // Redirect to user's appropriate dashboard
    const roleRedirects = {
      dj: '/dj-portal/dashboard',
      venue: '/venue-portal/dashboard', 
      attendee: '/attendee-portal/dashboard'
    }
    return <Navigate to={roleRedirects[user?.role as keyof typeof roleRedirects] || '/attendee-portal/dashboard'} />
  }
  
  return <>{children}</>
}

// Admin route wrapper
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuthStore()
  
  if (!isAuthenticated) {
    return <Navigate to="/landing" />
  }
  
  if (!user?.isAdmin) {
    // Redirect to user's appropriate dashboard
    const roleRedirects = {
      dj: '/dj-portal/dashboard',
      venue: '/venue-portal/dashboard',
      attendee: '/attendee-portal/dashboard'
    }
    return <Navigate to={roleRedirects[user?.role as keyof typeof roleRedirects] || '/attendee-portal/dashboard'} />
  }
  
  return <>{children}</>
}

function App() {
  const { isAuthenticated } = useAuthStore()

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-background text-foreground">
          <Routes>
            {/* Public routes with navbar */}
            <Route path="/" element={<PublicLayout><LandingScreen /></PublicLayout>} />
            <Route path="/landing" element={<PublicLayout><LandingScreen /></PublicLayout>} />
            <Route path="/about" element={<PublicLayout><AboutScreen /></PublicLayout>} />
            <Route path="/events" element={<PublicLayout><EventsScreen /></PublicLayout>} />
            <Route path="/djs" element={<PublicLayout><DjsScreen /></PublicLayout>} />
            
            {/* Auth routes - NO navbar */}
            <Route 
              path="/login" 
              element={isAuthenticated ? <Navigate to="/attendee-portal/dashboard" /> : <LoginScreen />} 
            />
            <Route 
              path="/signup" 
              element={isAuthenticated ? <Navigate to="/attendee-portal/dashboard" /> : <SignupScreen />} 
            />
            
            {/* DJ Portal routes */}
            <Route 
              path="/dj-portal" 
              element={
                <ProtectedRoute requiredRole="dj">
                  <DjPortalScreen />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dj-portal/dashboard" 
              element={
                <ProtectedRoute requiredRole="dj">
                  <DjDashboardScreen />
                </ProtectedRoute>
              } 
            />
            
            {/* Venue Portal routes */}
            <Route 
              path="/venue-portal" 
              element={
                <ProtectedRoute requiredRole="venue">
                  <VenuePortalScreen />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/venue-portal/dashboard" 
              element={
                <ProtectedRoute requiredRole="venue">
                  <VenueDashboardScreen />
                </ProtectedRoute>
              } 
            />
            
            {/* Attendee Portal routes */}
            <Route 
              path="/attendee-portal" 
              element={
                <ProtectedRoute requiredRole="attendee">
                  <AttendeePortalScreen />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/attendee-portal/dashboard" 
              element={
                <ProtectedRoute requiredRole="attendee">
                  <AttendeeDashboardScreen />
                </ProtectedRoute>
              } 
            />
            
            {/* Admin Portal routes */}
            <Route 
              path="/admin-portal" 
              element={
                <AdminRoute>
                  <AdminPortalScreen />
                </AdminRoute>
              } 
            />
            <Route 
              path="/admin-portal/dashboard" 
              element={
                <AdminRoute>
                  <AdminDashboardScreen />
                </AdminRoute>
              } 
            />
            
            {/* Redirect unknown routes to landing */}
            <Route path="*" element={<Navigate to="/landing" />} />
          </Routes>
        </div>
      </Router>
    </QueryClientProvider>
  )
}

export default App
