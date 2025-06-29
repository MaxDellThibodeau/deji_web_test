"use client"

import { useState, useEffect } from "react"
import { Coins } from "lucide-react"

export function WelcomeNotification() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    // Check if this is the user's first visit
    const hasVisited = localStorage.getItem("hasVisitedDashboard")

    if (!hasVisited) {
      setShow(true)
      localStorage.setItem("hasVisitedDashboard", "true")

      // Hide notification after 5 seconds
      const timer = setTimeout(() => {
        setShow(false)
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [])

  if (!show) return null

  return (
    <div className="fixed bottom-4 right-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-lg shadow-lg max-w-md z-50 animate-fade-in">
      <div className="flex items-start">
        <div className="bg-white/20 rounded-full p-2 mr-3">
          <Coins className="h-6 w-6" />
        </div>
        <div>
          <h3 className="font-bold text-lg mb-1">Welcome to DJ AI!</h3>
          <p className="text-sm text-white/90">
            You've received 10 free tokens to get started. Use them to bid on songs at your favorite events!
          </p>
        </div>
        <button onClick={() => setShow(false)} className="ml-2 text-white/80 hover:text-white">
          ×
        </button>
      </div>
    </div>
  )
}
