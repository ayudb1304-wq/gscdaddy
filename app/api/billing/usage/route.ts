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

    // The subscription the billing page manages: active, or payment failed.
    const sub = (user.subscriptions ?? []).find(
      (x: { status: string }) => x.status === "active" || x.status === "past_due"
    ) as { status: string; plan: string; billing_interval?: string | null } | undefined

    return NextResponse.json({
      plan: access.plan,
      daysRemaining: access.daysRemaining,
      pastDue: sub?.status === "past_due",
      hasSubscription: !!sub,
      subscriptionPlan: sub?.plan ?? null,
      billingInterval: sub?.billing_interval ?? null,
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
