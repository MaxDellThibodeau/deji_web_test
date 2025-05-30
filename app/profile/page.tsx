import type React from "react"
import { redirect } from "next/navigation"
import { getServerSideUser } from "@/features/auth/utils/server-auth"
import { ProfileClient } from "./profile-client"

export default async function ProfilePage() {
  const user = await getServerSideUser()
  if (!user) {
    redirect("/login?redirectTo=/profile")
  }

  return <ProfileClient initialUser={user} />
}
