import { Suspense } from "react"
// Dummy accounts moved to real database - this page needs updating to use real data

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