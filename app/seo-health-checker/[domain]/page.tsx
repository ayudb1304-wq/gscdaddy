import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Logo } from "@/components/logo"
import { HealthCheckerForm } from "../health-checker-form"
import { createAdminClient } from "@/lib/supabase/admin"

interface Props {
  params: Promise<{ domain: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { domain } = await params
  const decoded = decodeURIComponent(domain)

  const MAX_TITLE = 60
  const fullTitle = `${decoded} SEO Health Score | GSCdaddy`
  const title =
    fullTitle.length <= MAX_TITLE
      ? fullTitle
      : `${decoded} SEO Score | GSCdaddy`.length <= MAX_TITLE
        ? `${decoded} SEO Score | GSCdaddy`
        : `${decoded.slice(0, MAX_TITLE - 1).trimEnd()}…`

  const fullDesc = `Free SEO audit and health score for ${decoded}. Performance, mobile, on-page SEO, schema, security, and indexability checks.`
  const description =
    fullDesc.length <= 155
      ? fullDesc
      : `Free SEO audit and 0-100 health score for ${decoded}.`

  return {
    title,
    description,
    alternates: {
      canonical: `https://gscdaddy.com/seo-health-checker/${decoded}`,
    },
    openGraph: {
      title,
      description,
      url: `https://gscdaddy.com/seo-health-checker/${decoded}`,
      siteName: "GSCdaddy",
      locale: "en_US",
      type: "website",
      images: ["/opengraph-image"],
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

async function getCachedResult(domain: string) {
  const admin = createAdminClient()
  const { data } = await admin
    .from("health_checks")
    .select("*")
    .eq("domain", domain)
    .order("created_at", { ascending: false })
    .limit(1)
    .single()

  return data
}

export default async function DomainHealthPage({ params }: Props) {
  const { domain } = await params
  const decoded = decodeURIComponent(domain)
  const cached = await getCachedResult(decoded)

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `SEO Health Score for ${decoded}`,
    url: `https://gscdaddy.com/seo-health-checker/${decoded}`,
    description: `SEO audit results for ${decoded}`,
    isPartOf: {
      "@type": "WebApplication",
      name: "GSCdaddy SEO Health Checker",
      url: "https://gscdaddy.com/seo-health-checker",
    },
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:py-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Link
        href="/seo-health-checker"
        className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        SEO Health Checker
      </Link>

      <header>
        <Link href="/" className="flex items-center gap-2">
          <Logo size={24} />
          <span className="font-heading text-sm font-bold">GSCdaddy</span>
        </Link>
        <h1 className="mt-6 font-heading text-3xl font-bold leading-tight md:text-4xl">
          SEO Health Score for{" "}
          <span className="text-primary">{decoded}</span>
        </h1>
        <p className="mt-3 max-w-xl text-muted-foreground">
          {cached
            ? `Last checked ${new Date(cached.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}. Run a new check below to get the latest score.`
            : `Enter the URL below to get a free SEO health score for ${decoded}.`}
        </p>
      </header>

      <div className="mt-10">
        <HealthCheckerForm
          initialResult={
            cached?.results?.score
              ? {
                  id: cached.id,
                  domain: cached.domain,
                  url: cached.url,
                  score: cached.score,
                  results: { score: cached.results.score },
                  cached: true,
                  created_at: cached.created_at,
                }
              : null
          }
        />
      </div>

      {/* Programmatic SEO content */}
      <section className="mt-16 space-y-4">
        <h2 className="font-heading text-lg font-semibold">
          About {decoded} SEO audit
        </h2>
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>
            This page shows the SEO health score for <strong>{decoded}</strong>.
            The score is calculated by analyzing the site across 6 categories:
            performance, mobile friendliness, on-page SEO, schema markup,
            security, and indexability.
          </p>
          <p>
            Each category is scored 0-100 and weighted based on its impact on
            search rankings. The overall score gives you a quick indicator of
            how well the site's SEO fundamentals are set up.
          </p>
          <p>
            For deeper keyword-level analysis, connect your Google Search
            Console to GSCdaddy to discover striking distance keywords — queries
            where your pages rank between positions 5-15 and are close to
            breaking onto page 1.
          </p>
        </div>
      </section>
    </div>
  )
}
