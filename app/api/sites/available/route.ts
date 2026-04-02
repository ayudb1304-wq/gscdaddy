import { requireAuth } from "@/lib/auth"
import { getValidAccessToken } from "@/lib/google/tokens"
import { listAvailableSites } from "@/lib/google/search-console"
import { createAdminClient } from "@/lib/supabase/admin"
import { successResponse, errors } from "@/lib/api/response"

export async function GET() {
  try {
    const user = await requireAuth()
    const accessToken = await getValidAccessToken(user.id)
    const gscSites = await listAvailableSites(accessToken)

    // Get already-added sites
    const admin = createAdminClient()
    const { data: existingSites } = await admin
      .from("sites")
      .select("site_url")
      .eq("user_id", user.id)

    const existingUrls = new Set(
      (existingSites || []).map((s: { site_url: string }) => s.site_url)
    )

    const sites = gscSites.map((site) => ({
      ...site,
      isAdded: existingUrls.has(site.siteUrl),
    }))

    return successResponse(sites)
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error"
    const stack = e instanceof Error ? e.stack : undefined
    if (message === "UNAUTHORIZED") return errors.unauthorized()
    console.error("Failed to fetch available sites:", message)
    if (stack) console.error(stack)
    return errors.internal("Failed to fetch available sites")
  }
}
