"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { PublicHeader } from "@/shared/components/layout/public-header"
import { useUser } from "@/hooks/use-user"
import { UserBidsList } from "@/shared/components/common/user-bids-list"

export default function MyBidsPage() {
  const router = useRouter()
  const { user, loading: userLoading } = useUser()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // If user is not logged in and not loading, redirect to login
    if (!userLoading && !user) {
      router.push("/login?redirectTo=/my-bids")
    } else if (!userLoading) {
      setIsLoading(false)
    }
  }, [user, userLoading, router])

  // Show loading state while checking authentication
  if (userLoading || isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-xl text-zinc-400">Loading...</p>
      </div>
    )
  }

  // If no user and not loading, the useEffect will redirect to login
  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-xl text-zinc-400">Redirecting to login...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <PublicHeader currentPath="/my-bids" user={user} />
      <div className="pt-16 flex-1">
        <div className="container mx-auto max-w-6xl px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">My Song Bids</h1>
          <UserBidsList userId={user.id} />
        </div>
      </div>
    </div>
  )
}
