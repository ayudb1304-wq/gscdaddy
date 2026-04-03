import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/dashboard/", "/reports/", "/settings/", "/onboarding/"],
    },
    sitemap: "https://gscdaddy.com/sitemap.xml",
  }
}
