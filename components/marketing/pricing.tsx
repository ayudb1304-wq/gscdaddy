"use client"

import Link from "next/link"
import { useState } from "react"
import { Check } from "lucide-react"
import { PRICING_TIERS } from "@/lib/constants"
import { cn } from "@/lib/utils"
import { Reveal } from "./motion"

export function PricingCards() {
  const [annual, setAnnual] = useState(true)

  return (
    <div>
      <div
        role="radiogroup"
        aria-label="Billing period"
        className="mx-auto flex w-fit items-center gap-1 rounded-full bg-background/70 p-1 ring-1 ring-black/5 dark:ring-white/10"
      >
        {[
          { label: "Monthly", value: false },
          { label: "Yearly · save 20%", value: true },
        ].map((opt) => (
          <button
            key={opt.label}
            type="button"
            role="radio"
            aria-checked={annual === opt.value}
            onClick={() => setAnnual(opt.value)}
            className={cn(
              "rounded-full px-4 py-2 text-sm transition-colors",
              annual === opt.value ? "bg-ink text-ink-foreground" : "text-foreground/70 hover:text-foreground"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {PRICING_TIERS.map((tier, i) => {
          const price = annual ? tier.annualPrice : tier.monthlyPrice
          return (
            <Reveal key={tier.name} delay={i * 0.08}>
              <div
                className={cn(
                  "flex h-full flex-col rounded-3xl bg-card p-6 ring-1 ring-black/5 dark:ring-white/10",
                  tier.highlighted && "ring-2 ring-brand"
                )}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-heading text-xl font-semibold">{tier.name}</h3>
                  {tier.highlighted && (
                    <span className="rounded-full bg-pill px-2.5 py-1 text-xs font-medium text-pill-foreground">
                      Most popular
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{tier.description}</p>
                <p className="mt-6 flex items-baseline gap-1">
                  <span className="font-heading text-5xl font-semibold tracking-tight">${price}</span>
                  <span className="text-sm text-muted-foreground">/month</span>
                </p>
                <p className="mt-1 h-4 text-xs text-muted-foreground">
                  {annual ? `Billed $${tier.annualPrice * 12} a year` : "Billed monthly"}
                </p>
                <ul className="mt-6 flex-1 space-y-3">
                  {tier.features.map((f) => (
                    <li key={f.text} className="flex items-start gap-2.5 text-sm">
                      <Check className="mt-0.5 size-4 shrink-0 text-brand-strong" />
                      {f.text}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/login"
                  className={cn(
                    "mt-8 flex h-11 items-center justify-center rounded-xl text-sm font-medium transition-transform active:scale-[0.98]",
                    tier.highlighted
                      ? "bg-ink text-ink-foreground"
                      : "bg-secondary text-secondary-foreground ring-1 ring-border hover:bg-accent"
                  )}
                >
                  Start 14-day free trial
                </Link>
              </div>
            </Reveal>
          )
        })}
      </div>
      <p className="mt-6 text-center text-sm text-foreground/70">
        No credit card for the trial · Cancel in one click · 30-day money-back guarantee
      </p>
    </div>
  )
}
