import { Suspense } from "react"
import { attendeeAccounts, djAccounts, venueAccounts, adminAccounts } from "@/features/auth/services/dummy-accounts"

export default function AccountListLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      {children}
    </Suspense>
  )
}

// Export data that will be used by the page
export async function generateMetadata() {
  return {
    title: "Account List - DJ AI Platform",
    description: "Browse all available demo accounts for the DJ AI platform",
  }
} 