import type { Metadata } from "next"
import { DensityForm } from "./density-form"
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
  title: "Keyword Density Checker - Free Online Tool | GSCdaddy",
  description:
    "Analyze your content for keyword frequency and density. Check single words, 2-word and 3-word phrases to avoid keyword stuffing and optimize for SEO.",
  alternates: { canonical: "https://gscdaddy.com/tools/keyword-density-checker" },
  openGraph: {
    title: "Keyword Density Checker - Free Online Tool | GSCdaddy",
    description:
      "Free keyword density checker. Analyze word frequency and avoid over-optimization.",
    url: "https://gscdaddy.com/tools/keyword-density-checker",
    siteName: "GSCdaddy",
    locale: "en_US",
    type: "website",
    images: ["/opengraph-image"],
  },
}

const FAQS = [
  {
    question: "What is keyword density?",
    answer:
      "Keyword density is the percentage of times a keyword or phrase appears in your content compared to the total word count. For example, if a 500-word article mentions 'SEO tools' 10 times, the keyword density is 2%.",
  },
  {
    question: "What is the ideal keyword density for SEO?",
    answer:
      "There is no perfect keyword density, but most SEO experts recommend keeping it between 1% and 3%. Going above 4% can look like keyword stuffing to Google and may hurt your rankings. Focus on natural writing first, then check density.",
  },
  {
    question: "Does Google still care about keyword density?",
    answer:
      "Google does not use keyword density as a direct ranking factor. However, excessively repeating keywords (stuffing) can trigger spam filters. Google uses semantic understanding, so it is more important to cover a topic naturally than to hit a specific density number.",
  },
  {
    question: "What is the difference between 1-gram, 2-gram, and 3-gram analysis?",
    answer:
      "A 1-gram is a single word, a 2-gram (bigram) is a two-word phrase, and a 3-gram (trigram) is a three-word phrase. Checking all three helps you see both individual keyword frequency and how often multi-word phrases appear in your content.",
  },
  {
    question: "Should I optimize for keyword density or semantic coverage?",
    answer:
      "Semantic coverage is more important for modern SEO. Instead of repeating one keyword, cover related topics, synonyms, and questions that searchers might have. Keyword density checking is still useful as a guardrail against accidental over-optimization.",
  },
]

export default function KeywordDensityCheckerPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:py-24">
      <ToolJsonLd
        name="Keyword Density Checker"
        slug="keyword-density-checker"
        description="Analyze your content for keyword frequency and density to avoid over-optimization."
        faqs={FAQS}
      />


      <header className="rounded-tile bg-tile-lilac px-6 py-10 md:px-10 md:py-14">
        <p className="mb-4 text-xs font-semibold tracking-[0.14em] text-foreground/70 uppercase">Free tool</p>
        <h1 className="font-heading text-4xl leading-[1.05] font-semibold tracking-[-0.02em] md:text-5xl">
          Keyword Density Checker
        </h1>
        <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-foreground/75 md:text-base">
          Paste your content to analyze keyword frequency and density. Check
          single words, 2-word phrases, and 3-word phrases to keep your
          content naturally optimized.
        </p>
      </header>

      <div className="mt-10">
        <DensityForm />
      </div>

      <ToolCtaBanner />

      <ToolHowToSection
        steps={[
          { step: "Paste your content", description: "Copy the text from your blog post, landing page, or article into the text area." },
          { step: "Optionally enter a target keyword", description: "If you are optimizing for a specific keyword, enter it to see its density highlighted." },
          { step: "Click Analyze", description: "The tool will calculate word count, sentence count, and frequency tables for 1-word, 2-word, and 3-word phrases." },
          { step: "Review the density percentages", description: "Green (1-3%) is ideal. Yellow (3-4%) is borderline. Red (>4%) suggests possible keyword stuffing." },
        ]}
      />

      <ToolWhySection
        title="Why check keyword density?"
        reasons={[
          "Catch accidental keyword stuffing before publishing and risking a Google penalty.",
          "Identify which phrases dominate your content and whether they match your target keywords.",
          "Find content gaps where important related terms are missing from your writing.",
          "Compare your keyword usage against SEO best practices with color-coded density indicators.",
        ]}
      />

      <ToolFaqSection faqs={FAQS} />

      <RelatedToolsSection
        currentSlug="keyword-density-checker"
        slugs={["readability-checker", "keyword-calculator", "meta-tag-generator"]}
      />

      <RelatedPostsSection
        posts={[
          { slug: "low-hanging-fruit-keywords-gsc", title: "How to Find Low-Hanging Fruit Keywords in GSC" },
          { slug: "improve-ctr-google-search-console", title: "How to Improve CTR Using Google Search Console Data" },
        ]}
      />
    </div>
  )
}
