import { requireAuth } from "@/lib/auth"
import { isSyncInProgress } from "@/lib/sync/gsc-sync"
import { createAdminClient } from "@/lib/supabase/admin"
import { successResponse, errors } from "@/lib/api/response"
import { isUuid } from "@/lib/api/validate"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const user = await requireAuth()
    const { siteId } = await params
    if (!isUuid(siteId)) return errors.notFound("Site")
    const admin = createAdminClient()

    const { data: site, error } = await admin
      .from("sites")
      .select("id, sync_status, sync_progress, sync_started_at, last_synced_at")
      .eq("id", siteId)
      .eq("user_id", user.id)
      .single()

    if (error || !site) return errors.notFound("Site")

    const dead = site.sync_status === "syncing" && !isSyncInProgress(site.sync_status, site.sync_started_at)
    return successResponse({
      syncStatus: dead ? "failed" : site.sync_status,
      syncProgress: dead ? "Last sync didn't finish. Try again." : site.sync_progress,
      lastSyncedAt: site.last_synced_at,
    })
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error"
    if (message === "UNAUTHORIZED") return errors.unauthorized()
    return errors.internal("Failed to fetch sync status")
  }
}
