"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs"
import {
  attendeeAccounts,
  djAccounts,
  venueAccounts,
  adminAccounts,
  type UserRole,
  type DummyUser,
} from "@/features/auth/services/dummy-accounts"
import { UserRound, Music, Building, ShieldCheck } from "lucide-react"
import Link from "next/link"

export default function AccountListPage() {
  const [activeTab, setActiveTab] = useState<UserRole>("attendee")

  const getAccounts = () => {
    switch (activeTab) {
      case "attendee":
        return attendeeAccounts
      case "dj":
        return djAccounts
      case "venue":
        return venueAccounts
      case "admin":
        return adminAccounts
      default:
        return attendeeAccounts
    }
  }

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case "attendee":
        return <UserRound className="h-5 w-5" />
      case "dj":
        return <Music className="h-5 w-5" />
      case "venue":
        return <Building className="h-5 w-5" />
      case "admin":
        return <ShieldCheck className="h-5 w-5" />
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="text-blue-400 hover:underline mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-3xl font-bold mb-2">DJ AI Platform Accounts</h1>
          <p className="text-zinc-400">Browse all available demo accounts for the DJ AI platform</p>
        </div>

        <Tabs defaultValue="attendee" value={activeTab} onValueChange={(value) => setActiveTab(value as UserRole)}>
          <TabsList className="grid grid-cols-4 mb-8">
            <TabsTrigger value="attendee" className="flex items-center gap-2">
              <UserRound className="h-4 w-4" />
              <span>Attendees</span>
            </TabsTrigger>
            <TabsTrigger value="dj" className="flex items-center gap-2">
              <Music className="h-4 w-4" />
              <span>DJs</span>
            </TabsTrigger>
            <TabsTrigger value="venue" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              <span>Venues</span>
            </TabsTrigger>
            <TabsTrigger value="admin" className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              <span>Admins</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getAccounts().map((account) => (
                <AccountCard key={account.id} account={account} />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-8 bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-2">Login Information</h2>
          <p className="text-zinc-400 mb-2">You can use any of these accounts to log in to the DJ AI platform:</p>
          <ul className="list-disc list-inside text-zinc-300">
            <li>Email: Use the email address shown on each card</li>
            <li>
              Password: <code className="bg-zinc-800 px-2 py-1 rounded text-sm">password123</code> for all accounts
              (except admins)
            </li>
            <li>
              Admin Password: <code className="bg-zinc-800 px-2 py-1 rounded text-sm">admin123</code>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

function AccountCard({ account }: { account: DummyUser }) {
  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case "attendee":
        return <UserRound className="h-5 w-5" />
      case "dj":
        return <Music className="h-5 w-5" />
      case "venue":
        return <Building className="h-5 w-5" />
      case "admin":
        return <ShieldCheck className="h-5 w-5" />
    }
  }

  return (
    <Card className="bg-zinc-900/70 border-zinc-800">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{account.name}</CardTitle>
            <CardDescription className="text-zinc-400 mt-1">{account.email}</CardDescription>
          </div>
          <div className="bg-zinc-800 p-2 rounded-full">{getRoleIcon(account.role)}</div>
        </div>
      </CardHeader>
      <CardContent>
        {account.description && <p className="text-sm text-zinc-300 mb-2">{account.description}</p>}

        {account.location && (
          <div className="flex items-center text-xs text-zinc-400 mb-1">
            <span>📍 {account.location}</span>
          </div>
        )}

        {account.genres && account.genres.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {account.genres.map((genre) => (
              <span key={genre} className="text-xs bg-purple-900/50 text-purple-200 px-2 py-0.5 rounded-full">
                {genre}
              </span>
            ))}
          </div>
        )}

        {account.capacity && <div className="text-xs text-zinc-400 mt-2">Capacity: {account.capacity} people</div>}

        <div className="mt-3 pt-3 border-t border-zinc-800 flex justify-between items-center">
          <span className="text-xs text-zinc-500">ID: {account.id}</span>
          <Link
            href={`/login?email=${encodeURIComponent(account.email)}`}
            className="text-xs text-blue-400 hover:text-blue-300"
          >
            Login as this user →
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
