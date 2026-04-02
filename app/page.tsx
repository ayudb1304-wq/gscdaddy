import { Navigation } from "@/components/landing/Navigation"
import { Hero } from "@/components/landing/Hero"
import { TrustBar } from "@/components/landing/TrustBar"
import { ProblemSection } from "@/components/landing/ProblemSection"
import { HowItWorks } from "@/components/landing/HowItWorks"
import { Features } from "@/components/landing/Features"
import { Comparison } from "@/components/landing/Comparison"
import { FounderSection } from "@/components/landing/FounderSection"
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
    </>
  )
}

export default function Page() {
  return (
    <div>
      <div className="min-h-screen bg-background text-foreground">
        <Navigation />
        <Hero />
        <TrustBar />
        <ProblemSection />
        <HowItWorks />
        <Features />
        <Comparison />
        <FounderSection />
        <Pricing />
        <FAQ />
        <FinalCTA />
        <Footer />
        <JsonLd />
      </div>
    </div>
  )
}
