import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Logo } from "@/components/logo"
import { RobotsForm } from "./robots-form"
import {
  ToolJsonLd,
  ToolCtaBanner,
  ToolHowToSection,
  ToolWhySection,
  ToolFaqSection,
  RelatedToolsSection,
  RelatedPostsSection,
} from "@/components/tool-page-sections"

export const metadata: Metadata = {
  title: "Robots.txt Generator - Free Online Tool | GSCdaddy",
  description:
    "Generate a robots.txt file to control how search engines crawl your website. Includes presets for blocking AI bots, standard blogs, and custom rules.",
  alternates: { canonical: "https://gscdaddy.com/tools/robots-txt-generator" },
  openGraph: {
    title: "Robots.txt Generator - Free Online Tool | GSCdaddy",
    description:
      "Free robots.txt generator. Control how Googlebot and other crawlers access your site.",
    url: "https://gscdaddy.com/tools/robots-txt-generator",
    siteName: "GSCdaddy",
    type: "website",
  },
}

const FAQS = [
  {
    question: "What is a robots.txt file?",
    answer:
      "A robots.txt file is a plain text file placed at the root of your website (e.g. yoursite.com/robots.txt) that tells search engine crawlers which pages or sections they are allowed or not allowed to access. It follows the Robots Exclusion Protocol standard.",
  },
  {
    question: "Does robots.txt block pages from appearing in Google?",
    answer:
      "No. robots.txt prevents crawling, not indexing. If other sites link to a page you've disallowed in robots.txt, Google may still index it based on external signals. To prevent indexing, use a 'noindex' meta robots tag instead.",
  },
  {
    question: "Should I block AI bots in my robots.txt?",
    answer:
      "It depends on whether you want AI companies to use your content for training. Bots like GPTBot (OpenAI), Google-Extended (Gemini training), and CCBot (Common Crawl) can be blocked if you want to opt out of AI training while still allowing regular search crawlers.",
  },
  {
    question: "Where do I put my robots.txt file?",
    answer:
      "The robots.txt file must be placed in the root directory of your website so it's accessible at yoursite.com/robots.txt. In Next.js, you can create a robots.ts file in your app directory that generates it automatically.",
  },
  {
    question: "What is crawl-delay and should I use it?",
    answer:
      "Crawl-delay tells bots to wait a specified number of seconds between requests. Google ignores this directive (use Google Search Console's crawl rate setting instead), but Bing and other bots respect it. Use it if your server is struggling with crawl load.",
  },
]

export default function RobotsTxtGeneratorPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:py-24">
      <ToolJsonLd
        name="Robots.txt Generator"
        slug="robots-txt-generator"
        description="Generate a robots.txt file to control how search engines crawl your website."
        faqs={FAQS}
      />

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
          Robots.txt Generator
        </h1>
        <p className="mt-3 max-w-xl text-muted-foreground">
          Create a robots.txt file to control how search engines and AI bots
          crawl your website. Use presets or build custom rules.
        </p>
      </header>

      <div className="mt-10">
        <RobotsForm />
      </div>

      <ToolCtaBanner />

      <ToolHowToSection
        steps={[
          { step: "Choose a preset or add custom rules", description: "Start with a preset like 'Standard Blog' or 'Block AI Bots', then customize." },
          { step: "Add your sitemap URL", description: "Include your XML sitemap so search engines can find all your pages." },
          { step: "Review the generated robots.txt", description: "Check the output to make sure the rules match your intent." },
          { step: "Copy or download the file", description: "Save it as robots.txt and upload it to the root of your website." },
        ]}
      />

      <ToolWhySection
        title="Why use a robots.txt generator?"
        reasons={[
          "Prevent search engines from crawling duplicate, private, or thin content pages.",
          "Block AI training bots like GPTBot and CCBot from scraping your content.",
          "Point crawlers to your sitemap for faster and more complete indexing.",
          "Avoid syntax errors that could accidentally block important pages from Google.",
        ]}
      />

      <ToolFaqSection faqs={FAQS} />

      <RelatedToolsSection
        currentSlug="robots-txt-generator"
        slugs={["meta-tag-generator", "slug-generator", "keyword-calculator"]}
      />

      <RelatedPostsSection
        posts={[
          { slug: "google-search-console-beginners-guide", title: "Google Search Console: The Complete Beginner's Guide" },
        ]}
      />
    </div>
  )
}
