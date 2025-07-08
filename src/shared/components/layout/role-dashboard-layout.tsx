
import { type ReactNode, useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { useNavigate } from "react-router-dom"
import { Headphones, LogOut, User } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
// User lookup now handled by real authentication

interface RoleDashboardLayoutProps {
  children: ReactNode
  title: string
  role: "attendee" | "dj" | "venue"
  email?: string
}

export function RoleDashboardLayout({ children, title, role, email }: RoleDashboardLayoutProps) {
  const navigate = useNavigate()
  const [userName, setUserName] = useState<string>("")
  const [userRole, setUserRole] = useState<string>("")

  useEffect(() => {
    // Get user info from Supabase instead of cookies
    const getUserInfo = async () => {
      const { getUserFromSupabase } = await import("@/shared/utils/auth-utils")
      
      try {
        const user = await getUserFromSupabase()
        if (user) {
          setUserName(user.name || user.email?.split('@')[0] || 'User')
          setUserRole(user.role || role)
        } else if (email) {
          // Fallback to provided email
          setUserName(email.split('@')[0])
          setUserRole(role)
        }
      } catch (error) {
        console.error("Error getting user info:", error)
        // Fallback to provided props
        if (email) {
          setUserName(email.split('@')[0])
        }
        setUserRole(role)
      }
    }

    getUserInfo()
  }, [email, role])

  const handleLogout = async () => {
    try {
      // Import Supabase client and logout
      const { createClientClient } = await import("@/shared/services/client")
      const supabase = createClientClient()
      
      if (supabase) {
        await supabase.auth.signOut()
      }
      
      // Redirect to login
      navigate("/login")
    } catch (error) {
      console.error("Error during logout:", error)
      // Still redirect to login even if logout fails
      navigate("/login")
    }
  }

  const getProfilePath = () => {
    switch (userRole) {
      case "attendee":
        return "/attendee-portal/profile"
      case "dj":
        return "/dj-portal/profile"
      case "venue":
        return "/venue-portal/profile"
      default:
        return "/profile"
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-zinc-900 border-b border-zinc-800">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link to="/landing" className="flex items-center space-x-2">
              <div className="relative h-8 w-8 overflow-hidden rounded-full bg-gradient-to-br from-purple-600 to-blue-400">
                <Headphones className="absolute inset-0 h-full w-full p-1 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                DJ AI
              </span>
            </Link>
            <div className="hidden md:block h-6 w-px bg-zinc-700 mx-2"></div>
            <div className="hidden md:flex items-center space-x-1 text-zinc-400">
              <span className="text-sm">{userRole.charAt(0).toUpperCase() + userRole.slice(1)} Portal</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Link to={getProfilePath()}>
              <div className="flex items-center space-x-2 cursor-pointer group">
                <div className="w-8 h-8 rounded-full bg-purple-600/20 flex items-center justify-center group-hover:bg-purple-600/30 transition-colors">
                  <User className="w-4 h-4 text-purple-400" />
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium group-hover:text-purple-400 transition-colors">{userName}</p>
                  <p className="text-xs text-zinc-400">{userRole.charAt(0).toUpperCase() + userRole.slice(1)}</p>
                </div>
              </div>
            </Link>
            <Button
              variant="outline"
              size="sm"
              className="bg-zinc-800/50 border-zinc-700/50 hover:bg-zinc-800 hover:border-zinc-700"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">{title}</h1>
        {children}
      </main>
    </div>
  )
}
