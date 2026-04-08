import Image from "next/image"
import { Check } from "lucide-react"
import { FEATURES } from "@/lib/constants"
import { FadeInSection } from "./FadeInSection"

const FEATURE_SCREENSHOTS: Record<string, { src: string; alt: string }> = {
  "Striking Distance Finder": {
    src: "/images/striking-distance-screenshot.png",
    alt: "Striking distance keywords report showing positions, impressions, and opportunity scores",
  },
  "AI Action Plans": {
    src: "/images/recommendations-screenshot.png",
    alt: "AI-powered SEO recommendations with action items and priority levels",
  },
}

function FeatureScreenshot({ eyebrow }: { eyebrow: string }) {
  const screenshot = FEATURE_SCREENSHOTS[eyebrow]

  if (screenshot) {
    return (
      <div className="overflow-hidden rounded-xl border border-border shadow-lg">
        <Image
          src={screenshot.src}
          alt={screenshot.alt}
          width={1400}
          height={900}
          className="w-full"
        />
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
        <div className="flex gap-1.5">
          <div className="size-2.5 rounded-full bg-muted-foreground/20" />
          <div className="size-2.5 rounded-full bg-muted-foreground/20" />
          <div className="size-2.5 rounded-full bg-muted-foreground/20" />
        </div>
      </div>
      <div className="flex aspect-[16/10] items-center justify-center bg-muted/30 p-8">
        <p className="text-center text-sm text-muted-foreground">
          {eyebrow} - coming soon
        </p>
      </div>
    </div>
  )
}

export function Features() {
  return (
    <section id="features" className="py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <FadeInSection>
          <div className="text-center">
            <p className="mb-4 text-sm font-medium tracking-wider text-primary uppercase">
              Features
            </p>
            <h2 className="font-heading text-3xl font-semibold tracking-tight md:text-[40px] md:leading-[1.2]">
              Everything you need. Nothing you don&apos;t.
            </h2>
          </div>
        </FadeInSection>

        <div className="mt-20 space-y-24">
          {FEATURES.map((feature, i) => (
            <FadeInSection key={i}>
              <div
                className={`grid items-center gap-12 md:grid-cols-2 md:gap-16 ${
                  feature.imagePosition === "left" ? "md:[direction:rtl]" : ""
                }`}
              >
                {/* Text */}
                <div className={feature.imagePosition === "left" ? "md:[direction:ltr]" : ""}>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-primary">{feature.eyebrow}</p>
                  </div>

                  <h3 className="mt-3 font-heading text-2xl font-semibold leading-tight">
                    {feature.title}
                  </h3>

                  <p className="mt-4 text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>

                  <ul className="mt-6 space-y-3">
                    {feature.bullets.map((bullet, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm">
                        <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Screenshot */}
                <div className={feature.imagePosition === "left" ? "md:[direction:ltr]" : ""}>
                  <FeatureScreenshot eyebrow={feature.eyebrow} />
                </div>
              </div>
            </FadeInSection>
          ))}
        </div>
      </div>
    </section>
  )
}
