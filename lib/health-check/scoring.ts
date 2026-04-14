/**
 * Scoring engine for the SEO Health Score tool.
 * Aggregates crawl + PageSpeed results into a 0-100 score
 * across 6 categories, each with pass/warning/fail items.
 */

import type { CrawlResult } from "./crawler"
import type { PageSpeedResult } from "./pagespeed"

export type CheckStatus = "pass" | "warning" | "fail"

export interface CheckItem {
  label: string
  status: CheckStatus
  detail: string
}

export interface CategoryScore {
  name: string
  slug: string
  score: number // 0-100
  weight: number
  items: CheckItem[]
}

export interface HealthScore {
  overall: number // 0-100
  categories: CategoryScore[]
}

function item(
  label: string,
  status: CheckStatus,
  detail: string
): CheckItem {
  return { label, status, detail }
}

function categoryScore(items: CheckItem[]): number {
  if (items.length === 0) return 100
  let total = 0
  for (const i of items) {
    if (i.status === "pass") total += 100
    else if (i.status === "warning") total += 50
    // fail = 0
  }
  return Math.round(total / items.length)
}

/* ------------------------------------------------------------------ */
/*  Category scorers                                                   */
/* ------------------------------------------------------------------ */

function scorePerformance(psi: PageSpeedResult | null): CategoryScore {
  const items: CheckItem[] = []

  if (!psi) {
    items.push(item("Performance score", "warning", "Could not run PageSpeed analysis"))
    return { name: "Performance", slug: "performance", score: 50, weight: 20, items }
  }

  // Overall Lighthouse score
  if (psi.performanceScore >= 90) {
    items.push(item("Performance score", "pass", `Lighthouse score: ${psi.performanceScore}/100`))
  } else if (psi.performanceScore >= 50) {
    items.push(item("Performance score", "warning", `Lighthouse score: ${psi.performanceScore}/100 — aim for 90+`))
  } else {
    items.push(item("Performance score", "fail", `Lighthouse score: ${psi.performanceScore}/100 — needs significant improvement`))
  }

  // LCP
  const lcp = psi.metrics.largestContentfulPaint
  if (lcp <= 2500) {
    items.push(item("Largest Contentful Paint", "pass", `${(lcp / 1000).toFixed(1)}s — good`))
  } else if (lcp <= 4000) {
    items.push(item("Largest Contentful Paint", "warning", `${(lcp / 1000).toFixed(1)}s — aim for under 2.5s`))
  } else {
    items.push(item("Largest Contentful Paint", "fail", `${(lcp / 1000).toFixed(1)}s — too slow, target under 2.5s`))
  }

  // TBT (proxy for INP)
  const tbt = psi.metrics.totalBlockingTime
  if (tbt <= 200) {
    items.push(item("Total Blocking Time", "pass", `${Math.round(tbt)}ms — good`))
  } else if (tbt <= 600) {
    items.push(item("Total Blocking Time", "warning", `${Math.round(tbt)}ms — aim for under 200ms`))
  } else {
    items.push(item("Total Blocking Time", "fail", `${Math.round(tbt)}ms — too high, target under 200ms`))
  }

  // CLS
  const cls = psi.metrics.cumulativeLayoutShift
  if (cls <= 0.1) {
    items.push(item("Cumulative Layout Shift", "pass", `${cls.toFixed(3)} — good`))
  } else if (cls <= 0.25) {
    items.push(item("Cumulative Layout Shift", "warning", `${cls.toFixed(3)} — aim for under 0.1`))
  } else {
    items.push(item("Cumulative Layout Shift", "fail", `${cls.toFixed(3)} — too high, target under 0.1`))
  }

  return { name: "Performance", slug: "performance", score: categoryScore(items), weight: 20, items }
}

function scoreMobile(
  crawl: CrawlResult,
  psi: PageSpeedResult | null
): CategoryScore {
  const items: CheckItem[] = []

  // Viewport meta tag
  if (crawl.viewport) {
    items.push(item("Viewport meta tag", "pass", "Viewport is configured"))
  } else {
    items.push(item("Viewport meta tag", "fail", "Missing viewport meta tag — mobile users will see a desktop layout"))
  }

  if (psi) {
    // Font size
    if (psi.mobile.fontSizeOk) {
      items.push(item("Font size", "pass", "Text is legible on mobile"))
    } else {
      items.push(item("Font size", "warning", "Some text may be too small on mobile"))
    }

    // Tap targets
    if (psi.mobile.tapTargetsOk) {
      items.push(item("Tap targets", "pass", "Buttons and links are appropriately sized"))
    } else {
      items.push(item("Tap targets", "warning", "Some tap targets are too close together"))
    }

    // Overall mobile-friendliness
    if (psi.mobile.isMobileFriendly) {
      items.push(item("Mobile friendliness", "pass", "Page is mobile-friendly"))
    } else {
      items.push(item("Mobile friendliness", "fail", "Page has mobile usability issues"))
    }
  }

  return { name: "Mobile", slug: "mobile", score: categoryScore(items), weight: 15, items }
}

function scoreOnPageSeo(crawl: CrawlResult): CategoryScore {
  const items: CheckItem[] = []

  // Title tag
  if (!crawl.title) {
    items.push(item("Title tag", "fail", "Missing title tag"))
  } else if (crawl.titleLength < 30) {
    items.push(item("Title tag", "warning", `Title is too short (${crawl.titleLength} chars) — aim for 50-60`))
  } else if (crawl.titleLength > 60) {
    items.push(item("Title tag", "warning", `Title is too long (${crawl.titleLength} chars) — may be truncated in SERPs`))
  } else {
    items.push(item("Title tag", "pass", `Title tag is ${crawl.titleLength} chars — good length`))
  }

  // Meta description
  if (!crawl.metaDescription) {
    items.push(item("Meta description", "fail", "Missing meta description"))
  } else if (crawl.metaDescriptionLength < 70) {
    items.push(item("Meta description", "warning", `Description is short (${crawl.metaDescriptionLength} chars) — aim for 120-155`))
  } else if (crawl.metaDescriptionLength > 160) {
    items.push(item("Meta description", "warning", `Description is long (${crawl.metaDescriptionLength} chars) — may be truncated`))
  } else {
    items.push(item("Meta description", "pass", `Meta description is ${crawl.metaDescriptionLength} chars — good length`))
  }

  // H1
  if (crawl.h1Count === 0) {
    items.push(item("H1 heading", "fail", "No H1 heading found"))
  } else if (crawl.h1Count > 1) {
    items.push(item("H1 heading", "warning", `${crawl.h1Count} H1 tags found — best practice is exactly 1`))
  } else {
    items.push(item("H1 heading", "pass", "Single H1 heading found"))
  }

  // Heading hierarchy
  if (crawl.h2Count > 0) {
    items.push(item("Heading structure", "pass", `${crawl.h2Count} H2 and ${crawl.h3Count} H3 headings found`))
  } else {
    items.push(item("Heading structure", "warning", "No H2 headings found — add subheadings to structure your content"))
  }

  // Image alt text
  if (crawl.totalImages === 0) {
    items.push(item("Image alt text", "warning", "No images found on the page"))
  } else if (crawl.imagesWithoutAlt === 0) {
    items.push(item("Image alt text", "pass", `All ${crawl.totalImages} images have alt text`))
  } else {
    const pct = Math.round((crawl.imagesWithoutAlt / crawl.totalImages) * 100)
    if (pct > 50) {
      items.push(item("Image alt text", "fail", `${crawl.imagesWithoutAlt}/${crawl.totalImages} images missing alt text (${pct}%)`))
    } else {
      items.push(item("Image alt text", "warning", `${crawl.imagesWithoutAlt}/${crawl.totalImages} images missing alt text`))
    }
  }

  // Word count
  if (crawl.wordCount >= 300) {
    items.push(item("Content length", "pass", `${crawl.wordCount.toLocaleString()} words`))
  } else if (crawl.wordCount >= 100) {
    items.push(item("Content length", "warning", `Only ${crawl.wordCount} words — thin content may rank poorly`))
  } else {
    items.push(item("Content length", "fail", `Only ${crawl.wordCount} words — page appears to have very little content`))
  }

  // Canonical
  if (crawl.canonicalUrl) {
    items.push(item("Canonical URL", "pass", "Canonical tag is set"))
  } else {
    items.push(item("Canonical URL", "warning", "No canonical tag — could cause duplicate content issues"))
  }

  // Language attribute
  if (crawl.lang) {
    items.push(item("Language attribute", "pass", `Language set to "${crawl.lang}"`))
  } else {
    items.push(item("Language attribute", "warning", "No lang attribute on <html> tag"))
  }

  return { name: "On-Page SEO", slug: "on-page-seo", score: categoryScore(items), weight: 25, items }
}

function scoreSchema(crawl: CrawlResult): CategoryScore {
  const items: CheckItem[] = []

  if (crawl.hasJsonLd) {
    items.push(item("JSON-LD detected", "pass", `Found: ${crawl.jsonLdSchemas.join(", ")}`))
  } else {
    items.push(item("JSON-LD structured data", "fail", "No JSON-LD schema markup found"))
  }

  // Check for common useful schemas
  const schemas = crawl.jsonLdSchemas.map((s) => s.toLowerCase())
  const hasOrg =
    schemas.includes("organization") || schemas.includes("localbusiness")
  const hasBreadcrumb = schemas.includes("breadcrumblist")
  const hasArticle =
    schemas.includes("article") ||
    schemas.includes("blogposting") ||
    schemas.includes("webpage")

  if (hasOrg) {
    items.push(item("Organization schema", "pass", "Organization or LocalBusiness markup found"))
  } else {
    items.push(item("Organization schema", "warning", "Consider adding Organization schema for brand signals"))
  }

  if (hasBreadcrumb) {
    items.push(item("Breadcrumb schema", "pass", "BreadcrumbList markup found"))
  } else {
    items.push(item("Breadcrumb schema", "warning", "Consider adding BreadcrumbList for rich snippets"))
  }

  if (hasArticle) {
    items.push(item("Page type schema", "pass", "Article/WebPage markup found"))
  } else {
    items.push(item("Page type schema", "warning", "Consider adding Article or WebPage schema"))
  }

  return { name: "Schema Markup", slug: "schema", score: categoryScore(items), weight: 10, items }
}

function scoreSecurity(crawl: CrawlResult): CategoryScore {
  const items: CheckItem[] = []

  // HTTPS
  if (crawl.isHttps) {
    items.push(item("HTTPS", "pass", "Site is served over HTTPS"))
  } else {
    items.push(item("HTTPS", "fail", "Site is not using HTTPS — this is a Google ranking factor"))
  }

  // HSTS
  if (crawl.securityHeaders.strictTransportSecurity) {
    items.push(item("HSTS header", "pass", "Strict-Transport-Security header is set"))
  } else {
    items.push(item("HSTS header", "warning", "No HSTS header — browsers may still connect over HTTP"))
  }

  // X-Content-Type-Options
  if (crawl.securityHeaders.xContentTypeOptions) {
    items.push(item("X-Content-Type-Options", "pass", "Header is set"))
  } else {
    items.push(item("X-Content-Type-Options", "warning", "Missing X-Content-Type-Options: nosniff header"))
  }

  // X-Frame-Options
  if (crawl.securityHeaders.xFrameOptions) {
    items.push(item("X-Frame-Options", "pass", "Clickjacking protection is set"))
  } else {
    items.push(item("X-Frame-Options", "warning", "No X-Frame-Options header"))
  }

  return { name: "Security", slug: "security", score: categoryScore(items), weight: 10, items }
}

function scoreIndexability(crawl: CrawlResult): CategoryScore {
  const items: CheckItem[] = []

  // Robots.txt
  if (crawl.hasRobotsTxt) {
    items.push(item("Robots.txt", "pass", "robots.txt file found"))
  } else {
    items.push(item("Robots.txt", "warning", "No robots.txt file found"))
  }

  // Sitemap
  if (crawl.hasSitemap) {
    items.push(item("XML Sitemap", "pass", `Sitemap found at ${crawl.sitemapUrl}`))
  } else {
    items.push(item("XML Sitemap", "fail", "No XML sitemap detected — submit one to help search engines discover your pages"))
  }

  // Meta robots noindex check
  if (crawl.robots && crawl.robots.toLowerCase().includes("noindex")) {
    items.push(item("Noindex tag", "fail", "Page has a noindex directive — it will not appear in search results"))
  } else {
    items.push(item("Index status", "pass", "Page is indexable (no noindex directive)"))
  }

  // Canonical issues
  if (crawl.canonicalUrl) {
    const canonical = crawl.canonicalUrl.replace(/\/$/, "")
    const page = crawl.url.replace(/\/$/, "")
    if (canonical !== page && !canonical.endsWith(new URL(page).pathname)) {
      items.push(item("Canonical mismatch", "warning", `Canonical points to a different URL: ${crawl.canonicalUrl}`))
    } else {
      items.push(item("Canonical URL", "pass", "Canonical URL matches the page"))
    }
  }

  // HTTP status
  if (crawl.statusCode === 200) {
    items.push(item("HTTP status", "pass", "Page returns 200 OK"))
  } else {
    items.push(item("HTTP status", "warning", `Page returns HTTP ${crawl.statusCode}`))
  }

  return { name: "Indexability", slug: "indexability", score: categoryScore(items), weight: 20, items }
}

/* ------------------------------------------------------------------ */
/*  Main scorer                                                        */
/* ------------------------------------------------------------------ */

export function calculateHealthScore(
  crawl: CrawlResult,
  psi: PageSpeedResult | null
): HealthScore {
  const categories = [
    scorePerformance(psi),
    scoreMobile(crawl, psi),
    scoreOnPageSeo(crawl),
    scoreSchema(crawl),
    scoreSecurity(crawl),
    scoreIndexability(crawl),
  ]

  // Weighted average
  const totalWeight = categories.reduce((sum, c) => sum + c.weight, 0)
  const overall = Math.round(
    categories.reduce((sum, c) => sum + c.score * c.weight, 0) / totalWeight
  )

  return { overall, categories }
}
