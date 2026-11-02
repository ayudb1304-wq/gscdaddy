import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowRight,
  BookOpen,
  Check,
  FileText,
  Link2,
  RefreshCw,
  Scissors,
  Search,
  Sparkles,
  X,
  Zap,
} from "lucide-react"
import { SiteNav } from "@/components/marketing/site-nav"
import { SiteFooter } from "@/components/marketing/site-footer"
import { Hero } from "@/components/marketing/hero"
import { Eyebrow, SectionTitle, Tile } from "@/components/marketing/tile"
import { Parallax, Reveal, ScrollWords, Stagger, TileReveal } from "@/components/marketing/motion"
import { ActionPlanMock, ShippedMock } from "@/components/marketing/app-mockups"
import { Marquee, type MarqueeItem } from "@/components/marketing/marquee"
import { PricingCards } from "@/components/marketing/pricing"
import { FaqList } from "@/components/marketing/faq-list"
import { BUILD_IN_PUBLIC_TWEETS, FAQ_ITEMS, FOUNDER, PRICING_TIERS } from "@/lib/constants"
import { TOOLS } from "@/lib/tools"
import { TOOL_ICONS } from "@/lib/tool-icons"

const TITLE = "Search Console Tool for Keyword Opportunities | GSCdaddy"
const DESCRIPTION =
  "GSCdaddy finds the keywords you already rank 5–15 for in Google Search Console and gives you a step-by-step plan to reach page one. 14-day free trial."

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: "https://gscdaddy.com" },
  openGraph: {
    title: "You’re ranking #8. Let’s fix that. | GSCdaddy",
    description: DESCRIPTION,
    url: "https://gscdaddy.com",
    siteName: "GSCdaddy",
    type: "website",
    images: ["/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    creator: "@ayu_theindiedev",
    title: "You’re ranking #8. Let’s fix that. | GSCdaddy",
    description: DESCRIPTION,
    images: ["/opengraph-image"],
  },
}

const FIX_TYPES = [
  { label: "Rewrite the title", icon: FileText },
  { label: "Add internal links", icon: Link2 },
  { label: "Expand thin sections", icon: BookOpen },
  { label: "Refresh old content", icon: RefreshCw },
  { label: "Fix cannibalization", icon: Scissors },
  { label: "Quick wins", icon: Zap },
]

const STEPS = [
  {
    n: "01",
    title: "Connect Search Console",
    body: "Sign in with Google and pick your sites. We ask for read-only access, so nothing on your site can change.",
    note: "About a minute",
  },
  {
    n: "02",
    title: "See what’s almost ranking",
    body: "We pull up to 16 months of data and sort every keyword on positions 5–15 by how much traffic page one would bring.",
    note: "First results in minutes",
  },
  {
    n: "03",
    title: "Fix one page at a time",
    body: "Each keyword gets a short plan for its page. Mark it done and we track whether the position moves.",
    note: "A new focus every day",
  },
]

const COMPARE = [
  {
    label: "Spreadsheets",
    good: false,
    rows: ["Export CSVs every week", "Build pivot tables by hand", "Guess which page to fix", "No alerts when rankings drop"],
  },
  {
    label: "Search Console alone",
    good: false,
    rows: ["Thousands of raw rows", "No priority order", "No advice on what to change", "Data deleted after 16 months"],
  },
  {
    label: "GSCdaddy",
    good: true,
    rows: [
      "Opportunities sorted for you",
      "A plan for every keyword",
      "Daily focus and weekly email",
      "Tracks whether your fixes worked",
    ],
  },
]

const SWATCHES = ["bg-tile-peach", "bg-tile-lilac", "bg-tile-sky", "bg-tile-sage", "bg-tile-cream", "bg-tile-rose", "bg-tile-lime", "bg-tile-mist"]

function toolItems(): MarqueeItem[] {
  const items: MarqueeItem[] = [
    {
      label: "SEO Health Checker",
      href: "/seo-health-checker",
      icon: <Search className="size-5" />,
      swatch: "bg-tile-lime",
    },
    ...TOOLS.map((t, i) => {
      const Icon = TOOL_ICONS[t.icon] ?? Sparkles
      return {
        label: t.name,
        href: `/tools/${t.slug}`,
        icon: <Icon className="size-5" />,
        swatch: SWATCHES[i % SWATCHES.length],
      }
    }),
  ]
  return items
}

function JsonLd() {
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: "GSCdaddy",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        description:
          "Google Search Console tool that finds keywords ranking on positions 5–15 and writes a step-by-step plan to move each one to page one.",
        url: "https://gscdaddy.com",
        image: "https://gscdaddy.com/opengraph-image",
        offers: {
          "@type": "AggregateOffer",
          lowPrice: Math.min(...PRICING_TIERS.map((t) => t.annualPrice)),
          highPrice: Math.max(...PRICING_TIERS.map((t) => t.monthlyPrice)),
          priceCurrency: "USD",
          offerCount: PRICING_TIERS.length,
        },
      },
      {
        "@type": "Organization",
        name: "GSCdaddy",
        url: "https://gscdaddy.com",
        logo: "https://gscdaddy.com/images/GSCDaddyLogo.png",
        founder: { "@type": "Person", name: "Ayush", url: "https://x.com/ayu_theindiedev" },
        sameAs: ["https://x.com/ayu_theindiedev"],
      },
      {
        "@type": "WebSite",
        name: "GSCdaddy",
        alternateName: ["GSC daddy", "GSC Daddy"],
        url: "https://gscdaddy.com",
      },
      {
        "@type": "FAQPage",
        mainEntity: FAQ_ITEMS.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: { "@type": "Answer", text: item.answer },
        })),
      },
    ],
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph).replace(/</g, "\\u003c") }}
    />
  )
}

export default function Page() {
  const tools = toolItems()
  const half = Math.ceil(tools.length / 2)

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />
      <main className="mx-auto max-w-[1280px] space-y-3 px-3 pt-3 md:space-y-4 md:px-4 md:pt-4">
        <Hero />

        {/* Why */}
        <TileReveal>
          <Tile tone="peach" className="px-6 py-24 md:py-36" aria-labelledby="why-title">
            <FloatingObjects />
            <div className="relative mx-auto max-w-xl text-center">
              <h2 id="why-title" className="text-xs font-semibold tracking-[0.14em] text-foreground/70 uppercase">
                Why GSCdaddy?
              </h2>
              <ScrollWords
                className="mt-6 space-y-5"
                lineClassName="font-sans text-2xl leading-snug font-medium md:text-[2rem] md:leading-[1.25]"
                lines={[
                  "Search Console shows you thousands of rows: queries, clicks, impressions, positions.",
                  "It never tells you which ten keywords to work on this week, or what to change on the page.",
                  "GSCdaddy does both.",
                ]}
              />
            </div>
          </Tile>
        </TileReveal>

        {/* Features */}
        <div id="features" className="grid gap-3 md:grid-cols-12 md:gap-4">
          <TileReveal className="md:col-span-12">
            <Tile tone="sand" className="grid gap-10 p-7 md:p-10 lg:grid-cols-[0.8fr_1.6fr] lg:items-center">
              <div>
                <SectionTitle as="h2" className="md:text-[2.4rem]">One page to fix, every morning</SectionTitle>
                <p className="mt-3 max-w-md text-[15px] leading-relaxed text-foreground/75">
                  The Today page picks the single best opportunity for your site and shows what moved
                  since yesterday, so you never start the day wondering where to begin.
                </p>
                <ul className="mt-6 space-y-2 text-sm">
                  {["A new focus every day", "What gained and what slipped", "Done in one click"].map((t) => (
                    <li key={t} className="flex items-center gap-2">
                      <Check className="size-4 text-brand-strong" /> {t}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative pb-40 md:pb-48">
                <Parallax speed={18}>
                  <figure className="overflow-hidden rounded-2xl shadow-[0_30px_70px_-30px_rgb(0_0_0/0.45)] ring-1 ring-black/10 dark:ring-white/10">
                    <Image
                      src="/marketing/app-today-focus.jpg"
                      alt="The Today page in GSCdaddy: today's focus keyword, why it matters and the steps to fix it"
                      width={2006}
                      height={514}
                      sizes="(max-width: 1024px) 92vw, 760px"
                      className="w-full"
                    />
                  </figure>
                </Parallax>
                <Parallax speed={46} className="absolute right-2 -bottom-4 w-[62%] max-w-[380px] md:right-8">
                  <figure className="overflow-hidden rounded-2xl shadow-[0_30px_70px_-24px_rgb(0_0_0/0.5)] ring-1 ring-black/10 dark:ring-white/10">
                    <Image
                      src="/marketing/app-today-movers.jpg"
                      alt="Yesterday's movers: keywords that gained and lost clicks since the day before"
                      width={801}
                      height={448}
                      sizes="360px"
                      className="w-full"
                    />
                  </figure>
                </Parallax>
              </div>
            </Tile>
          </TileReveal>

          <TileReveal className="md:col-span-7" delay={0.08}>
            <Tile tone="lilac" className="flex h-full flex-col p-7 md:p-10">
              <SectionTitle as="h2" className="md:text-[2.4rem]">Advice for your page, not SEO in general</SectionTitle>
              <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-foreground/75">
                Every recommendation is written from your own Search Console data: the queries a
                page ranks for, where it sits, and what the pages above it do differently.
              </p>
              <Stagger
                className="mt-8 flex flex-wrap justify-center gap-3 md:mt-auto md:pt-10"
                itemClassName="list-none"
              >
                {FIX_TYPES.map((f) => (
                  <span
                    key={f.label}
                    className="inline-flex items-center gap-2 rounded-full bg-pill px-5 py-3 text-base font-medium text-pill-foreground shadow-[inset_0_-3px_0_rgb(0_0_0/0.08),0_10px_24px_-14px_rgb(60_80_0/0.6)] md:text-lg"
                  >
                    <f.icon className="size-4" />
                    {f.label}
                  </span>
                ))}
              </Stagger>
            </Tile>
          </TileReveal>

          <TileReveal className="md:col-span-5" delay={0.08}>
            <Tile tone="sage" className="flex h-full flex-col p-7 md:p-10">
              <SectionTitle as="h2" className="md:text-[2.4rem]">Proof your fixes worked</SectionTitle>
              <p className="mt-3 text-[15px] leading-relaxed text-foreground/75">
                When you mark a fix as done, we save the page’s position that day and show you where
                it goes over the next weeks.
              </p>
              <Parallax speed={24} className="mt-8 md:mt-auto md:pt-10">
                <ShippedMock />
              </Parallax>
            </Tile>
          </TileReveal>
          <TileReveal className="md:col-span-12">
            <Tile tone="sky" className="grid h-full gap-8 p-7 md:grid-cols-[1fr_1fr] md:items-center md:p-10">
              <div>
                <SectionTitle as="h2" className="md:text-[2.4rem]">A game plan for every keyword</SectionTitle>
                <p className="mt-3 text-[15px] leading-relaxed text-foreground/75">
                  Three or four steps, each tied to something we found on your page. Most take under
                  an hour. Tick them off as you go.
                </p>
                <ul className="mt-6 space-y-2 text-sm">
                  {["Specific to the page, not a checklist", "Time estimate on every plan", "Marked done in one click"].map((t) => (
                    <li key={t} className="flex items-center gap-2">
                      <Check className="size-4 text-brand-strong" /> {t}
                    </li>
                  ))}
                </ul>
              </div>
              <Parallax speed={30}>
                <ActionPlanMock />
              </Parallax>
            </Tile>
          </TileReveal>

        </div>

        {/* How it works */}
        <TileReveal>
          <Tile tone="rose" id="how-it-works" className="px-6 py-16 md:px-12 md:py-24">
            <div className="grid gap-12 md:grid-cols-[0.9fr_1.1fr]">
              <div>
                <Eyebrow>How it works</Eyebrow>
                <SectionTitle className="mt-4">From Search Console to a to-do list in three steps</SectionTitle>
                <p className="mt-4 max-w-md text-[15px] leading-relaxed text-foreground/75">
                  No setup, no tracking code, no keyword lists to type in. GSCdaddy works from the
                  data Google already collects about your site.
                </p>
                <Link
                  href="/login"
                  className="group mt-8 inline-flex h-11 items-center gap-2 rounded-xl bg-ink px-5 text-sm font-medium text-ink-foreground"
                >
                  Connect Search Console
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
              <ol className="space-y-3">
                {STEPS.map((s, i) => (
                  <Reveal key={s.n} as="li" delay={i * 0.1}>
                    <div className="flex gap-5 rounded-3xl bg-card/80 p-6 ring-1 ring-black/5 backdrop-blur dark:ring-white/10">
                      <span className="font-heading text-4xl font-semibold text-foreground/25 tabular-nums">{s.n}</span>
                      <div>
                        <h3 className="font-heading text-xl font-semibold">{s.title}</h3>
                        <p className="mt-1.5 text-[15px] leading-relaxed text-muted-foreground">{s.body}</p>
                        <p className="mt-3 text-xs font-medium text-brand-strong">{s.note}</p>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </ol>
            </div>
          </Tile>
        </TileReveal>

        {/* Free tools marquee */}
        <TileReveal>
          <Tile tone="sand" className="py-16 md:py-24" aria-labelledby="tools-title">
            <div className="mx-auto max-w-2xl px-6 text-center">
              <Eyebrow>Free tools</Eyebrow>
              <SectionTitle className="mt-4" as="h2">
                <span id="tools-title">Free SEO tools, no sign-up needed</span>
              </SectionTitle>
              <p className="mt-4 text-[15px] text-foreground/75">
                Check a page’s health, preview your Google snippet or write meta tags. Free to use,
                and every one of them is also inside the app.
              </p>
            </div>
            <div className="mt-12 space-y-3">
              <Marquee items={tools} duration={60} />
              <Marquee items={[...tools.slice(half), ...tools.slice(0, half)]} duration={70} reverse />
            </div>
            <div className="mt-10 text-center">
              <Link href="/tools" className="inline-flex items-center gap-1.5 text-sm font-medium underline underline-offset-4">
                See all free tools <ArrowRight className="size-4" />
              </Link>
            </div>
          </Tile>
        </TileReveal>

        {/* Comparison */}
        <TileReveal>
          <Tile tone="cream" className="px-6 py-16 md:px-12 md:py-24" aria-labelledby="compare-title">
            <div className="mx-auto max-w-2xl text-center">
              <Eyebrow>Compare</Eyebrow>
              <SectionTitle className="mt-4">
                <span id="compare-title">Spreadsheets vs. Search Console vs. GSCdaddy</span>
              </SectionTitle>
            </div>
            <div className="mt-12 grid gap-3 md:grid-cols-3">
              {COMPARE.map((col, i) => (
                <Reveal key={col.label} delay={i * 0.08}>
                  <div
                    className={
                      col.good
                        ? "h-full rounded-3xl bg-ink p-6 text-ink-foreground"
                        : "h-full rounded-3xl bg-card/70 p-6 ring-1 ring-black/5 dark:ring-white/10"
                    }
                  >
                    <h3 className="font-heading text-lg font-semibold">{col.label}</h3>
                    <ul className="mt-5 space-y-3">
                      {col.rows.map((r) => (
                        <li key={r} className="flex items-start gap-2.5 text-[15px]">
                          {col.good ? (
                            <Check className="mt-0.5 size-4 shrink-0 text-brand" />
                          ) : (
                            <X className="mt-0.5 size-4 shrink-0 text-foreground/35" />
                          )}
                          <span className={col.good ? "" : "text-foreground/70"}>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Reveal>
              ))}
            </div>
          </Tile>
        </TileReveal>

        {/* Founder + build in public */}
        <TileReveal>
          <Tile tone="lime" className="px-6 py-16 md:px-12 md:py-24" aria-labelledby="founder-title">
            <div className="grid items-center gap-10 md:grid-cols-[auto_1fr]">
              <div className="flex flex-col items-center gap-5">
                <Image
                  src="/images/founder-portrait.jpg"
                  alt="Ayush, founder of GSCdaddy"
                  width={176}
                  height={176}
                  className="size-44 rounded-[2rem] object-cover shadow-[0_24px_50px_-24px_rgb(0_0_0/0.5)]"
                />
                <a
                  href="https://trustmrr.com/startup/gscdaddy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-foreground/60 underline underline-offset-4 hover:text-foreground"
                >
                  Revenue verified on TrustMRR
                </a>
              </div>
              <div>
                <Eyebrow>Built in public</Eyebrow>
                <h2 id="founder-title" className="mt-4 font-heading text-2xl leading-snug font-semibold tracking-tight md:text-[2rem]">
                  “{FOUNDER.quote}”
                </h2>
                <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-foreground/75">{FOUNDER.bio}</p>
                <p className="mt-4 text-sm font-medium">
                  {FOUNDER.name} · <span className="text-foreground/60">{FOUNDER.title}</span>
                </p>
              </div>
            </div>
            <ul className="mt-12 grid gap-3 md:grid-cols-3">
              {BUILD_IN_PUBLIC_TWEETS.map((t, i) => (
                <Reveal key={t.url} as="li" delay={i * 0.08}>
                  <a
                    href={t.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-full flex-col rounded-3xl p-6 ring-[1.5px] ring-foreground/60 transition-colors hover:bg-card/50"
                  >
                    <p className="line-clamp-6 flex-1 text-[15px] leading-relaxed whitespace-pre-line">{t.text}</p>
                    <p className="mt-5 text-xs font-semibold tracking-[0.12em] text-foreground/60 uppercase">
                      @ayu_theindiedev · {t.date}
                    </p>
                  </a>
                </Reveal>
              ))}
            </ul>
          </Tile>
        </TileReveal>

        {/* Pricing */}
        <TileReveal>
          <Tile tone="mist" id="pricing" className="px-6 py-16 md:px-12 md:py-24" aria-labelledby="pricing-title">
            <div className="mx-auto max-w-2xl text-center">
              <Eyebrow>Pricing</Eyebrow>
              <SectionTitle className="mt-4">
                <span id="pricing-title">Simple plans. Try any of them free.</span>
              </SectionTitle>
              <p className="mt-4 text-[15px] text-foreground/75">
                Every trial gets the Pro plan for 14 days. Pick a plan afterwards, or don’t.
              </p>
            </div>
            <div className="mt-10">
              <PricingCards />
            </div>
          </Tile>
        </TileReveal>

        {/* FAQ */}
        <TileReveal>
          <Tile tone="sky" id="faq" className="px-6 py-16 md:px-12 md:py-24" aria-labelledby="faq-title">
            <div className="mx-auto max-w-3xl">
              <div className="text-center">
                <Eyebrow>FAQ</Eyebrow>
                <SectionTitle className="mt-4">
                  <span id="faq-title">Frequently asked questions</span>
                </SectionTitle>
              </div>
              <div className="mt-10">
                <FaqList items={FAQ_ITEMS} />
              </div>
            </div>
          </Tile>
        </TileReveal>

        {/* Final CTA */}
        <TileReveal>
          <section className="relative overflow-hidden rounded-tile px-6 py-24 text-center md:py-32" aria-labelledby="cta-title">
            <div aria-hidden="true" className="absolute inset-0 bg-[oklch(0.62_0.11_240)]">
              <Image
                src="/marketing/hero-sky.jpg"
                alt=""
                fill
                sizes="(max-width: 1280px) 100vw, 1280px"
                className="object-cover object-bottom dark:brightness-[0.45] dark:saturate-[0.8]"
              />
            </div>
            <div className="relative mx-auto max-w-2xl">
              <h2
                id="cta-title"
                className="mt-6 font-heading text-4xl leading-[1.05] font-semibold tracking-[-0.03em] text-[oklch(0.27_0.09_245)] md:text-6xl dark:text-white"
              >
                Your next page-one keyword is already in Search Console.
              </h2>
              <p className="mt-5 text-lg text-[oklch(0.28_0.05_245)] dark:text-white/85">
                Connect in a minute and see your opportunities today. Free for 14 days.
              </p>
              <Link
                href="/login"
                className="group mt-8 inline-flex h-12 items-center gap-2 rounded-xl bg-ink px-6 text-[15px] font-medium text-ink-foreground shadow-[0_12px_30px_-12px_rgb(0_0_0/0.5)]"
              >
                Show me what I’m missing
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </section>
        </TileReveal>
      </main>
      <div className="mt-3 md:mt-4">
        <SiteFooter />
      </div>
      <JsonLd />
    </div>
  )
}

/** Halftone object cards (Higgsfield) that drift around the "Why" tile at different speeds. */
function FloatingObjects() {
  const objects = [
    { src: "/marketing/obj-magnifier.jpg", cls: "left-[3%] top-[7%] size-28 md:size-32", speed: 40, rot: "-rotate-6" },
    { src: "/marketing/obj-telescope.jpg", cls: "right-[5%] top-[5%] size-32 md:size-40", speed: 70, rot: "rotate-3" },
    { src: "/marketing/obj-compass.jpg", cls: "left-[8%] bottom-[20%] size-28 md:size-36", speed: 55, rot: "rotate-2" },
    { src: "/marketing/obj-target.jpg", cls: "right-[9%] bottom-[16%] size-24 md:size-28", speed: 35, rot: "-rotate-3" },
    { src: "/marketing/obj-ladder.jpg", cls: "left-[29%] -bottom-6 size-24 md:size-28", speed: 25, rot: "rotate-6" },
    { src: "/marketing/obj-stopwatch.jpg", cls: "right-[29%] -bottom-8 size-20 md:size-24", speed: 45, rot: "-rotate-6" },
  ]
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden md:block">
      {objects.map(({ src, cls, speed, rot }) => (
        <Parallax key={src} speed={speed} className={`absolute ${cls}`}>
          <div
            className={`relative size-full overflow-hidden rounded-2xl shadow-[0_18px_40px_-20px_rgb(0_0_0/0.45)] ring-4 ring-white/70 dark:ring-white/10 ${rot}`}
          >
            <Image src={src} alt="" fill sizes="160px" className="object-cover dark:brightness-90" />
          </div>
        </Parallax>
      ))}
    </div>
  )
}
