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

    // Credit-burn guard: if this site already has non-expired recommendations,
    // return them without calling the AI. Prevents duplicate spend on repeated
    // clicks, UI races (e.g., cron just generated in parallel), or stale props.
    // This makes the endpoint idempotent — safe to hammer without billing.
    const nowIso = new Date().toISOString()
    const { data: existingFreshRecs } = await admin
      .from("recommendations")
      .select("*")
      .eq("site_id", siteId)
      .gt("expires_at", nowIso)
      .order("created_at", { ascending: false })

    if (existingFreshRecs && existingFreshRecs.length > 0) {
      return successResponse(existingFreshRecs)
    }

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
