export const NAV_LINKS = [
  { label: "SEO Checker", href: "/seo-health-checker" },
  { label: "Features", href: "#features" },
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

export const BUILD_IN_PUBLIC_TWEETS = [
  {
    text: "Just added a verified MRR badge to my landing page.\n\nIt says $0.\n\nMost founders wait until they hit $1K or $5K MRR before showing revenue publicly. I'm doing the opposite. Putting $0 on my homepage on purpose.\n\nThe number will change. The transparency won't.",
    date: "Apr 8, 2026",
    likes: 12,
    replies: 3,
    url: "https://x.com/ayu_theindiedev/status/2040054722279940237?s=46",
  },
  {
    text: "I just launched GSCdaddy, a tool that finds your \n 'Striking Distance' keywords in Google Search Console and tells you what exactly to do with them.\n\nSo I did the only logical think, I connected my own\n site to it. \n\n Everything is at zero. Imgoing to fix that publicly.",
    date: "Apr 03, 2026",
    likes: 5,
    replies: 11,
    url: "https://x.com/ayu_theindiedev/status/2039920395583934657?s=12",
  },
  {
    text: "Week 1 starts now. I'll post the first real data drop next week.\n\nIf you want to follow along, or run the same experiment on your own site, gscdaddy.com has a 14-day free trial, no credit card needed.\n\nEither way, I'm sharing everything publicly.\n\nThe wins AND the failures.",
    date: "Apr 3, 2026",
    likes: 4,
    replies: 2,
    url: "https://x.com/ayu_theindiedev/status/2039921294821749089?s=46",
  },
] as const
