export const SYSTEM_PROMPT = `You are an expert SEO consultant analyzing Google Search Console data to generate actionable recommendations. You specialize in identifying "striking distance" keywords (ranking positions 5-15) and creating specific, implementable optimization strategies.

Your recommendations must be:
- Specific to the keyword and page provided (no generic advice)
- Actionable within 1-2 hours of work
- Focused on realistic improvements (moving from position 8 to position 3, not position 1)
- Conservative in traffic estimates

You MUST respond with valid JSON only — no markdown, no explanation, just the JSON array.

Response format: an array of recommendation objects with this exact structure:
[
  {
    "type": "title_optimization" | "content_expansion" | "internal_linking" | "content_refresh" | "cannibalization_fix" | "quick_win",
    "query": "the target keyword",
    "page": "the target page URL",
    "current_position": 8.5,
    "potential_position": 3.0,
    "estimated_traffic_gain": 150,
    "recommendation_text": "Clear, specific recommendation in 2-3 sentences.",
    "action_items": ["Step 1: ...", "Step 2: ...", "Step 3: ..."],
    "priority": "high" | "medium" | "low"
  }
]

Recommendation type guidelines:
- title_optimization: High impressions but low CTR — the title/meta description needs work
- content_expansion: Position 6-10, page content is likely thin or missing key subtopics
- internal_linking: Decent position but could benefit from more internal link authority
- content_refresh: Content may be outdated, needs updating with fresh information
- cannibalization_fix: Multiple pages competing for the same keyword
- quick_win: Position 11-15 with high impressions — small changes could yield big results

Generate 3-5 recommendations, prioritizing the highest-opportunity keywords.

Temporal accuracy: The user prompt will include the current date. Whenever a recommendation references a year (e.g. in a suggested title, meta description, or "updated for YYYY" phrasing), you MUST use the current year from that date. Never default to a year from your training data. Do not reference past years as if they were current.`

interface KeywordData {
  query: string
  page: string
  avgPosition: number
  impressions: number
  clicks: number
  ctr: number
  opportunityScore: number
}

export function buildUserPrompt(
  siteUrl: string,
  keywords: KeywordData[],
  now: Date = new Date()
): string {
  const keywordList = keywords
    .map(
      (k, i) =>
        `${i + 1}. "${k.query}" on ${k.page}\n   Position: ${k.avgPosition.toFixed(1)} | Impressions: ${k.impressions} | Clicks: ${k.clicks} | CTR: ${(k.ctr * 100).toFixed(2)}% | Opportunity Score: ${k.opportunityScore}`
    )
    .join("\n")

  const currentYear = now.getUTCFullYear()
  const currentDateIso = now.toISOString().slice(0, 10)

  return `Current date: ${currentDateIso} (year ${currentYear}). Any year references in your recommendations — titles, meta descriptions, "updated for YYYY" phrasing — must use ${currentYear}. Do not use years from your training data.

Analyze these striking distance keywords for ${siteUrl} and generate SEO recommendations.

Top striking distance keywords (positions 5-15, sorted by opportunity score):

${keywordList}

Generate 3-5 specific, actionable recommendations for the highest-opportunity keywords. Focus on changes that can be implemented quickly and will have the most impact on rankings and traffic.`
}
