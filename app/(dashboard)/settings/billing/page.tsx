"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, ExternalLink, Loader2 } from "lucide-react"
import { PLANS } from "@/lib/billing/plans"
import { cn } from "@/lib/utils"

interface Usage {
  plan: string
  daysRemaining?: number
  pastDue?: boolean
  hasSubscription?: boolean
  subscriptionPlan?: string | null
  billingInterval?: "monthly" | "annual" | null
  sitesUsed: number
  sitesLimit: number
  recsToday: number
  recsLimit: number
}

const PLAN_ORDER = ["blogger", "pro", "agency"] as const

export default function BillingPage() {
  const [usage, setUsage] = useState<Usage | null>(null)
  const [loading, setLoading] = useState(true)
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null)
  const [portalLoading, setPortalLoading] = useState(false)
  // Defaults to the subscriber's current interval once usage loads (it always
  // defaulted to annual, so a monthly customer clicking a plan got billed annually).
  const [interval, setInterval] = useState<"monthly" | "annual">("monthly")
  const [actionError, setActionError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    async function init() {
      // If returning from checkout, verify the subscription
      const params = new URLSearchParams(window.location.search)
      const subId = sessionStorage.getItem("pending_subscription_id")
      if (params.get("checkout") === "success" && subId) {
        sessionStorage.removeItem("pending_subscription_id")
        // Poll for activation (about 30s); the webhook can lag behind the redirect.
        let activated = false
        for (let i = 0; i < 15 && !activated; i++) {
          const res = await fetch("/api/billing/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ subscriptionId: subId }),
          }).catch(() => null)
          const data = res ? await res.json().catch(() => null) : null
          activated = !!data?.activated
          if (!activated) await new Promise((r) => setTimeout(r, 2000))
        }
        // Not confirmed yet: say so, and block a second checkout for a while
        // instead of silently showing "Upgrade" again (people paid twice).
        if (!activated) {
          try {
            sessionStorage.setItem("checkout_processing_until", String(Date.now() + 10 * 60_000))
          } catch {}
        }
        // Clean URL
        window.history.replaceState({}, "", "/settings/billing")
      }

      try {
        setProcessing(Number(sessionStorage.getItem("checkout_processing_until") ?? 0) > Date.now())
      } catch {}

      const res = await fetch("/api/billing/usage")
      const data = res.ok ? await res.json().catch(() => null) : null
      if (data?.plan) {
        setUsage(data)
        if (data.billingInterval === "annual" || data.billingInterval === "monthly") setInterval(data.billingInterval)
        if (data.hasSubscription) {
          setProcessing(false)
          try {
            sessionStorage.removeItem("checkout_processing_until")
          } catch {}
        }
      }
      setLoading(false)
    }
    init()
  }, [])

  async function handlePlanAction(plan: string) {
    setActionError(null)
    if (isPaid) {
      const cfg = PLANS[plan as keyof typeof PLANS] as { price?: { monthly: number; annual: number } }
      const price = cfg.price ? (interval === "annual" ? `$${cfg.price.annual}/mo billed yearly` : `$${cfg.price.monthly}/mo`) : ""
      const upgrade = PLAN_ORDER.indexOf(plan as (typeof PLAN_ORDER)[number]) > PLAN_ORDER.indexOf((usage?.subscriptionPlan ?? "blogger") as (typeof PLAN_ORDER)[number])
      const ok = window.confirm(
        upgrade
          ? `Switch to ${plan} (${price})? You'll be charged the prorated difference now.`
          : `Switch to ${plan} (${price})? The change takes effect at your next billing date.`
      )
      if (!ok) return
    }
    setCheckoutLoading(plan)
    try {
      if (isPaid) {
        // Already subscribed — change plan
        const res = await fetch("/api/billing/change-plan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan, interval }),
        })
        const data = await res.json().catch(() => null)
        if (data?.success) {
          // Refresh usage to reflect new plan
          const usageRes = await fetch("/api/billing/usage")
          if (usageRes.ok) setUsage(await usageRes.json())
        } else {
          setActionError(data?.error || "Couldn't change your plan. Please try again.")
        }
      } else {
        // No subscription — create new checkout
        const res = await fetch("/api/billing/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan, interval }),
        })
        const data = await res.json().catch(() => null)
        if (data?.url) {
          sessionStorage.setItem("pending_subscription_id", data.subscriptionId)
          window.location.href = data.url
        } else {
          setActionError(data?.error || "Couldn't start checkout. Please try again.")
        }
      }
    } catch {
      setActionError("Couldn't reach the server. Please try again.")
    } finally {
      setCheckoutLoading(null)
    }
  }

  async function handlePortal() {
    setPortalLoading(true)
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" })
      const data = await res.json()
      if (data.url) {
        window.open(data.url, "_blank")
      }
    } finally {
      setPortalLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!usage) return null

  // Subscribed (active, or payment failed and being retried): manage the
  // subscription rather than starting a new checkout.
  const isPaid = !!usage.hasSubscription || ["blogger", "pro", "agency"].includes(usage.plan)
  const isTrial = usage.plan === "trial"
  const isFree = usage.plan === "free"

  return (
    <div className="space-y-8">

      {/* Current plan */}
      <div className="rounded-lg border p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Current plan</p>
            <div className="mt-1 flex items-center gap-3">
              <p className="text-xl font-semibold capitalize">
                {usage.hasSubscription && usage.subscriptionPlan
                  ? usage.subscriptionPlan
                  : isTrial ? "Free Trial" : isFree ? "Free" : usage.plan}
                {usage.hasSubscription && usage.billingInterval && (
                  <span className="ml-2 text-sm font-normal text-muted-foreground normal-case">
                    ({usage.billingInterval})
                  </span>
                )}
              </p>
              {isTrial && usage.daysRemaining != null && (
                <Badge variant="secondary" className="text-xs">
                  {usage.daysRemaining} day{usage.daysRemaining !== 1 ? "s" : ""} left
                </Badge>
              )}
            </div>
          </div>
          {isPaid && (
            <Button variant="outline" onClick={handlePortal} disabled={portalLoading}>
              {portalLoading ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <ExternalLink className="mr-2 size-4" />
              )}
              Manage subscription
            </Button>
          )}
        </div>

        {usage.pastDue && (
          <p role="alert" className="mt-4 rounded-lg border border-warning/30 bg-warning-soft px-4 py-3 text-sm">
            Your last payment didn&apos;t go through. You still have full access for now; update your payment
            method under <strong>Manage subscription</strong> to keep it.
          </p>
        )}
        {processing && !usage.hasSubscription && (
          <p role="status" className="mt-4 rounded-lg border px-4 py-3 text-sm text-muted-foreground">
            We&apos;re waiting for the payment provider to confirm your payment. This usually takes under a
            minute; refresh this page shortly. Your plan activates automatically.
          </p>
        )}
        {actionError && (
          <p role="alert" className="mt-4 rounded-lg border border-critical/30 bg-critical-soft px-4 py-3 text-sm text-critical">
            {actionError}
          </p>
        )}

        {/* Usage bars */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <UsageBar
            label="Sites"
            used={usage.sitesUsed}
            limit={usage.sitesLimit}
          />
          <UsageBar
            label="AI recommendations today"
            used={usage.recsToday}
            limit={usage.recsLimit}
          />
        </div>
      </div>

      {/* Upgrade section (show when on free/trial, or to allow plan changes) */}
      {(isFree || isTrial || isPaid) && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-heading text-lg font-semibold">
              {isPaid ? "Change plan" : "Upgrade"}
            </h2>
            <div className="flex items-center gap-2 rounded-full border p-1 text-sm">
              <button
                onClick={() => setInterval("monthly")}
                className={cn(
                  "rounded-full px-3 py-1 transition-colors",
                  interval === "monthly"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Monthly
              </button>
              <button
                onClick={() => setInterval("annual")}
                className={cn(
                  "rounded-full px-3 py-1 transition-colors",
                  interval === "annual"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Annual
                <Badge variant="secondary" className="ml-1.5 text-[10px]">
                  Save 20%
                </Badge>
              </button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {PLAN_ORDER.map((plan) => {
              const config = PLANS[plan]
              const prices = config.price as { monthly: number; annual: number }
              const price = interval === "annual" ? prices.annual : prices.monthly
              // Current = same plan AND same billing interval, so a monthly
              // subscriber can still switch the same plan to annual.
              const currentPlan = usage.hasSubscription ? usage.subscriptionPlan : usage.plan
              const isCurrent =
                currentPlan === plan && (!usage.hasSubscription || !usage.billingInterval || usage.billingInterval === interval)
              const isHighlighted = plan === "pro"

              return (
                <div
                  key={plan}
                  className={cn(
                    "relative rounded-lg border p-5",
                    isHighlighted && "border-primary/40 ring-2 ring-primary/20",
                    isCurrent && "bg-muted/50"
                  )}
                >
                  {isHighlighted && (
                    <Badge className="absolute -top-2.5 left-4 text-xs">
                      Most Popular
                    </Badge>
                  )}
                  <h3 className="font-heading font-semibold capitalize">{plan}</h3>
                  <div className="mt-2 flex items-baseline gap-1.5">
                    {interval === "annual" && (
                      <span className="font-mono text-base text-muted-foreground line-through">
                        ${prices.monthly}
                      </span>
                    )}
                    <span className="font-mono text-3xl font-bold">${price}</span>
                    <span className="text-sm text-muted-foreground">/mo</span>
                  </div>
                  {interval === "annual" && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      ${prices.annual * 12}/yr — save ${(prices.monthly - prices.annual) * 12}/yr
                    </p>
                  )}

                  <ul className="mt-4 space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <Check className="size-3.5 text-primary" />
                      {config.sites} site{config.sites > 1 ? "s" : ""}
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="size-3.5 text-primary" />
                      {config.aiRecsPerDay >= 999 ? "Unlimited" : config.aiRecsPerDay} AI recs/day
                    </li>
                    {(config.features as readonly string[]).includes("csv_exports") && (
                      <li className="flex items-center gap-2">
                        <Check className="size-3.5 text-primary" />
                        CSV exports
                      </li>
                    )}
                  </ul>

                  <Button
                    className="mt-5 w-full"
                    variant={isCurrent ? "outline" : isHighlighted ? "default" : "outline"}
                    disabled={isCurrent || checkoutLoading !== null || (processing && !isPaid)}
                    onClick={() => handlePlanAction(plan)}
                  >
                    {checkoutLoading === plan && (
                      <Loader2 className="mr-2 size-4 animate-spin" />
                    )}
                    {isCurrent
                      ? "Current plan"
                      : isPaid && currentPlan === plan
                        ? `Switch to ${interval}`
                        : isPaid && PLAN_ORDER.indexOf(plan) < PLAN_ORDER.indexOf(currentPlan as typeof PLAN_ORDER[number])
                          ? "Downgrade"
                          : "Upgrade"}
                  </Button>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function UsageBar({ label, used, limit }: { label: string; used: number; limit: number }) {
  const isUnlimited = limit >= 999
  const pct = isUnlimited ? 0 : Math.min((used / limit) * 100, 100)
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">
          {isUnlimited ? `${used} / Unlimited` : `${used} / ${limit}`}
        </span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            isUnlimited ? "bg-primary" : pct >= 90 ? "bg-destructive" : "bg-primary"
          )}
          style={{ width: isUnlimited ? "5%" : `${pct}%` }}
        />
      </div>
    </div>
  )
}
