import { after } from "next/server"
import { requireAuth } from "@/lib/auth"
import { createAdminClient } from "@/lib/supabase/admin"
import { successResponse, errors } from "@/lib/api/response"
import { syncSite } from "@/lib/sync/gsc-sync"

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
      }
    })

    return successResponse({ status: "syncing", siteId })
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error"
    if (message === "UNAUTHORIZED") return errors.unauthorized()
    return errors.internal("Failed to trigger sync")
  }
}
