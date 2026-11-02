import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function BlogPostNotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:py-24 text-center">
      <h1 className="font-heading text-3xl font-bold">Post not found</h1>
      <p className="mt-2 text-muted-foreground">
        This blog post does not exist or has been removed.
      </p>
      <Link
        href="/blog"
        className="mt-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to blog
      </Link>
    </div>
  )
}
