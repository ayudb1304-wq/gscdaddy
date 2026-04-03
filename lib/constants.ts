export const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
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

export const FEATURES = [
  {
    eyebrow: "Striking Distance Finder",
    title: "See which keywords are THIS close to page 1",
    description:
      "Stop guessing which pages to optimize. GSCdaddy automatically finds your keywords ranking positions 5-15 and scores them by traffic potential - not just position.",
    bullets: [
      "Sorted by opportunity score, not just rankings",
      "Filter by impressions, clicks, or CTR",
      "Export to CSV in one click",
    ],
    imagePosition: "right" as const,
  },
  {
    eyebrow: "AI Action Plans",
    title: '"What should I do?" - answered every week',
    description:
      "Other tools show you data. GSCdaddy tells you what to DO with it. Get personalized recommendations delivered to your inbox every Monday.",
    bullets: [
      "Specific actions, not generic advice",
      "Estimated time to complete each task",
      "Track which recommendations you've completed",
    ],
    imagePosition: "left" as const,
  },
  {
    eyebrow: "Content Decay Alerts",
    title: "Know when your rankings start slipping",
    description:
      "Get notified automatically when pages lose 20%+ traffic. Catch problems before they become disasters.",
    bullets: [
      "Daily monitoring of all your pages",
      "Alerts via email or dashboard",
      "AI-suggested recovery actions",
    ],
    imagePosition: "right" as const,
    comingSoon: true,
  },
] as const

export const COMPARISON = {
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
      "1 site",
      "5 AI recs/day",
      "Striking distance keywords",
      "Content decay alerts",
      "Weekly email summary",
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
      "5 sites",
      "25 AI recs/day",
      "Everything in Blogger",
      "CSV exports",
      "Priority support",
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
      "25 sites",
      "Unlimited AI recs",
      "Everything in Pro",
      "PDF exports",
      "Team access",
      "White-label reports",
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
      "Keywords where your pages rank positions 5-15 on Google. These are your biggest opportunities - you're already close to page 1, so small improvements can dramatically increase your traffic.",
  },
  {
    question: "How is this different from Google Search Console?",
    answer:
      "GSC shows you raw data. GSCdaddy analyzes that data to find opportunities and tells you exactly what to do. Think of it as having an SEO consultant look at your data every week.",
  },
  {
    question: "What if I have multiple websites?",
    answer:
      "The Pro plan supports up to 5 sites, and Agency supports 15. All your sites appear in one dashboard - no more logging in and out.",
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
] as const

export const FOUNDER = {
  quote:
    "I built GSCdaddy because I was tired of staring at my own Search Console data and not knowing what to do with it.",
  bio: 'I\'m a solo indie developer from Bangalore, India. I had pages ranking at positions 7, 8, 12. SO close to page 1 - but no idea which ones to focus on first. Every "SEO tool" wanted $100+/month and still didn\'t answer my actual question.\n\nSo I built the tool I wished existed. GSCdaddy is bootstrapped, independent, and built by someone who uses it every single day.',
  name: "Ayush",
  title: "Solo founder, GSCdaddy ·  India",
} as const
