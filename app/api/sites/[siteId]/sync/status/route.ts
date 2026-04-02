import { requireAuth } from "@/lib/auth"
import { createAdminClient } from "@/lib/supabase/admin"
import { successResponse, errors } from "@/lib/api/response"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const user = await requireAuth()
    const { siteId } = await params
    const admin = createAdminClient()

    const { data: site, error } = await admin
      .from("sites")
      .select("id, sync_status, sync_progress, last_synced_at")
      .eq("id", siteId)
      .eq("user_id", user.id)
      .single()

    if (error || !site) return errors.notFound("Site")

    return successResponse({
      syncStatus: site.sync_status,
      syncProgress: site.sync_progress,
      lastSyncedAt: site.last_synced_at,
    })
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error"
    if (message === "UNAUTHORIZED") return errors.unauthorized()
    return errors.internal("Failed to fetch sync status")
  }
}
