import { requireAuth } from "@/lib/auth"
import { createAdminClient } from "@/lib/supabase/admin"
import { successResponse, errors } from "@/lib/api/response"

export async function GET(request: Request) {
  try {
    const user = await requireAuth()
    const { searchParams } = new URL(request.url)
    const siteId = searchParams.get("siteId")

    if (!siteId) return errors.validation("siteId is required")

    const admin = createAdminClient()

    // Verify ownership
    const { data: site, error: siteError } = await admin
      .from("sites")
      .select("id")
      .eq("id", siteId)
      .eq("user_id", user.id)
      .single()

    if (siteError || !site) return errors.notFound("Site")

    const { data, error } = await admin
      .from("recommendations")
      .select("*")
      .eq("site_id", siteId)
      .order("created_at", { ascending: false })

    if (error) return errors.internal("Failed to fetch recommendations")

    return successResponse(data || [])
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error"
    if (message === "UNAUTHORIZED") return errors.unauthorized()
    return errors.internal("Failed to fetch recommendations")
  }
}
