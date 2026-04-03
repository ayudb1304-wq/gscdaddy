import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { notFound } from "next/navigation"
import { getAllSlugs, getPostBySlug } from "@/lib/blog"

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

  return (
    <article className="mx-auto max-w-3xl px-4 py-16 md:py-24">
      <BlogPostJsonLd post={post} />

      <Link
        href="/blog"
        className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to blog
      </Link>

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
        className="prose prose-neutral dark:prose-invert mt-10 max-w-none prose-headings:font-heading prose-headings:font-semibold prose-a:text-primary prose-a:underline-offset-2"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
    </article>
  )
}
