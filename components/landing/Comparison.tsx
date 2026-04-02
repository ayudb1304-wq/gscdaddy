import { X, Check } from "lucide-react"
import { COMPARISON } from "@/lib/constants"
import { FadeInSection } from "./FadeInSection"

export function Comparison() {
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <FadeInSection>
          <h2 className="text-center font-heading text-3xl font-semibold tracking-tight md:text-[40px] md:leading-[1.2]">
            Google Search Console vs. GSCdaddy
          </h2>
        </FadeInSection>

        <FadeInSection delay={0.1}>
          <div className="mx-auto mt-12 grid max-w-4xl gap-4 md:grid-cols-2 md:gap-0">
            {/* Without */}
            <div className="rounded-xl border border-border bg-card p-6 md:rounded-r-none">
              <h3 className="mb-6 text-center font-heading text-lg font-semibold text-muted-foreground">
                Without GSCdaddy
              </h3>
              <ul className="space-y-4">
                {COMPARISON.without.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <X className="mt-0.5 size-4 shrink-0 text-destructive/70" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* With */}
            <div className="rounded-xl border border-primary/30 bg-card p-6 ring-1 ring-primary/20 md:rounded-l-none">
              <h3 className="mb-6 text-center font-heading text-lg font-semibold text-primary">
                With GSCdaddy
              </h3>
              <ul className="space-y-4">
                {COMPARISON.with.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </FadeInSection>
      </div>
    </section>
  )
}
