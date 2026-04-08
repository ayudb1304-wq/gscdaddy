import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { TOOLS, type ToolMeta } from "@/lib/tools"

/* ------------------------------------------------------------------ */
/*  JSON-LD Schemas                                                    */
/* ------------------------------------------------------------------ */

interface ToolJsonLdProps {
  name: string
  slug: string
  description: string
  faqs: { question: string; answer: string }[]
}

export function ToolJsonLd({ name, slug, description, faqs }: ToolJsonLdProps) {
  const url = `https://gscdaddy.com/tools/${slug}`

  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name,
    url,
    applicationCategory: "SEO Tool",
    operatingSystem: "Web",
    description,
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
      { "@type": "ListItem", position: 1, name: "Home", item: "https://gscdaddy.com" },
      { "@type": "ListItem", position: 2, name: "Tools", item: "https://gscdaddy.com/tools" },
      { "@type": "ListItem", position: 3, name, item: url },
    ],
  }

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
    </>
  )
}

/* ------------------------------------------------------------------ */
/*  CTA Banner                                                         */
/* ------------------------------------------------------------------ */

export function ToolCtaBanner() {
  return (
    <section className="mt-16 rounded-xl border-2 border-primary/20 bg-primary/5 p-6 text-center md:p-8">
      <h2 className="font-heading text-lg font-bold md:text-xl">
        Want to find which pages need these fixes?
      </h2>
      <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
        GSCdaddy scans your Google Search Console data and tells you exactly
        what to optimize — with AI-powered action plans for every page.
      </p>
      <Link
        href="/login"
        className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Try GSCdaddy Free
        <ArrowRight className="size-4" />
      </Link>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  How To Use                                                         */
/* ------------------------------------------------------------------ */

interface HowToStep {
  step: string
  description: string
}

export function ToolHowToSection({ steps }: { steps: HowToStep[] }) {
  return (
    <section className="mt-16 space-y-4">
      <h2 className="font-heading text-lg font-semibold text-foreground">
        How to use this tool
      </h2>
      <ol className="space-y-3">
        {steps.map((s, i) => (
          <li key={i} className="flex gap-3 text-sm text-muted-foreground">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
              {i + 1}
            </span>
            <div>
              <span className="font-medium text-foreground">{s.step}</span>
              {" — "}
              {s.description}
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  Why Use This Tool                                                  */
/* ------------------------------------------------------------------ */

export function ToolWhySection({
  title,
  reasons,
}: {
  title: string
  reasons: string[]
}) {
  return (
    <section className="mt-12 space-y-3">
      <h2 className="font-heading text-lg font-semibold text-foreground">
        {title}
      </h2>
      <ul className="space-y-2">
        {reasons.map((r, i) => (
          <li
            key={i}
            className="flex gap-2 text-sm text-muted-foreground"
          >
            <span className="mt-1 text-primary">&#10003;</span>
            {r}
          </li>
        ))}
      </ul>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  FAQ Section                                                        */
/* ------------------------------------------------------------------ */

export function ToolFaqSection({
  faqs,
}: {
  faqs: { question: string; answer: string }[]
}) {
  return (
    <section className="mt-12 space-y-4">
      <h2 className="font-heading text-lg font-semibold text-foreground">
        Frequently asked questions
      </h2>
      <div className="space-y-4">
        {faqs.map((faq, i) => (
          <details
            key={i}
            className="group rounded-lg border px-4 py-3"
          >
            <summary className="cursor-pointer text-sm font-medium text-foreground">
              {faq.question}
            </summary>
            <p className="mt-2 text-sm text-muted-foreground">{faq.answer}</p>
          </details>
        ))}
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  Related Tools                                                      */
/* ------------------------------------------------------------------ */

export function RelatedToolsSection({
  currentSlug,
  slugs,
}: {
  currentSlug: string
  slugs?: string[]
}) {
  const tools: ToolMeta[] = slugs
    ? slugs.map((s) => TOOLS.find((t) => t.slug === s)!).filter(Boolean)
    : TOOLS.filter((t) => t.slug !== currentSlug).slice(0, 3)

  return (
    <section className="mt-12 space-y-3">
      <h2 className="font-heading text-lg font-semibold text-foreground">
        Related tools
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <Link
            key={tool.slug}
            href={`/tools/${tool.slug}`}
            className="rounded-lg border p-4 transition-colors hover:bg-muted/50"
          >
            <p className="text-sm font-medium text-foreground">{tool.name}</p>
            <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
              {tool.description}
            </p>
          </Link>
        ))}
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  Related Blog Posts                                                 */
/* ------------------------------------------------------------------ */

export function RelatedPostsSection({
  posts,
}: {
  posts: { slug: string; title: string }[]
}) {
  return (
    <section className="mt-12 space-y-3">
      <h2 className="font-heading text-lg font-semibold text-foreground">
        Related articles
      </h2>
      <ul className="space-y-2">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link
              href={`/blog/${post.slug}`}
              className="text-sm text-primary underline underline-offset-2 hover:text-primary/80"
            >
              {post.title}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
