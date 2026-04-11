import { anthropic } from "@ai-sdk/anthropic"
import { generateObject } from "ai"
import { z } from "zod/v4"
import { createAdminClient } from "@/lib/supabase/admin"
import { SYSTEM_PROMPT, buildUserPrompt } from "./prompts"
import { estimateTrafficGain } from "@/lib/algorithms/opportunity-score"

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

export async function generateRecommendations(siteId: string) {
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

  // Fetch top 20 striking distance keywords
  const { data: keywords, error: kwError } = await admin.rpc("get_striking_distance", {
    p_site_id: siteId,
    p_sort_by: "opportunity_score",
    p_sort_order: "desc",
    p_page: 1,
    p_limit: 20,
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
    model: anthropic("claude-sonnet-4-6"),
    output: "array",
    schema: RecommendationSchema,
    system: SYSTEM_PROMPT,
    prompt: userPrompt,
    maxOutputTokens: 2048,
  })

  // Insert into DB
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

  const records = recommendations.map((rec) => ({
    site_id: siteId,
    type: rec.type,
    query: rec.query,
    page: rec.page,
    current_position: rec.current_position,
    potential_position: rec.potential_position,
    estimated_traffic_gain: rec.estimated_traffic_gain || estimateTrafficGain(
      keywordData.find((k: { query: string; impressions: number }) => k.query === rec.query)?.impressions || 1000,
      rec.current_position,
      Math.round(rec.potential_position)
    ),
    recommendation_text: rec.recommendation_text,
    action_items: rec.action_items,
    priority: rec.priority,
    expires_at: expiresAt,
  }))

  const { data: inserted, error: insertError } = await admin
    .from("recommendations")
    .insert(records)
    .select()

  if (insertError) {
    throw new Error(`Failed to save recommendations: ${insertError.message}`)
  }

  console.log(`Generated ${inserted?.length || 0} recommendations for site ${siteId}`)
  return inserted
}
