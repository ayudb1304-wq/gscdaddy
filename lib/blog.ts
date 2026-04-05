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
