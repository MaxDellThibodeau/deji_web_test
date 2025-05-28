"use client"

import { useState, useEffect } from "react"
import { AppLayout } from "@/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card"
import { Button } from "@/ui/button"
import { Badge } from "@/ui/badge"
import { Gift, Calendar, Ticket, Music, Star, ArrowRight, RefreshCw } from "lucide-react"
import { useUser } from "@/hooks/use-user"
import { toast } from "@/shared/hooks/use-toast"

// Mock rewards data
const REWARDS = [
  {
    id: 1,
    title: "Attend 5 Events",
    description: "Attend 5 events to earn 50 tokens",
    progress: 3,
    total: 5,
    reward: 50,
    icon: Calendar,
    completed: false,
  },
  {
    id: 2,
    title: "Bid on 10 Songs",
    description: "Bid on 10 different songs to earn 30 tokens",
    progress: 7,
    total: 10,
    reward: 30,
    icon: Music,
    completed: false,
  },
  {
    id: 3,
    title: "Purchase VIP Ticket",
    description: "Purchase a VIP ticket to earn 25 tokens",
    progress: 1,
    total: 1,
    reward: 25,
    icon: Ticket,
    completed: true,
  },
  {
    id: 4,
    title: "Rate 5 DJs",
    description: "Rate 5 different DJs to earn 20 tokens",
    progress: 2,
    total: 5,
    reward: 20,
    icon: Star,
    completed: false,
  },
]

export default function RewardsPage() {
  const { user, loading: userLoading } = useUser()
  const [rewards, setRewards] = useState(REWARDS)
  const [isLoading, setIsLoading] = useState(true)
  const [claimingId, setClaimingId] = useState<number | null>(null)

  useEffect(() => {
    // Simulate loading rewards data
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const handleClaimReward = (id: number) => {
    setClaimingId(id)

    // Simulate API call to claim reward
    setTimeout(() => {
      setRewards(rewards.map((reward) => (reward.id === id ? { ...reward, completed: true } : reward)))

      toast({
        title: "Reward Claimed!",
        description: `You've earned ${rewards.find((r) => r.id === id)?.reward} tokens.`,
      })

      setClaimingId(null)
    }, 1500)
  }

  // Calculate total tokens earned
  const totalEarned = rewards.filter((reward) => reward.completed).reduce((sum, reward) => sum + reward.reward, 0)

  // Calculate total tokens available to claim
  const availableToClaim = rewards
    .filter((reward) => !reward.completed && reward.progress >= reward.total)
    .reduce((sum, reward) => sum + reward.reward, 0)

  return (
    <AppLayout>
      <div className="container mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold mb-6">Rewards</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Total Earned</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Gift className="h-5 w-5 text-purple-500 mr-2" />
                <span className="text-3xl font-bold">{totalEarned} tokens</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Available to Claim</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Gift className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-3xl font-bold">{availableToClaim} tokens</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Rewards Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Gift className="h-5 w-5 text-blue-500 mr-2" />
                <span className="text-3xl font-bold">
                  {rewards.filter((r) => r.completed).length}/{rewards.length}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold mb-4">Your Challenges</h2>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <RefreshCw className="h-8 w-8 text-purple-500 animate-spin" />
            </div>
          ) : (
            rewards.map((reward) => (
              <Card key={reward.id} className="bg-zinc-900 border-zinc-800">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="bg-purple-900/30 p-3 rounded-full">
                        <reward.icon className="h-6 w-6 text-purple-500" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-1 flex items-center">
                          {reward.title}
                          {reward.completed && (
                            <Badge className="ml-2 bg-green-600" variant="secondary">
                              Completed
                            </Badge>
                          )}
                        </h3>
                        <p className="text-zinc-400 text-sm mb-2">{reward.description}</p>
                        <div className="flex items-center">
                          <div className="w-48 h-2 bg-zinc-800 rounded-full mr-3">
                            <div
                              className={`h-2 rounded-full ${
                                reward.completed
                                  ? "bg-green-500"
                                  : reward.progress >= reward.total
                                    ? "bg-purple-500"
                                    : "bg-blue-600"
                              }`}
                              style={{
                                width: `${Math.min(100, (reward.progress / reward.total) * 100)}%`,
                              }}
                            />
                          </div>
                          <span className="text-sm text-zinc-400">
                            {reward.progress}/{reward.total}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="bg-purple-900/20 px-3 py-1 rounded-full text-purple-300 font-medium mb-2">
                        +{reward.reward} tokens
                      </div>
                      {!reward.completed && reward.progress >= reward.total ? (
                        <Button
                          onClick={() => handleClaimReward(reward.id)}
                          disabled={claimingId === reward.id}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          {claimingId === reward.id ? (
                            <>
                              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                              Claiming...
                            </>
                          ) : (
                            <>
                              Claim Reward
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </>
                          )}
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  )
}
