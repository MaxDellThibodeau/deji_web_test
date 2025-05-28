import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { uploadProfileImage } from "@/features/auth/actions/profile-actions"

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    // Get form data
    const formData = await request.formData()

    // Call the server action
    const result = await uploadProfileImage(formData)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error in profile image upload API:", error)
    return NextResponse.json({ success: false, error: "An unexpected error occurred" }, { status: 500 })
  }
}
