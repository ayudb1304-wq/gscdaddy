import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const user = await requireAuth()
    return NextResponse.json({
      name: user.name,
      email: user.email,
      avatar_url: user.avatar_url,
      plan: user.plan,
      created_at: user.created_at,
    })
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    const user = await requireAuth()
    const admin = createAdminClient()

    // Delete user from users table (FK cascades delete sites, gsc_data, recommendations, subscriptions)
    await admin.from("users").delete().eq("id", user.id)

    // Delete from Supabase auth
    await admin.auth.admin.deleteUser(user.id)

    // Sign out current session
    const supabase = await createClient()
    await supabase.auth.signOut()

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    console.error("Delete account error:", error)
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 })
  }
}
