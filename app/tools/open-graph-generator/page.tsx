import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Logo } from "@/components/logo"
import { OgForm } from "./og-form"
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
  title: "Open Graph Generator - Free Online Tool | GSCdaddy",
  description:
    "Free open graph meta tag generator. Create OG and Twitter Card meta tags to control how your pages appear when shared on Facebook, Twitter, LinkedIn, and other social platforms.",
  alternates: { canonical: "https://gscdaddy.com/tools/open-graph-generator" },
  openGraph: {
    title: "Open Graph Generator - Free Online Tool | GSCdaddy",
    description:
      "Generate OG and Twitter Card meta tags in seconds. Preview your social share card and copy the code.",
    url: "https://gscdaddy.com/tools/open-graph-generator",
    siteName: "GSCdaddy",
    type: "website",
  },
}

const FAQS = [
  {
    question: "What are Open Graph meta tags?",
    answer:
      "Open Graph meta tags are snippets of HTML that control how your page title, description, and image appear when someone shares a URL on social media platforms like Facebook, LinkedIn, and Pinterest. Without them, platforms guess which content to display and often get it wrong.",
  },
  {
    question: "What is the difference between Open Graph tags and Twitter Card tags?",
    answer:
      "Open Graph tags (og:title, og:description, og:image) are used by most social platforms including Facebook and LinkedIn. Twitter Card tags (twitter:card, twitter:title, twitter:description) are specific to Twitter/X. Twitter will fall back to OG tags if no Twitter Card tags are present, but adding both gives you full control over how your content appears on every platform.",
  },
  {
    question: "What is the recommended og:image size?",
    answer:
      "The recommended Open Graph image size is 1200 x 630 pixels with an aspect ratio of 1.91:1. This size works well across Facebook, LinkedIn, and Twitter when using the summary_large_image card type. Keep the file size under 5 MB and use JPEG or PNG format for best compatibility.",
  },
  {
    question: "Do I need both OG and Twitter Card meta tags?",
    answer:
      "Strictly speaking, no. Twitter will fall back to Open Graph tags if Twitter-specific tags are missing. However, adding both gives you more control. For example, you might want a different title or description length on Twitter versus Facebook. The summary_large_image card type also has no direct OG equivalent.",
  },
  {
    question: "Where do I put Open Graph meta tags in my HTML?",
    answer:
      "Open Graph and Twitter Card meta tags go inside the <head> section of your HTML page. They must be present in the initial server-rendered HTML -- they cannot be injected by JavaScript after page load because social media crawlers do not execute JavaScript when fetching link previews.",
  },
]

export default function OpenGraphGeneratorPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:py-24">
      <ToolJsonLd
        name="Open Graph Generator"
        slug="open-graph-generator"
        description="Generate Open Graph and Twitter Card meta tags to control how your pages appear on social media."
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
          Open Graph Generator
        </h1>
        <p className="mt-3 max-w-xl text-muted-foreground">
          Control how your pages appear when shared on Facebook, Twitter,
          LinkedIn, and other social platforms. Fill in the fields below to
          generate your OG and Twitter Card meta tags instantly.
        </p>
      </header>

      <div className="mt-10">
        <OgForm />
      </div>

      <ToolCtaBanner />

      <ToolHowToSection
        steps={[
          { step: "Enter your page details", description: "Add the title, description, URL, and image URL you want to appear in social share cards." },
          { step: "Choose your card type", description: "Select the OG type (website, article, etc.) and Twitter Card format (summary or large image)." },
          { step: "Preview the social card", description: "See a live preview of how your link will look when shared on social media." },
          { step: "Copy the meta tags", description: "Click the copy button and paste the generated HTML into your page's <head> section." },
        ]}
      />

      <ToolWhySection
        title="Why use an Open Graph generator?"
        reasons={[
          "Control exactly how your pages look when shared on Facebook, Twitter, LinkedIn, and other platforms.",
          "Improve click-through rates from social media by crafting compelling titles, descriptions, and images.",
          "Maintain brand consistency across every platform where your content gets shared.",
          "Avoid broken or missing previews that make shared links look unprofessional and reduce engagement.",
        ]}
      />

      <ToolFaqSection faqs={FAQS} />

      <RelatedToolsSection
        currentSlug="open-graph-generator"
        slugs={["meta-tag-generator", "serp-preview", "slug-generator"]}
      />

      <RelatedPostsSection
        posts={[
          { slug: "improve-ctr-google-search-console", title: "How to Improve CTR Using Google Search Console" },
        ]}
      />
    </div>
  )
}
