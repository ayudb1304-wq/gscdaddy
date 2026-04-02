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
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-semibold tracking-tight md:text-[40px] md:leading-[1.2]">
              Ready to stop guessing and start ranking?
            </h2>

            <p className="mt-4 text-lg text-muted-foreground">
              Join 200+ bloggers and SEO pros who finally know what to do with their
              Search Console data.
            </p>

            <div className="mt-8">
              <Button size="lg" className="h-12 px-8 text-sm font-semibold" asChild>
                <a href="#pricing">
                  Start my free trial
                  <ArrowRight className="ml-1 size-4" />
                </a>
              </Button>
            </div>

            <p className="mt-4 text-sm text-muted-foreground">
              Free 14-day trial · No credit card · Cancel anytime
            </p>
          </div>
        </FadeInSection>
      </div>
    </section>
  )
}
