import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Logo } from "@/components/logo"
import { HealthCheckerForm } from "./health-checker-form"
import {
  ToolHowToSection,
  ToolWhySection,
  ToolFaqSection,
  RelatedToolsSection,
  RelatedPostsSection,
} from "@/components/tool-page-sections"

export const metadata: Metadata = {
  title: "Free SEO Health Checker - Website SEO Audit Tool | GSCdaddy",
  description:
    "Get a free 0-100 SEO health score for any website in 15 seconds. Check performance, mobile friendliness, on-page SEO, schema markup, security, and indexability.",
  alternates: { canonical: "https://gscdaddy.com/seo-health-checker" },
  openGraph: {
    title: "Free SEO Health Checker - Website SEO Audit Tool | GSCdaddy",
    description:
      "Get a free 0-100 SEO health score for any website in 15 seconds. Check 6 critical SEO categories instantly.",
    url: "https://gscdaddy.com/seo-health-checker",
    siteName: "GSCdaddy",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free SEO Health Checker | GSCdaddy",
    description:
      "Get a free 0-100 SEO health score for any website in 15 seconds.",
  },
}

const FAQS = [
  {
    question: "What does the SEO Health Score measure?",
    answer:
      "The score covers 6 categories: Performance (page speed via Lighthouse), Mobile Friendliness (viewport, font size, tap targets), On-Page SEO (title, meta description, headings, images, content length), Schema Markup (JSON-LD structured data), Security (HTTPS, security headers), and Indexability (robots.txt, sitemap, canonical tags). Each category is weighted and combined into a 0-100 overall score.",
  },
  {
    question: "Is this tool really free?",
    answer:
      "Yes, the instant SEO health score is completely free with no signup required. You can run as many checks as you want. We offer an optional email-gated PDF report with more detail if you want to save or share your results.",
  },
  {
    question: "How accurate is the score?",
    answer:
      "The score uses Google's own PageSpeed Insights API for performance data, and our crawler checks the same signals that search engines evaluate. It is a directional indicator — a score of 90+ means your SEO fundamentals are solid, while below 50 means there are critical issues to fix.",
  },
  {
    question: "How is this different from Ahrefs or Semrush site audits?",
    answer:
      "Ahrefs and Semrush run full crawls across your entire site (hundreds or thousands of pages), which requires a paid subscription. Our SEO Health Checker analyzes a single URL instantly for free, giving you a quick pulse check on your homepage or any specific page. For deeper multi-page analysis, connect Google Search Console to GSCdaddy.",
  },
  {
    question: "Can I check any website or just my own?",
    answer:
      "You can check any publicly accessible website. This makes it useful for competitive analysis — see how your SEO health compares to competitors in your niche.",
  },
  {
    question: "How often should I check my SEO health score?",
    answer:
      "We recommend checking after any major site update — redesigns, CMS migrations, new deployments, or content overhauls. For ongoing monitoring, connecting Google Search Console to GSCdaddy gives you daily tracking of your keyword rankings and opportunities.",
  },
]

function HealthCheckerJsonLd() {
  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Free SEO Health Checker",
    url: "https://gscdaddy.com/seo-health-checker",
    applicationCategory: "SEO Tool",
    operatingSystem: "Web",
    description:
      "Get a free 0-100 SEO health score for any website. Checks performance, mobile friendliness, on-page SEO, schema markup, security, and indexability.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
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
        name: "SEO Health Checker",
        item: "https://gscdaddy.com/seo-health-checker",
      },
    ],
  }

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  )
}

export default function SeoHealthCheckerPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:py-24">
      <HealthCheckerJsonLd />

      <Link
        href="/tools"
        className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        All tools
      </Link>

      <header>
        <Link href="/" className="flex items-center gap-2">
          <Logo size={24} />
          <span className="font-heading text-sm font-bold">GSCdaddy</span>
        </Link>
        <h1 className="mt-6 font-heading text-3xl font-bold leading-tight md:text-4xl">
          Free SEO Health Checker
        </h1>
        <p className="mt-3 max-w-xl text-muted-foreground">
          Get a 0-100 SEO health score for any website in seconds. We check
          performance, mobile friendliness, on-page SEO, schema markup,
          security, and indexability — no signup required.
        </p>
      </header>

      <div className="mt-10">
        <HealthCheckerForm />
      </div>

      <ToolHowToSection
        steps={[
          {
            step: "Enter your website URL",
            description:
              "Type any URL — your homepage, a blog post, or a competitor's page.",
          },
          {
            step: "Wait 10-15 seconds",
            description:
              "We run a full crawl and PageSpeed analysis in the background.",
          },
          {
            step: "Review your score",
            description:
              "See your 0-100 score with a breakdown across 6 SEO categories.",
          },
          {
            step: "Fix the failing checks",
            description:
              "Each item tells you exactly what is wrong and how to fix it.",
          },
        ]}
      />

      <ToolWhySection
        title="Why use this SEO health checker?"
        reasons={[
          "Instant results — no signup, no login, no credit card required.",
          "Uses Google's own PageSpeed Insights API for performance data.",
          "Checks the same signals search engines use to rank your pages.",
          "Works on any publicly accessible URL — great for competitive analysis.",
          "Free forever for single-page checks.",
        ]}
      />

      <ToolFaqSection faqs={FAQS} />

      <RelatedToolsSection
        currentSlug="seo-health-checker"
        slugs={["meta-tag-generator", "robots-txt-generator", "readability-checker"]}
      />

      <RelatedPostsSection
        posts={[
          {
            slug: "google-search-console-beginners-guide",
            title: "The Complete Beginner's Guide to Google Search Console",
          },
          {
            slug: "striking-distance-keywords-guide",
            title: "The Complete Guide to Striking Distance Keywords",
          },
        ]}
      />
    </div>
  )
}
