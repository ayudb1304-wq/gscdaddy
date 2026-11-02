import { requireAuth } from "@/lib/auth"
import { createAdminClient } from "@/lib/supabase/admin"
import { successResponse, errors } from "@/lib/api/response"
import { estimateTrafficGain } from "@/lib/algorithms/opportunity-score"
import { checkAccess, getEffectivePlan } from "@/lib/billing/access"
import { hasFeature } from "@/lib/billing/plans"
import { isUuid, intParam } from "@/lib/api/validate"

const SORTS = new Set(["opportunity_score", "total_impressions", "total_clicks", "avg_position", "avg_ctr"])
const num = (v: string | null) => {
  if (v === null || v === "") return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const user = await requireAuth()
    const { siteId } = await params
    if (!isUuid(siteId)) return errors.notFound("Site")
    const { searchParams } = new URL(request.url)

    // Expired users could still pull every keyword through the API.
    if (!checkAccess(user).hasAccess) return errors.trialExpired()

    // CSV export pages through up to 1,000 rows at a time and is a Pro/Agency
    // feature (it worked on every plan). Normal table views cap at 100 rows.
    const isExport = searchParams.get("export") === "1"
    if (isExport && !hasFeature(getEffectivePlan(user), "csv_exports")) {
      return errors.planLimit("CSV export is included in the Pro and Agency plans.")
    }

    const admin = createAdminClient()

    // Verify ownership
    const { data: site, error: siteError } = await admin
      .from("sites")
      .select("id")
      .eq("id", siteId)
      .eq("user_id", user.id)
      .single()

    if (siteError || !site) return errors.notFound("Site")

    // Clamped: page <= 0 or a negative limit made the SQL OFFSET/LIMIT throw (500).
    const sortBy = SORTS.has(searchParams.get("sortBy") ?? "") ? searchParams.get("sortBy")! : "opportunity_score"
    const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc"
    const page = intParam(searchParams.get("page"), 1, 1, 100_000)
    const limit = intParam(searchParams.get("limit"), 25, 1, isExport ? 1000 : 100)
    const search = (searchParams.get("search") || "").slice(0, 200) || null
    const minImpressions = num(searchParams.get("minImpressions"))
    const minPosition = num(searchParams.get("minPosition"))
    const maxPosition = num(searchParams.get("maxPosition"))

    const { data, error } = await admin.rpc("get_striking_distance", {
      p_site_id: siteId,
      p_sort_by: sortBy,
      p_sort_order: sortOrder,
      p_page: page,
      p_limit: limit,
      p_search: search,
      p_min_impressions: minImpressions === null ? null : Math.max(0, Math.round(minImpressions)),
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
