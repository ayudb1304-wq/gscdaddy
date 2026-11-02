import { z } from "zod/v4"
import { successResponse, errors } from "@/lib/api/response"
import { sharedRateLimit } from "@/lib/api/rate-limit"
import { createAdminClient } from "@/lib/supabase/admin"
import { sendEmail } from "@/lib/email/resend"
import { HealthReportEmail } from "@/lib/health-check/report-email"

const inputSchema = z.object({
  email: z.email("Please enter a valid email address"),
  healthCheckId: z.uuid("Invalid health check ID"),
})

export async function POST(request: Request) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown"
    // Shared across instances: each request sends an email.
    const limit = await sharedRateLimit(`health-report:${ip}`, { windowSeconds: 3600, max: 10 })
    if (!limit.allowed) return errors.rateLimited()

    const body = await request.json().catch(() => null)
    if (!body) return errors.validation("Invalid JSON body")

    const parsed = inputSchema.safeParse(body)
    if (!parsed.success) {
      return errors.validation(parsed.error.issues[0]?.message || "Invalid input")
    }

    const { email, healthCheckId } = parsed.data
    const admin = createAdminClient()

    // Fetch the health check
    const { data: check, error: fetchError } = await admin
      .from("health_checks")
      .select("*")
      .eq("id", healthCheckId)
      .single()

    if (fetchError || !check) {
      return errors.notFound("Health check")
    }

    // One report email per health check, claimed atomically. Without this the
    // endpoint could mail any list of addresses about any (attacker-chosen)
    // domain from our sending domain.
    const { data: claimed } = await admin
      .from("health_checks")
      .update({ email })
      .eq("id", healthCheckId)
      .is("email", null)
      .select("id")

    if (!claimed || claimed.length === 0) {
      return errors.validation("A report for this check has already been sent. Run a new check to get another.")
    }

    // Send the report email
    const score = check.results?.score?.overall ?? check.score ?? 0
    const reportUrl = `https://gscdaddy.com/seo-health-checker/${check.domain}`

    await sendEmail({
      to: email,
      subject: `Your SEO Health Score: ${score}/100 for ${check.domain}`,
      react: HealthReportEmail({
        domain: check.domain,
        score,
        reportUrl,
        categories: check.results?.score?.categories ?? [],
      }),
    })

    return successResponse({ sent: true })
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error"
    console.error("Report email error:", message)
    return errors.internal("Failed to send report. Please try again.")
  }
}
