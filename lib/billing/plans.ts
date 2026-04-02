export const PLANS = {
  free: {
    sites: 1,
    aiRecsPerDay: 2,
    features: ["striking_distance", "weekly_email"],
  },
  starter: {
    sites: 1,
    aiRecsPerDay: 3,
    price: { monthly: 19, annual: 15 },
    features: ["striking_distance", "weekly_email"],
  },
  pro: {
    sites: 5,
    aiRecsPerDay: 5,
    price: { monthly: 49, annual: 39 },
    features: [
      "striking_distance",
      "ai_recs",
      "decay_alerts",
      "weekly_email",
      "priority_support",
    ],
  },
  agency: {
    sites: 15,
    aiRecsPerDay: 10,
    price: { monthly: 99, annual: 79 },
    features: [
      "striking_distance",
      "ai_recs",
      "decay_alerts",
      "pdf_exports",
      "team_access",
      "white_label",
      "weekly_email",
      "priority_support",
    ],
  },
} as const

export type PlanName = keyof typeof PLANS

export function getPlanLimits(plan: string) {
  return PLANS[plan as PlanName] ?? PLANS.free
}

export function canAddSite(plan: string, currentSiteCount: number): boolean {
  const limits = getPlanLimits(plan)
  return currentSiteCount < limits.sites
}

export function hasFeature(plan: string, feature: string): boolean {
  const limits = getPlanLimits(plan)
  return (limits.features as readonly string[]).includes(feature)
}
