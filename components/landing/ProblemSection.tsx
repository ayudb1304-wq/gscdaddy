import { FadeInSection } from "./FadeInSection"

export function ProblemSection() {
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <FadeInSection>
          <div className="grid items-start gap-10 md:grid-cols-2">
            {/* Left — heading + body */}
            <div>
              <p className="mb-4 text-sm font-medium tracking-wider text-primary uppercase">
                The Problem
              </p>

              <h2 className="font-heading text-3xl font-semibold tracking-tight md:text-[40px] md:leading-[1.2]">
                You&apos;re sitting on a{" "}
                <span className="text-primary" style={{ fontFamily: "var(--font-cursive)" }}>goldmine</span>{" "}
                of almost-ranking keywords.{" "}
                You just can&apos;t find them.
              </h2>

              <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
                Google Search Console shows you data. Lots of it. But it doesn&apos;t tell
                you which keywords are worth your time, which pages need attention, or what
                to actually{" "}
                <span className="text-xl text-primary md:text-2xl" style={{ fontFamily: "var(--font-cursive)" }}>do</span>.
              </p>

              <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
                So you export CSVs. Toggle between tabs. Stare at charts that don&apos;t
                answer the question that actually matters:
              </p>
            </div>

            {/* Right — blockquote */}
            <div className="flex items-center md:min-h-full">
              <blockquote className="border-l-4 border-primary pl-6 text-xl font-medium italic md:text-2xl">
                &ldquo;What should I work on this week to get more traffic?&rdquo;
              </blockquote>
            </div>
          </div>
        </FadeInSection>
      </div>
    </section>
  )
}
