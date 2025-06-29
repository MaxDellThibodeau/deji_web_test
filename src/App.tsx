import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuthStore } from '@/shared/stores/auth-store'
import './App.css'

// Import actual screen components
import { LandingScreen } from '@/features/landing/screens/LandingScreen'
import { LoginScreen } from '@/features/auth/screens/LoginScreen'
import { SignupScreen } from '@/features/auth/screens/SignupScreen'

// Create React Query client
const queryClient = new QueryClient()

// Temporary placeholder components for missing screens
const AboutScreen = () => <div className="p-8 text-center">About Page</div>
const EventsScreen = () => <div className="p-8 text-center">Events Page</div>
const DjsScreen = () => <div className="p-8 text-center">DJs Page</div>
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
            {/* Public routes */}
            <Route path="/" element={<LandingScreen />} />
            <Route path="/landing" element={<LandingScreen />} />
            <Route path="/about" element={<AboutScreen />} />
            <Route path="/events" element={<EventsScreen />} />
            <Route path="/djs" element={<DjsScreen />} />
            
            {/* Auth routes - redirect to dashboard if already logged in */}
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
