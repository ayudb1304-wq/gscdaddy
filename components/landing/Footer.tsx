import { Logo } from "@/components/logo"
import { getAllPosts } from "@/lib/blog"

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

export function Footer() {
  const latestPosts = getAllPosts().slice(0, 3)

  return (
    <footer className="border-t border-border py-8">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2 font-heading text-lg font-bold">
            <Logo size={20} />
            GSCdaddy
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://x.com/ayu_theindiedev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground transition-colors hover:text-foreground"
              aria-label="X (Twitter)"
            >
              <XIcon className="size-4" />
            </a>
          </div>
        </div>

        <div className="mt-6 grid gap-6 text-xs text-muted-foreground md:grid-cols-2">
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-foreground">
              From the Blog
            </p>
            <ul className="space-y-3">
              {latestPosts.map((post) => (
                <li key={post.slug}>
                  <a
                    href={`/blog/${post.slug}`}
                    className="inline-flex items-center gap-1.5 underline underline-offset-2 decoration-border transition-colors hover:text-foreground hover:decoration-foreground"
                  >
                    <span className="text-primary">→</span>
                    {post.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col justify-between gap-4">
            <div className="flex flex-wrap gap-4">
              <a href="/seo-health-checker" className="transition-colors hover:text-foreground">
                SEO Health Checker
              </a>
              <a href="/tools" className="transition-colors hover:text-foreground">
                Free Tools
              </a>
              <a href="/blog" className="transition-colors hover:text-foreground">
                Blog
              </a>
              <a href="/privacy" className="transition-colors hover:text-foreground">
                Privacy Policy
              </a>
              <a href="/terms" className="transition-colors hover:text-foreground">
                Terms of Service
              </a>
              <a href="mailto:sushi@gscdaddy.com" className="transition-colors hover:text-foreground">
                Contact
              </a>
            </div>
            <p>&copy; 2026 GSCdaddy. Built with &#9749; in India.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
