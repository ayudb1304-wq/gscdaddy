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
      .select("*")
      .eq("id", siteId)
      .eq("user_id", user.id)
      .single()

    if (error || !site) return errors.notFound("Site")

    return successResponse(site)
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error"
    if (message === "UNAUTHORIZED") return errors.unauthorized()
    return errors.internal("Failed to fetch site")
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const user = await requireAuth()
    const { siteId } = await params
    const admin = createAdminClient()

    const { error } = await admin
      .from("sites")
      .delete()
      .eq("id", siteId)
      .eq("user_id", user.id)

    if (error) throw error

    return successResponse({ deleted: true })
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error"
    if (message === "UNAUTHORIZED") return errors.unauthorized()
    return errors.internal("Failed to delete site")
  }
}
