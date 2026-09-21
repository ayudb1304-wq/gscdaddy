# Claude Code Prompt: Build GSCdaddy Landing Page

## Context
Read the following files in this project before starting:
- `GSCdaddy-PRD.md` — Full product requirements document
- `landing-page-playbook.md` — Research-backed conversion optimization guide
- `founder-portrait.jpg` (or .png) — My photo for the founder section

## What I Need
Build a complete, high-converting landing page for GSCdaddy at the `/` route. This should be production-ready, not a template — every detail matters for conversion.

---

## Design System (DO NOT DEVIATE)

### Colors
```css
/* Dark mode base — NOT the typical AI purple-blue */
--bg-primary: #0F0F0F;        /* Near black */
--bg-secondary: #1A1A1A;      /* Slightly lighter for cards */
--bg-tertiary: #252525;       /* For hover states, borders */

/* Accent — Warm amber/gold (stands out from AI templates) */
--accent-primary: #F5A623;    /* Primary CTA, highlights */
--accent-hover: #FFB84D;      /* Hover state */
--accent-muted: rgba(245, 166, 35, 0.1); /* Backgrounds */

/* Text */
--text-primary: #FFFFFF;
--text-secondary: #A1A1A1;
--text-muted: #6B6B6B;

/* Semantic */
--success: #22C55E;
--error: #EF4444;
```

### Typography
- **Headings:** Satoshi (from Google Fonts alternative: use `font-sans` with Geist or fallback to system-ui, but configure Satoshi if possible via @fontsource/satoshi)
- **Body:** Inter
- **Monospace (for numbers/stats):** JetBrains Mono

```css
/* Heading styles */
h1: 56px, font-weight 700, letter-spacing -0.02em, line-height 1.1
h2: 40px, font-weight 600, letter-spacing -0.01em, line-height 1.2
h3: 24px, font-weight 600, line-height 1.3
body: 18px, font-weight 400, line-height 1.6
small: 14px
```

### Spacing
- Section padding: `py-24` (96px) on desktop, `py-16` on mobile
- Max content width: `max-w-6xl` (1152px)
- Component gaps: Use 8px grid (8, 16, 24, 32, 48, 64, 96)

### Design Rules
1. NO centered symmetric layouts for everything — use asymmetric hero
2. NO gradient blobs or decorative shapes
3. NO generic stock illustrations
4. Real product screenshots/mockups only
5. Subtle animations: fade-in on scroll, button hover effects
6. Cards should have subtle borders (`border-white/5`) not shadows

---

## Page Structure & Copy

Build these sections in order. The copy below is final — implement exactly as written.

### 1. Navigation (Sticky)
```
[GSCdaddy logo]                    [Features] [Pricing] [FAQ]  [Start Free Trial →]
```
- Logo: Text "GSCdaddy" with a small radar/target icon
- Nav links scroll to sections
- CTA button uses accent color, small size

---

### 2. Hero Section

**Layout:** Two columns on desktop (60/40 split), stacked on mobile

**Left Column:**
```
[Eyebrow - small, muted text]
Google Search Console Analytics Tool

[Main Headline - H1]
Find your almost-ranking keywords.
Know exactly what to do next.

[Subheadline - text-secondary, max 2 lines]
GSCdaddy connects to your Search Console and shows you which pages are THIS close to page 1 — plus AI-powered action plans to get them there.

[CTA Button - Large, accent color]
Start my free trial →

[Trust microcopy - small, muted, below button]
Free 14-day trial · No credit card required · Cancel anytime

[Social proof metric - small, with subtle icon]
📊 127,847 keywords analyzed this week
```

**Right Column:**
- Product screenshot/mockup of the dashboard showing striking distance keywords
- Should look like an actual app screenshot, slightly angled
- Add subtle glow effect behind it using accent color at low opacity

---

### 3. Trust Bar
```
[Horizontal bar, slightly darker background]

Connects securely with:  [Google Search Console logo]  [Google API badge]

Powered by: [OpenAI logo - small] [Vercel logo - small] [Supabase logo - small]
```
- Logos should be grayscale/muted, not full color
- This section should be subtle, not shouty

---

### 4. Problem Section

**Layout:** Full width, centered text

```
[Section eyebrow - small, accent color]
THE PROBLEM

[Headline - H2]
You're sitting on a goldmine of almost-ranking keywords.
You just can't find them.

[Body copy - max-w-2xl, centered]
Google Search Console shows you data. Lots of it. But it doesn't tell you which keywords are worth your time, which pages need attention, or what to actually DO.

So you export CSVs. Toggle between tabs. Stare at charts that don't answer the question that actually matters:

[Emphasized quote - larger, accent color border-left]
"What should I work on this week to get more traffic?"

[Body copy continued]
Meanwhile, pages ranking at position 8, 9, 12 — SO CLOSE to page 1 — slip further away. Every day you don't act, you lose traffic to competitors who figured this out.
```

---

### 5. Solution Section (How It Works)

**Layout:** 3-column grid on desktop, stacked on mobile

```
[Section eyebrow]
HOW IT WORKS

[Headline - H2]
From confused to confident in 3 steps

[Three cards with icons and numbers]

┌─────────────────────────────────────────────────────────────────────────┐
│  [1]                    │  [2]                    │  [3]                │
│  🔗 Connect             │  🎯 Discover            │  ✅ Act             │
│                         │                         │                     │
│  Link your Google       │  See your striking-     │  Get AI-powered     │
│  Search Console in      │  distance keywords —    │  recommendations    │
│  one click. We only     │  pages ranking 5-15     │  telling you        │
│  read data, never       │  with the most          │  exactly what to    │
│  modify anything.       │  traffic potential.     │  change and why.    │
│                         │                         │                     │
│  [60 seconds]           │  [Instant insights]     │  [Weekly via email] │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### 6. Features Section (Benefits, Not Features)

**Layout:** Alternating left-right sections with screenshots

```
[Section eyebrow]
FEATURES

[Headline - H2]
Everything you need. Nothing you don't.

────────────────────────────────────────

[Feature 1 - Image RIGHT]

Striking Distance Finder
[H3] See which keywords are THIS close to page 1

Stop guessing which pages to optimize. GSCdaddy automatically finds your keywords ranking positions 5-15 and scores them by traffic potential — not just position.

✓ Sorted by opportunity score, not just rankings
✓ Filter by impressions, clicks, or CTR
✓ Export to CSV in one click

[Screenshot: Striking distance report with keywords, positions, opportunity scores]

────────────────────────────────────────

[Feature 2 - Image LEFT]

AI Action Plans
[H3] "What should I do?" — answered every week

Other tools show you data. GSCdaddy tells you what to DO with it. Get personalized recommendations delivered to your inbox every Monday.

✓ Specific actions, not generic advice
✓ Estimated time to complete each task
✓ Track which recommendations you've completed

[Screenshot: AI recommendation card with specific action items]

────────────────────────────────────────

[Feature 3 - Image RIGHT]

Content Decay Alerts (Coming Soon badge)
[H3] Know when your rankings start slipping

Get notified automatically when pages lose 20%+ traffic. Catch problems before they become disasters.

✓ Daily monitoring of all your pages
✓ Alerts via email or dashboard
✓ AI-suggested recovery actions

[Screenshot: Alert card showing "Page dropped 25% this month"]
```

---

### 7. Before/After Comparison

**Layout:** Two-column comparison

```
[Headline - H2, centered]
Google Search Console vs. GSCdaddy

┌─────────────────────────────────┬─────────────────────────────────┐
│          WITHOUT                │          WITH                   │
│          GSCdaddy               │          GSCdaddy               │
│          (muted styling)        │          (highlighted)          │
├─────────────────────────────────┼─────────────────────────────────┤
│ ✗ Export CSVs manually          │ ✓ One-click data sync           │
│ ✗ Build spreadsheets to filter  │ ✓ Pre-built striking distance   │
│ ✗ Guess which pages to fix      │ ✓ AI tells you what to do       │
│ ✗ Miss when rankings drop       │ ✓ Automatic decay alerts        │
│ ✗ Check multiple sites manually │ ✓ All sites in one dashboard    │
│ ✗ Data disappears after 16mo    │ ✓ Historical data forever       │
└─────────────────────────────────┴─────────────────────────────────┘
```

---

### 8. Founder Section

**Layout:** Centered, personal

```
[Section with slightly different background - bg-secondary]

[Founder photo - circular, ~120px, actual image from founder-portrait file]

[Quote - larger text, centered]
"I built GSCdaddy because I was tired of staring at my own Search Console data and not knowing what to do with it."

[Body - centered, max-w-xl]
I'm a solo indie developer from India. I had pages ranking at positions 7, 8, 12 — SO close to page 1 — but no idea which ones to focus on first. Every "SEO tool" wanted $100+/month and still didn't answer my actual question.

So I built the tool I wished existed. GSCdaddy is bootstrapped, independent, and built by someone who uses it every single day.

[Signature style]
— [Your Name]
Solo founder, GSCdaddy

[Small social links]
[Twitter/X icon] [GitHub icon - optional]
```

---

### 9. Pricing Section

**Layout:** 3 cards, middle one highlighted

```
[Section eyebrow]
PRICING

[Headline - H2]
Simple pricing. No surprises.

[Subheadline]
Less than your morning coffee habit. Seriously.

[Billing toggle - default to Annual]
Monthly | Annual (Save 20%)

┌──────────────────┬──────────────────────────┬──────────────────┐
│     BLOGGER      │      PRO ⭐              │     AGENCY       │
│                  │   MOST POPULAR           │                  │
│     $19/mo       │      $49/mo              │     $99/mo       │
│   ($15/mo annual)│    ($39/mo annual)       │  ($79/mo annual) │
├──────────────────┼──────────────────────────┼──────────────────┤
│ For solo         │ For serious creators     │ For teams &      │
│ bloggers         │ & consultants            │ client work      │
├──────────────────┼──────────────────────────┼──────────────────┤
│ ✓ 1 site         │ ✓ 5 sites                │ ✓ 15 sites       │
│ ✓ Striking       │ ✓ Everything in Blogger  │ ✓ Everything     │
│   distance       │ ✓ AI recommendations     │   in Pro         │
│   keywords       │ ✓ Content decay alerts   │ ✓ PDF exports    │
│ ✓ Weekly email   │ ✓ Priority support       │ ✓ Team access    │
│   summary        │                          │ ✓ White-label    │
│                  │                          │   reports        │
├──────────────────┼──────────────────────────┼──────────────────┤
│ [Start free]     │ [Start free trial →]     │ [Start free]     │
│ (ghost button)   │ (solid accent button)    │ (ghost button)   │
└──────────────────┴──────────────────────────┴──────────────────┘

[Below pricing cards, centered]
🔒 14-day free trial · No credit card · 30-day money-back guarantee
```

**Dematerialization copy (add below the relevant tier):**
- Blogger: "Less than a single coffee a week"
- Pro: "Less than one hour with an SEO freelancer"
- Agency: "One missed client costs more than a year of GSCdaddy"

---

### 10. FAQ Section

**Layout:** Accordion style, max-w-3xl centered

```
[Section eyebrow]
FAQ

[Headline - H2]
Got questions? I've got answers.

[Accordion items - click to expand]

Q: How does GSCdaddy connect to my Search Console?
A: You'll sign in with Google and grant read-only access to your Search Console data. We never modify anything — just read your performance data to show you insights.

Q: What are "striking distance" keywords?
A: Keywords where your pages rank positions 5-15 on Google. These are your biggest opportunities — you're already close to page 1, so small improvements can dramatically increase your traffic.

Q: How is this different from Google Search Console?
A: GSC shows you raw data. GSCdaddy analyzes that data to find opportunities and tells you exactly what to do. Think of it as having an SEO consultant look at your data every week.

Q: What if I have multiple websites?
A: The Pro plan supports up to 5 sites, and Agency supports 15. All your sites appear in one dashboard — no more logging in and out.

Q: Can I cancel anytime?
A: Yes. Cancel with one click from your dashboard. If you cancel, you'll keep access until the end of your billing period.

Q: Is there a free trial?
A: Yes! 14 days, full access, no credit card required. If GSCdaddy doesn't help you find opportunities worth pursuing, it costs you nothing.
```

---

### 11. Final CTA Section

**Layout:** Full width, centered, bold

```
[Background: slightly different, maybe accent color at very low opacity]

[Headline - H2]
Ready to stop guessing and start ranking?

[Subheadline]
Join 200+ bloggers and SEO pros who finally know what to do with their Search Console data.

[Large CTA button - accent color]
Start my free trial →

[Trust microcopy below]
Free 14-day trial · No credit card · Cancel anytime
```

---

### 12. Footer

```
[Simple, minimal footer]

GSCdaddy                                          [Twitter] [GitHub]

© 2026 GSCdaddy. Built with ☕ in India.

[Links row]
Privacy Policy · Terms of Service · Contact
```

---

## Technical Requirements

1. **Framework:** Next.js 14 App Router (already set up)
2. **Styling:** Tailwind CSS + shadcn/ui components where useful
3. **Animations:** 
   - Subtle fade-in on scroll (use Framer Motion or CSS animations)
   - Button hover states
   - Accordion smooth expand/collapse
4. **Responsive:** Mobile-first, breakpoints at `sm`, `md`, `lg`, `xl`
5. **Performance:** 
   - Optimize images (next/image)
   - Lazy load below-fold content
   - Target LCP < 2.5s
6. **SEO:**
   - Proper meta tags (title, description, og:image)
   - Semantic HTML (one H1, proper heading hierarchy)
   - Add FAQPage schema markup (JSON-LD)
   - Add SoftwareApplication schema

---

## Files to Create

```
/app
  /page.tsx                 # Main landing page
  /layout.tsx              # Update with fonts, metadata
/components
  /landing
    /Hero.tsx
    /TrustBar.tsx
    /ProblemSection.tsx
    /HowItWorks.tsx
    /Features.tsx
    /Comparison.tsx
    /FounderSection.tsx
    /Pricing.tsx
    /FAQ.tsx
    /FinalCTA.tsx
    /Footer.tsx
    /Navigation.tsx
/lib
  /constants.ts            # Pricing data, FAQ data
/public
  /images
    /dashboard-screenshot.png    # Placeholder — I'll replace later
    /founder-portrait.jpg        # Move my photo here
```

---

## Important Notes

1. **Use the exact copy I provided** — it's been carefully written for conversion
2. **Don't simplify the design** — the details matter
3. **Make the Pro plan visually stand out** — it should be obvious which tier to pick
4. **Test on mobile** — 60%+ of traffic will be mobile
5. **Add placeholder images** for screenshots — I'll replace with real ones later

---

## After Building

Once done, tell me:
1. What I need to replace (images, links, etc.)
2. Any components that need real data connections
3. Suggestions for improvement based on what you built

Start building now. Create all files and implement the complete landing page.
