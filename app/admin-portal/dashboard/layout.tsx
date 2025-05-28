import { Suspense } from "react"

export default function AdminDashboardLayout({
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
    title: "Admin Dashboard - DJ AI Platform",
    description: "Manage and monitor the DJ AI platform",
  }
} 