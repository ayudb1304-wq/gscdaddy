import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Logo } from "@/components/logo"
import { ReadabilityForm } from "./readability-form"
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
  title: "Readability Score Checker - Free Online Tool | GSCdaddy",
  description:
    "Check the readability of your content with Flesch Reading Ease, Flesch-Kincaid Grade Level, and Gunning Fog Index. Get actionable recommendations to improve your writing.",
  alternates: { canonical: "https://gscdaddy.com/tools/readability-checker" },
  openGraph: {
    title: "Readability Score Checker - Free Online Tool | GSCdaddy",
    description:
      "Free readability checker. Get Flesch-Kincaid, Gunning Fog, and more scores for your content.",
    url: "https://gscdaddy.com/tools/readability-checker",
    siteName: "GSCdaddy",
    type: "website",
  },
}

const FAQS = [
  {
    question: "What is Flesch Reading Ease?",
    answer:
      "Flesch Reading Ease is a readability formula that scores text on a 0-100 scale. Higher scores mean easier reading. A score of 60-70 is considered ideal for web content — understandable by 13-15 year olds. The formula considers average sentence length and average syllables per word.",
  },
  {
    question: "What is a good Flesch-Kincaid Grade Level for blog posts?",
    answer:
      "For most blog posts and web content, aim for a grade level of 6-8. This means your content is understandable by a typical 6th to 8th grader. Studies show that even college-educated adults prefer reading at this level online because it requires less cognitive effort.",
  },
  {
    question: "What is the Gunning Fog Index?",
    answer:
      "The Gunning Fog Index estimates the years of formal education needed to understand a text on first reading. A fog index of 12 requires a high school senior reading level. For web content, aim for a fog index below 10.",
  },
  {
    question: "Does readability affect SEO rankings?",
    answer:
      "Google has not confirmed readability as a direct ranking factor. However, content that is easier to read tends to have lower bounce rates, longer time on page, and higher engagement — all of which are positive user signals. Readable content also earns more backlinks and social shares.",
  },
  {
    question: "How can I improve my readability score?",
    answer:
      "Use shorter sentences (under 20 words), choose simpler words over complex ones, break content into short paragraphs, use subheadings and bullet points, and avoid jargon unless writing for a technical audience. Reading your content aloud helps identify awkward phrasing.",
  },
]

export default function ReadabilityCheckerPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:py-24">
      <ToolJsonLd
        name="Readability Score Checker"
        slug="readability-checker"
        description="Check the readability of your content with Flesch-Kincaid, Gunning Fog, and more."
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
          Readability Score Checker
        </h1>
        <p className="mt-3 max-w-xl text-muted-foreground">
          Check how easy your content is to read. Get Flesch Reading Ease,
          Flesch-Kincaid Grade Level, and Gunning Fog scores with actionable
          recommendations.
        </p>
      </header>

      <div className="mt-10">
        <ReadabilityForm />
      </div>

      <ToolCtaBanner />

      <ToolHowToSection
        steps={[
          { step: "Paste your content", description: "Copy the text from your blog post or article into the text area." },
          { step: "Click Check Readability", description: "The tool calculates three readability formulas and provides detailed stats." },
          { step: "Review your scores", description: "Check the visual gauge and grade interpretation for each formula." },
          { step: "Follow the recommendations", description: "Use the suggestions to simplify your writing and improve engagement." },
        ]}
      />

      <ToolWhySection
        title="Why check readability?"
        reasons={[
          "Content written at a 6th-8th grade level gets more engagement, even from educated readers.",
          "Lower readability scores correlate with higher bounce rates and shorter time on page.",
          "Readable content earns more backlinks and social shares, boosting your SEO indirectly.",
          "Catch overly complex sentences and jargon before publishing your content.",
        ]}
      />

      <ToolFaqSection faqs={FAQS} />

      <RelatedToolsSection
        currentSlug="readability-checker"
        slugs={["keyword-density-checker", "keyword-calculator", "serp-preview"]}
      />

      <RelatedPostsSection
        posts={[
          { slug: "improve-ctr-google-search-console", title: "How to Improve CTR Using Google Search Console Data" },
          { slug: "low-hanging-fruit-keywords-gsc", title: "How to Find Low-Hanging Fruit Keywords in GSC" },
        ]}
      />
    </div>
  )
}
