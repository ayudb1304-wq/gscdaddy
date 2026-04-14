import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FadeInSection } from "./FadeInSection"

export function FinalCTA() {
  return (
    <section className="relative overflow-hidden py-16 md:py-24">
      {/* Subtle amber background wash */}
      <div className="absolute inset-0 bg-primary/[0.03]" />

      <div className="relative mx-auto max-w-6xl px-4 md:px-6">
        <FadeInSection>
          <div className="grid items-center gap-10 md:grid-cols-2">
            {/* Left — text */}
            <div>
              <h2 className="font-heading text-3xl font-semibold tracking-tight md:text-[40px] md:leading-[1.2]">
                Ready to stop guessing and{" "}
                <span className="text-primary" style={{ fontFamily: "var(--font-cursive)" }}>start ranking</span>?
              </h2>

              <p className="mt-4 text-lg text-muted-foreground">
                14-day free trial. No credit card. Your first AI action plan in
                under 5 minutes.
              </p>

            </div>

            {/* Right — CTA button */}
            <div className="flex flex-col items-center">
              <Button size="lg" className="h-12 w-full px-8 text-sm font-semibold" asChild>
                <a href="/login">
                  Show me what I&apos;m missing
                  <ArrowRight className="ml-1 size-4" />
                </a>
              </Button>
              <p className="mt-3 text-center text-sm text-muted-foreground">
                No credit card required · 14 days free · Cancel anytime
              </p>
            </div>
          </div>
        </FadeInSection>
      </div>
    </section>
  )
}
