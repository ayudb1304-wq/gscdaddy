export const NAV_LINKS = [
  { label: "SEO Checker", href: "/seo-health-checker" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
  { label: "Blog", href: "/blog" },
  { label: "Tools", href: "/tools" },
  { label: "FAQ", href: "#faq" },
] as const

export const STEPS = [
  {
    number: 1,
    icon: "link",
    title: "Connect",
    description:
      "Link your Google Search Console in one click. We only read data, never modify anything.",
    detail: "60 seconds",
  },
  {
    number: 2,
    icon: "target",
    title: "Discover",
    description:
      "See your striking-distance keywords - pages ranking 5-15 with the most traffic potential.",
    detail: "Instant insights",
  },
  {
    number: 3,
    icon: "check",
    title: "Act",
    description:
      "Get AI-powered recommendations telling you exactly what to change and why.",
    detail: "Weekly via email",
  },
] as const

export const COMPARISON = {
  spreadsheet: [
    "Export CSV every week",
    "Build pivot tables to find patterns",
    "Manually check each keyword",
    "No alerts when rankings drop",
    "One site at a time",
    "2+ hours every Monday morning",
  ],
  without: [
    "Export CSVs manually",
    "Build spreadsheets to filter",
    "Guess which pages to fix",
    "Miss when rankings drop",
    "Check multiple sites manually",
    "Data disappears after 16mo",
  ],
  with: [
    "One-click data sync",
    "Pre-built striking distance",
    "AI tells you what to do",
    "Automatic decay alerts",
    "All sites in one dashboard",
    "Historical data forever",
  ],
} as const

export const PRICING_TIERS = [
  {
    name: "Blogger",
    monthlyPrice: 19,
    annualPrice: 15,
    description: "For solo bloggers",
    features: [
      { text: "1 site", comingSoon: false },
      { text: "5 AI recs/day", comingSoon: false },
      { text: "Striking distance keywords", comingSoon: false },
      { text: "Weekly email summary", comingSoon: false },
    ],
    highlighted: false,
    dematerialization: "Less than a single coffee a week",
  },
  {
    name: "Pro",
    monthlyPrice: 49,
    annualPrice: 39,
    description: "For serious creators & consultants",
    features: [
      { text: "5 sites", comingSoon: false },
      { text: "25 AI recs/day", comingSoon: false },
      { text: "Everything in Blogger", comingSoon: false },
      { text: "CSV exports", comingSoon: false },
      { text: "Priority support", comingSoon: false },
    ],
    highlighted: true,
    dematerialization: "Less than one hour with an SEO freelancer",
  },
  {
    name: "Agency",
    monthlyPrice: 99,
    annualPrice: 79,
    description: "For teams & client work",
    features: [
      { text: "25 sites", comingSoon: false },
      { text: "50 AI recs/day", comingSoon: false },
      { text: "Everything in Pro", comingSoon: false },
      { text: "Dedicated support", comingSoon: false },
    ],
    highlighted: false,
    dematerialization: "One missed client costs more than a year of GSCdaddy",
  },
] as const

export const FAQ_ITEMS = [
  {
    question: "How does GSCdaddy connect to my Search Console?",
    answer:
      "You'll sign in with Google and grant read-only access to your Search Console data. We never modify anything - just read your performance data to show you insights.",
  },
  {
    question: 'What are "striking distance" keywords?',
    answer:
      "Keywords where your pages rank in positions 5 to 15 on Google. You're already close to page one, so a better title, a few internal links or a fuller section often moves them up faster than writing a new post.",
  },
  {
    question: "How is this different from Google Search Console?",
    answer:
      "Search Console shows you raw rows: queries, pages, clicks and positions. GSCdaddy sorts those rows into keyword opportunities, ranks them by how much traffic they could bring, and writes the steps to improve each page.",
  },
  {
    question: "What if I have multiple websites?",
    answer:
      "Blogger covers 1 site, Pro covers 5 and Agency covers 25. Every site shows up in one dashboard, so you switch with one click instead of logging in and out.",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "Yes. Cancel with one click from your dashboard. If you cancel, you'll keep access until the end of your billing period.",
  },
  {
    question: "Is there a free trial?",
    answer:
      "Yes! 14 days, full access, no credit card required. If GSCdaddy doesn't help you find opportunities worth pursuing, it costs you nothing.",
  },
  {
    question: "What are AI action plans?",
    answer:
      "For every striking distance keyword, GSCdaddy generates specific steps to improve your ranking. This includes adding internal links, updating headings, or expanding thin sections. Each plan includes estimated time and expected impact. Think of it as having an SEO consultant review every page.",
  },
  {
    question: "Is my Search Console data safe?",
    answer:
      "Yes. GSCdaddy uses read-only access to your Google Search Console. We can never modify your site, your content, or your settings. Your data is encrypted in transit and at rest.",
  },
  {
    question: "Does it work for non-English sites?",
    answer:
      "Yes. GSCdaddy works with any language in Google Search Console. The AI recommendations are generated in English, but the keyword analysis works regardless of language.",
  },
] as const
