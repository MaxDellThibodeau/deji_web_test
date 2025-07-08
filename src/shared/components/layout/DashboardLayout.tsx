import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/stores/auth-store'
import { Button } from '@/shared/components/ui/button'
import { 
  Headphones, 
  LogOut, 
  User, 
  Settings, 
  Home,
  Music,
  Calendar,
  Users,
  Building,
  CreditCard,
  Bell
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar'
import { Badge } from '@/shared/components/ui/badge'

interface DashboardLayoutProps {
  children: React.ReactNode
  title: string
  role: 'dj' | 'attendee' | 'venue'
}

export function DashboardLayout({ children, title, role }: DashboardLayoutProps) {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const getNavigationItems = () => {
    const commonItems = [
      { icon: Home, label: 'Dashboard', path: `/${role}-portal/dashboard` },
      { icon: User, label: 'Profile', path: `/${role}-portal/profile` },
      { icon: Settings, label: 'Settings', path: `/${role}-portal/settings` }
    ]

    const roleSpecificItems = {
      dj: [
        { icon: Music, label: 'Music Library', path: '/dj-portal/music' },
        { icon: Calendar, label: 'Bookings', path: '/dj-portal/bookings' },
        { icon: CreditCard, label: 'Earnings', path: '/dj-portal/earnings' }
      ],
      attendee: [
        { icon: Calendar, label: 'Events', path: '/attendee-portal/events' },
        { icon: Music, label: 'Requests', path: '/attendee-portal/requests' },
        { icon: Users, label: 'Following', path: '/attendee-portal/following' }
      ],
      venue: [
        { icon: Building, label: 'Venue Info', path: '/venue-portal/venue' },
        { icon: Calendar, label: 'Bookings', path: '/venue-portal/bookings' },
        { icon: Users, label: 'Analytics', path: '/venue-portal/analytics' }
      ]
    }

    return [...commonItems, ...roleSpecificItems[role]]
  }

  const getRoleColor = () => {
    switch (role) {
      case 'dj':
        return 'from-purple-600 to-blue-600'
      case 'attendee':
        return 'from-blue-600 to-green-600'
      case 'venue':
        return 'from-purple-600 to-pink-600'
      default:
        return 'from-gray-600 to-gray-700'
    }
  }

  const getRoleLabel = () => {
    switch (role) {
      case 'dj':
        return 'DJ Portal'
      case 'attendee':
        return 'Attendee Portal'
      case 'venue':
        return 'Venue Portal'
      default:
        return 'Dashboard'
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-zinc-900 border-b border-zinc-800 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo & Brand */}
            <div className="flex items-center space-x-4">
              <Link to="/landing" className="flex items-center space-x-2">
                <div className="relative h-8 w-8 overflow-hidden rounded-full bg-gradient-to-br from-purple-600 to-blue-400">
                  <Headphones className="absolute inset-0 h-full w-full p-1 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  DJEI
                </span>
              </Link>
              
              {/* Role Badge */}
              <div className="hidden md:flex items-center space-x-2">
                <div className="h-6 w-px bg-zinc-700"></div>
                <Badge className={`bg-gradient-to-r ${getRoleColor()}`}>
                  {getRoleLabel()}
                </Badge>
              </div>
            </div>

            {/* Navigation Items - Hidden on mobile */}
            <nav className="hidden lg:flex items-center space-x-1">
              {getNavigationItems().map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-zinc-800 transition-colors"
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <Button variant="ghost" size="sm" className="p-2">
                <Bell className="w-4 h-4" />
              </Button>

              {/* User Profile */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user?.avatar_url} />
                    <AvatarFallback className={`bg-gradient-to-br ${getRoleColor()} text-white`}>
                      {user?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block">
                    <p className="text-sm font-medium">{user?.name || 'User'}</p>
                    <p className="text-xs text-gray-400 capitalize">{role}</p>
                  </div>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-zinc-800/50 border-zinc-700/50 hover:bg-zinc-800 hover:border-zinc-700"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="lg:hidden mt-4 border-t border-zinc-800 pt-4">
            <div className="flex items-center justify-between">
              <div className="flex space-x-1 overflow-x-auto">
                {getNavigationItems().slice(0, 4).map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="flex items-center space-x-1 px-3 py-2 rounded-lg text-xs text-gray-300 hover:text-white hover:bg-zinc-800 transition-colors whitespace-nowrap"
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold">{title}</h1>
          <p className="text-gray-400 mt-1">
            Welcome back, {user?.name || 'User'}! Here's what's happening with your {role} account.
          </p>
        </div>
        
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-zinc-900 border-t border-zinc-800 mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 DJEI. All rights reserved.
            </p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <Link to="/help" className="text-gray-400 hover:text-white text-sm">
                Help
              </Link>
              <Link to="/privacy" className="text-gray-400 hover:text-white text-sm">
                Privacy
              </Link>
              <Link to="/terms" className="text-gray-400 hover:text-white text-sm">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
} 