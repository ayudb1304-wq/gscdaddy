import { z } from "zod"
import { requireAuth } from "@/lib/auth"
import { createAdminClient } from "@/lib/supabase/admin"
import { successResponse, errors } from "@/lib/api/response"

const personaSchema = z.object({
  persona: z.enum(["blogger", "consultant", "agency"]),
})

export async function PATCH(request: Request) {
  try {
    const user = await requireAuth()
    const body = await request.json()
    const parsed = personaSchema.safeParse(body)

    if (!parsed.success) {
      return errors.validation("Invalid persona. Must be blogger, consultant, or agency.")
    }

    const admin = createAdminClient()
    await admin
      .from("users")
      .update({ persona: parsed.data.persona, updated_at: new Date().toISOString() })
      .eq("id", user.id)

    return successResponse({ persona: parsed.data.persona })
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error"
    if (message === "UNAUTHORIZED") return errors.unauthorized()
    return errors.internal("Failed to update persona")
  }
}
