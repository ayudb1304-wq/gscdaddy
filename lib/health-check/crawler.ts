/**
 * HTML crawler for the SEO Health Score tool.
 * Fetches a URL and extracts on-page SEO signals from the raw HTML.
 */

export interface CrawlResult {
  url: string
  statusCode: number
  redirectedTo: string | null
  isHttps: boolean
  responseTimeMs: number

  // Meta tags
  title: string | null
  titleLength: number
  metaDescription: string | null
  metaDescriptionLength: number
  canonicalUrl: string | null
  viewport: string | null
  robots: string | null
  lang: string | null

  // Headings
  h1Count: number
  h1Texts: string[]
  h2Count: number
  h3Count: number

  // Images
  totalImages: number
  imagesWithoutAlt: number

  // Links
  internalLinks: number
  externalLinks: number

  // Content
  wordCount: number

  // Schema / structured data
  jsonLdSchemas: string[] // list of @type values found
  hasJsonLd: boolean

  // Indexability signals
  hasRobotsTxt: boolean
  robotsTxtContent: string | null
  hasSitemap: boolean
  sitemapUrl: string | null

  // Security headers
  securityHeaders: {
    strictTransportSecurity: boolean
    contentSecurityPolicy: boolean
    xContentTypeOptions: boolean
    xFrameOptions: boolean
  }
}

const USER_AGENT =
  "Mozilla/5.0 (compatible; GSCdaddyBot/1.0; +https://gscdaddy.com/seo-health-checker)"

const FETCH_TIMEOUT = 15_000

async function fetchWithTimeout(
  url: string,
  timeout = FETCH_TIMEOUT
): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)
  try {
    return await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": USER_AGENT },
      redirect: "follow",
    })
  } finally {
    clearTimeout(timer)
  }
}

function extractTag(html: string, regex: RegExp): string | null {
  const match = html.match(regex)
  return match ? match[1].trim() : null
}

function countMatches(html: string, regex: RegExp): number {
  const matches = html.match(regex)
  return matches ? matches.length : 0
}

function extractAllMatches(html: string, regex: RegExp): string[] {
  const results: string[] = []
  let match
  while ((match = regex.exec(html)) !== null) {
    results.push(match[1].trim())
  }
  return results
}

function normalizeUrl(input: string): string {
  let url = input.trim()
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`
  }
  // Remove trailing slash for consistency
  return url.replace(/\/+$/, "")
}

function getDomain(url: string): string {
  try {
    return new URL(url).hostname
  } catch {
    return url
  }
}

export async function crawlUrl(rawUrl: string): Promise<CrawlResult> {
  const url = normalizeUrl(rawUrl)
  const domain = getDomain(url)

  // Fetch the page
  const start = Date.now()
  const response = await fetchWithTimeout(url)
  const responseTimeMs = Date.now() - start
  const html = await response.text()
  const finalUrl = response.url

  const isHttps = finalUrl.startsWith("https://")
  const redirectedTo = finalUrl !== url ? finalUrl : null

  // --- Meta tags ---
  const title = extractTag(html, /<title[^>]*>([^<]+)<\/title>/i)
  const metaDescription = extractTag(
    html,
    /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i
  ) ?? extractTag(
    html,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i
  )
  const canonicalUrl = extractTag(
    html,
    /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i
  ) ?? extractTag(
    html,
    /<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i
  )
  const viewport = extractTag(
    html,
    /<meta[^>]+name=["']viewport["'][^>]+content=["']([^"']+)["']/i
  ) ?? extractTag(
    html,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']viewport["']/i
  )
  const robots = extractTag(
    html,
    /<meta[^>]+name=["']robots["'][^>]+content=["']([^"']+)["']/i
  ) ?? extractTag(
    html,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']robots["']/i
  )
  const lang = extractTag(html, /<html[^>]+lang=["']([^"']+)["']/i)

  // --- Headings ---
  const h1Texts = extractAllMatches(html, /<h1[^>]*>([\s\S]*?)<\/h1>/gi).map(
    (t) => t.replace(/<[^>]+>/g, "").trim()
  )
  const h2Count = countMatches(html, /<h2[\s>]/gi)
  const h3Count = countMatches(html, /<h3[\s>]/gi)

  // --- Images ---
  const imgTags = html.match(/<img[^>]*>/gi) || []
  const totalImages = imgTags.length
  const imagesWithoutAlt = imgTags.filter(
    (tag) => !tag.match(/alt=["'][^"']+["']/i)
  ).length

  // --- Links ---
  const linkHrefs = extractAllMatches(html, /<a[^>]+href=["']([^"']+)["']/gi)
  let internalLinks = 0
  let externalLinks = 0
  for (const href of linkHrefs) {
    if (
      href.startsWith("/") ||
      href.startsWith("#") ||
      href.includes(domain)
    ) {
      internalLinks++
    } else if (href.startsWith("http")) {
      externalLinks++
    }
  }

  // --- Word count (strip tags, count words) ---
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i)
  const bodyText = bodyMatch
    ? bodyMatch[1]
        .replace(/<script[\s\S]*?<\/script>/gi, "")
        .replace(/<style[\s\S]*?<\/style>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim()
    : ""
  const wordCount = bodyText ? bodyText.split(/\s+/).length : 0

  // --- JSON-LD structured data ---
  const jsonLdBlocks = extractAllMatches(
    html,
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  )
  const jsonLdSchemas: string[] = []
  for (const block of jsonLdBlocks) {
    try {
      const parsed = JSON.parse(block)
      if (parsed["@type"]) jsonLdSchemas.push(parsed["@type"])
      if (Array.isArray(parsed["@graph"])) {
        for (const item of parsed["@graph"]) {
          if (item["@type"]) jsonLdSchemas.push(item["@type"])
        }
      }
    } catch {
      // malformed JSON-LD, skip
    }
  }

  // --- Security headers ---
  const securityHeaders = {
    strictTransportSecurity: response.headers.has("strict-transport-security"),
    contentSecurityPolicy: response.headers.has("content-security-policy"),
    xContentTypeOptions: response.headers.has("x-content-type-options"),
    xFrameOptions: response.headers.has("x-frame-options"),
  }

  // --- Robots.txt ---
  let hasRobotsTxt = false
  let robotsTxtContent: string | null = null
  try {
    const origin = new URL(finalUrl).origin
    const robotsRes = await fetchWithTimeout(`${origin}/robots.txt`, 5_000)
    if (
      robotsRes.ok &&
      (robotsRes.headers.get("content-type") || "").includes("text/plain")
    ) {
      robotsTxtContent = await robotsRes.text()
      hasRobotsTxt = robotsTxtContent.length > 0
    }
  } catch {
    // robots.txt fetch failed, skip
  }

  // --- Sitemap detection ---
  let hasSitemap = false
  let sitemapUrl: string | null = null

  // Check robots.txt for sitemap directive
  if (robotsTxtContent) {
    const sitemapMatch = robotsTxtContent.match(/^Sitemap:\s*(.+)$/im)
    if (sitemapMatch) {
      sitemapUrl = sitemapMatch[1].trim()
      hasSitemap = true
    }
  }

  // Fallback: check common sitemap paths
  if (!hasSitemap) {
    const origin = new URL(finalUrl).origin
    for (const path of ["/sitemap.xml", "/sitemap_index.xml"]) {
      try {
        const res = await fetchWithTimeout(`${origin}${path}`, 5_000)
        if (res.ok) {
          const ct = res.headers.get("content-type") || ""
          if (ct.includes("xml") || ct.includes("text")) {
            hasSitemap = true
            sitemapUrl = `${origin}${path}`
            break
          }
        }
      } catch {
        // skip
      }
    }
  }

  return {
    url: finalUrl,
    statusCode: response.status,
    redirectedTo,
    isHttps,
    responseTimeMs,
    title,
    titleLength: title ? title.length : 0,
    metaDescription,
    metaDescriptionLength: metaDescription ? metaDescription.length : 0,
    canonicalUrl,
    viewport,
    robots,
    lang,
    h1Count: h1Texts.length,
    h1Texts,
    h2Count,
    h3Count,
    totalImages,
    imagesWithoutAlt,
    internalLinks,
    externalLinks,
    wordCount,
    jsonLdSchemas,
    hasJsonLd: jsonLdSchemas.length > 0,
    hasRobotsTxt,
    robotsTxtContent,
    hasSitemap,
    sitemapUrl,
    securityHeaders,
  }
}
