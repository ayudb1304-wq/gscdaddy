"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { BarChart3, ArrowRight } from "lucide-react"
import { FadeInSection } from "./FadeInSection"

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-28 pb-16 md:pt-36 md:pb-24">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        {/* Text content — centered */}
        <FadeInSection>
          <div className="mx-auto max-w-3xl space-y-6 text-center">
            <p className="text-sm font-medium tracking-wider text-muted-foreground uppercase">
              Google Search Console Analytics Tool
            </p>

            <h1 className="font-heading text-4xl font-bold tracking-tight md:text-[56px] md:leading-[1.1]">
              Find your <em className="whitespace-nowrap not-italic" style={{ fontFamily: "var(--font-cursive)" }}>almost-ranking</em> keywords.{" "}
              <span className="text-primary">Know exactly what to do next.</span>
            </h1>

            <p className="mx-auto max-w-xl text-lg text-muted-foreground">
              GSCdaddy connects to your Search Console and shows you which pages are
              THIS close to page 1, plus AI-powered action plans to get them there.
            </p>

            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" className="h-12 px-6 text-sm font-semibold" asChild>
                <a href="/login">
                  Get started free
                  <ArrowRight className="ml-1 size-4" />
                </a>
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-6 text-sm font-semibold" asChild>
                <a href="/tools/keyword-calculator">
                  Try the free calculator
                </a>
              </Button>
            </div>

            <p className="text-sm text-muted-foreground">
              No credit card required · 14 days free · Cancel anytime
            </p>

            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <BarChart3 className="size-4 text-primary" />
              <span className="font-mono">127,847</span> keywords analyzed this week
            </div>
          </div>
        </FadeInSection>

        {/* Dashboard screenshot — full width below */}
        <FadeInSection delay={0.2}>
          <div className="mt-14 overflow-hidden rounded-xl border border-border shadow-[0_8px_40px_-12px_rgba(0,0,0,0.15)] dark:shadow-[0_8px_40px_-12px_rgba(0,0,0,0.5)]">
            <Image
              src="/images/dashboard-screenshot.png"
              alt="GSCdaddy Dashboard showing performance metrics, striking distance keywords, and AI recommendations"
              width={1400}
              height={900}
              className="w-full"
              priority
            />
          </div>
        </FadeInSection>
      </div>
    </section>
  )
}
