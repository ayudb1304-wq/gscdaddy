import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Logo } from "@/components/logo"
import { SerpForm } from "./serp-form"
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
  title: "SERP Snippet Preview - Free Online Tool | GSCdaddy",
  description:
    "Preview how your page looks in Google search results. Optimize your title tag and meta description length to maximize click-through rates with this free google serp preview tool.",
  alternates: { canonical: "https://gscdaddy.com/tools/serp-preview" },
  openGraph: {
    title: "SERP Snippet Preview - Free Online Tool | GSCdaddy",
    description:
      "Free SERP snippet preview tool. See exactly how your page will appear in Google search results before you publish.",
    url: "https://gscdaddy.com/tools/serp-preview",
    siteName: "GSCdaddy",
    type: "website",
  },
}

const FAQS = [
  {
    question: "What is a SERP snippet?",
    answer:
      "A SERP snippet is the block of text that Google displays for each search result. It typically includes a blue title link, a green URL, and a gray description pulled from your page's meta description or page content.",
  },
  {
    question: "What is the ideal title tag length for Google?",
    answer:
      "Google typically displays the first 50-60 characters of a title tag. Titles longer than 60 characters may be truncated with an ellipsis. Aim for under 60 characters to ensure your full title is visible in search results.",
  },
  {
    question: "What is the ideal meta description length?",
    answer:
      "Google usually shows up to 155-160 characters of a meta description on desktop. On mobile, it may be shorter. Keep your meta description under 160 characters and front-load the most important information.",
  },
  {
    question: "Does the meta description affect my Google ranking?",
    answer:
      "Meta descriptions are not a direct ranking factor. However, a compelling meta description can significantly improve your click-through rate (CTR), which may indirectly influence rankings over time. Google also sometimes bolds keywords in the description that match the search query.",
  },
  {
    question: "Why does Google sometimes show a different snippet than my meta description?",
    answer:
      "Google may rewrite your snippet if it believes other content on your page better matches the user's search query. This is common when the meta description is missing, too short, or not relevant to the specific search term. Writing specific, keyword-rich meta descriptions reduces the chance of Google overriding them.",
  },
]

export default function SerpPreviewPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:py-24">
      <ToolJsonLd
        name="SERP Snippet Preview"
        slug="serp-preview"
        description="Preview how your page appears in Google search results. Optimize title tags and meta descriptions for maximum CTR."
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
          SERP Snippet Preview
        </h1>
        <p className="mt-3 max-w-xl text-muted-foreground">
          See exactly how your page will look in Google search results. Craft the
          perfect title tag and meta description to maximize your click-through
          rate.
        </p>
      </header>

      <div className="mt-10">
        <SerpForm />
      </div>

      <ToolCtaBanner />

      <ToolHowToSection
        steps={[
          { step: "Enter your title tag", description: "Type the title you want to appear in search results. Keep it under 60 characters." },
          { step: "Write your meta description", description: "Add a compelling description under 160 characters that encourages clicks." },
          { step: "Preview your snippet", description: "See a live Google-styled preview and fine-tune your text until it looks perfect." },
        ]}
      />

      <ToolWhySection
        title="Why preview your SERP snippet?"
        reasons={[
          "Avoid truncated titles and descriptions that hurt your click-through rate.",
          "Craft more compelling snippets that stand out from competing search results.",
          "Test different title and description variations before publishing changes.",
          "Ensure your most important keywords and calls-to-action are visible in the snippet.",
        ]}
      />

      <ToolFaqSection faqs={FAQS} />

      <RelatedToolsSection
        currentSlug="serp-preview"
        slugs={["meta-tag-generator", "open-graph-generator", "keyword-calculator"]}
      />

      <RelatedPostsSection
        posts={[
          { slug: "improve-ctr-google-search-console", title: "How to Improve CTR Using Google Search Console" },
          { slug: "striking-distance-keywords-guide", title: "The Complete Guide to Striking Distance Keywords" },
        ]}
      />
    </div>
  )
}
