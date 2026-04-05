import { strikingDistanceKeywordsGuide } from "@/content/blog/striking-distance-keywords-guide"
import { lowHangingFruitKeywordsGsc } from "@/content/blog/low-hanging-fruit-keywords-gsc"

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
