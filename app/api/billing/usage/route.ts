import { NextResponse } from "next/server"
import { checkAccess } from "@/lib/billing/access"
import { getPlanLimits } from "@/lib/billing/plans"
import { requireAuth } from "@/lib/auth"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET() {
  try {
    const user = await requireAuth()
    const admin = createAdminClient()
    const access = checkAccess(user)

    // For trial/free users, use free limits. For paid users, use their plan limits.
    const isPaid = ["blogger", "pro", "agency"].includes(access.plan)
    const limits = isPaid ? getPlanLimits(access.plan) : getPlanLimits("free")

    // Count current sites
    const { count: sitesUsed } = await admin
      .from("sites")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)

    // Count today's AI recommendations generated
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const { data: userSites } = await admin
      .from("sites")
      .select("id")
      .eq("user_id", user.id)
    const siteIds = userSites?.map((s) => s.id) ?? []

    let recsToday = 0
    if (siteIds.length > 0) {
      const { count } = await admin
        .from("recommendations")
        .select("id", { count: "exact", head: true })
        .in("site_id", siteIds)
        .gte("created_at", todayStart.toISOString())
      recsToday = count ?? 0
    }

    return NextResponse.json({
      plan: access.plan,
      daysRemaining: access.daysRemaining,
      sitesUsed: sitesUsed ?? 0,
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
