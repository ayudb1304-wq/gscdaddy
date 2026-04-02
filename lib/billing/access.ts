import type { AppUser } from "@/lib/auth"

export interface AccessLevel {
  hasAccess: boolean
  plan: string
  daysRemaining?: number
  reason?: "trial_expired" | "no_subscription"
}

export function checkAccess(user: AppUser): AccessLevel {
  // Check active paid subscription
  const sub = user.subscriptions?.[0]
  if (sub?.status === "active") {
    return { hasAccess: true, plan: sub.plan }
  }

  // Check trial
  if (user.trial_ends_at) {
    const trialEnd = new Date(user.trial_ends_at)
    if (trialEnd > new Date()) {
      const daysRemaining = Math.ceil(
        (trialEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      )
      return { hasAccess: true, plan: "trial", daysRemaining }
    }
  }

  return { hasAccess: false, plan: "free", reason: "trial_expired" }
}

export function getEffectivePlan(user: AppUser): string {
  const access = checkAccess(user)
  if (!access.hasAccess) return "free"
  if (access.plan === "trial") return "pro" // trial gets pro features
  return access.plan
}
