import { z } from "zod"
import { requireAuth } from "@/lib/auth"
import { isSyncInProgress } from "@/lib/sync/gsc-sync"
import { createAdminClient } from "@/lib/supabase/admin"
import { getEffectivePlan, getUserLimits } from "@/lib/billing/access"
import { getValidAccessToken } from "@/lib/google/tokens"
import { listAvailableSites, GoogleAuthError } from "@/lib/google/search-console"
import { successResponse, errors } from "@/lib/api/response"

const addSiteSchema = z.object({
  siteUrl: z.string().min(1).max(2048),
  displayName: z.string().max(200).optional(),
  permissionLevel: z.string().max(64).optional(),
})

export async function GET() {
  try {
    const user = await requireAuth()
    const admin = createAdminClient()

    const { data: sites, error } = await admin
      .from("sites")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) throw error

    // Report a dead (timed-out) sync as failed so the UI re-enables Sync.
    return successResponse(
      (sites ?? []).map((s) =>
        s.sync_status === "syncing" && !isSyncInProgress(s.sync_status, s.sync_started_at)
          ? { ...s, sync_status: "failed", sync_progress: "Last sync didn't finish. Try again." }
          : s
      )
    )
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error"
    if (message === "UNAUTHORIZED") return errors.unauthorized()
    return errors.internal("Failed to fetch sites")
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth()
    const body = await request.json().catch(() => null)
    const parsed = addSiteSchema.safeParse(body)

    if (!parsed.success) {
      return errors.validation(parsed.error.issues[0].message)
    }

    const { siteUrl, displayName } = parsed.data
    const admin = createAdminClient()

    // Check plan limit (same limits the usage meter shows; trial = Pro)
    const plan = getEffectivePlan(user)
    const limits = getUserLimits(user)
    const { count } = await admin
      .from("sites")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)

    if ((count || 0) >= limits.sites) {
      return errors.planLimit(
        `Your ${plan} plan allows up to ${limits.sites} site(s). Please upgrade to add more.`
      )
    }

    // Only properties this Google account can actually query. Anything else
    // (unverified, typo, someone else's site) would fail every sync while
    // taking a plan slot. Permission level comes from Google, not the client.
    const gscSites = await listAvailableSites(await getValidAccessToken(user.id))
    const property = gscSites.find((p) => p.siteUrl === siteUrl)
    if (!property || property.permissionLevel === "siteUnverifiedUser") {
      return errors.validation("That property isn't verified in your Google Search Console account.")
    }
    const permissionLevel = property.permissionLevel

    // Insert site
    const { data: site, error } = await admin
      .from("sites")
      .insert({
        user_id: user.id,
        site_url: siteUrl,
        display_name: displayName || siteUrl.replace(/^(sc-domain:|https?:\/\/)/, "").replace(/\/$/, ""),
        permission_level: permissionLevel,
        sync_status: "pending",
      })
      .select()
      .single()

    if (error) {
      if (error.code === "23505") {
        return errors.validation("This site is already connected")
      }
      throw error
    }

    return successResponse(site)
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error"
    if (message === "UNAUTHORIZED") return errors.unauthorized()
    if (e instanceof GoogleAuthError) return errors.googleReauth()
    console.error("Failed to add site:", message)
    return errors.internal("Failed to add site")
  }
}
