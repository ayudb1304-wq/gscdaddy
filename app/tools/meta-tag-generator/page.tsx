import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Logo } from "@/components/logo"
import { GeneratorForm } from "./generator-form"
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
  title: "Meta Tag Generator - Free Online Tool | GSCdaddy",
  description:
    "Generate perfect HTML meta tags for SEO in seconds. Set title, description, robots directives, canonical URL, and more with this free meta tag generator.",
  alternates: { canonical: "https://gscdaddy.com/tools/meta-tag-generator" },
  openGraph: {
    title: "Meta Tag Generator - Free Online Tool | GSCdaddy",
    description:
      "Free meta tag generator. Create optimized HTML meta tags for better search engine visibility and click-through rates.",
    url: "https://gscdaddy.com/tools/meta-tag-generator",
    siteName: "GSCdaddy",
    type: "website",
  },
}

const FAQS = [
  {
    question: "What are meta tags and why do they matter for SEO?",
    answer:
      "Meta tags are HTML elements placed in the <head> section of a web page that provide metadata about the page to search engines and browsers. They influence how your page appears in search results, whether search engines index it, and how social platforms display shared links. Well-optimized meta tags can significantly improve your click-through rate from search results.",
  },
  {
    question: "What is the ideal length for a title tag?",
    answer:
      "Google typically displays the first 50-60 characters of a title tag in search results. Keeping your title under 60 characters ensures it won't be truncated. Place your most important keywords near the beginning of the title for maximum SEO impact.",
  },
  {
    question: "How long should a meta description be?",
    answer:
      "Meta descriptions should be between 120 and 160 characters. Google may display up to 160 characters on desktop and around 120 on mobile. A compelling meta description that fits within this limit can improve your click-through rate from search results.",
  },
  {
    question: "What do the robots meta tag directives mean?",
    answer:
      "The robots meta tag controls how search engines crawl and index your page. 'index' tells search engines to include the page in their index, while 'noindex' tells them to exclude it. 'follow' means search engines should follow the links on the page, and 'nofollow' means they should not. The default behavior is 'index, follow' if no robots tag is specified.",
  },
  {
    question: "What is a canonical tag and when should I use it?",
    answer:
      "A canonical tag (rel='canonical') tells search engines which version of a page is the primary one when duplicate or very similar content exists at multiple URLs. Use it when you have the same content accessible via different URLs, such as pages with query parameters, www vs non-www versions, or HTTP vs HTTPS. This prevents duplicate content issues and consolidates ranking signals to a single URL.",
  },
]

export default function MetaTagGeneratorPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:py-24">
      <ToolJsonLd
        name="Meta Tag Generator"
        slug="meta-tag-generator"
        description="Generate optimized HTML meta tags for better SEO and search engine visibility."
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
          Meta Tag Generator
        </h1>
        <p className="mt-3 max-w-xl text-muted-foreground">
          Generate SEO-friendly HTML meta tags in seconds. Fill in your page
          details, configure robots directives, and copy the generated tags
          straight into your HTML.
        </p>
      </header>

      <div className="mt-10">
        <GeneratorForm />
      </div>

      <ToolCtaBanner />

      <ToolHowToSection
        steps={[
          { step: "Fill in your page details", description: "Enter your page title, meta description, keywords, author, and canonical URL." },
          { step: "Configure robots directives", description: "Choose whether search engines should index and follow links on your page." },
          { step: "Generate the meta tags", description: "Click the generate button to create your HTML meta tags instantly." },
          { step: "Copy and paste into your HTML", description: "Copy the generated tags and paste them into the <head> section of your HTML document." },
        ]}
      />

      <ToolWhySection
        title="Why use a meta tag generator?"
        reasons={[
          "Properly formatted meta tags help search engines understand your page content and rank it for relevant queries.",
          "A compelling title and description can significantly increase your click-through rate from search results.",
          "Robots directives give you control over which pages get indexed and how search engines crawl your site.",
          "Canonical tags prevent duplicate content issues that can dilute your ranking power across multiple URLs.",
        ]}
      />

      <ToolFaqSection faqs={FAQS} />

      <RelatedToolsSection
        currentSlug="meta-tag-generator"
        slugs={["open-graph-generator", "serp-preview", "robots-txt-generator"]}
      />

      <RelatedPostsSection
        posts={[
          { slug: "improve-ctr-google-search-console", title: "How to Improve CTR Using Google Search Console" },
          { slug: "google-search-console-beginners-guide", title: "Google Search Console: The Complete Beginner's Guide" },
        ]}
      />
    </div>
  )
}
