import { FadeInSection } from "./FadeInSection"

export function ProblemSection() {
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <FadeInSection>
          <div className="mx-auto max-w-2xl text-center">
            <p className="mb-4 text-sm font-medium tracking-wider text-primary uppercase">
              The Problem
            </p>

            <h2 className="font-heading text-3xl font-semibold tracking-tight md:text-[40px] md:leading-[1.2]">
              You&apos;re sitting on a goldmine of almost-ranking keywords.{" "}
              <span className="text-muted-foreground">You just can&apos;t find them.</span>
            </h2>

            <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
              Google Search Console shows you data. Lots of it. But it doesn&apos;t tell
              you which keywords are worth your time, which pages need attention, or what
              to actually DO.
            </p>

            <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
              So you export CSVs. Toggle between tabs. Stare at charts that don&apos;t
              answer the question that actually matters:
            </p>
          </div>
        </FadeInSection>

        <FadeInSection delay={0.15}>
          <blockquote className="mx-auto mt-8 max-w-xl border-l-4 border-primary pl-6 text-xl font-medium italic md:text-2xl">
            &ldquo;What should I work on this week to get more traffic?&rdquo;
          </blockquote>
        </FadeInSection>

        <FadeInSection delay={0.25}>
          <p className="mx-auto mt-8 max-w-2xl text-center text-lg text-muted-foreground leading-relaxed">
            Meanwhile, pages ranking at position 8, 9, 12... SO CLOSE to page 1... slip
            further away. Every day you don&apos;t act, you lose traffic to competitors
            who figured this out.
          </p>
        </FadeInSection>
      </div>
    </section>
  )
}
