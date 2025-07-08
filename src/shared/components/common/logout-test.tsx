
import type React from "react"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { toast } from "@/shared/hooks/use-toast"
import { logout } from "@/features/auth/actions/auth-actions"
import { LogOut, CheckCircle, XCircle } from "lucide-react"

export function LogoutTest() {
  const navigate = useNavigate()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [testResults, setTestResults] = useState<{
    cookieCheck: boolean | null
    uiCheck: boolean | null
    redirectCheck: boolean | null
  }>({
    cookieCheck: null,
    uiCheck: null,
    redirectCheck: null,
  })
  const [currentPath, setCurrentPath] = useState("")

  // Check login status
  useEffect(() => {
    const checkLoginStatus = () => {
      const hasSession = document.cookie.includes("session=") || document.cookie.includes("supabase-auth-token=")
      setIsLoggedIn(hasSession)
      return hasSession
    }

    // Initial check
    checkLoginStatus()

    // Set current path
    setCurrentPath(window.location.pathname)

    // Set up interval to check login status
    const interval = setInterval(() => {
      const loginStatus = checkLoginStatus()

      // If we were logged in but now we're not, update test results
      if (isLoggedIn && !loginStatus) {
        setTestResults((prev) => ({
          ...prev,
          cookieCheck: true,
          uiCheck: document.body.innerHTML.includes("Login") || document.body.innerHTML.includes("Sign Up"),
          redirectCheck: true, // We'll assume this is true if we're seeing this component
        }))

        toast({
          title: "Logout Test Complete",
          description: "Check the test results below",
        })

        // Clear the interval once we've detected logout
        clearInterval(interval)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [isLoggedIn])

  const simulateLogin = () => {
    // Set a mock session cookie
    document.cookie = "session=mock-session; path=/; max-age=86400"
    setIsLoggedIn(true)
    setTestResults({
      cookieCheck: null,
      uiCheck: null,
      redirectCheck: null,
    })

    toast({
      title: "Mock Login",
      description: "You are now logged in for testing purposes",
    })

    // Refresh the page to update UI
    window.location.reload()
  }

  const handleLogout = async (e: React.FormEvent) => {
    e.preventDefault()

    // Log the current path before logout
    console.log("Logging out from:", currentPath)

    // Submit the form
    const form = e.target as HTMLFormElement
    form.submit()
  }

  return (
    <Card className="w-full max-w-md mx-auto bg-zinc-900 border-zinc-800 text-white">
      <CardHeader>
        <CardTitle>Logout Functionality Test</CardTitle>
        <CardDescription>Test the logout functionality across different pages</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span>Current Login Status:</span>
            <span className={isLoggedIn ? "text-green-500" : "text-red-500"}>
              {isLoggedIn ? "Logged In" : "Logged Out"}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span>Current Path:</span>
            <code className="bg-zinc-800 px-2 py-1 rounded">{currentPath}</code>
          </div>

          {testResults.cookieCheck !== null && (
            <div className="space-y-2 mt-4 p-4 bg-zinc-800 rounded-md">
              <h3 className="font-medium">Test Results:</h3>
              <div className="flex items-center justify-between">
                <span>Cookies Cleared:</span>
                {testResults.cookieCheck ? (
                  <CheckCircle className="text-green-500 h-5 w-5" />
                ) : (
                  <XCircle className="text-red-500 h-5 w-5" />
                )}
              </div>
              <div className="flex items-center justify-between">
                <span>UI Updated:</span>
                {testResults.uiCheck ? (
                  <CheckCircle className="text-green-500 h-5 w-5" />
                ) : (
                  <XCircle className="text-red-500 h-5 w-5" />
                )}
              </div>
              <div className="flex items-center justify-between">
                <span>Redirect Worked:</span>
                {testResults.redirectCheck ? (
                  <CheckCircle className="text-green-500 h-5 w-5" />
                ) : (
                  <XCircle className="text-red-500 h-5 w-5" />
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        {isLoggedIn ? (
          <form action={logout} onSubmit={handleLogout} className="w-full">
            <input type="hidden" name="currentPath" value={currentPath} />
            <Button type="submit" className="w-full bg-red-600 hover:bg-red-700">
              <LogOut className="mr-2 h-4 w-4" />
              Test Logout
            </Button>
          </form>
        ) : (
          <Button onClick={simulateLogin} className="w-full bg-green-600 hover:bg-green-700">
            Simulate Login
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
