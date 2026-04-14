import { z } from "zod/v4"
import { successResponse, errors } from "@/lib/api/response"
import { rateLimit } from "@/lib/api/rate-limit"
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
    const limit = rateLimit(`health-report:${ip}`)
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

    // Store the email on the health check record (lead capture)
    await admin
      .from("health_checks")
      .update({ email })
      .eq("id", healthCheckId)

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
