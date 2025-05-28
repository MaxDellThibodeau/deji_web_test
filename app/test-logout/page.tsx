"use client"

import { useState } from "react"
import Link from "next/link"
import { LogoutTest } from "@/shared/components/common/logout-test"
import { Button } from "@/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs"
import { AppLayout } from "@/shared/components/layout/app-layout"

export default function TestLogoutPage() {
  const [activeTab, setActiveTab] = useState("test")

  return (
    <AppLayout>
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Logout Functionality Test</h1>

        <Tabs defaultValue="test" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="test">Test Component</TabsTrigger>
            <TabsTrigger value="pages">Test Pages</TabsTrigger>
            <TabsTrigger value="info">Test Information</TabsTrigger>
          </TabsList>

          <TabsContent value="test" className="space-y-6">
            <p className="text-zinc-400 mb-6">
              This component tests the logout functionality by simulating login and logout actions and checking if the
              UI updates correctly.
            </p>

            <LogoutTest />
          </TabsContent>

          <TabsContent value="pages" className="space-y-6">
            <p className="text-zinc-400 mb-6">
              Test logout from different pages to ensure redirects work correctly. Auth-required pages should redirect
              to landing, while public pages should stay on the same page.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                <h3 className="text-lg font-medium mb-2">Auth-Required Pages</h3>
                <p className="text-zinc-400 text-sm mb-4">Should redirect to landing page after logout</p>
                <div className="grid grid-cols-2 gap-2">
                  <Link href="/dashboard">
                    <Button variant="outline" className="w-full">
                      Dashboard
                    </Button>
                  </Link>
                  <Link href="/token-bidding">
                    <Button variant="outline" className="w-full">
                      Token Bidding
                    </Button>
                  </Link>
                  <Link href="/token-history">
                    <Button variant="outline" className="w-full">
                      Token History
                    </Button>
                  </Link>
                  <Link href="/music-preferences">
                    <Button variant="outline" className="w-full">
                      Music Preferences
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                <h3 className="text-lg font-medium mb-2">Public Pages</h3>
                <p className="text-zinc-400 text-sm mb-4">Should stay on the same page after logout</p>
                <div className="grid grid-cols-2 gap-2">
                  <Link href="/landing">
                    <Button variant="outline" className="w-full">
                      Landing
                    </Button>
                  </Link>
                  <Link href="/events">
                    <Button variant="outline" className="w-full">
                      Events
                    </Button>
                  </Link>
                  <Link href="/djs">
                    <Button variant="outline" className="w-full">
                      DJs
                    </Button>
                  </Link>
                  <Link href="/about">
                    <Button variant="outline" className="w-full">
                      About
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="info" className="space-y-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <h3 className="text-xl font-medium mb-4">How Logout Testing Works</h3>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-purple-400">Cookie Clearing</h4>
                  <p className="text-zinc-400">Tests if the session cookies are properly removed after logout.</p>
                </div>

                <div>
                  <h4 className="font-medium text-purple-400">UI Updates</h4>
                  <p className="text-zinc-400">
                    Checks if the UI correctly updates to show logged-out state (login/signup buttons).
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-purple-400">Redirect Behavior</h4>
                  <p className="text-zinc-400">
                    Verifies that auth-required pages redirect to landing, while public pages stay on the same page.
                  </p>
                </div>

                <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-md p-4 mt-4">
                  <h4 className="font-medium text-yellow-300 mb-2">Testing Instructions</h4>
                  <ol className="list-decimal list-inside space-y-2 text-zinc-300">
                    <li>Click "Simulate Login" to set a mock session cookie</li>
                    <li>Navigate to the page you want to test from the "Test Pages" tab</li>
                    <li>Use the logout button in the header or sidebar</li>
                    <li>Observe if you're redirected correctly and if the UI updates</li>
                  </ol>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  )
}
