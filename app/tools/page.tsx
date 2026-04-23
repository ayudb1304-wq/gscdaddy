import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, HeartPulse } from "lucide-react"
import { Logo } from "@/components/logo"
import { TOOLS } from "@/lib/tools"
import { TOOL_ICONS } from "@/lib/tool-icons"

export const metadata: Metadata = {
  title: "Free SEO Tools - Online SEO Toolkit | GSCdaddy",
  description:
    "Free online SEO tools to optimize your website. SERP preview, meta tag generator, keyword density checker, readability scorer, robots.txt generator, and more.",
  alternates: { canonical: "https://gscdaddy.com/tools" },
  openGraph: {
    title: "Free SEO Tools - Online SEO Toolkit | GSCdaddy",
    description:
      "Free online SEO tools to optimize your website. SERP preview, meta tag generator, keyword density checker, and more.",
    url: "https://gscdaddy.com/tools",
    siteName: "GSCdaddy",
    type: "website",
  },
}

function ToolsJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Free SEO Tools",
    url: "https://gscdaddy.com/tools",
    description: "Free online SEO tools to optimize your website.",
    publisher: {
      "@type": "Organization",
      name: "GSCdaddy",
      url: "https://gscdaddy.com",
    },
  }

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://gscdaddy.com" },
      { "@type": "ListItem", position: 2, name: "Tools", item: "https://gscdaddy.com/tools" },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
    </>
  )
}

export default function ToolsIndexPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 md:py-24">
      <ToolsJsonLd />

      <header className="text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowRight className="size-3.5 rotate-180" />
          Back to home
        </Link>
        <div className="mt-4">
          <Link href="/" className="inline-flex items-center gap-2">
            <Logo size={28} />
            <span className="font-heading text-sm font-bold">GSCdaddy</span>
          </Link>
        </div>
        <h1 className="mt-6 font-heading text-3xl font-bold leading-tight md:text-4xl">
          Free SEO Tools
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          Optimize your pages with these free tools. No signup required — just
          paste, click, and copy.
        </p>
      </header>

      {/* Featured: SEO Health Checker */}
      <Link
        href="/seo-health-checker"
        className="group mt-12 flex flex-col gap-4 rounded-xl border-2 border-primary/30 bg-primary/5 p-6 transition-colors hover:border-primary/50 hover:bg-primary/10 sm:flex-row sm:items-center"
      >
        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/20 text-primary transition-colors group-hover:bg-primary/30">
          <HeartPulse className="size-6" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="font-heading text-base font-bold text-foreground">
              SEO Health Checker
            </p>
            <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
              Popular
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Get a free 0-100 SEO health score for any website in 15 seconds. Checks
            performance, mobile friendliness, on-page SEO, schema markup, security,
            and indexability.
          </p>
        </div>
        <ArrowRight className="size-5 shrink-0 text-primary opacity-0 transition-opacity group-hover:opacity-100" />
      </Link>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {TOOLS.map((tool) => {
          const Icon = TOOL_ICONS[tool.icon]
          return (
            <Link
              key={tool.slug}
              href={`/tools/${tool.slug}`}
              className="group flex gap-4 rounded-xl border p-5 transition-colors hover:border-primary/40 hover:bg-muted/50"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                {Icon ? <Icon className="size-5" /> : null}
              </div>
              <div>
                <p className="font-heading text-sm font-semibold text-foreground">
                  {tool.name}
                </p>
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                  {tool.description}
                </p>
              </div>
            </Link>
          )
        })}
      </div>

      <section className="mt-16 rounded-xl border-2 border-primary/20 bg-primary/5 p-6 text-center md:p-8">
        <h2 className="font-heading text-lg font-bold md:text-xl">
          These tools fix individual pages.
          <br />
          GSCdaddy finds which pages need fixing.
        </h2>
        <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
          Connect your Google Search Console and get AI-powered action plans for
          every page on your site — automatically.
        </p>
        <Link
          href="/login"
          className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Try GSCdaddy Free
          <ArrowRight className="size-4" />
        </Link>
      </section>
    </div>
  )
}
