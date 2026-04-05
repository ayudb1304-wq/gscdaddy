import type { MetadataRoute } from "next"
import { getAllPosts } from "@/lib/blog"

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://gscdaddy.com"

  const pages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      images: [`${baseUrl}/images/dashboard-screenshot.png`],
    },
    { url: `${baseUrl}/blog`, lastModified: new Date() },
    { url: `${baseUrl}/tools/keyword-calculator`, lastModified: new Date() },
    { url: `${baseUrl}/login`, lastModified: new Date() },
    { url: `${baseUrl}/privacy`, lastModified: new Date() },
    { url: `${baseUrl}/terms`, lastModified: new Date() },
  ]

  const blogPosts: MetadataRoute.Sitemap = getAllPosts().map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt ?? post.publishedAt),
    images: [`${baseUrl}/images/filters.png`],
  }))

  return [...pages, ...blogPosts]
}
