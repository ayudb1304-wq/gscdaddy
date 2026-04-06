import { Inter, JetBrains_Mono, Oxanium, Caveat } from "next/font/google"
import type { Metadata } from "next"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Analytics } from "@vercel/analytics/next"
import { cn } from "@/lib/utils"

const oxanium = Oxanium({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
})

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-cursive",
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL("https://gscdaddy.com"),
  title: "GSCdaddy - Find Your Almost-Ranking Keywords",
  description:
    "Stop guessing which SEO fixes matter. GSCdaddy finds your almost-ranking keywords and builds AI action plans to push them to page 1. Free 14-day trial.",
  keywords: [
    "Google Search Console",
    "SEO analytics",
    "striking distance keywords",
    "search console tool",
    "SEO recommendations",
    "GSC tool",
    "keyword ranking tracker",
    "SEO action plan",
  ],
  authors: [{ name: "Ayush", url: "https://x.com/ayu_theindiedev" }],
  alternates: {
    canonical: "https://gscdaddy.com",
    types: {
      "application/rss+xml": "https://gscdaddy.com/feed.xml",
    },
  },
  openGraph: {
    title: "GSCdaddy - Find Your Almost-Ranking Keywords",
    description:
      "Turn your Google Search Console data into actionable insights. Track rankings, discover opportunities, and grow your organic traffic.",
    url: "https://gscdaddy.com",
    siteName: "GSCdaddy",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    creator: "@ayu_theindiedev",
    title: "GSCdaddy - Find Your Almost-Ranking Keywords",
    description:
      "Turn your Google Search Console data into actionable insights.",
  },
  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        inter.variable,
        oxanium.variable,
        jetbrainsMono.variable,
        caveat.variable
      )}
    >
      <body>
        <ThemeProvider>{children}</ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
