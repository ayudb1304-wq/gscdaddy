import { FadeInSection } from "./FadeInSection"

export function AIActionPlan() {
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="grid items-start gap-12 md:grid-cols-2">
          <FadeInSection>
            <div>
              <p className="mb-4 text-sm font-medium tracking-wider text-primary uppercase">
                AI-Powered SEO Action Plans
              </p>
              <h2 className="font-heading text-3xl font-semibold tracking-tight md:text-[40px] md:leading-[1.2]">
                Every striking distance keyword gets a{" "}
                <span className="text-primary" style={{ fontFamily: "var(--font-cursive)" }}>game plan</span>
              </h2>
              <p className="mt-4 max-w-lg text-lg text-muted-foreground">
                Not generic SEO advice. Specific action steps for YOUR content, generated from your Google Search Console data.
              </p>
              <p
                className="mt-6 text-xl text-primary md:text-2xl"
                style={{ fontFamily: "var(--font-cursive)" }}
              >
                No other tool does this.
              </p>
            </div>
          </FadeInSection>

          <FadeInSection delay={0.15}>
            <div className="overflow-hidden rounded-xl border border-border bg-card">
              {/* Header bar */}
              <div className="border-b border-border bg-muted/50 px-6 py-4">
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-sm">
                  <span className="text-foreground font-medium">
                    &ldquo;best project management tools&rdquo;
                  </span>
                  <span className="text-muted-foreground">
                    Position: <span className="text-foreground">#12</span>
                  </span>
                  <span className="text-muted-foreground">
                    Impressions: <span className="text-foreground">1,840/mo</span>
                  </span>
                </div>
              </div>

              {/* Action steps */}
              <div className="space-y-0 divide-y divide-border">
                <div className="flex gap-4 px-6 py-4">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 font-mono text-xs font-bold text-primary">
                    1
                  </span>
                  <div>
                    <p className="text-sm font-medium">
                      Add the keyword to your H2 subheading
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Your page mentions it once in the body but never in a heading.
                      Search engines weight headings heavily.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 px-6 py-4">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 font-mono text-xs font-bold text-primary">
                    2
                  </span>
                  <div>
                    <p className="text-sm font-medium">
                      Add 3 internal links from your highest-traffic pages
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Your blog has 2 related posts with strong authority that
                      don&apos;t link to this page yet.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 px-6 py-4">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 font-mono text-xs font-bold text-primary">
                    3
                  </span>
                  <div>
                    <p className="text-sm font-medium">
                      Expand the comparison section by 200 words
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Top-ranking pages for this keyword average 2,400 words.
                      Yours is at 1,800.
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border bg-muted/50 px-6 py-4 font-mono text-sm">
                <span className="text-muted-foreground">
                  Estimated time: <span className="text-foreground font-medium">~30 min</span>
                </span>
                <span className="text-muted-foreground">
                  Goal: <span className="text-primary font-medium">Page 2 → Page 1</span>
                </span>
              </div>
            </div>
          </FadeInSection>
        </div>
      </div>
    </section>
  )
}
