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
  const [interval, setInterval] = useState<"monthly" | "annual">("annual")

  useEffect(() => {
    async function init() {
      // If returning from checkout, verify the subscription
      const params = new URLSearchParams(window.location.search)
      const subId = sessionStorage.getItem("pending_subscription_id")
      if (params.get("checkout") === "success" && subId) {
        sessionStorage.removeItem("pending_subscription_id")
        // Poll up to 5 times for activation
        for (let i = 0; i < 5; i++) {
          const res = await fetch("/api/billing/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ subscriptionId: subId }),
          })
          const data = await res.json()
          if (data.activated) break
          await new Promise((r) => setTimeout(r, 2000))
        }
        // Clean URL
        window.history.replaceState({}, "", "/settings/billing")
      }

      const res = await fetch("/api/billing/usage")
      const data = await res.json()
      setUsage(data)
      setLoading(false)
    }
    init()
  }, [])

  async function handlePlanAction(plan: string) {
    setCheckoutLoading(plan)
    try {
      if (isPaid) {
        // Already subscribed — change plan
        const res = await fetch("/api/billing/change-plan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan, interval }),
        })
        const data = await res.json()
        if (data.success) {
          // Refresh usage to reflect new plan
          const usageRes = await fetch("/api/billing/usage")
          setUsage(await usageRes.json())
        }
      } else {
        // No subscription — create new checkout
        const res = await fetch("/api/billing/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan, interval }),
        })
        const data = await res.json()
        if (data.url) {
          sessionStorage.setItem("pending_subscription_id", data.subscriptionId)
          window.location.href = data.url
        }
      }
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

  const isPaid = ["blogger", "pro", "agency"].includes(usage.plan)
  const isTrial = usage.plan === "trial"
  const isFree = usage.plan === "free"

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6 md:p-8">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Billing</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your subscription and plan
        </p>
      </div>

      {/* Current plan */}
      <div className="rounded-lg border p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Current plan</p>
            <div className="mt-1 flex items-center gap-3">
              <p className="text-xl font-semibold capitalize">
                {isTrial ? "Free Trial" : isFree ? "Free" : usage.plan}
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
              const isCurrent = usage.plan === plan
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
                    {(config.features as readonly string[]).includes("decay_alerts") && (
                      <li className="flex items-center gap-2">
                        <Check className="size-3.5 text-primary" />
                        Decay alerts
                      </li>
                    )}
                    {(config.features as readonly string[]).includes("pdf_exports") && (
                      <li className="flex items-center gap-2">
                        <Check className="size-3.5 text-primary" />
                        PDF exports
                      </li>
                    )}
                  </ul>

                  <Button
                    className="mt-5 w-full"
                    variant={isCurrent ? "outline" : isHighlighted ? "default" : "outline"}
                    disabled={isCurrent || checkoutLoading !== null}
                    onClick={() => handlePlanAction(plan)}
                  >
                    {checkoutLoading === plan && (
                      <Loader2 className="mr-2 size-4 animate-spin" />
                    )}
                    {isCurrent
                      ? "Current plan"
                      : isPaid && PLAN_ORDER.indexOf(plan) < PLAN_ORDER.indexOf(usage.plan as typeof PLAN_ORDER[number])
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
