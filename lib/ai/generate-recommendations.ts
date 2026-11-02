import { anthropic } from "@ai-sdk/anthropic"
import { generateObject } from "ai"
import { z } from "zod/v4"
import { createAdminClient } from "@/lib/supabase/admin"
import { SYSTEM_PROMPT, buildUserPrompt } from "./prompts"
import { estimateTrafficGain } from "@/lib/algorithms/opportunity-score"
import { logGeneration } from "@/lib/recommendations/quota"

const RecommendationSchema = z.object({
  type: z.enum([
    "title_optimization",
    "content_expansion",
    "internal_linking",
    "content_refresh",
    "cannibalization_fix",
    "quick_win",
  ]),
  query: z.string(),
  page: z.string(),
  current_position: z.number(),
  potential_position: z.number(),
  estimated_traffic_gain: z.number(),
  recommendation_text: z.string(),
  action_items: z.array(z.string()),
  priority: z.enum(["high", "medium", "low"]),
})

export const RECOMMENDATIONS_MODEL = "claude-sonnet-5-5"

/** Most recommendations kept from one generation. */
const MAX_RECS = 5
/** Abort the model call before the 120s route limit. */
const MODEL_TIMEOUT_MS = 100_000

export async function generateRecommendations(
  siteId: string,
  { source = "auto" }: { source?: "manual" | "auto" } = {}
) {
  const admin = createAdminClient()

  // Fetch site
  const { data: site, error: siteError } = await admin
    .from("sites")
    .select("id, site_url, user_id")
    .eq("id", siteId)
    .single()

  if (siteError || !site) {
    throw new Error(`Site not found: ${siteId}`)
  }

  // Fetch top 20 striking distance keywords.
  // All parameters must be passed explicitly (including the null optional ones)
  // to match the function signature — omitting them can cause PostgREST to
  // skip default resolution and return zero rows.
  const { data: keywords, error: kwError } = await admin.rpc("get_striking_distance", {
    p_site_id: siteId,
    p_sort_by: "opportunity_score",
    p_sort_order: "desc",
    p_page: 1,
    p_limit: 20,
    p_search: null,
    p_min_impressions: null,
    p_min_position: null,
    p_max_position: null,
  })

  if (kwError) {
    throw new Error(`Failed to fetch striking distance keywords: ${kwError.message}`)
  }

  if (!keywords || keywords.length === 0) {
    console.log(`Site ${siteId} has no striking distance keywords yet — skipping`)
    return []
  }

  const keywordData = keywords.map((k: {
    query: string
    page: string
    avg_position: number
    total_impressions: number
    total_clicks: number
    avg_ctr: number
    opportunity_score: number
  }) => ({
    query: k.query,
    page: k.page,
    avgPosition: Number(k.avg_position),
    impressions: Number(k.total_impressions),
    clicks: Number(k.total_clicks),
    ctr: Number(k.avg_ctr),
    opportunityScore: Math.round(Number(k.opportunity_score)),
  }))

  // Build prompt and call Claude via @ai-sdk/anthropic. Pass `new Date()` so
  // the model always knows the current date and doesn't fall back to years
  // from its training data when generating titles or "updated for YYYY" phrasing.
  const userPrompt = buildUserPrompt(site.site_url, keywordData, new Date())

  // generateObject handles schema validation, markdown-fence stripping, and
  // JSON parsing internally — replacing the manual parse/zod pipeline we had
  // with the direct Anthropic SDK.
  const { object: recommendations } = await generateObject({
    model: anthropic(RECOMMENDATIONS_MODEL),
    output: "array",
    schema: RecommendationSchema,
    system: SYSTEM_PROMPT,
    prompt: userPrompt,
    // Sonnet 5.5 thinks by default and thinking counts toward this limit, so
    // leave room for it plus five recommendations.
    maxOutputTokens: 16000,
    abortSignal: AbortSignal.timeout(MODEL_TIMEOUT_MS),
    providerOptions: {
      anthropic: {
        // This AI SDK version doesn't know Sonnet 5.5 and would fall back to a
        // forced "json" tool call, which Sonnet 5.5 rejects (400). Use native
        // structured output (output_config.format) instead.
        structuredOutputMode: "outputFormat",
        // Sonnet 5.5 defaults to "high"; "medium" keeps latency and cost down
        // for a single structured response.
        effort: "medium",
      },
    },
  })

  // Check the model's output against the data we sent. Its own numbers are not
  // trusted: positions come from the input row, the target is clamped between
  // #1 and the current position, the gain is recomputed, and recs for keywords
  // that weren't in the input (or a re-normalised URL) are dropped, since they
  // would break the shipped-fix baseline join.
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  const byKey = new Map(keywordData.map((k: { query: string; page: string }) => [`${k.query}\u0000${k.page}`, k]))

  const records = recommendations
    .map((rec) => {
      const input = byKey.get(`${rec.query}\u0000${rec.page}`) as (typeof keywordData)[number] | undefined
      if (!input) return null
      const current = Math.round(input.avgPosition * 10) / 10
      const target = Math.min(current, Math.max(1, Math.round(rec.potential_position)))
      return {
        site_id: siteId,
        type: rec.type,
        query: input.query,
        page: input.page,
        current_position: current,
        potential_position: target,
        estimated_traffic_gain: estimateTrafficGain(input.impressions, current, target),
        recommendation_text: rec.recommendation_text,
        action_items: rec.action_items,
        priority: rec.priority,
        expires_at: expiresAt,
      }
    })
    .filter((r): r is NonNullable<typeof r> => r !== null)
    .slice(0, MAX_RECS)

  if (records.length === 0) {
    console.warn(`Model returned no usable recommendations for site ${siteId} (${recommendations.length} raw)`)
    return []
  }

  const { data: inserted, error: insertError } = await admin
    .from("recommendations")
    .insert(records)
    .select()

  if (insertError) {
    throw new Error(`Failed to save recommendations: ${insertError.message}`)
  }

  await logGeneration(admin, { userId: site.user_id, siteId, source, recCount: inserted?.length ?? 0 })
  console.log(`Generated ${inserted?.length || 0} recommendations for site ${siteId}`)
  return inserted
}
