"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { FadeInSection } from "./FadeInSection"

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-28 pb-16 md:pt-36 md:pb-24">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <FadeInSection>
            <div className="space-y-6">
              <p className="text-sm font-medium tracking-wider text-muted-foreground uppercase">
                Google Search Console Intelligence
              </p>

              <h1 className="font-heading text-4xl font-bold tracking-tight md:text-[56px] md:leading-[1.1]">
                You&apos;re ranking #8.{" "}
                <span className="text-primary" style={{ fontFamily: "var(--font-cursive)" }}>Let&apos;s fix that.</span>
              </h1>

              <p className="max-w-lg text-lg text-muted-foreground">
                GSCdaddy connects to Google Search Console, finds your{" "}
                <span className="text-xl text-primary md:text-2xl" style={{ fontFamily: "var(--font-cursive)" }}>striking distance keywords</span>,
                and gives you an AI action plan to reach page 1.
              </p>

              <div className="flex flex-col gap-4 sm:flex-row">
                <Button size="lg" className="h-12 px-6 text-sm font-semibold" asChild>
                  <a href="/login">
                    Find my striking distance keywords
                    <ArrowRight className="ml-1 size-4" />
                  </a>
                </Button>
              </div>

              <p className="text-sm text-muted-foreground">
                No credit card · 14-day free trial · Read-only access to your data
              </p>
            </div>
          </FadeInSection>

          <FadeInSection delay={0.2}>
            <div className="overflow-hidden rounded-xl border border-border shadow-[0_8px_40px_-12px_rgba(0,0,0,0.15)] dark:shadow-[0_8px_40px_-12px_rgba(0,0,0,0.5)]">
              <Image
                src="/images/dashboard-screenshot.jpg"
                alt="GSCdaddy Dashboard showing performance metrics, striking distance keywords, and AI recommendations"
                width={1400}
                height={900}
                className="w-full"
                priority
              />
            </div>
          </FadeInSection>
        </div>
      </div>
    </section>
  )
}
