// REFERENCE — target path: lib/google/sitemaps.ts (+ lib/indexing/discover-urls.ts for the XML part)
// Sitemaps API: GET https://www.googleapis.com/webmasters/v3/sites/{siteUrl}/sitemaps
// Adapt to repo conventions, then typecheck. No new dependency: the XML is simple
// enough for a regex over <loc> inside <url> / <sitemap> blocks.

export interface GscSitemap {
  path: string
  lastSubmitted?: string
  lastDownloaded?: string
  isPending?: boolean
  isSitemapsIndex?: boolean
  type?: string
  warnings?: string
  errors?: string
  contents?: { type: string; submitted?: string; indexed?: string }[]
}

export async function listSitemaps(
  accessToken: string,
  siteUrl: string
): Promise<GscSitemap[]> {
  const res = await fetch(
    `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/sitemaps`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`GSC Sitemaps API error (${res.status}): ${text.slice(0, 300)}`)
  }
  const data = (await res.json()) as { sitemap?: GscSitemap[] }
  return data.sitemap ?? []
}

/** Origin to fetch robots.txt / default sitemap from. sc-domain properties fall back to https://<domain>. */
export function propertyOrigin(siteUrl: string): string {
  if (siteUrl.startsWith("sc-domain:")) {
    return `https://${siteUrl.slice("sc-domain:".length)}`
  }
  return new URL(siteUrl).origin
}

const LIMITS = {
  maxDepth: 2,
  maxChildSitemaps: 50,
  maxUrls: 50_000,
  timeoutMs: 15_000,
  maxBytes: 20 * 1024 * 1024,
}

const USER_AGENT =
  "Mozilla/5.0 (compatible; GSCdaddyBot/1.0; +https://gscdaddy.com/seo-health-checker)"

async function fetchText(url: string): Promise<string | null> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), LIMITS.timeoutMs)
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": USER_AGENT },
      redirect: "follow",
    })
    if (!res.ok) return null
    const len = Number(res.headers.get("content-length") ?? 0)
    if (len > LIMITS.maxBytes) return null
    // Gzipped sitemaps (.xml.gz): fetch() only decompresses Content-Encoding: gzip,
    // not gzip files served as application/gzip. Handle with DecompressionStream if needed.
    return await res.text()
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

function extractLocs(xml: string, block: "url" | "sitemap"): string[] {
  const re = new RegExp(
    `<${block}>[\\s\\S]*?<loc>\\s*([^<\\s]+)\\s*</loc>[\\s\\S]*?</${block}>`,
    "gi"
  )
  const out: string[] = []
  for (const m of xml.matchAll(re)) {
    out.push(
      m[1]
        .replace(/&amp;/g, "&")
        .replace(/&apos;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
    )
  }
  return out
}

/** Sitemap URLs listed in robots.txt ("Sitemap: https://…"). */
export async function sitemapsFromRobots(origin: string): Promise<string[]> {
  const txt = await fetchText(`${origin}/robots.txt`)
  if (!txt) return []
  return [...txt.matchAll(/^\s*sitemap:\s*(\S+)\s*$/gim)].map((m) => m[1])
}

/**
 * Read page URLs from a set of sitemap URLs, following sitemap indexes.
 * Returns de-duplicated page URLs and the sitemaps that failed to load.
 */
export async function readSitemapUrls(
  sitemapUrls: string[]
): Promise<{ urls: string[]; failed: string[] }> {
  const seenSitemaps = new Set<string>()
  const pages = new Set<string>()
  const failed: string[] = []

  async function visit(url: string, depth: number) {
    if (seenSitemaps.has(url) || seenSitemaps.size >= LIMITS.maxChildSitemaps) return
    if (pages.size >= LIMITS.maxUrls) return
    seenSitemaps.add(url)

    const xml = await fetchText(url)
    if (!xml) {
      failed.push(url)
      return
    }

    if (/<sitemapindex[\s>]/i.test(xml)) {
      if (depth >= LIMITS.maxDepth) return
      for (const child of extractLocs(xml, "sitemap")) {
        await visit(child, depth + 1)
      }
      return
    }

    for (const loc of extractLocs(xml, "url")) {
      if (pages.size >= LIMITS.maxUrls) break
      pages.add(loc)
    }
  }

  for (const s of sitemapUrls) {
    await visit(s, 0)
  }
  return { urls: [...pages], failed }
}
