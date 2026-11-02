// REFERENCE — target path: lib/google/url-inspection.ts
// Written against https://developers.google.com/webmaster-tools/v1/urlInspection.index/inspect
// (checked Nov 2, 2026). Adapt to repo conventions, then typecheck.
//
// Scope: webmasters.readonly (already granted). Limits: 2,000/day and 600/min per site.
// Callers must reserve quota first (reserve_inspections RPC) and throttle to <= 5 req/s per site.

export type Verdict =
  | "VERDICT_UNSPECIFIED"
  | "PASS"
  | "PARTIAL"
  | "FAIL"
  | "NEUTRAL"

export type RobotsTxtState =
  | "ROBOTS_TXT_STATE_UNSPECIFIED"
  | "ALLOWED"
  | "DISALLOWED"

export type IndexingState =
  | "INDEXING_STATE_UNSPECIFIED"
  | "INDEXING_ALLOWED"
  | "BLOCKED_BY_META_TAG"
  | "BLOCKED_BY_HTTP_HEADER"
  | "BLOCKED_BY_ROBOTS_TXT"

export type PageFetchState =
  | "PAGE_FETCH_STATE_UNSPECIFIED"
  | "SUCCESSFUL"
  | "SOFT_404"
  | "BLOCKED_ROBOTS_TXT"
  | "NOT_FOUND"
  | "ACCESS_DENIED"
  | "SERVER_ERROR"
  | "REDIRECT_ERROR"
  | "ACCESS_FORBIDDEN"
  | "BLOCKED_4XX"
  | "INTERNAL_CRAWL_ERROR"
  | "INVALID_URL"

export interface IndexStatusResult {
  sitemap?: string[]
  referringUrls?: string[]
  verdict?: Verdict
  coverageState?: string
  robotsTxtState?: RobotsTxtState
  indexingState?: IndexingState
  lastCrawlTime?: string
  pageFetchState?: PageFetchState
  googleCanonical?: string
  userCanonical?: string
  crawledAs?: "CRAWLING_USER_AGENT_UNSPECIFIED" | "DESKTOP" | "MOBILE"
}

export interface UrlInspectionResult {
  inspectionResultLink?: string
  indexStatusResult?: IndexStatusResult
}

export class InspectionError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    /** true when Google says the per-site quota is used up — stop this site for the day */
    public readonly quotaExhausted: boolean,
    /** true when the token no longer has access to the property */
    public readonly permissionDenied: boolean
  ) {
    super(message)
    this.name = "InspectionError"
  }
}

const ENDPOINT =
  "https://searchconsole.googleapis.com/v1/urlInspection/index:inspect"

/**
 * Inspect one URL. `siteUrl` must be the exact GSC property string
 * ("https://example.com/" with trailing slash, or "sc-domain:example.com"),
 * and `inspectionUrl` must belong to it.
 */
export async function inspectUrl(
  accessToken: string,
  siteUrl: string,
  inspectionUrl: string,
  languageCode = "en-US"
): Promise<UrlInspectionResult> {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ inspectionUrl, siteUrl, languageCode }),
  })

  if (!res.ok) {
    const text = await res.text()
    const quotaExhausted =
      res.status === 429 || /RESOURCE_EXHAUSTED|quota/i.test(text)
    const permissionDenied = res.status === 403 && !quotaExhausted
    throw new InspectionError(
      `URL Inspection API error (${res.status}): ${text.slice(0, 500)}`,
      res.status,
      quotaExhausted,
      permissionDenied
    )
  }

  const data = (await res.json()) as { inspectionResult?: UrlInspectionResult }
  return data.inspectionResult ?? {}
}

/** True if `url` belongs to the GSC property `siteUrl`. */
export function urlBelongsToProperty(url: string, siteUrl: string): boolean {
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return false
  }
  if (siteUrl.startsWith("sc-domain:")) {
    const domain = siteUrl.slice("sc-domain:".length).toLowerCase()
    const host = parsed.hostname.toLowerCase()
    return host === domain || host.endsWith(`.${domain}`)
  }
  return url.startsWith(siteUrl)
}
