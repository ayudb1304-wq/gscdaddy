export interface GSCSite {
  siteUrl: string
  permissionLevel: string
}

export interface GSCRow {
  keys: string[] // [query, page, date] or subset
  clicks: number
  impressions: number
  ctr: number
  position: number
}

export interface GSCResponse {
  rows?: GSCRow[]
  responseAggregationType?: string
}

/**
 * Google rejected our credentials (revoked access, expired grant, or the
 * Search Console scope wasn't granted). Retrying won't help; the user has to
 * reconnect Google.
 */
export class GoogleAuthError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "GoogleAuthError"
  }
}

const REQUEST_TIMEOUT_MS = 30_000
const MAX_ATTEMPTS = 4

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * fetch() for the Search Console API with a timeout, retries with exponential
 * backoff on 429/5xx/network errors (honouring Retry-After), and auth failures
 * surfaced as GoogleAuthError. A single transient 429 used to fail the whole sync.
 */
async function gscFetch(url: string, init: RequestInit): Promise<Response> {
  let lastError: unknown
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const res = await fetch(url, { ...init, signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) })
      if (res.ok) return res

      const text = await res.text().catch(() => "")
      if (res.status === 401 || (res.status === 403 && /insufficient|scope|permission|forbidden/i.test(text))) {
        throw new GoogleAuthError(`Google rejected the request (${res.status}): ${text.slice(0, 300)}`)
      }
      const retryable = res.status === 429 || res.status >= 500
      if (!retryable || attempt === MAX_ATTEMPTS) {
        throw new Error(`GSC API error (${res.status}): ${text.slice(0, 500)}`)
      }
      const retryAfter = Number(res.headers.get("retry-after"))
      await sleep(Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : 1000 * 2 ** (attempt - 1))
    } catch (err) {
      if (err instanceof GoogleAuthError) throw err
      if (err instanceof Error && err.message.startsWith("GSC API error")) throw err
      // Network error or timeout: retry.
      lastError = err
      if (attempt === MAX_ATTEMPTS) break
      await sleep(1000 * 2 ** (attempt - 1))
    }
  }
  throw lastError instanceof Error ? lastError : new Error("GSC request failed")
}

export async function listAvailableSites(accessToken: string): Promise<GSCSite[]> {
  const res = await gscFetch("https://www.googleapis.com/webmasters/v3/sites", {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  const data = await res.json()
  return (data.siteEntry || []).map((entry: { siteUrl: string; permissionLevel: string }) => ({
    siteUrl: entry.siteUrl,
    permissionLevel: entry.permissionLevel,
  }))
}

export async function fetchSearchAnalytics(
  accessToken: string,
  siteUrl: string,
  startDate: string,
  endDate: string,
  startRow: number = 0,
  rowLimit: number = 25000,
  dimensions: string[] = ["query", "page", "date"]
): Promise<GSCRow[]> {
  const encodedSiteUrl = encodeURIComponent(siteUrl)
  const res = await gscFetch(
    `https://www.googleapis.com/webmasters/v3/sites/${encodedSiteUrl}/searchAnalytics/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        startDate,
        endDate,
        dimensions,
        rowLimit,
        startRow,
        dataState: "final",
      }),
    }
  )

  const data: GSCResponse = await res.json()
  return data.rows || []
}

/**
 * Fetch all GSC analytics rows for a date range, page by page. `onPage` lets
 * the caller save each page as it arrives instead of holding everything.
 */
export async function fetchAllSearchAnalytics(
  accessToken: string,
  siteUrl: string,
  startDate: string,
  endDate: string,
  onPage?: (rows: GSCRow[]) => Promise<void>
): Promise<GSCRow[]> {
  const allRows: GSCRow[] = []
  let startRow = 0
  const rowLimit = 25000

  while (true) {
    const rows = await fetchSearchAnalytics(accessToken, siteUrl, startDate, endDate, startRow, rowLimit)
    if (rows.length === 0) break

    if (onPage) await onPage(rows)
    else allRows.push(...rows)
    startRow += rowLimit

    if (rows.length < rowLimit) break
  }

  return allRows
}

/**
 * Site-level totals per day, exactly as the Search Console Performance report
 * shows them. Summing query×page rows misses anonymised queries and counts
 * impressions per page, so headline numbers come from here instead.
 */
export async function fetchDailyTotals(
  accessToken: string,
  siteUrl: string,
  startDate: string,
  endDate: string
): Promise<GSCRow[]> {
  return fetchSearchAnalytics(accessToken, siteUrl, startDate, endDate, 0, 25000, ["date"])
}
