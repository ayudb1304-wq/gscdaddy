import { requireAuth } from "@/lib/auth"
import { createAdminClient } from "@/lib/supabase/admin"
import { successResponse, errors } from "@/lib/api/response"
import { checkAccess, getUserLimits, sitesWithinPlan } from "@/lib/billing/access"
import { generateRecommendations } from "@/lib/ai/generate-recommendations"
import { manualRecsUsedToday } from "@/lib/recommendations/quota"
import { isUuid } from "@/lib/api/validate"

export const maxDuration = 120 // AI generation (Sonnet with thinking) can take a while

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const user = await requireAuth()
    const { siteId } = await params
    if (!isUuid(siteId)) return errors.notFound("Site")
    const admin = createAdminClient()

    if (!checkAccess(user).hasAccess) return errors.trialExpired()

    // Ownership, and the site must be within the plan (after a downgrade, the
    // extra sites stop getting AI recommendations).
    const { data: userSites } = await admin
      .from("sites")
      .select("id, created_at")
      .eq("user_id", user.id)
    const site = (userSites ?? []).find((s) => s.id === siteId)
    if (!site) return errors.notFound("Site")
    if (!sitesWithinPlan(user, userSites ?? []).some((s) => s.id === siteId)) {
      return errors.planLimit("This site is beyond your plan's site limit. Upgrade or remove a site to use it.")
    }

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

    // Daily limit per user (UTC day), counted from the generation log, so
    // regenerating (which replaces the previous batch) can't reset it. Same
    // scope and numbers the sidebar meter shows.
    const limits = getUserLimits(user)
    const used = await manualRecsUsedToday(admin, user.id, (userSites ?? []).map((s) => s.id))
    if (used >= limits.aiRecsPerDay) {
      return errors.planLimit(
        `Daily recommendation limit reached (${limits.aiRecsPerDay}/day). It resets at midnight UTC.`
      )
    }

    // Generate first, then clear the older uncompleted recs. If the AI call or
    // the insert fails, the user keeps their existing recommendations.
    const generationStartedAt = new Date().toISOString()
    const recommendations = await generateRecommendations(siteId, { source: "manual" })

    if (recommendations && recommendations.length > 0) {
      // Completed recs are preserved so the user doesn't lose tracked progress.
      await admin
        .from("recommendations")
        .delete()
        .eq("site_id", siteId)
        .eq("is_completed", false)
        .lt("created_at", generationStartedAt)
    }

    return successResponse(recommendations)
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error"
    if (message === "UNAUTHORIZED") return errors.unauthorized()
    console.error("Failed to generate recommendations:", e)
    return errors.internal("Failed to generate recommendations")
  }
}
