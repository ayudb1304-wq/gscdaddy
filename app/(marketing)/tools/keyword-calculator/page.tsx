import type { Metadata } from "next"
import { CalculatorForm } from "./calculator-form"
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
  title: "Keyword Opportunity Calculator - Free SEO Tool | GSCdaddy",
  description:
    "Estimate how much traffic you could gain by improving your Google ranking. Enter your current position, impressions, and CTR to see projected clicks.",
  alternates: { canonical: "https://gscdaddy.com/tools/keyword-calculator" },
  openGraph: {
    title: "Keyword Opportunity Calculator - Free SEO Tool | GSCdaddy",
    description:
      "Free SEO calculator. See how many clicks you are leaving on the table based on your current Google position.",
    url: "https://gscdaddy.com/tools/keyword-calculator",
    siteName: "GSCdaddy",
    locale: "en_US",
    type: "website",
    images: ["/opengraph-image"],
  },
}

const FAQS = [
  {
    question: "How accurate are the CTR benchmarks used in this calculator?",
    answer:
      "The benchmarks are based on aggregated data across millions of search results. Your actual CTR will vary depending on your industry, search intent, SERP features, and how compelling your title tag and meta description are.",
  },
  {
    question: "What is a striking distance keyword?",
    answer:
      "A striking distance keyword is one where your page ranks between positions 5 and 15 in Google. These keywords are close enough to page 1 that small optimizations can push them up and significantly increase your traffic.",
  },
  {
    question: "How do I find my current position and impressions?",
    answer:
      "You can find this data in Google Search Console under the Performance report. Filter by a specific query to see its average position, impressions, clicks, and CTR.",
  },
  {
    question: "Why does position 1 get so many more clicks than position 5?",
    answer:
      "Studies show position 1 gets roughly 28% of all clicks, while position 5 gets about 6.5%. Most users click one of the top 3 results. Moving from position 5 to position 1 can increase your clicks by 4x or more.",
  },
  {
    question: "Can I use this calculator for YouTube or Amazon rankings?",
    answer:
      "This calculator uses Google Search CTR benchmarks specifically. YouTube and Amazon have different click-through rate distributions, so the projections would not be accurate for those platforms.",
  },
]

export default function KeywordCalculatorPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:py-24">
      <ToolJsonLd
        name="Keyword Opportunity Calculator"
        slug="keyword-calculator"
        description="Estimate how much traffic you could gain by improving your Google ranking position."
        faqs={FAQS}
      />


      <header className="rounded-tile bg-tile-lime px-6 py-10 md:px-10 md:py-14">
        <p className="mb-4 text-xs font-semibold tracking-[0.14em] text-foreground/70 uppercase">Free tool</p>
        <h1 className="font-heading text-4xl leading-[1.05] font-semibold tracking-[-0.02em] md:text-5xl">
          Keyword Opportunity Calculator
        </h1>
        <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-foreground/75 md:text-base">
          See how many clicks you are leaving on the table. Enter your current
          Google position, monthly impressions, and CTR to estimate the traffic
          you could gain by ranking higher.
        </p>
      </header>

      <div className="mt-10">
        <CalculatorForm />
      </div>

      <ToolCtaBanner />

      <ToolHowToSection
        steps={[
          { step: "Enter your current position", description: "Find this in Google Search Console under Performance → Queries." },
          { step: "Add your monthly impressions", description: "The number of times your page appeared in search results for that keyword." },
          { step: "Enter your current CTR", description: "Your click-through rate as a percentage. GSC shows this in the Performance report." },
          { step: "Review the projections", description: "See how many extra clicks you could get by moving to positions 1, 3, or 5." },
        ]}
      />

      <ToolWhySection
        title="Why use this calculator?"
        reasons={[
          "Prioritize which keywords to optimize first based on the biggest traffic opportunity.",
          "Quantify the business case for SEO improvements with concrete click projections.",
          "Understand the relationship between Google position and click-through rates.",
          "Identify striking distance keywords where small ranking gains mean big traffic jumps.",
        ]}
      />

      <ToolFaqSection faqs={FAQS} />

      <RelatedToolsSection
        currentSlug="keyword-calculator"
        slugs={["keyword-density-checker", "serp-preview", "readability-checker"]}
      />

      <RelatedPostsSection
        posts={[
          { slug: "striking-distance-keywords-guide", title: "The Complete Guide to Striking Distance Keywords" },
          { slug: "low-hanging-fruit-keywords-gsc", title: "How to Find Low-Hanging Fruit Keywords in GSC" },
        ]}
      />
    </div>
  )
}
