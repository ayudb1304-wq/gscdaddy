import { requireAuth } from "@/lib/auth"
import { createAdminClient } from "@/lib/supabase/admin"
import { successResponse, errors } from "@/lib/api/response"
import { getEffectivePlan } from "@/lib/billing/access"
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

    // Rate limit check: count today's generations for this site
    const today = new Date().toISOString().split("T")[0]
    const { count } = await admin
      .from("recommendations")
      .select("*", { count: "exact", head: true })
      .eq("site_id", siteId)
      .gte("created_at", `${today}T00:00:00Z`)

    const plan = getEffectivePlan(user)
    const limits = getPlanLimits(plan)

    if ((count || 0) >= limits.aiRecsPerDay) {
      return errors.planLimit(
        `Daily recommendation limit reached (${limits.aiRecsPerDay}/day on ${plan} plan)`
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
