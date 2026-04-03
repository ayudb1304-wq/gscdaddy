import DodoPayments from "dodopayments"

let client: DodoPayments | null = null

export function getDodoClient() {
  if (!client) {
    client = new DodoPayments({
      bearerToken: process.env.DODO_API_KEY!,
      webhookKey: process.env.DODO_WEBHOOK_SECRET!,
      environment: process.env.NODE_ENV === "production" ? "live_mode" : "test_mode",
    })
  }
  return client
}

// Product IDs from env vars
export const PRODUCT_IDS: Record<string, string> = {
  blogger_monthly: process.env.DODO_BLOGGER_MONTHLY_ID!,
  blogger_annual: process.env.DODO_BLOGGER_ANNUAL_ID!,
  pro_monthly: process.env.DODO_PRO_MONTHLY_ID!,
  pro_annual: process.env.DODO_PRO_ANNUAL_ID!,
  agency_monthly: process.env.DODO_AGENCY_MONTHLY_ID!,
  agency_annual: process.env.DODO_AGENCY_ANNUAL_ID!,
}

export function getProductId(plan: string, interval: "monthly" | "annual"): string {
  const key = `${plan}_${interval}`
  const productId = PRODUCT_IDS[key]
  if (!productId) throw new Error(`Unknown plan/interval: ${key}`)
  return productId
}

// Reverse lookup: Dodo product ID → { plan, interval }
const PRODUCT_ID_TO_PLAN = Object.entries(PRODUCT_IDS).reduce(
  (acc, [key, productId]) => {
    const [plan, interval] = key.split("_") as [string, string]
    acc[productId] = { plan, interval }
    return acc
  },
  {} as Record<string, { plan: string; interval: string }>
)

export function planFromProductId(productId: string) {
  return PRODUCT_ID_TO_PLAN[productId] ?? null
}
