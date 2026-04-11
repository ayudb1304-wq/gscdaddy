import { after } from "next/server"
import { requireAuth } from "@/lib/auth"
import { createAdminClient } from "@/lib/supabase/admin"
import { successResponse, errors } from "@/lib/api/response"
import { syncSite } from "@/lib/sync/gsc-sync"
import { generateRecommendations } from "@/lib/ai/generate-recommendations"

export const maxDuration = 300 // 5 minutes max for sync

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const user = await requireAuth()
    const { siteId } = await params
    const admin = createAdminClient()

    // Verify ownership
    const { data: site, error: fetchError } = await admin
      .from("sites")
      .select("id, sync_status")
      .eq("id", siteId)
      .eq("user_id", user.id)
      .single()

    if (fetchError || !site) return errors.notFound("Site")

    if (site.sync_status === "syncing") {
      return errors.validation("Sync is already in progress")
    }

    // Use next/server after() to keep the function alive after responding
    after(async () => {
      try {
        await syncSite(siteId)
      } catch (err) {
        console.error(`Background sync failed for site ${siteId}:`, err)
        return
      }

      // Post-sync: auto-generate recommendations for first-time users
      // so they land on the dashboard with something to act on immediately.
      // Gated on "zero non-expired recs" so repeat syncs don't re-bill the AI call.
      try {
        const { count } = await admin
          .from("recommendations")
          .select("*", { count: "exact", head: true })
          .eq("site_id", siteId)
          .gt("expires_at", new Date().toISOString())

        if (!count || count === 0) {
          console.log(`Auto-generating first-time recommendations for site ${siteId}`)
          await generateRecommendations(siteId)
        }
      } catch (err) {
        console.error(`Auto rec-generation failed for site ${siteId}:`, err)
      }
    })

    return successResponse({ status: "syncing", siteId })
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error"
    if (message === "UNAUTHORIZED") return errors.unauthorized()
    return errors.internal("Failed to trigger sync")
  }
}
