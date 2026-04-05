import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Logo } from "@/components/logo"
import { CalculatorForm } from "./calculator-form"

export const metadata: Metadata = {
  title: "Keyword Opportunity Calculator - GSCdaddy",
  description:
    "Estimate how much traffic you could gain by improving your Google ranking. Enter your current position, impressions, and CTR to see projected clicks.",
  alternates: { canonical: "https://gscdaddy.com/tools/keyword-calculator" },
  openGraph: {
    title: "Keyword Opportunity Calculator - GSCdaddy",
    description:
      "Free SEO calculator. See how many clicks you are leaving on the table based on your current Google position.",
    url: "https://gscdaddy.com/tools/keyword-calculator",
    siteName: "GSCdaddy",
    type: "website",
  },
}

function CalculatorJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Keyword Opportunity Calculator",
    url: "https://gscdaddy.com/tools/keyword-calculator",
    applicationCategory: "SEO Tool",
    operatingSystem: "Web",
    description:
      "Estimate how much traffic you could gain by improving your Google ranking position.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    author: {
      "@type": "Organization",
      name: "GSCdaddy",
      url: "https://gscdaddy.com",
    },
  }

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://gscdaddy.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Tools",
        item: "https://gscdaddy.com/tools",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "Keyword Opportunity Calculator",
        item: "https://gscdaddy.com/tools/keyword-calculator",
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </>
  )
}

export default function KeywordCalculatorPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:py-24">
      <CalculatorJsonLd />

      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to home
      </Link>

      <header>
        <div className="flex items-center gap-2">
          <Logo size={24} />
          <span className="text-xs font-medium text-muted-foreground">Free Tool</span>
        </div>
        <h1 className="mt-4 font-heading text-3xl font-bold leading-tight md:text-4xl">
          Keyword Opportunity Calculator
        </h1>
        <p className="mt-3 max-w-xl text-muted-foreground">
          See how many clicks you are leaving on the table. Enter your current
          Google position, monthly impressions, and CTR to estimate the traffic
          you could gain by ranking higher.
        </p>
      </header>

      <div className="mt-10">
        <CalculatorForm />
      </div>

      <section className="mt-16 space-y-6 text-sm text-muted-foreground">
        <h2 className="font-heading text-lg font-semibold text-foreground">
          How this calculator works
        </h2>
        <p>
          This calculator uses industry-average click-through rate benchmarks for
          each Google position. These benchmarks are based on aggregated data
          across millions of search results. Your actual CTR will vary depending
          on your industry, search intent, and how compelling your title tag and
          meta description are.
        </p>
        <p>
          The estimated traffic gain shows you the difference between your
          current clicks and what you could expect at a higher position. This
          helps you prioritize which keywords to optimize first based on the
          biggest potential impact.
        </p>
        <p>
          Want to find these keywords automatically?{" "}
          <Link href="/login" className="text-primary underline underline-offset-2">
            Try GSCdaddy free for 14 days
          </Link>{" "}
          and get AI-powered recommendations for every striking distance keyword
          on your site.
        </p>
      </section>
    </div>
  )
}
