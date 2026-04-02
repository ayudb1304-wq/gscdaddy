import { Link, Target, CheckCircle } from "lucide-react"
import { STEPS } from "@/lib/constants"
import { FadeInSection } from "./FadeInSection"

const icons = {
  link: Link,
  target: Target,
  check: CheckCircle,
} as const

export function HowItWorks() {
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <FadeInSection>
          <div className="text-center">
            <p className="mb-4 text-sm font-medium tracking-wider text-primary uppercase">
              How It Works
            </p>
            <h2 className="font-heading text-3xl font-semibold tracking-tight md:text-[40px] md:leading-[1.2]">
              From confused to confident in 3 steps
            </h2>
          </div>
        </FadeInSection>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {STEPS.map((step, i) => {
            const Icon = icons[step.icon]
            return (
              <FadeInSection key={step.number} delay={i * 0.1}>
                <div className="rounded-xl border border-border bg-card p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 font-mono text-sm font-bold text-primary">
                      {step.number}
                    </div>
                    <Icon className="size-5 text-primary" />
                  </div>

                  <h3 className="font-heading text-xl font-semibold">{step.title}</h3>

                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>

                  <p className="mt-4 font-mono text-xs text-primary">{step.detail}</p>
                </div>
              </FadeInSection>
            )
          })}
        </div>
      </div>
    </section>
  )
}
