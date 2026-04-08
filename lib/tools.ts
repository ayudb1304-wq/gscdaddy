export interface ToolMeta {
  slug: string
  name: string
  description: string
  icon: string // lucide-react icon name
  category: "Calculator" | "Generator" | "Checker" | "Preview"
}

export const TOOLS: ToolMeta[] = [
  {
    slug: "keyword-calculator",
    name: "Keyword Opportunity Calculator",
    description:
      "Estimate how much traffic you could gain by improving your Google ranking position.",
    icon: "TrendingUp",
    category: "Calculator",
  },
  {
    slug: "serp-preview",
    name: "SERP Snippet Preview",
    description:
      "Preview how your page will look in Google search results before publishing.",
    icon: "Eye",
    category: "Preview",
  },
  {
    slug: "meta-tag-generator",
    name: "Meta Tag Generator",
    description:
      "Generate SEO-optimized HTML meta tags for your web pages with proper character limits.",
    icon: "Code",
    category: "Generator",
  },
  {
    slug: "open-graph-generator",
    name: "Open Graph Generator",
    description:
      "Create Open Graph and Twitter Card meta tags to control how your pages appear on social media.",
    icon: "Share2",
    category: "Generator",
  },
  {
    slug: "slug-generator",
    name: "Slug Generator",
    description:
      "Convert page titles and text into SEO-friendly URL slugs instantly.",
    icon: "Link",
    category: "Generator",
  },
  {
    slug: "robots-txt-generator",
    name: "Robots.txt Generator",
    description:
      "Create a robots.txt file to control how search engines crawl your website.",
    icon: "Bot",
    category: "Generator",
  },
  {
    slug: "keyword-density-checker",
    name: "Keyword Density Checker",
    description:
      "Analyze your content for keyword frequency and density to avoid over-optimization.",
    icon: "BarChart3",
    category: "Checker",
  },
  {
    slug: "readability-checker",
    name: "Readability Score Checker",
    description:
      "Check the readability of your content with Flesch-Kincaid, Gunning Fog, and more.",
    icon: "BookOpen",
    category: "Checker",
  },
]

export function getRelatedTools(currentSlug: string, count = 3): ToolMeta[] {
  return TOOLS.filter((t) => t.slug !== currentSlug).slice(0, count)
}
