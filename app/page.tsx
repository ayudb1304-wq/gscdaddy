import { Navigation } from "@/components/landing/Navigation"
import { Hero } from "@/components/landing/Hero"
import { TrustBar } from "@/components/landing/TrustBar"
import { ProblemSection } from "@/components/landing/ProblemSection"
import { HowItWorks } from "@/components/landing/HowItWorks"
import { Features } from "@/components/landing/Features"
import { Comparison } from "@/components/landing/Comparison"
import { FounderSection } from "@/components/landing/FounderSection"
import { BuildInPublic } from "@/components/landing/BuildInPublic"
import { BlogSection } from "@/components/landing/BlogSection"
import { Pricing } from "@/components/landing/Pricing"
import { FAQ } from "@/components/landing/FAQ"
import { FinalCTA } from "@/components/landing/FinalCTA"
import { Footer } from "@/components/landing/Footer"
import { FAQ_ITEMS, PRICING_TIERS } from "@/lib/constants"

function JsonLd() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  }

  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "GSCdaddy",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description:
      "Google Search Console analytics tool that finds striking-distance keywords and provides AI-powered action plans.",
    offers: PRICING_TIERS.map((tier) => ({
      "@type": "Offer",
      name: tier.name,
      price: tier.monthlyPrice.toString(),
      priceCurrency: "USD",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: tier.monthlyPrice.toString(),
        priceCurrency: "USD",
        unitText: "MONTH",
      },
    })),
  }

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "GSCdaddy",
    alternateName: ["GSC daddy", "GSC Daddy"],
    url: "https://gscdaddy.com",
    description:
      "Find your striking distance keywords in Google Search Console and get AI-powered action plans to reach page 1.",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://gscdaddy.com/blog?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  }

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "GSCdaddy",
    url: "https://gscdaddy.com",
    logo: "https://gscdaddy.com/images/GSCDaddyLogo.png",
    description:
      "Google Search Console analytics tool that finds striking-distance keywords and provides AI-powered SEO recommendations.",
    founder: {
      "@type": "Person",
      name: "Ayush",
      url: "https://x.com/ayu_theindiedev",
    },
    sameAs: ["https://x.com/ayu_theindiedev"],
  }

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://gscdaddy.com",
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </>
  )
}

export default function Page() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <main>
        <Hero />
        <TrustBar />
        <ProblemSection />
        <HowItWorks />
        <Features />
        <Comparison />
        <FounderSection />
        <BuildInPublic />
        <BlogSection />
        <Pricing />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
      <JsonLd />
    </div>
  )
}
