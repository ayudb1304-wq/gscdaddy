import { z } from "zod"
import { requireAuth } from "@/lib/auth"
import { createAdminClient } from "@/lib/supabase/admin"
import { getEffectivePlan } from "@/lib/billing/access"
import { getPlanLimits } from "@/lib/billing/plans"
import { successResponse, errors } from "@/lib/api/response"

const addSiteSchema = z.object({
  siteUrl: z.string().min(1),
  displayName: z.string().optional(),
  permissionLevel: z.string().optional(),
})

export async function GET() {
  try {
    const user = await requireAuth()
    const admin = createAdminClient()

    const { data: sites, error } = await admin
      .from("sites")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) throw error

    return successResponse(sites)
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error"
    if (message === "UNAUTHORIZED") return errors.unauthorized()
    return errors.internal("Failed to fetch sites")
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth()
    const body = await request.json()
    const parsed = addSiteSchema.safeParse(body)

    if (!parsed.success) {
      return errors.validation(parsed.error.issues[0].message)
    }

    const { siteUrl, displayName, permissionLevel } = parsed.data
    const admin = createAdminClient()

    // Check plan limit
    const plan = getEffectivePlan(user)
    const limits = getPlanLimits(plan)
    const { count } = await admin
      .from("sites")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)

    if ((count || 0) >= limits.sites) {
      return errors.planLimit(
        `Your ${plan} plan allows up to ${limits.sites} site(s). Please upgrade to add more.`
      )
    }

    // Insert site
    const { data: site, error } = await admin
      .from("sites")
      .insert({
        user_id: user.id,
        site_url: siteUrl,
        display_name: displayName || siteUrl.replace(/^(sc-domain:|https?:\/\/)/, "").replace(/\/$/, ""),
        permission_level: permissionLevel,
        sync_status: "pending",
      })
      .select()
      .single()

    if (error) {
      if (error.code === "23505") {
        return errors.validation("This site is already connected")
      }
      throw error
    }

    return successResponse(site)
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error"
    if (message === "UNAUTHORIZED") return errors.unauthorized()
    console.error("Failed to add site:", message)
    return errors.internal("Failed to add site")
  }
}
