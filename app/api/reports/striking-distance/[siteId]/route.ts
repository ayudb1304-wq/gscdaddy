import { requireAuth } from "@/lib/auth"
import { createAdminClient } from "@/lib/supabase/admin"
import { successResponse, errors } from "@/lib/api/response"
import { estimateTrafficGain } from "@/lib/algorithms/opportunity-score"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const user = await requireAuth()
    const { siteId } = await params
    const { searchParams } = new URL(request.url)

    const admin = createAdminClient()

    // Verify ownership
    const { data: site, error: siteError } = await admin
      .from("sites")
      .select("id")
      .eq("id", siteId)
      .eq("user_id", user.id)
      .single()

    if (siteError || !site) return errors.notFound("Site")

    const sortBy = searchParams.get("sortBy") || "opportunity_score"
    const sortOrder = searchParams.get("sortOrder") || "desc"
    const page = parseInt(searchParams.get("page") || "1", 10)
    const limit = Math.min(parseInt(searchParams.get("limit") || "25", 10), 10000)
    const search = searchParams.get("search") || null
    const minImpressions = searchParams.get("minImpressions")
      ? parseInt(searchParams.get("minImpressions")!, 10)
      : null
    const minPosition = searchParams.get("minPosition")
      ? parseFloat(searchParams.get("minPosition")!)
      : null
    const maxPosition = searchParams.get("maxPosition")
      ? parseFloat(searchParams.get("maxPosition")!)
      : null

    const { data, error } = await admin.rpc("get_striking_distance", {
      p_site_id: siteId,
      p_sort_by: sortBy,
      p_sort_order: sortOrder,
      p_page: page,
      p_limit: limit,
      p_search: search,
      p_min_impressions: minImpressions,
      p_min_position: minPosition,
      p_max_position: maxPosition,
    })

    if (error) {
      console.error("Striking distance RPC error:", error)
      return errors.internal("Failed to fetch striking distance data")
    }

    const total = data?.[0]?.total_count ?? 0

    const enriched = (data || []).map((row: {
      query: string
      page: string
      avg_position: number
      total_impressions: number
      total_clicks: number
      avg_ctr: number
      opportunity_score: number
      last_seen: string
    }) => ({
      query: row.query,
      page: row.page,
      avgPosition: Number(row.avg_position),
      impressions: Number(row.total_impressions),
      clicks: Number(row.total_clicks),
      ctr: Number(row.avg_ctr),
      opportunityScore: Math.round(Number(row.opportunity_score)),
      estimatedTrafficGain: estimateTrafficGain(
        Number(row.total_impressions),
        Number(row.avg_position)
      ),
      lastSeen: row.last_seen,
    }))

    return successResponse(enriched, { page, limit, total: Number(total) })
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error"
    if (message === "UNAUTHORIZED") return errors.unauthorized()
    return errors.internal("Failed to fetch striking distance report")
  }
}
