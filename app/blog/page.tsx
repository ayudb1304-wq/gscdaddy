import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { ArrowRight } from "lucide-react"
import { getAllPosts, getReadingTime } from "@/lib/blog"

export const metadata: Metadata = {
  title: "Blog - GSCdaddy",
  description:
    "SEO guides, Google Search Console tutorials, and striking distance keyword strategies from the GSCdaddy team.",
  alternates: { canonical: "https://gscdaddy.com/blog" },
  openGraph: {
    title: "Blog - GSCdaddy",
    description:
      "SEO guides, Google Search Console tutorials, and striking distance keyword strategies.",
    url: "https://gscdaddy.com/blog",
    siteName: "GSCdaddy",
    type: "website",
  },
}

function BreadcrumbJsonLd() {
  const schema = {
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
        name: "Blog",
        item: "https://gscdaddy.com/blog",
      },
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export default function BlogPage() {
  const posts = getAllPosts()

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:py-24">
      <BreadcrumbJsonLd />

      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to home
      </Link>

      <h1 className="font-heading text-3xl font-bold">Blog</h1>
      <p className="mt-2 text-muted-foreground">
        SEO guides, GSC tutorials, and lessons from building GSCdaddy in
        public.
      </p>

      {posts.length === 0 ? (
        <p className="mt-12 text-center text-muted-foreground">
          First posts coming soon. Stay tuned.
        </p>
      ) : (
        <div className="mt-10 space-y-6">
          {posts.map((post) => {
            const readTime = getReadingTime(post.content)
            return (
              <article key={post.slug}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="group block rounded-xl border p-6 transition-colors hover:bg-muted"
                >
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <time dateTime={post.publishedAt}>
                      {new Date(post.publishedAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </time>
                    <span>&middot;</span>
                    <span>{readTime} min read</span>
                    {post.tags.length > 0 && (
                      <>
                        <span>&middot;</span>
                        <span className="rounded-full bg-muted px-2 py-0.5 group-hover:bg-background">
                          {post.tags[0]}
                        </span>
                      </>
                    )}
                  </div>
                  <h2 className="mt-3 font-heading text-xl font-semibold transition-colors group-hover:text-primary">
                    {post.title}
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {post.description}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                    Read article
                    <ArrowRight className="size-3.5" />
                  </span>
                </Link>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
