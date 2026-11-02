import Image from "next/image"
import Link from "next/link"
import { getAllPosts } from "@/lib/blog"
import { TOOLS } from "@/lib/tools"

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

const PRODUCT = [
  { label: "How it works", href: "/#how-it-works" },
  { label: "Pricing", href: "/#pricing" },
  { label: "FAQ", href: "/#faq" },
  { label: "Log in", href: "/login" },
]

const COMPANY = [
  { label: "Privacy policy", href: "/privacy" },
  { label: "Terms of service", href: "/terms" },
  { label: "Contact", href: "mailto:sushi@gscdaddy.com" },
  { label: "RSS feed", href: "/feed.xml" },
]

export function SiteFooter() {
  const posts = getAllPosts().slice(0, 4)
  const tools = [
    { label: "SEO Health Checker", href: "/seo-health-checker" },
    ...TOOLS.slice(0, 5).map((t) => ({ label: t.name, href: `/tools/${t.slug}` })),
  ]

  return (
    <footer className="mx-auto max-w-[1280px] px-3 pb-3 md:px-4 md:pb-4">
      <div className="rounded-tile bg-[oklch(0.2_0.008_230)] px-6 py-12 text-white md:px-12 md:py-14 dark:bg-card dark:ring-1 dark:ring-white/10">
        <div className="grid gap-10 md:grid-cols-[1.3fr_repeat(4,1fr)]">
          <div>
            <Link href="/" className="flex items-center gap-2" aria-label="GSCdaddy home">
              <Image
                src="/images/GSCDaddyLogo_LightMode.png"
                alt=""
                width={28}
                height={28}
              />
              <span className="font-heading text-xl font-bold tracking-tight">GSCdaddy</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm text-white/60">
              The Google Search Console tool that finds your almost-ranking keywords and tells you
              what to fix next.
            </p>
            <a
              href="https://x.com/ayu_theindiedev"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 text-sm text-white/70 transition-colors hover:text-white"
            >
              <XIcon className="size-4" /> @ayu_theindiedev
            </a>
          </div>

          <FooterColumn title="Product" links={PRODUCT} />
          <FooterColumn title="Free tools" links={[...tools, { label: "All free tools", href: "/tools" }]} />
          <FooterColumn
            title="From the blog"
            links={[
              ...posts.map((p) => ({ label: p.title, href: `/blog/${p.slug}` })),
              { label: "All posts", href: "/blog" },
            ]}
          />
          <FooterColumn title="Company" links={COMPANY} />
        </div>

        <div className="mt-12 flex flex-col justify-between gap-2 border-t border-white/10 pt-6 text-xs text-white/45 md:flex-row">
          <p>&copy; {new Date().getFullYear()} GSCdaddy. Built by one founder in India.</p>
          <p>Read-only access to your Search Console. We never change your site.</p>
        </div>
      </div>
    </footer>
  )
}

function FooterColumn({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <p className="text-xs font-medium tracking-wider text-white/45 uppercase">{title}</p>
      <ul className="mt-4 space-y-2.5">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="line-clamp-2 text-sm text-white/75 transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
