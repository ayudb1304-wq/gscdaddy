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

export async function listAvailableSites(
  accessToken: string
): Promise<GSCSite[]> {
  const res = await fetch(
    "https://www.googleapis.com/webmasters/v3/sites",
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`GSC API error (${res.status}): ${text}`)
  }

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
  rowLimit: number = 25000
): Promise<GSCRow[]> {
  const encodedSiteUrl = encodeURIComponent(siteUrl)
  const res = await fetch(
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
        dimensions: ["query", "page", "date"],
        rowLimit,
        startRow,
        dataState: "final",
      }),
    }
  )

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`GSC Analytics API error (${res.status}): ${text}`)
  }

  const data: GSCResponse = await res.json()
  return data.rows || []
}

/**
 * Fetch all GSC analytics data with automatic pagination.
 */
export async function fetchAllSearchAnalytics(
  accessToken: string,
  siteUrl: string,
  startDate: string,
  endDate: string
): Promise<GSCRow[]> {
  const allRows: GSCRow[] = []
  let startRow = 0
  const rowLimit = 25000

  while (true) {
    const rows = await fetchSearchAnalytics(
      accessToken,
      siteUrl,
      startDate,
      endDate,
      startRow,
      rowLimit
    )

    if (rows.length === 0) break

    allRows.push(...rows)
    startRow += rowLimit

    if (rows.length < rowLimit) break

    // Basic rate limiting - 20 QPS max
    await new Promise((resolve) => setTimeout(resolve, 100))
  }

  return allRows
}
