import { strikingDistanceKeywordsGuide } from "@/content/blog/striking-distance-keywords-guide"
import { lowHangingFruitKeywordsGsc } from "@/content/blog/low-hanging-fruit-keywords-gsc"
import { googleSearchConsoleBeginnersGuide } from "@/content/blog/google-search-console-beginners-guide"
import { improveCtrGoogleSearchConsole } from "@/content/blog/improve-ctr-google-search-console"
import { ahrefsVsSemrushVsGoogleSearchConsole } from "@/content/blog/ahrefs-vs-semrush-vs-google-search-console"
import { keywordCannibalizationGoogleSearchConsole } from "@/content/blog/keyword-cannibalization-google-search-console"
import { googleSearchConsoleAlternatives } from "@/content/blog/google-search-console-alternatives"
import { whatIsCtrSeo } from "@/content/blog/what-is-ctr-seo"
import { googleSearchConsoleWordpressSetup } from "@/content/blog/google-search-console-wordpress-setup"
import { contentAuditGoogleSearchConsole } from "@/content/blog/content-audit-google-search-console"
import { whatIsCrawlBudget } from "@/content/blog/what-is-crawl-budget"
import { whatIsKeywordDifficulty } from "@/content/blog/what-is-keyword-difficulty"
import { whatIsSearchIntent } from "@/content/blog/what-is-search-intent"
import { whatIsContentDecay } from "@/content/blog/what-is-content-decay"
import { whatIsLongTailKeywords } from "@/content/blog/what-is-long-tail-keywords"
import { moveKeywordsPage2ToPage1 } from "@/content/blog/move-keywords-page-2-to-page-1"
import { ahrefsAlternatives } from "@/content/blog/ahrefs-alternatives"
import { semrushAlternatives } from "@/content/blog/semrush-alternatives"
import { mozAlternatives } from "@/content/blog/moz-alternatives"
import { gscdaddyDogfoodingWeek3 } from "@/content/blog/gscdaddy-dogfooding-week-3"
import { freeSeoAuditChecklist } from "@/content/blog/free-seo-audit-checklist"
import { whatIsDomainAuthority } from "@/content/blog/what-is-domain-authority"
import { whatIsABacklink } from "@/content/blog/what-is-a-backlink"
import { whatIsIndexingInSeo } from "@/content/blog/what-is-indexing-in-seo"

export interface BlogPost {
  slug: string
  title: string
  description: string
  content: string
  publishedAt: string
  updatedAt?: string
  author: {
    name: string
    url: string
  }
  tags: string[]
  schema?: ("FAQPage" | "HowTo")[]
  faqs?: { question: string; answer: string }[]
}

const posts: BlogPost[] = [
  strikingDistanceKeywordsGuide,
  lowHangingFruitKeywordsGsc,
  googleSearchConsoleBeginnersGuide,
  improveCtrGoogleSearchConsole,
  ahrefsVsSemrushVsGoogleSearchConsole,
  keywordCannibalizationGoogleSearchConsole,
  googleSearchConsoleAlternatives,
  whatIsCtrSeo,
  googleSearchConsoleWordpressSetup,
  contentAuditGoogleSearchConsole,
  whatIsCrawlBudget,
  whatIsKeywordDifficulty,
  whatIsSearchIntent,
  whatIsContentDecay,
  whatIsLongTailKeywords,
  moveKeywordsPage2ToPage1,
  ahrefsAlternatives,
  semrushAlternatives,
  mozAlternatives,
  gscdaddyDogfoodingWeek3,
  freeSeoAuditChecklist,
  whatIsDomainAuthority,
  whatIsABacklink,
  whatIsIndexingInSeo,
]

export function getAllPosts(): BlogPost[] {
  return posts
    .slice()
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    )
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return posts.find((p) => p.slug === slug)
}

export function getAllSlugs(): string[] {
  return posts.map((p) => p.slug)
}

export function getReadingTime(content: string): number {
  const text = content.replace(/<[^>]*>/g, "")
  const words = text.trim().split(/\s+/).length
  return Math.max(1, Math.round(words / 230))
}

export function extractHeadings(
  content: string
): { id: string; text: string; level: number }[] {
  const regex = /<h([23])[^>]*>(.+?)<\/h\1>/gi
  const headings: { id: string; text: string; level: number }[] = []
  let match
  while ((match = regex.exec(content)) !== null) {
    const text = match[2].replace(/<[^>]*>/g, "")
    const id = text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
    headings.push({ id, text, level: parseInt(match[1], 10) })
  }
  return headings
}

export function addHeadingIds(content: string): string {
  return content.replace(/<h([23])([^>]*)>(.+?)<\/h\1>/gi, (_match, level, attrs, text) => {
    const plain = text.replace(/<[^>]*>/g, "")
    const id = plain
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
    return `<h${level}${attrs} id="${id}">${text}</h${level}>`
  })
}
