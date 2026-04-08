import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Logo } from "@/components/logo"
import { SlugForm } from "./slug-form"
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
  title: "Slug Generator - Free URL Slug Tool | GSCdaddy",
  description:
    "Convert page titles and text into clean, SEO-friendly URL slugs. Supports custom separators, stop word removal, and bulk slug generation.",
  alternates: { canonical: "https://gscdaddy.com/tools/slug-generator" },
  openGraph: {
    title: "Slug Generator - Free URL Slug Tool | GSCdaddy",
    description:
      "Free slug generator. Convert titles into SEO-friendly URL slugs instantly.",
    url: "https://gscdaddy.com/tools/slug-generator",
    siteName: "GSCdaddy",
    type: "website",
  },
}

const FAQS = [
  {
    question: "What is a URL slug?",
    answer:
      "A URL slug is the part of a web address that comes after the domain name and identifies a specific page. For example, in gscdaddy.com/blog/seo-tips, the slug is 'seo-tips'. A good slug is short, descriptive, and uses hyphens to separate words.",
  },
  {
    question: "Why are SEO-friendly slugs important?",
    answer:
      "SEO-friendly slugs help search engines understand what a page is about. They also improve click-through rates because users can read the URL and know what to expect. Google recommends using simple, descriptive URLs with hyphens between words.",
  },
  {
    question: "Should I use hyphens or underscores in URLs?",
    answer:
      "Google recommends hyphens (-) over underscores (_) in URLs. Google treats hyphens as word separators but treats underscores as word joiners. So 'seo-tips' is read as two words, while 'seo_tips' may be read as one.",
  },
  {
    question: "Should I remove stop words from slugs?",
    answer:
      "It depends. Removing common stop words like 'the', 'a', 'and', 'in' makes slugs shorter and cleaner. However, sometimes stop words are needed for clarity. 'how-to-fix-404-errors' reads better than 'fix-404-errors'.",
  },
  {
    question: "What is the ideal URL slug length?",
    answer:
      "Google can handle long URLs but shorter slugs are better for users and sharing. Aim for 3-5 words (under 60 characters). Very long slugs get truncated in search results and are harder to share on social media.",
  },
]

export default function SlugGeneratorPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:py-24">
      <ToolJsonLd
        name="Slug Generator"
        slug="slug-generator"
        description="Convert page titles and text into clean, SEO-friendly URL slugs."
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
          Slug Generator
        </h1>
        <p className="mt-3 max-w-xl text-muted-foreground">
          Convert page titles and text into clean, SEO-friendly URL slugs.
          Supports custom separators, stop word removal, and bulk generation.
        </p>
      </header>

      <div className="mt-10">
        <SlugForm />
      </div>

      <ToolCtaBanner />

      <ToolHowToSection
        steps={[
          { step: "Enter your page title or text", description: "Type or paste the text you want to convert into a URL slug." },
          { step: "Adjust options", description: "Choose your separator, toggle lowercase, and enable stop word removal if needed." },
          { step: "Copy the slug", description: "Click the copy button to copy the generated slug to your clipboard." },
        ]}
      />

      <ToolWhySection
        title="Why use a slug generator?"
        reasons={[
          "Create consistent, clean URLs across your entire website.",
          "Avoid common slug mistakes like special characters, spaces, or double hyphens.",
          "Bulk convert multiple titles at once to save time when setting up many pages.",
          "Follow Google's URL best practices automatically without memorizing the rules.",
        ]}
      />

      <ToolFaqSection faqs={FAQS} />

      <RelatedToolsSection
        currentSlug="slug-generator"
        slugs={["meta-tag-generator", "robots-txt-generator", "serp-preview"]}
      />

      <RelatedPostsSection
        posts={[
          { slug: "google-search-console-beginners-guide", title: "Google Search Console: The Complete Beginner's Guide" },
        ]}
      />
    </div>
  )
}
