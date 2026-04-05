import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { getAllPosts } from "@/lib/blog"

export function BlogSection() {
  const posts = getAllPosts().slice(0, 3)

  if (posts.length === 0) return null

  return (
    <section className="border-t py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
              From the blog
            </p>
            <h2 className="mt-2 font-heading text-3xl font-bold md:text-4xl">
              Learn SEO that actually works
            </h2>
          </div>
          <Link
            href="/blog"
            className="hidden items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80 sm:flex"
          >
            View all posts
            <ArrowRight className="size-4" />
          </Link>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group flex flex-col rounded-xl border p-6 transition-colors hover:bg-muted"
            >
              <div className="flex flex-wrap gap-2">
                {post.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground group-hover:bg-background"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <h3 className="mt-3 font-heading text-base font-semibold leading-snug group-hover:text-primary">
                {post.title}
              </h3>
              <p className="mt-2 line-clamp-2 flex-1 text-sm text-muted-foreground">
                {post.description}
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-primary">
                Read more
                <ArrowRight className="size-3" />
              </span>
            </Link>
          ))}
        </div>

        <Link
          href="/blog"
          className="mt-8 flex items-center justify-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80 sm:hidden"
        >
          View all posts
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </section>
  )
}
