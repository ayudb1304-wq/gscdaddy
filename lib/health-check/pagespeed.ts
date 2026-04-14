/**
 * PageSpeed Insights API wrapper.
 * Uses the free PSI API (25k req/day) to get performance + mobile data.
 */

export interface PageSpeedResult {
  performanceScore: number // 0-100
  metrics: {
    firstContentfulPaint: number // ms
    largestContentfulPaint: number // ms
    totalBlockingTime: number // ms
    cumulativeLayoutShift: number // score
    speedIndex: number // ms
    interactive: number // ms
  }
  mobile: {
    isMobileFriendly: boolean
    viewportConfigured: boolean
    fontSizeOk: boolean
    tapTargetsOk: boolean
  }
}

const PSI_API_URL = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed"

export async function getPageSpeedResults(
  url: string,
  strategy: "mobile" | "desktop" = "mobile"
): Promise<PageSpeedResult> {
  const apiKey = process.env.PAGESPEED_API_KEY
  const params = new URLSearchParams({
    url,
    strategy,
    category: "performance",
  })
  params.append("category", "accessibility")
  if (apiKey) params.set("key", apiKey)

  const response = await fetch(`${PSI_API_URL}?${params}`, {
    signal: AbortSignal.timeout(30_000),
  })

  if (!response.ok) {
    const text = await response.text().catch(() => "")
    throw new Error(`PageSpeed API error ${response.status}: ${text}`)
  }

  const data = await response.json()

  const lighthouse = data.lighthouseResult
  if (!lighthouse) {
    throw new Error("No Lighthouse result in PageSpeed API response")
  }

  const perfScore = Math.round((lighthouse.categories?.performance?.score ?? 0) * 100)
  const audits = lighthouse.audits || {}

  const metrics = {
    firstContentfulPaint: audits["first-contentful-paint"]?.numericValue ?? 0,
    largestContentfulPaint: audits["largest-contentful-paint"]?.numericValue ?? 0,
    totalBlockingTime: audits["total-blocking-time"]?.numericValue ?? 0,
    cumulativeLayoutShift: audits["cumulative-layout-shift"]?.numericValue ?? 0,
    speedIndex: audits["speed-index"]?.numericValue ?? 0,
    interactive: audits["interactive"]?.numericValue ?? 0,
  }

  // Mobile-friendliness from viewport and tap target audits
  const viewportAudit = audits["viewport"]
  const tapTargetsAudit = audits["tap-targets"]
  const fontSizeAudit = audits["font-size"]

  const mobile = {
    isMobileFriendly: strategy === "mobile" && perfScore > 50,
    viewportConfigured: viewportAudit?.score === 1,
    fontSizeOk: fontSizeAudit?.score === 1 || fontSizeAudit?.score === undefined,
    tapTargetsOk: tapTargetsAudit?.score === 1 || tapTargetsAudit?.score === undefined,
  }

  // Refine mobile-friendly based on individual checks
  if (strategy === "mobile") {
    mobile.isMobileFriendly =
      mobile.viewportConfigured && mobile.fontSizeOk && mobile.tapTargetsOk
  }

  return { performanceScore: perfScore, metrics, mobile }
}
