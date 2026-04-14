import { z } from "zod/v4"
import { crawlUrl } from "@/lib/health-check/crawler"
import { getPageSpeedResults } from "@/lib/health-check/pagespeed"
import { calculateHealthScore } from "@/lib/health-check/scoring"
import { successResponse, errors } from "@/lib/api/response"
import { rateLimit } from "@/lib/api/rate-limit"
import { createAdminClient } from "@/lib/supabase/admin"

const inputSchema = z.object({
  url: z
    .string()
    .min(1, "URL is required")
    .max(500, "URL is too long"),
})

function extractDomain(url: string): string {
  try {
    let normalized = url.trim()
    if (!/^https?:\/\//i.test(normalized)) {
      normalized = `https://${normalized}`
    }
    return new URL(normalized).hostname.replace(/^www\./, "")
  } catch {
    return url.trim().replace(/^www\./, "")
  }
}

export async function POST(request: Request) {
  try {
    // Rate limit by IP (public endpoint, no auth required)
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown"
    const limit = rateLimit(`health-check:${ip}`)
    if (!limit.allowed) return errors.rateLimited()

    const body = await request.json().catch(() => null)
    if (!body) return errors.validation("Invalid JSON body")

    const parsed = inputSchema.safeParse(body)
    if (!parsed.success) {
      return errors.validation(parsed.error.issues[0]?.message || "Invalid input")
    }

    const { url } = parsed.data
    const domain = extractDomain(url)

    // Check for a recent cached result (within 1 hour)
    const admin = createAdminClient()
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const { data: cached } = await admin
      .from("health_checks")
      .select("*")
      .eq("domain", domain)
      .gte("created_at", oneHourAgo)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (cached?.results) {
      return successResponse({
        id: cached.id,
        domain,
        url: cached.url,
        score: cached.score,
        results: cached.results,
        cached: true,
        created_at: cached.created_at,
      })
    }

    // Run crawl + PageSpeed in parallel
    const [crawlResult, psiResult] = await Promise.all([
      crawlUrl(url),
      getPageSpeedResults(
        url.trim().startsWith("http") ? url.trim() : `https://${url.trim()}`
      ).catch((err) => {
        console.error("PageSpeed API failed:", err.message)
        return null
      }),
    ])

    // Calculate score
    const healthScore = calculateHealthScore(crawlResult, psiResult)

    // Store in DB
    const { data: record, error: dbError } = await admin
      .from("health_checks")
      .insert({
        domain,
        url: crawlResult.url,
        score: healthScore.overall,
        results: {
          crawl: crawlResult,
          pagespeed: psiResult,
          score: healthScore,
        },
      })
      .select("id, created_at")
      .single()

    if (dbError) {
      console.error("Failed to store health check:", dbError.message)
    }

    return successResponse({
      id: record?.id ?? null,
      domain,
      url: crawlResult.url,
      score: healthScore.overall,
      results: {
        crawl: crawlResult,
        pagespeed: psiResult,
        score: healthScore,
      },
      cached: false,
      created_at: record?.created_at ?? new Date().toISOString(),
    })
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error"
    console.error("Health check error:", message)

    if (message.includes("aborted") || message.includes("timeout")) {
      return errors.validation(
        "Could not reach that URL — it may be down or blocking automated requests"
      )
    }

    return errors.internal("Failed to analyze the URL. Please check the URL and try again.")
  }
}
