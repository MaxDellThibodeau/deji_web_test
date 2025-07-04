import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuthStore } from '@/shared/stores/auth-store'
import { PublicLayout } from '@/shared/components/layout/public-layout'
import './App.css'

// Import actual screen components
import { LandingScreen } from '@/features/landing/screens/LandingScreen'
import { LoginScreen } from '@/features/auth/screens/LoginScreen'
import { SignupScreen } from '@/features/auth/screens/SignupScreen'
import { OnboardingScreen } from '@/features/auth/screens/OnboardingScreen'
import { EventsScreen } from '@/features/events/screens/EventsScreen'
import { OAuthCallback } from '@/features/auth/components/oauth-callback'
import { TestProfileUpload } from './test-profile-upload'

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
      <div className="grid md:grid-cols-3 gap-8 mt-12 mb-16">
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

      {/* Team Section */}
      <div className="mt-16">
        <h2 className="text-3xl md:text-4xl font-bold mb-12 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
          Meet Our Team
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-6 bg-zinc-900 rounded-lg">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-600 to-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-3xl font-bold text-white">IP</span>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-white">Isaac Pulatov</h3>
            <p className="text-purple-400 font-medium mb-3">Project Manager</p>
            <p className="text-gray-400 text-sm">Leading strategic vision and coordinating development efforts to bring DJ AI to life.</p>
          </div>
          
          <div className="p-6 bg-zinc-900 rounded-lg">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-3xl font-bold text-white">DM</span>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-white">Daniel Michael</h3>
            <p className="text-purple-400 font-medium mb-3">CTO</p>
            <p className="text-gray-400 text-sm">Architecting scalable technology solutions and driving innovation in AI-powered music experiences.</p>
          </div>
          
          <div className="p-6 bg-zinc-900 rounded-lg">
            <div className="w-24 h-24 bg-gradient-to-br from-green-600 to-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-3xl font-bold text-white">MT</span>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-white">Max Dell-Thibodeau</h3>
            <p className="text-purple-400 font-medium mb-3">Lead Full Stack AI Engineer</p>
            <p className="text-gray-400 text-sm">Building cutting-edge AI systems and full-stack solutions that power the future of music events.</p>
          </div>
        </div>
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
  
  if (!user?.is_admin) {
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
            <Route 
              path="/auth/callback" 
              element={<OAuthCallback />} 
            />
            <Route 
              path="/onboarding" 
              element={<OnboardingScreen />} 
            />
            
            {/* Test Profile Upload (temporary for testing) */}
            <Route 
              path="/test-upload" 
              element={
                <ProtectedRoute>
                  <TestProfileUpload />
                </ProtectedRoute>
              } 
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
