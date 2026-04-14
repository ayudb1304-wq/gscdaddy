import { requireAuth } from "@/lib/auth"
import { createAdminClient } from "@/lib/supabase/admin"
import { successResponse, errors } from "@/lib/api/response"
import { checkAccess } from "@/lib/billing/access"
import { getPlanLimits } from "@/lib/billing/plans"
import { generateRecommendations } from "@/lib/ai/generate-recommendations"

export const maxDuration = 60 // AI generation can take a while

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const user = await requireAuth()
    const { siteId } = await params
    const admin = createAdminClient()

    // Verify ownership
    const { data: site, error: siteError } = await admin
      .from("sites")
      .select("id")
      .eq("id", siteId)
      .eq("user_id", user.id)
      .single()

    if (siteError || !site) return errors.notFound("Site")

    // Anti-bounce guard: prevent rapid double-clicks from burning AI credits.
    // Only block if recs were generated in the last 2 minutes — this protects
    // against accidental re-clicks and UI races (e.g., cron fired in parallel)
    // while still allowing intentional regeneration.
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString()
    const { data: recentRecs } = await admin
      .from("recommendations")
      .select("*")
      .eq("site_id", siteId)
      .gt("created_at", twoMinutesAgo)
      .order("created_at", { ascending: false })

    if (recentRecs && recentRecs.length > 0) {
      return successResponse(recentRecs)
    }

    // Clear stale non-completed recommendations so the user gets a fresh set.
    // Completed recs are preserved so the user doesn't lose tracked progress.
    await admin
      .from("recommendations")
      .delete()
      .eq("site_id", siteId)
      .eq("is_completed", false)

    // Daily rate limit check: count today's rows for this site.
    // Only applies when we actually need to call the AI.
    const today = new Date().toISOString().split("T")[0]
    const { count } = await admin
      .from("recommendations")
      .select("*", { count: "exact", head: true })
      .eq("site_id", siteId)
      .gte("created_at", `${today}T00:00:00Z`)

    const access = checkAccess(user)
    const isPaid = ["blogger", "pro", "agency"].includes(access.plan)
    const limits = isPaid ? getPlanLimits(access.plan) : getPlanLimits("free")

    if ((count || 0) >= limits.aiRecsPerDay) {
      return errors.planLimit(
        `Daily recommendation limit reached (${limits.aiRecsPerDay}/day). Upgrade for more.`
      )
    }

    const recommendations = await generateRecommendations(siteId)

    return successResponse(recommendations)
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error"
    if (message === "UNAUTHORIZED") return errors.unauthorized()
    console.error("Failed to generate recommendations:", e)
    return errors.internal("Failed to generate recommendations")
  }
}
