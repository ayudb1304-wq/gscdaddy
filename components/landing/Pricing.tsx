"use client"

import { useState } from "react"
import { Check, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { PRICING_TIERS } from "@/lib/constants"
import { FadeInSection } from "./FadeInSection"
import { cn } from "@/lib/utils"

export function Pricing() {
  const [isAnnual, setIsAnnual] = useState(true)

  return (
    <section id="pricing" className="py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <FadeInSection>
          <div className="text-center">
            <p className="mb-4 text-sm font-medium tracking-wider text-primary uppercase">
              Pricing
            </p>
            <h2 className="font-heading text-3xl font-semibold tracking-tight md:text-[40px] md:leading-[1.2]">
              Simple pricing. No surprises.
            </h2>
            <p className="mt-3 text-muted-foreground">
              Less than your morning coffee habit. Seriously.
            </p>
          </div>

          {/* Billing toggle */}
          <div className="mt-8 flex items-center justify-center gap-3">
            <span
              className={cn(
                "text-sm transition-colors",
                !isAnnual ? "text-foreground" : "text-muted-foreground"
              )}
            >
              Monthly
            </span>
            <Switch checked={isAnnual} onCheckedChange={setIsAnnual} />
            <span
              className={cn(
                "text-sm transition-colors",
                isAnnual ? "text-foreground" : "text-muted-foreground"
              )}
            >
              Annual
            </span>
            {isAnnual && (
              <Badge variant="secondary" className="text-xs text-primary">
                Save 20%
              </Badge>
            )}
          </div>
        </FadeInSection>

        {/* Pricing cards */}
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {PRICING_TIERS.map((tier, i) => (
            <FadeInSection key={tier.name} delay={i * 0.1}>
              <div
                className={cn(
                  "relative flex h-full flex-col rounded-xl border p-6",
                  tier.highlighted
                    ? "border-primary/40 bg-card ring-2 ring-primary/20"
                    : "border-border bg-card"
                )}
              >
                {tier.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="gap-1">
                      <Star className="size-3" />
                      Most Popular
                    </Badge>
                  </div>
                )}

                <div>
                  <h3 className="font-heading text-lg font-semibold">{tier.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{tier.description}</p>
                </div>

                <div className="mt-4">
                  <div className="flex items-baseline gap-1">
                    <span className="font-mono text-4xl font-bold">
                      ${isAnnual ? tier.annualPrice : tier.monthlyPrice}
                    </span>
                    <span className="text-sm text-muted-foreground">/mo</span>
                  </div>
                  {isAnnual && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      billed annually (${tier.annualPrice * 12}/yr)
                    </p>
                  )}
                </div>

                <ul className="mt-6 flex-1 space-y-3">
                  {tier.features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <div className="mt-6">
                  <Button
                    variant={tier.highlighted ? "default" : "outline"}
                    className="w-full"
                    size="lg"
                    asChild
                  >
                    <a href="#">
                      {tier.highlighted ? "Start free trial" : "Start free"}
                    </a>
                  </Button>
                  <p className="mt-3 text-center text-xs text-muted-foreground italic">
                    {tier.dematerialization}
                  </p>
                </div>
              </div>
            </FadeInSection>
          ))}
        </div>

        <FadeInSection delay={0.3}>
          <p className="mt-8 text-center text-sm text-muted-foreground">
            🔒 14-day free trial · No credit card · 30-day money-back guarantee
          </p>
        </FadeInSection>
      </div>
    </section>
  )
}
