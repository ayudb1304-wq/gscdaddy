import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, ExternalLink } from "lucide-react"
import { TOOLS } from "@/lib/tools"
import { CalculatorForm } from "@/app/tools/keyword-calculator/calculator-form"
import { SerpForm } from "@/app/tools/serp-preview/serp-form"
import { GeneratorForm } from "@/app/tools/meta-tag-generator/generator-form"
import { OgForm } from "@/app/tools/open-graph-generator/og-form"
import { SlugForm } from "@/app/tools/slug-generator/slug-form"
import { RobotsForm } from "@/app/tools/robots-txt-generator/robots-form"
import { DensityForm } from "@/app/tools/keyword-density-checker/density-form"
import { ReadabilityForm } from "@/app/tools/readability-checker/readability-form"
import { HealthCheckerForm } from "@/app/seo-health-checker/health-checker-form"

// In-app wrapper around the free tool forms. Same components as /tools/*
// public pages — we just drop the marketing chrome (FAQs, JSON-LD, CTA,
// related posts) so users stay in their dashboard session. Sharing the
// form component means tool behaviour can't drift between public and
// in-app versions.

type ToolKey =
  | "keyword-calculator"
  | "serp-preview"
  | "meta-tag-generator"
  | "open-graph-generator"
  | "slug-generator"
  | "robots-txt-generator"
  | "keyword-density-checker"
  | "readability-checker"
  | "seo-health-checker"

const TOOL_COMPONENTS: Record<ToolKey, () => React.ReactElement> = {
  "keyword-calculator": () => <CalculatorForm />,
  "serp-preview": () => <SerpForm />,
  "meta-tag-generator": () => <GeneratorForm />,
  "open-graph-generator": () => <OgForm />,
  "slug-generator": () => <SlugForm />,
  "robots-txt-generator": () => <RobotsForm />,
  "keyword-density-checker": () => <DensityForm />,
  "readability-checker": () => <ReadabilityForm />,
  "seo-health-checker": () => <HealthCheckerForm inApp />,
}

const HEALTH_CHECKER_META = {
  slug: "seo-health-checker" as const,
  name: "SEO Health Checker",
  description:
    "Get a 0–100 SEO health score for any website in about 15 seconds. Checks performance, mobile, on-page, schema, security, and indexability.",
  publicHref: "/seo-health-checker",
}

function getMeta(slug: string) {
  if (slug === HEALTH_CHECKER_META.slug) return HEALTH_CHECKER_META
  const t = TOOLS.find((x) => x.slug === slug)
  if (!t) return null
  return {
    slug: t.slug,
    name: t.name,
    description: t.description,
    publicHref: `/tools/${t.slug}`,
  }
}

export async function generateStaticParams() {
  return [
    ...TOOLS.map((t) => ({ slug: t.slug })),
    { slug: HEALTH_CHECKER_META.slug },
  ]
}

export default async function InAppToolPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const meta = getMeta(slug)
  if (!meta || !(slug in TOOL_COMPONENTS)) notFound()

  const Component = TOOL_COMPONENTS[slug as ToolKey]

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <Link
          href="/today"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Back to Today
        </Link>
        <div className="mt-3 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{meta.name}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{meta.description}</p>
          </div>
          <Link
            href={meta.publicHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            Public version <ExternalLink className="size-3" />
          </Link>
        </div>
      </div>

      <Component />
    </div>
  )
}
