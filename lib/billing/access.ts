import { getPlanLimits } from "@/lib/billing/plans"

/** The fields access decisions need; works for the app's user and the cron scripts' rows. */
export interface AccessUser {
  trial_ends_at?: string | null
  created_at?: string | null
  subscriptions?: { status: string; plan: string; updated_at?: string | null }[] | null
}

export interface AccessLevel {
  hasAccess: boolean
  plan: string
  daysRemaining?: number
  /** Payment failed; access continues during the grace period while it's fixed. */
  pastDue?: boolean
  reason?: "trial_expired" | "no_subscription"
}

/** How long a failed payment keeps paid access while Dodo retries / the user fixes it. */
const PAST_DUE_GRACE_MS = 7 * 24 * 60 * 60 * 1000

export function checkAccess(user: AccessUser): AccessLevel {
  const subs = user.subscriptions ?? []
  // A user can have several subscription rows (cancel then resubscribe), and
  // the embed has no ordering, so look for any active one, not just the first.
  const active = subs.find((s) => s.status === "active")
  if (active) return { hasAccess: true, plan: active.plan }

  // A failed payment used to lock the user out immediately, with no way to fix
  // it from the billing page. Keep access for a grace period.
  const pastDue = subs.find(
    (s) => s.status === "past_due" && s.updated_at && Date.now() - new Date(s.updated_at).getTime() < PAST_DUE_GRACE_MS
  )
  if (pastDue) return { hasAccess: true, plan: pastDue.plan, pastDue: true }

  if (user.trial_ends_at) {
    const trialEnd = new Date(user.trial_ends_at)
    if (trialEnd > new Date()) {
      const daysRemaining = Math.ceil((trialEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      return { hasAccess: true, plan: "trial", daysRemaining }
    }
  }

  return { hasAccess: false, plan: "free", reason: "trial_expired" }
}

/** The plan whose limits apply: trials get Pro (as the pricing page promises), no access gets Free. */
export function getEffectivePlan(user: AccessUser): string {
  const access = checkAccess(user)
  if (!access.hasAccess) return "free"
  if (access.plan === "trial") return "pro"
  return access.plan
}

/**
 * One source of truth for limits. The usage meter and the AI route treated a
 * trial as Free while adding sites treated it as Pro, so the Sites page showed
 * "1 / 1" and disabled Add while the API accepted five.
 */
export function getUserLimits(user: AccessUser) {
  return getPlanLimits(getEffectivePlan(user))
}

const WELCOME_WINDOW_MS = 7 * 24 * 60 * 60 * 1000

/**
 * The dashboard welcome popup is for new accounts still on the trial: not paid
 * users, and not long-time users who happen to open a new browser.
 */
export function shouldShowWelcome(user: AccessUser): boolean {
  if (checkAccess(user).plan !== "trial" || !user.created_at) return false
  return Date.now() - new Date(user.created_at).getTime() < WELCOME_WINDOW_MS
}

/**
 * Sites a user's plan covers: the oldest N by creation. After a downgrade the
 * extra sites stay visible but stop syncing and getting AI recommendations.
 */
export function sitesWithinPlan<T extends { created_at?: string | null }>(user: AccessUser, sites: T[]): T[] {
  const limit = getUserLimits(user).sites
  return [...sites]
    .sort((a, b) => new Date(a.created_at ?? 0).getTime() - new Date(b.created_at ?? 0).getTime())
    .slice(0, limit)
}
