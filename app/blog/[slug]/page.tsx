import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { notFound } from "next/navigation"
import { getAllSlugs, getAllPosts, getPostBySlug, getReadingTime, extractHeadings, addHeadingIds } from "@/lib/blog"
import { TableOfContents } from "@/components/blog/table-of-contents"

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) return {}

  return {
    title: `${post.title} - GSCdaddy`,
    description: post.description,
    authors: [{ name: post.author.name, url: post.author.url }],
    alternates: { canonical: `https://gscdaddy.com/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt ?? post.publishedAt,
      authors: [post.author.name],
      url: `https://gscdaddy.com/blog/${post.slug}`,
      siteName: "GSCdaddy",
    },
    twitter: {
      card: "summary_large_image",
      creator: "@ayu_theindiedev",
      title: post.title,
      description: post.description,
    },
  }
}

function BlogPostJsonLd({
  post,
}: {
  post: NonNullable<ReturnType<typeof getPostBySlug>>
}) {
  const blogPostingSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt ?? post.publishedAt,
    author: {
      "@type": "Person",
      name: post.author.name,
      url: post.author.url,
    },
    publisher: {
      "@type": "Organization",
      name: "GSCdaddy",
      url: "https://gscdaddy.com",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://gscdaddy.com/blog/${post.slug}`,
    },
    url: `https://gscdaddy.com/blog/${post.slug}`,
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
        name: "Blog",
        item: "https://gscdaddy.com/blog",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: post.title,
        item: `https://gscdaddy.com/blog/${post.slug}`,
      },
    ],
  }

  const faqSchema =
    post.faqs && post.faqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: post.faqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: faq.answer,
            },
          })),
        }
      : null

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
    </>
  )
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) notFound()

  const readTime = getReadingTime(post.content)
  const headings = extractHeadings(post.content)
  const contentWithIds = addHeadingIds(post.content)

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
      <BlogPostJsonLd post={post} />

      <Link
        href="/blog"
        className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to blog
      </Link>

      <div className="lg:grid lg:grid-cols-[1fr_220px] lg:gap-12">
        {/* Main content */}
        <article className="min-w-0">
          <header>
            <h1 className="font-heading text-3xl font-bold leading-tight md:text-4xl">
              {post.title}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span>
                By{" "}
                <a
                  href={post.author.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 transition-colors hover:text-foreground"
                >
                  {post.author.name}
                </a>
              </span>
              <span>&middot;</span>
              <time dateTime={post.publishedAt}>
                {new Date(post.publishedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
              {post.updatedAt && post.updatedAt !== post.publishedAt && (
                <>
                  <span>&middot;</span>
                  <span>
                    Updated{" "}
                    <time dateTime={post.updatedAt}>
                      {new Date(post.updatedAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </time>
                  </span>
                </>
              )}
              <span>&middot;</span>
              <span>{readTime} min read</span>
            </div>
            {post.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </header>

          <div
            className="prose prose-lg prose-neutral dark:prose-invert mt-10 max-w-none prose-headings:font-heading prose-headings:font-semibold prose-headings:mt-12 prose-headings:mb-4 prose-p:my-6 prose-p:leading-relaxed prose-ul:my-6 prose-ol:my-6 prose-li:my-2 prose-a:text-primary prose-a:underline-offset-2 prose-figure:my-10 prose-blockquote:my-8 prose-headings:scroll-mt-20"
            dangerouslySetInnerHTML={{ __html: contentWithIds }}
          />

          <RelatedPosts currentSlug={post.slug} currentTags={post.tags} />

          <section className="mt-12 rounded-xl border bg-card p-8 text-center">
            <h2 className="font-heading text-lg font-semibold">
              Stop guessing. Start fixing.
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              GSCdaddy finds your striking distance keywords and tells you exactly
              what to change. Free for 14 days, no credit card required.
            </p>
            <Link
              href="/login"
              className="mt-5 inline-flex h-10 items-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Try GSCdaddy free
            </Link>
          </section>
        </article>

        {/* Sidebar TOC — sticky on desktop, hidden on mobile */}
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <TableOfContents headings={headings} />
          </div>
        </aside>
      </div>
    </div>
  )
}

function RelatedPosts({
  currentSlug,
  currentTags,
}: {
  currentSlug: string
  currentTags: string[]
}) {
  const allPosts = getAllPosts().filter((p) => p.slug !== currentSlug)
  if (allPosts.length === 0) return null

  // Score by shared tags, take top 3
  const scored = allPosts
    .map((p) => ({
      post: p,
      score: p.tags.filter((t) => currentTags.includes(t)).length,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)

  return (
    <section className="mt-16 border-t pt-10">
      <h2 className="font-heading text-xl font-semibold">Keep reading</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {scored.map(({ post: p }) => (
          <Link
            key={p.slug}
            href={`/blog/${p.slug}`}
            className="group rounded-lg border p-5 transition-colors hover:bg-muted"
          >
            <h3 className="font-heading text-sm font-semibold leading-snug group-hover:text-primary">
              {p.title}
            </h3>
            <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
              {p.description}
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {p.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
