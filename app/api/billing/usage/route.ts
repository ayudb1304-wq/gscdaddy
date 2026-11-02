import { NextResponse } from "next/server"
import { checkAccess, getUserLimits } from "@/lib/billing/access"
import { requireAuth } from "@/lib/auth"
import { createAdminClient } from "@/lib/supabase/admin"
import { manualRecsUsedToday } from "@/lib/recommendations/quota"

export async function GET() {
  try {
    const user = await requireAuth()
    const admin = createAdminClient()
    const access = checkAccess(user)

    // Same limits and counting as the routes that enforce them (trial = Pro;
    // AI recs per user per UTC day from the generation log).
    const limits = getUserLimits(user)

    const { data: userSites } = await admin.from("sites").select("id").eq("user_id", user.id)
    const siteIds = (userSites ?? []).map((s) => s.id)
    const recsToday = await manualRecsUsedToday(admin, user.id, siteIds)

    return NextResponse.json({
      plan: access.plan,
      daysRemaining: access.daysRemaining,
      sitesUsed: siteIds.length,
      sitesLimit: limits.sites,
      recsToday,
      recsLimit: limits.aiRecsPerDay,
    })
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    console.error("Usage error:", error)
    return NextResponse.json({ error: "Failed to fetch usage" }, { status: 500 })
  }
}
