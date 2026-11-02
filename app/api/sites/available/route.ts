import { requireAuth } from "@/lib/auth"
import { getValidAccessToken } from "@/lib/google/tokens"
import { listAvailableSites, GoogleAuthError } from "@/lib/google/search-console"
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

    // Unverified properties can't be queried (every sync would 403), so don't offer them.
    const sites = gscSites
      .filter((site) => site.permissionLevel !== "siteUnverifiedUser")
      .map((site) => ({
        ...site,
        isAdded: existingUrls.has(site.siteUrl),
      }))

    return successResponse(sites)
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error"
    const stack = e instanceof Error ? e.stack : undefined
    if (message === "UNAUTHORIZED") return errors.unauthorized()
    if (e instanceof GoogleAuthError) return errors.googleReauth()
    console.error("Failed to fetch available sites:", message)
    if (stack) console.error(stack)
    return errors.internal("Couldn't load your Search Console sites. Try again in a moment.")
  }
}
