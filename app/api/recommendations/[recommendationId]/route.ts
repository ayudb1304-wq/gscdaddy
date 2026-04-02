import { requireAuth } from "@/lib/auth"
import { createAdminClient } from "@/lib/supabase/admin"
import { successResponse, errors } from "@/lib/api/response"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ recommendationId: string }> }
) {
  try {
    const user = await requireAuth()
    const { recommendationId } = await params
    const admin = createAdminClient()

    // Verify ownership through sites join
    const { data: rec, error: fetchError } = await admin
      .from("recommendations")
      .select("id, is_completed, site_id, sites!inner(user_id)")
      .eq("id", recommendationId)
      .single()

    if (fetchError || !rec) return errors.notFound("Recommendation")

    const siteOwner = (rec.sites as unknown as { user_id: string })?.user_id
    if (siteOwner !== user.id) return errors.notFound("Recommendation")

    const newCompleted = !rec.is_completed

    const { data, error } = await admin
      .from("recommendations")
      .update({
        is_completed: newCompleted,
        completed_at: newCompleted ? new Date().toISOString() : null,
      })
      .eq("id", recommendationId)
      .select()
      .single()

    if (error) return errors.internal("Failed to update recommendation")

    return successResponse(data)
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error"
    if (message === "UNAUTHORIZED") return errors.unauthorized()
    return errors.internal("Failed to update recommendation")
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ recommendationId: string }> }
) {
  try {
    const user = await requireAuth()
    const { recommendationId } = await params
    const admin = createAdminClient()

    // Verify ownership through sites join
    const { data: rec, error: fetchError } = await admin
      .from("recommendations")
      .select("id, site_id, sites!inner(user_id)")
      .eq("id", recommendationId)
      .single()

    if (fetchError || !rec) return errors.notFound("Recommendation")

    const siteOwner = (rec.sites as unknown as { user_id: string })?.user_id
    if (siteOwner !== user.id) return errors.notFound("Recommendation")

    const { error } = await admin
      .from("recommendations")
      .delete()
      .eq("id", recommendationId)

    if (error) return errors.internal("Failed to delete recommendation")

    return successResponse({ deleted: true })
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error"
    if (message === "UNAUTHORIZED") return errors.unauthorized()
    return errors.internal("Failed to delete recommendation")
  }
}
