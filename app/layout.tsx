import { Inter, JetBrains_Mono, Oxanium } from "next/font/google"
import type { Metadata } from "next"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
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

export const metadata: Metadata = {
  title: "GSCdaddy - Find Your Almost-Ranking Keywords",
  description:
    "GSCdaddy connects to your Google Search Console and shows you which pages are close to page 1 - plus AI-powered action plans to get them there.",
  keywords: [
    "Google Search Console",
    "SEO analytics",
    "striking distance keywords",
    "search console tool",
    "SEO recommendations",
  ],
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
    title: "GSCdaddy - Find Your Almost-Ranking Keywords",
    description:
      "Turn your Google Search Console data into actionable insights.",
  },
  robots: { index: true, follow: true },
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
        jetbrainsMono.variable
      )}
    >
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
