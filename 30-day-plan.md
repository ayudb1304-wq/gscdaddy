# GSCdaddy 30-Day Organic Growth Execution Plan

**Start date:** \***\*\_\_\_\*\***
**Owner:** Ayush (@ayu_theindiedev)
**Goal:** Go from 0 impressions to first meaningful GSC data on gscdaddy.com

This is a day-by-day execution doc. Every task is specific. Every blog post has a Claude prompt ready to go. No guesswork, just execution.

---

## How to use this document

Each day has three sections:

- **BUILD** = Technical tasks, code changes, infrastructure
- **PUBLISH** = Blog posts with ready-to-use Claude prompts
- **DISTRIBUTE** = Social media, directories, community engagement

Time estimate per day: 3-5 hours. Some days are heavier (publishing days), some are lighter (distribution days).

For every blog post, use the Claude prompt provided to generate a first draft, then spend 20-30 minutes editing in your voice. Add personal anecdotes, GSCdaddy screenshots where relevant, and remove anything that sounds generic.

---

## Pre-Day 1 Checklist (Do this before starting)

- [x] Google Search Console verified for gscdaddy.com
- [x] Bing Webmaster Tools account created and site verified
- [x] Google Analytics 4 installed
- [x] Twitter/X account active (@ayu_theindiedev)
- [x] Reddit account created (if not already, start building karma immediately)
- [x] Bookmark this doc and check off tasks daily

---

# WEEK 1: TECHNICAL FOUNDATION + FIRST CONTENT

**Weekly goal:** Ship schema markup, sitemap fixes, IndexNow, OG image fix, and publish 4 foundational blog posts. Submit to first 8 directories.

---

## Day 1 (Thursday Apr 2) — Technical SEO foundation

### BUILD

- [x] **Fix OG image** — Dynamic 1200x630 OG image already in place with logo, tagline, and feature bullets. Product screenshot version can be done in Figma later.
- [x] **Rewrite meta description** — Changed to: "Stop guessing which SEO fixes matter. GSCdaddy finds your almost-ranking keywords and builds AI action plans to push them to page 1. Free 14-day trial."
- [x] **Add WebSite schema** to the homepage:

```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "GSCdaddy",
  "url": "https://gscdaddy.com",
  "description": "Find your striking distance keywords in Google Search Console and get AI-powered action plans to reach page 1.",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://gscdaddy.com/blog?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
}
```

- [x] **Add BreadcrumbList schema** sitewide (homepage, privacy, terms)
- [x] **Implement IndexNow** — API key `63f303fd44293ae3d9e48879b618d67e`, verification file at `/public/`, POST endpoint at `/api/indexnow`

### DISTRIBUTE

- [x] Create Reddit account bio mentioning "building GSCdaddy" (don't be salesy, just a line in bio)
- [x] Comment on 5 posts in r/SEO with genuine, helpful answers (build karma)
- [x] Comment on 3 posts in r/SaaS or r/indiehackers
- [x] Tweet 1 casual post (use the GSC frustration or poll post from our earlier conversation)

---

## Day 2 (Friday Apr 3) — Sitemap + Blog infrastructure + First directory submissions

### BUILD

- [x] **Expand sitemap** — Dynamic sitemap now auto-includes all blog posts. Removed `changefreq` and `priority` tags. Added `/blog` to sitemap.
- [x] **Add `Sitemap: https://gscdaddy.com/sitemap.xml` to robots.txt** (already present)
- [x] **Create blog infrastructure** — `/blog` listing page, `/blog/[slug]` individual pages with BlogPosting schema, BreadcrumbList schema, FAQPage schema support, author info, published/modified dates, tags, and Tailwind typography.
- [x] Submit sitemap to Google Search Console
- [x] Submit sitemap to Bing Webmaster Tools

### DISTRIBUTE

- [x] **Submit to directories (batch 1):**
  - [ ] AlternativeTo — moved to Day 9 (7-day account age requirement)
  - [x] F6S — instant auto-approval, dofollow link
  - [x] StartuPage — skipped, site doesn't exist
- [x] Comment on 5 posts across r/SEO and r/juststart
- [x] **Post the TrustMRR tweet** (today is Tuesday, optimal timing). Post at 8:30-9:30am IST. Drop the follow-up reply 15-20 minutes later.

---

## Day 3 (Saturday Apr 4) — Publish Blog Post #1: Pillar Page

### PUBLISH

**Blog Post #1: "The Complete Guide to Striking Distance Keywords in 2026"**

Target URL: `/blog/striking-distance-keywords-guide`
Target keyword: "striking distance keywords"
Word count: 2,500-3,500 words
Schema: BlogPosting + FAQPage (add 5-6 FAQs at the bottom)

**Claude prompt for first draft:**

```
Write a comprehensive guide titled "The Complete Guide to Striking Distance Keywords in 2026" for the GSCdaddy blog.

Voice: Write as Ayush, a solo indie developer from Bangalore who built GSCdaddy to solve his own problem of staring at GSC data without knowing what to do. First person, specific, honest. Never corporate, never salesy. No colons or em dashes in the writing.

Structure the post with these sections:
1. What are striking distance keywords (positions 5-15 in Google) and why they matter more than any other SEO opportunity
2. Why most people ignore them (they focus on position 1 keywords or completely new keywords instead)
3. How to find them manually in Google Search Console (step by step with specific filter instructions)
4. How to prioritize which ones to work on first (explain the opportunity score concept: high impressions + low CTR + position 8-15 = gold)
5. Five specific optimization tactics for each striking distance keyword (title tag improvements, content expansion, internal linking, featured snippet optimization, CTR improvement)
6. Common mistakes people make with striking distance keywords
7. FAQ section with 5-6 questions like "How long does it take to move from position 8 to position 3?" and "What's a good CTR for position 5 vs position 10?"

Important rules:
- Use specific example numbers throughout (e.g., "a keyword at position 8 with 2,400 impressions and 1.2% CTR")
- Mention GSCdaddy naturally in only 1-2 places, never as a hard sell. Something like "This is exactly the problem I built GSCdaddy to solve" in the intro, and a soft mention in the manual process section like "or if you want this automated, GSCdaddy does this in one click"
- Include a "what I learned using this on my own site" anecdote
- End with a practical next-steps section
- No hashtags, no "game-changer" or "revolutionary" language
- Do not use ":" in headings
- Do not use em dashes anywhere
- Write for someone who knows what GSC is but feels overwhelmed by the data
```

### BUILD

- [x] After Claude generates the draft, edit for 30 minutes in your voice
- [x] Add relevant screenshots from GSC showing the filters
- [x] Add FAQPage schema to this post
- [x] Request indexing via GSC URL Inspection tool
- [x] Ping IndexNow

### DISTRIBUTE

- [x] Share the post link on Twitter with a short hook: "Wrote everything I know about striking distance keywords. This is the strategy I built GSCdaddy around."
- [x] Comment on 5 Reddit posts (keep building karma)
- [x] Submit to SaaSHub (dofollow backlink)

---

## Day 4 (Sunday Apr 5) — Blog Post #2: GSC Tutorial

### PUBLISH

**Blog Post #2: "How to Find Low-Hanging Fruit Keywords in Google Search Console"**

Target URL: `/blog/low-hanging-fruit-keywords-gsc`
Target keyword: "low hanging fruit keywords GSC" / "GSC low hanging fruit"
Word count: 1,500-2,000 words
Schema: BlogPosting + HowTo + FAQPage

**Claude prompt for first draft:**

```
Write a tutorial titled "How to Find Low-Hanging Fruit Keywords in Google Search Console" for the GSCdaddy blog.

Voice: Write as Ayush, solo indie dev from Bangalore. First person, practical, like you're showing a friend over their shoulder. No corporate tone. No colons or em dashes.

Structure:
1. Open with a relatable hook about how most bloggers have goldmine keywords hiding in their GSC data and don't know it
2. Define what "low-hanging fruit" means in SEO context (keywords ranking 5-20 with decent impressions but poor CTR or where small changes could push to page 1)
3. Step-by-step walkthrough of finding them in GSC:
   - Step 1: Go to Performance > Search Results
   - Step 2: Set date range to last 3 months
   - Step 3: Click on "Average position" to enable it
   - Step 4: Filter by position > greater than 5, less than 20
   - Step 5: Sort by impressions (highest first)
   - Step 6: Look for keywords with high impressions but low CTR
4. How to evaluate which keywords are worth pursuing (search the keyword yourself, check what's ranking above you, assess if you can realistically improve)
5. Three quick wins you can implement in under an hour per keyword
6. A "what I found on my own site" section sharing a real example
7. Brief mention that GSCdaddy automates this entire process and adds AI recommendations on top

Include a FAQ section with 3-4 questions.

Rules:
- Include specific numbers in examples
- No "game-changer" or "unlock your potential" language
- Keep it actionable and specific
- HowTo schema friendly structure (clear numbered steps)
- Do not use ":" in headings or em dashes anywhere
```

### BUILD

- [x] Edit draft, add screenshots of GSC filters
- [x] Ensure internal link from this post to the pillar page (Post #1)
- [x] Ensure pillar page links back to this post
- [x] Request indexing via GSC
- [x] Ping IndexNow (runs automatically on deploy)

### DISTRIBUTE

- [x] Share on Twitter as a tip thread (break the key steps into 4-5 tweets)
- [x] Comment on 5 Reddit posts
- [x] Submit to Capterra (free listing under "SEO Software")

---

## Day 5 (Monday Apr 6) — Blog Post #3 + Directory push

### PUBLISH

**Blog Post #3: "Google Search Console for Beginners: The Only Guide You Actually Need"**

Target URL: `/blog/google-search-console-beginners-guide`
Target keyword: "google search console guide" / "how to use google search console"
Word count: 2,000-2,500 words
Schema: BlogPosting + FAQPage

**Claude prompt for first draft:**

```
Write a beginner-friendly guide titled "Google Search Console for Beginners: The Only Guide You Actually Need" for the GSCdaddy blog.

Voice: Write as Ayush, solo indie dev. Friendly, patient, no jargon without explanation. Like explaining GSC to a smart friend who just started their first blog. No colons or em dashes.

Structure:
1. What Google Search Console is (and what it's NOT... it's not Google Analytics)
2. How to set it up (domain vs URL prefix, verification methods, which to pick and why)
3. The 5 reports that actually matter:
   - Performance report (clicks, impressions, CTR, position)
   - URL Inspection (is my page indexed?)
   - Coverage/Indexing (which pages have issues?)
   - Sitemaps (submitting and monitoring)
   - Links (who's linking to you?)
4. The 3 things to check every week (a simple weekly routine)
5. Common GSC mistakes beginners make
6. What GSC doesn't tell you (and where tools like GSCdaddy fill the gap)
7. FAQ section

Rules:
- Assume zero SEO knowledge
- Use analogies to explain concepts
- Keep paragraphs short (2-3 sentences max)
- Mention GSCdaddy only in section 6, naturally
- Include specific screenshots/filter instructions
- No "game-changer" language, no em dashes, no colons in headings
```

### BUILD

- [x] Edit draft, add screenshots
- [x] Internal link to Post #1 and Post #2
- [x] Request indexing + IndexNow ping (auto on deploy)

### DISTRIBUTE

- [ ] Share on Twitter with a personal angle: "I wrote the GSC guide I wish existed when I started"
- [x] **Submit to directories (batch 2):**
  - [x] SourceForge (dofollow)
  - [x] StackShare (dofollow)
  - [ ] Product Hunt (start preparing launch, set date for Week 3 or 4)
- [ ] Comment on 5 Reddit posts (you should have ~100+ karma by now)

---

## Day 6 (Tuesday Apr 7) — Blog Post #4 + Catch up

### PUBLISH

**Blog Post #4: "How to Improve Your Click-Through Rate Using Google Search Console Data"**

Target URL: `/blog/improve-ctr-google-search-console`
Target keyword: "improve CTR search console" / "google search console CTR optimization"
Word count: 1,500-2,000 words
Schema: BlogPosting + FAQPage

**Claude prompt for first draft:**

```
Write a practical guide titled "How to Improve Your Click-Through Rate Using Google Search Console Data" for the GSCdaddy blog.

Voice: Ayush, solo indie dev. Data-driven but accessible. No colons or em dashes.

Structure:
1. Why CTR matters more than most people think (position 1 gets ~27% CTR, position 5 gets ~5%, position 10 gets ~1.5%. Even moving from 1.5% to 3% CTR at position 10 doubles your clicks without ranking higher)
2. How to find your worst CTR pages in GSC (filter for pages with high impressions and below-average CTR)
3. The title tag formula that improves CTR (include power words, numbers, parentheses, current year)
4. Meta description tactics that drive clicks
5. How to use structured data to get rich snippets (FAQ schema, HowTo schema, review stars)
6. Before/after examples (make up realistic ones based on common patterns)
7. How to track whether your changes worked (GSC takes 2-4 weeks to reflect changes)

Rules:
- Include specific CTR benchmarks by position
- Show the exact GSC filters to use
- Mention GSCdaddy briefly when discussing automated CTR monitoring
- Keep it tactical, not theoretical
- No "game-changer" language, no em dashes, no colons in headings
```

### BUILD

- [x] Edit, add screenshots, cross-link to all previous posts
- [x] Request indexing + IndexNow
- [x] Do a quick internal linking audit: make sure all 4 posts link to each other where relevant and all link to the homepage

### DISTRIBUTE

- [ ] Light Twitter activity (reply to 10 people in SEO/indie hacker space)
- [ ] Catch up on any missed directory submissions
- [ ] Plan next week's content calendar

---

## Day 7 (Wednesday Apr 8) — Rest + Plan + Community

### BUILD

- [x] No new content today. Review all 4 published posts for typos, broken links, missing alt text
- [x] Check GSC for any indexing issues
- [x] Install Ahrefs Webmaster Tools (free) and run first site audit

### DISTRIBUTE

- [x] Spend 30-45 minutes on Reddit commenting helpfully (aim for 10 quality comments)
- [x] Engage on Twitter (reply to 15-20 people)
- [x] Plan Week 2 content calendar
- [x] Sign up for journalist query platforms: Featured.com (free), Help a B2B Writer (free), Source of Sources (free)

---

# WEEK 2: CONTENT ACCELERATION + COMPARISON PAGES

**Weekly goal:** Publish 5 posts (including first comparison and alternatives pages). Submit to 8 more directories. Make first Reddit post. Hit 15+ indexed pages in GSC.

---

## Day 8 (Thursday Apr 9) — Blog Post #5: First Comparison Page

### PUBLISH

**Blog Post #5: "Ahrefs vs Semrush vs Google Search Console: Which Do You Actually Need?"**

Target URL: `/blog/ahrefs-vs-semrush-vs-google-search-console`
Target keyword: "ahrefs vs semrush" / "do I need ahrefs"
Word count: 2,000-2,500 words
Schema: BlogPosting + FAQPage

**Claude prompt for first draft:**

```
Write a comparison article titled "Ahrefs vs Semrush vs Google Search Console: Which Do You Actually Need?" for the GSCdaddy blog.

Voice: Ayush, solo indie dev who has used all three. Honest, balanced, not trying to trash competitors. The angle is that most indie bloggers and small site owners are paying $99-130/month for tools they use 10% of, when GSC (free) plus a focused tool like GSCdaddy ($19/month) covers their actual needs. No colons or em dashes.

Structure:
1. The honest truth about SEO tool spending (most solo bloggers don't need $100+/month tools)
2. What Google Search Console gives you for free (and where it falls short)
3. What Ahrefs does best (backlink analysis, competitor research, keyword explorer). Be genuinely complimentary.
4. What Semrush does best (PPC data, site audit, content marketing toolkit). Be genuinely complimentary.
5. The real question: what do YOU actually need? (Decision framework based on site size, goals, budget)
6. Where GSCdaddy fits in (it's not a replacement for Ahrefs/Semrush. It's a complement to free GSC that adds the "what should I do next?" layer that GSC is missing)
7. My recommendation by user type:
   - Solo blogger with <50K monthly visitors → GSC + GSCdaddy
   - Freelance SEO consultant → Ahrefs or Semrush + GSCdaddy
   - Agency → Full stack
8. FAQ section

Rules:
- Be factually accurate about Ahrefs and Semrush features and pricing
- Don't position GSCdaddy as a direct competitor to them. It's a different category.
- Include a comparison table
- No "game-changer" language, no em dashes, no colons in headings
- This post should feel like genuine advice, not a sales pitch
```

### DISTRIBUTE

- [ ] **Submit directories (batch 3):**
  - [ ] BetaList (free tier, 2-4 week wait)
  - [ ] G2 (claim free profile)
  - [ ] GetApp
  - [ ] Indie Hackers product page (create and fill out completely)
- [ ] Comment on 5 Reddit posts
- [ ] Tweet about the comparison angle: "Do solo bloggers actually need Ahrefs at $99/month? I wrote an honest breakdown."

---

## Day 9 (Friday Apr 10) — Blog Post #6

### PUBLISH

**Blog Post #6: "How to Find Keyword Cannibalization in Google Search Console"**

Target URL: `/blog/keyword-cannibalization-google-search-console`
Target keyword: "keyword cannibalization GSC" / "find keyword cannibalization search console"
Word count: 1,500-2,000 words
Schema: BlogPosting + HowTo + FAQPage

**Claude prompt for first draft:**

```
Write a tutorial titled "How to Find Keyword Cannibalization in Google Search Console" for the GSCdaddy blog.

Voice: Ayush, solo dev. Practical, step-by-step. No colons or em dashes.

Structure:
1. What keyword cannibalization is (multiple pages competing for the same keyword, splitting your authority)
2. Why it kills your rankings (Google doesn't know which page to rank, so neither ranks well)
3. Signs you might have cannibalization (fluctuating positions, two pages showing up for same query in GSC)
4. Step-by-step method to find it in GSC:
   - Go to Performance > Search Results
   - Click on a query that gets decent impressions
   - Click the "Pages" tab
   - If multiple pages appear for the same query, you have cannibalization
   - Export and repeat for your top 50 queries
5. How to fix it (301 redirect, canonical tag, content consolidation, or differentiation)
6. Prevention strategies
7. Brief mention that GSCdaddy flags cannibalization automatically

Rules:
- Include specific examples
- Make the GSC steps very detailed (which buttons to click, what to look for)
- This is a genuinely useful tutorial first, product mention last
- No "game-changer" language, no em dashes, no colons in headings
```

### DISTRIBUTE

- [ ] **Submit to AlternativeTo** (7-day account age requirement met) — list as alternative to Ahrefs, Semrush, Moz, SE Ranking
- [ ] Share on Twitter
- [ ] Comment on 5 Reddit posts
- [ ] Respond to any journalist queries from Featured.com or HABW

---

## Day 10 (Saturday Apr 11) — First Alternatives Page + Reddit Post

### PUBLISH

**Blog Post #7: "7 Best Google Search Console Alternatives and Companion Tools (2026)"**

Target URL: `/blog/google-search-console-alternatives`
Target keyword: "google search console alternative" / "best search console tools"
Word count: 2,000-2,500 words
Schema: BlogPosting + FAQPage

**Claude prompt for first draft:**

```
Write a listicle titled "7 Best Google Search Console Alternatives and Companion Tools in 2026" for the GSCdaddy blog.

Voice: Ayush. Honest, first-person reviews where possible. No colons or em dashes.

The 7 tools to cover (in this order):
1. GSCdaddy (position 3 or 4, not #1, that would look suspicious) — striking distance keywords + AI action plans. $19/month. Disclose clearly: "Full disclosure, I built this one."
2. Ahrefs Webmaster Tools (free) — site audit + backlink monitoring
3. Bing Webmaster Tools (free) — Bing's version of GSC, includes SEO reports
4. Search Console Insights (free, by Google) — simplified view combining GSC + GA4
5. Rank Math (free WordPress plugin) — integrates GSC data into WordPress
6. Semrush (paid, $130/month) — full suite with GSC integration
7. SE Ranking (paid, $55/month) — mid-range option with GSC data pull

For each tool cover:
- What it does (2-3 sentences)
- Best for (one-line description of ideal user)
- Pricing
- Pros (2-3 bullet points)
- Cons (1-2 bullet points)

End with a "Which should you pick?" decision framework based on budget and needs.

Rules:
- Be genuine about each tool's strengths
- GSCdaddy should NOT be positioned as the best overall. Position it as "best for striking distance keyword analysis specifically"
- Include a summary comparison table
- No "game-changer" language, no em dashes, no colons in headings
```

### DISTRIBUTE

- [ ] **Make your first Reddit post in r/juststart or r/Blogging:**

**Suggested Reddit post:**

> **Title:** I spent a week analyzing my Search Console data. Here are the keywords I was ignoring that could have been easy wins.
>
> **Body:** Write a 300-500 word value-first post sharing what you learned from analyzing gscdaddy.com's GSC data (even if the numbers are tiny). Share specific examples of striking distance concepts. End with something like "I actually built a tool to automate this process, happy to answer questions about the methodology." Do NOT link to GSCdaddy unless someone asks.

- [ ] Comment on 5 Reddit posts
- [ ] Tweet linking to the alternatives post

---

## Day 11 (Sunday Apr 12) — Blog Post #8: Tutorial

### PUBLISH

**Blog Post #8: "How to Use Google Search Console with WordPress (Complete Setup Guide)"**

Target URL: `/blog/google-search-console-wordpress-setup`
Target keyword: "google search console wordpress" / "add search console to wordpress"
Word count: 1,500-2,000 words
Schema: BlogPosting + HowTo + FAQPage

**Claude prompt for first draft:**

```
Write a step-by-step tutorial titled "How to Use Google Search Console with WordPress: Complete Setup Guide" for the GSCdaddy blog.

Voice: Ayush. Patient, beginner-friendly. No colons or em dashes.

Structure:
1. Why every WordPress site needs GSC (it's free, Google literally tells you what to fix)
2. How to verify your WordPress site in GSC (cover all methods: HTML tag, DNS, Google Analytics, Site Kit plugin)
3. How to submit your WordPress sitemap (and how to find it with Yoast or Rank Math)
4. The 5 most important things to check weekly in GSC for WordPress sites
5. Common WordPress-specific GSC issues (soft 404s, crawl errors from plugins, mobile usability issues)
6. Plugins that integrate with GSC (Site Kit, Rank Math, MonsterInsights)
7. Taking it further with GSCdaddy (one paragraph, soft mention)

Rules:
- This targets a huge search volume keyword cluster
- Be very specific about WordPress steps
- Include notes about different versions of WP and common plugins
- No "game-changer" language, no em dashes, no colons in headings
```

### DISTRIBUTE

- [ ] **Submit directories (batch 4):**
  - [ ] TrustRadius
  - [ ] Trustpilot
  - [ ] SaaSWorthy (dofollow)
  - [ ] Crunchbase (free tier)
- [ ] Comment on 5 Reddit posts
- [ ] Reply to all comments on your Reddit post from yesterday

---

## Day 12 (Monday Apr 13) — Blog Post #9: Programmatic Template Launch

### PUBLISH

**Blog Post #9: "What is CTR in SEO? How to Calculate and Improve Your Click-Through Rate"**

Target URL: `/blog/what-is-ctr-seo`
Target keyword: "what is CTR in SEO" / "click through rate SEO"
Word count: 1,200-1,500 words
Schema: BlogPosting + FAQPage
**Note: This is the first "glossary-style" post. Use it as a template for future definition posts.**

**Claude prompt for first draft:**

```
Write a glossary-style article titled "What is CTR in SEO? How to Calculate and Improve Your Click-Through Rate" for the GSCdaddy blog.

Voice: Ayush. Clear, concise, educational. No colons or em dashes.

Structure:
1. Featured-snippet-optimized definition (40-60 words, formatted as a standalone paragraph that Google can extract)
2. Why CTR matters for SEO (Google uses it as a user satisfaction signal)
3. How to calculate CTR (formula + example)
4. What's a "good" CTR? (benchmarks by position: position 1 = ~27%, position 5 = ~5%, position 10 = ~1.5%)
5. How to check your CTR in Google Search Console
6. 5 ways to improve your CTR (title tags, meta descriptions, schema markup, URL structure, date freshness)
7. FAQ section (3-4 questions)

Rules:
- First paragraph must be a clean, extractable definition for featured snippets
- Keep total length 1,200-1,500 words
- Link to the CTR improvement post (Post #4) for deeper reading
- Minimal GSCdaddy mention (one line: "Tools like GSCdaddy surface pages with unusually low CTR so you know what to fix")
- No "game-changer" language, no em dashes, no colons in headings
```

### BUILD

- [ ] **Create 5 more glossary page stubs** (just the URL structure and basic content, to be filled next week):
  - `/blog/what-is-crawl-budget`
  - `/blog/what-is-keyword-difficulty`
  - `/blog/what-is-search-intent`
  - `/blog/what-is-content-decay`
  - `/blog/what-are-long-tail-keywords`

### DISTRIBUTE

- [ ] Light Twitter day (engage with 15 replies, no original post needed)
- [ ] Comment on 5 Reddit posts
- [ ] Check GSC for first indexed pages and impressions (screenshot anything you find for future content)

---

## Day 13 (Tuesday Apr 14) — Blog Post #10 + Internal Linking Audit

### PUBLISH

**Blog Post #10: "How to Do a Content Audit Using Google Search Console Data (Free Method)"**

Target URL: `/blog/content-audit-google-search-console`
Target keyword: "content audit search console" / "how to do a content audit"
Word count: 1,800-2,200 words
Schema: BlogPosting + HowTo + FAQPage

**Claude prompt for first draft:**

```
Write a practical guide titled "How to Do a Content Audit Using Google Search Console Data for Free" for the GSCdaddy blog.

Voice: Ayush. Hands-on, no-nonsense. No colons or em dashes.

Structure:
1. Why content audits matter (most sites have 20-30% dead weight pages that are hurting overall site quality)
2. How to export your GSC data (Performance > Search Results > Export)
3. The 4 buckets to sort your pages into:
   - Winners (top 3 positions, growing traffic) → Leave alone
   - Striking distance (positions 5-15, decent impressions) → Optimize
   - Underperformers (indexed but near-zero traffic for 6+ months) → Update or consolidate
   - Dead weight (zero impressions for 3+ months) → Noindex or delete
4. Step-by-step process using Google Sheets (free):
   - Export GSC data
   - Create a pivot table by page
   - Add columns for total clicks, impressions, avg position
   - Color-code by bucket
5. What to do with each bucket (specific actions)
6. How often to repeat this (quarterly is ideal)
7. One paragraph on how GSCdaddy automates the content decay detection

Rules:
- Include a downloadable Google Sheets template link if possible (or describe the exact setup)
- Use specific numbers throughout
- This should be genuinely useful even without GSCdaddy
- No "game-changer" language, no em dashes, no colons in headings
```

### BUILD

- [ ] **Internal linking audit:** Go through all 10 posts and ensure:
  - Every post links to at least 2 other posts
  - Every post links to the homepage
  - Pillar page (Post #1) links to all relevant cluster posts
  - Use descriptive anchor text (not "click here")

### DISTRIBUTE

- [ ] Tweet a thread summarizing the content audit process (5-6 tweets)
- [ ] Light Reddit engagement

---

## Day 14 (Wednesday Apr 15) — Rest + Review + Plan

### BUILD

- [ ] **Weekly review:**
  - Check GSC: How many pages indexed? Any impressions yet? Screenshot everything.
  - Check Ahrefs Webmaster Tools: Any backlinks from directories showing up?
  - Run Screaming Frog audit (free up to 500 URLs) to check for technical issues
- [ ] Fix any broken links, missing alt text, or schema errors found
- [ ] Plan Week 3 content calendar

### DISTRIBUTE

- [ ] 30 minutes of Reddit commenting
- [ ] Engage on Twitter (15-20 replies)
- [ ] Check and respond to any journalist queries from Featured.com / HABW / Source of Sources

---

# WEEK 3: PROGRAMMATIC CONTENT + COMMUNITY GROWTH

**Weekly goal:** Launch first batch of programmatic pages (5 glossary, 3 alternatives). Publish 3 editorial posts. Make 2 Reddit posts. Start guest post outreach.

---

## Day 15 (Thursday Apr 16) — Programmatic Glossary Pages (Batch 1)

### PUBLISH

**Publish 5 glossary pages** (use the stubs from Day 12 + this template)

**Claude prompt (use for each page, changing the term):**

```
Write a glossary article for the GSCdaddy blog about [TERM]. The URL will be /blog/what-is-[term-slug].

Voice: Ayush. Clear, authoritative but friendly. No colons or em dashes.

Structure:
1. Featured snippet paragraph (40-60 words, clear definition that Google can extract directly)
2. "Why [term] matters for SEO" section (150-200 words)
3. "How to measure/check [term]" section (200-300 words, include GSC method if applicable)
4. "How to improve/optimize [term]" section (200-300 words, actionable tips)
5. "Common mistakes" section (3-4 bullet points)
6. FAQ section (3 questions)
7. "Related terms" section linking to other glossary pages and relevant blog posts

Total length: 800-1,200 words.

Include FAQPage schema. Link to at least 2 other GSCdaddy blog posts. Mention GSCdaddy only if directly relevant to the term.

Do not use ":" in headings, em dashes, or "game-changer" language.
```

**Terms to publish today:**

1. What is Crawl Budget
2. What is Keyword Difficulty
3. What is Search Intent
4. What is Content Decay
5. What are Long-Tail Keywords

### DISTRIBUTE

- [ ] Submit to There's An AI For That (theresanaiforthat.com)
- [ ] Submit to ToolPilot.ai
- [ ] Submit to SaaSBison (dofollow)
- [ ] Comment on 5 Reddit posts
- [ ] Tweet: "Building out an SEO glossary on the GSCdaddy blog. Writing definitions for terms that took me years to actually understand."

---

## Day 16 (Friday Apr 17) — Blog Post #11: Educational Deep Dive

### PUBLISH

**Blog Post #11: "How to Move Keywords from Page 2 to Page 1 of Google (Proven Process)"**

Target URL: `/blog/move-keywords-page-2-to-page-1`
Target keyword: "move keywords page 2 to page 1" / "rank on first page google"
Word count: 2,000-2,500 words
Schema: BlogPosting + FAQPage

**Claude prompt for first draft:**

```
Write an in-depth guide titled "How to Move Keywords from Page 2 to Page 1 of Google: A Proven Process" for the GSCdaddy blog.

Voice: Ayush. Experienced but honest about what works and what doesn't. No colons or em dashes.

Structure:
1. The math of page 1 vs page 2 (page 1 gets 91.5% of all clicks, page 2 gets less than 4%. Moving from position 11 to position 8 can 5x your traffic for that keyword.)
2. Step 1: Identify your page 2 keywords in GSC (filter position 11-20, sort by impressions)
3. Step 2: Analyze the competition (search the keyword, study what's ranking above you)
4. Step 3: Content gap analysis (what are the top 3 results covering that you're not?)
5. Step 4: On-page optimization checklist (title, H1, subheadings, content depth, internal links, schema)
6. Step 5: Build internal links from your strongest pages
7. Step 6: Improve user engagement signals (better intro, formatting, multimedia)
8. Step 7: Monitor and iterate (check GSC weekly, adjust)
9. Realistic timeline expectations (most moves take 2-8 weeks)
10. What to do if nothing works after 8 weeks

Include specific before/after examples. Mention GSCdaddy in the "identify keywords" section as the automated way to do step 1.

No "game-changer" language, no em dashes, no colons in headings.
```

### DISTRIBUTE

- [ ] **Make a Reddit post in r/SEO:**

> **Title:** The actual process I use to move keywords from page 2 to page 1 (with examples)
>
> **Body:** Share the framework from the blog post in 500-600 words. Pure value, no links. If people ask for more detail, THEN link to the blog post. If someone asks what tools you use, mention GSCdaddy casually.

- [ ] Tweet the post with a specific hook: "Page 2 of Google gets less than 4% of clicks. I wrote the exact process to push keywords to page 1."

---

## Day 17 (Saturday Apr 18) — Alternatives Pages (Batch 1)

### PUBLISH

**Publish 3 alternatives/comparison pages using a template:**

**Claude prompt (adjust the competitor for each):**

```
Write an alternatives page titled "Best [COMPETITOR] Alternatives in 2026 (Free and Paid)" for the GSCdaddy blog. Target URL: /blog/[competitor]-alternatives

Voice: Ayush. Fair, balanced. No colons or em dashes.

Competitor to write about: [Ahrefs / Semrush / Moz]

Structure:
1. Brief intro about the competitor (what it does well, why people look for alternatives — usually pricing)
2. Why people search for alternatives (too expensive for small sites, overwhelming features, looking for something simpler)
3. List 7 alternatives:
   - Include GSCdaddy as one of the 7 (not #1, position 3-5). Be clear about what it does and doesn't do compared to the competitor.
   - Include 3-4 well-known tools (SE Ranking, Mangools, Ubersuggest, Moz)
   - Include 1-2 free tools (GSC itself, Ahrefs Webmaster Tools)
   - For each: 2-3 sentence description, best for, pricing, key pros, key cons
4. Comparison table (features vs pricing)
5. "How to choose" decision framework
6. FAQ (3-4 questions)

Rules:
- Be genuinely helpful and fair
- Don't trash the competitor
- Position GSCdaddy honestly: "Best for striking distance keyword analysis if you already use GSC"
- No "game-changer" language, no em dashes, no colons in headings
```

**Pages to publish:**

1. `/blog/ahrefs-alternatives` — "Best Ahrefs Alternatives in 2026"
2. `/blog/semrush-alternatives` — "Best Semrush Alternatives in 2026"
3. `/blog/moz-alternatives` — "Best Moz Alternatives in 2026"

### DISTRIBUTE

- [ ] Share one of the alternatives posts on Twitter
- [ ] Comment on 5 Reddit posts
- [ ] **Start guest post outreach:** Send 3 emails to SEO blogs pitching: "How to Find and Optimize Striking Distance Keywords in Google Search Console" as a guest post

---

## Day 18 (Sunday Apr 19) — Blog Post #12 + Newsletter Pitches

### PUBLISH

**Blog Post #12: "I'm Using My Own SEO Tool on My Own Site. Here's What the Data Shows After 3 Weeks."**

Target URL: `/blog/gscdaddy-dogfooding-week-3`
Target keyword: n/a (this is a narrative/build-in-public post, not keyword-targeted)
Word count: 800-1,200 words
Schema: BlogPosting

**Claude prompt for first draft:**

```
Write a build-in-public update titled "I'm Using My Own SEO Tool on My Own Site. Here's What the Data Shows After 3 Weeks." for the GSCdaddy blog.

Voice: Ayush. Raw, honest, specific numbers only (I'll fill in the real data). No colons or em dashes.

Structure:
1. Quick context: "I built GSCdaddy to find striking distance keywords in Google Search Console. Three weeks ago I started using it on gscdaddy.com itself. Here's what happened."
2. The numbers (leave placeholders for me to fill in):
   - Pages published: [X]
   - Pages indexed: [X]
   - Total impressions: [X]
   - Total clicks: [X]
   - Keywords appearing in GSC: [X]
   - Keywords in striking distance (positions 5-15): [X]
3. What surprised me
4. What didn't work
5. What I'm changing for the next 2 weeks
6. What the tool recommended and whether I followed the recommendations
7. Honest reflection on the cold start problem (the irony of building an SEO tool with no SEO traffic)

Rules:
- This should feel like a journal entry, not a blog post
- Include actual screenshots (I'll add them)
- No selling. This is transparency content.
- No "game-changer" language, no em dashes, no colons in headings
```

### DISTRIBUTE

- [ ] **Pitch 3 newsletters:**
  - SEOFOMO by Aleyda Solis — "Free tool that finds striking distance keywords in GSC and generates AI action plans"
  - SEO Notebook by Steve Toth — "New indie tool for automated striking distance analysis"
  - WTSNewsletter — "Solo dev from India built a free GSC companion tool"
- [ ] Share the dogfooding post on Twitter as a thread
- [ ] Post the dogfooding story on Indie Hackers

---

## Day 19 (Monday Apr 20) — Blog Post #13 + More Glossary

### PUBLISH

**Blog Post #13: "Free SEO Audit Checklist for New Websites (2026)"**

Target URL: `/blog/free-seo-audit-checklist`
Target keyword: "free SEO audit checklist" / "SEO checklist new website"
Word count: 1,800-2,200 words
Schema: BlogPosting + FAQPage

**Claude prompt for first draft:**

```
Write a comprehensive checklist article titled "Free SEO Audit Checklist for New Websites in 2026" for the GSCdaddy blog.

Voice: Ayush. Practical, actionable. No colons or em dashes.

Structure:
Organize as a checklist with these categories:

1. Technical SEO (10 items):
   - Google Search Console setup
   - Sitemap submitted
   - Robots.txt configured
   - HTTPS enabled
   - Core Web Vitals passing
   - Mobile responsive
   - No broken links
   - Schema markup implemented
   - IndexNow configured
   - Clean URL structure

2. On-Page SEO (8 items):
   - Unique title tags
   - Meta descriptions on all pages
   - Proper heading hierarchy
   - Image alt text
   - Internal linking
   - Keyword in first 100 words
   - Content length adequate
   - FAQ schema on relevant pages

3. Content SEO (6 items):
   - Target keyword research done
   - Content matches search intent
   - Covers topic comprehensively
   - Updated with current year info
   - Original insights included
   - No keyword stuffing

4. Off-Page SEO (5 items):
   - Google Business Profile (even for SaaS)
   - Directory submissions
   - Social profiles created
   - Build-in-public presence
   - Guest post outreach started

For each item: one-line description of why it matters + link to the relevant GSCdaddy blog post if we've covered it.

End with "Want to automate the ongoing monitoring? GSCdaddy checks your striking distance keywords daily."

No "game-changer" language, no em dashes, no colons in headings.
```

**Also publish 3 more glossary pages:**

- `/blog/what-is-domain-authority`
- `/blog/what-is-a-backlink`
- `/blog/what-is-indexing-in-seo`

(Use the same glossary prompt template from Day 15, swapping the term)

### DISTRIBUTE

- [ ] Share the checklist on Twitter
- [ ] Comment on 5 Reddit posts

---

## Day 20 (Tuesday Apr 21) — Light day + Community catch-up

### BUILD

- [ ] Review all published content for cross-linking opportunities
- [ ] Check which pages are indexed in GSC (run `site:gscdaddy.com/blog` in Google)
- [ ] Request indexing for any pages not yet indexed
- [ ] Fix any technical issues found in Screaming Frog or Ahrefs Webmaster Tools

### DISTRIBUTE

- [ ] Heavy Reddit engagement day: comment on 15-20 posts across r/SEO, r/juststart, r/Blogging, r/SaaS
- [ ] Reply to all comments on your previous Reddit posts
- [ ] Follow up on any journalist queries
- [ ] Tweet a behind-the-scenes screenshot of your GSC data (even if numbers are tiny, transparency is the angle)

---

## Day 21 (Wednesday Apr 22) — Rest + Week 3 Review

### BUILD

- [ ] **Week 3 review:**
  - Total posts published: should be ~23 (10 editorial + 8 glossary + 3 alternatives + 2 programmatic)
  - Total pages indexed: check GSC
  - First impressions/clicks: screenshot and save for the experiment post
  - Backlinks from directories: check Ahrefs Webmaster Tools
  - Reddit karma: should be 300+ by now
- [ ] Plan Week 4 calendar

### DISTRIBUTE

- [ ] Light Twitter engagement
- [ ] 10 Reddit comments

---

# WEEK 4: SCALE + OPTIMIZE + CONVERSION PUSH

**Weekly goal:** Publish 5 more posts. Launch Product Hunt. More alternatives pages. First guest post published. Post experiment summary on Reddit and Twitter.

---

## Day 22 (Thursday Apr 23) — Blog Post #14 + More Alternatives

### PUBLISH

**Blog Post #14: "SEO for Indie Hackers: How to Get Your First 1,000 Organic Visitors"**

Target URL: `/blog/seo-for-indie-hackers`
Target keyword: "SEO for indie hackers" / "startup SEO guide"
Word count: 2,000-2,500 words
Schema: BlogPosting + FAQPage

**Claude prompt for first draft:**

```
Write a guide titled "SEO for Indie Hackers: How to Get Your First 1,000 Organic Visitors" for the GSCdaddy blog.

Voice: Ayush. Speaking from experience as an indie hacker who is literally doing this right now with gscdaddy.com. No colons or em dashes.

Structure:
1. Why most indie hackers ignore SEO (they think it takes too long, prefer Product Hunt and Twitter)
2. The math that changes your mind (1,000 organic visitors/month at 2% conversion = 20 signups/month on autopilot, forever, for free)
3. The minimal SEO stack for $0/month:
   - Google Search Console (free)
   - Google Keyword Planner (free)
   - Ahrefs Webmaster Tools (free)
   - GSCdaddy (free trial, then $19/month)
4. The 90-day content playbook:
   - Month 1: 3 pillar pages + 8-10 cluster posts
   - Month 2: Comparison/alternatives pages + programmatic content
   - Month 3: Optimize based on GSC data + double down on winners
5. Directory submissions as free backlinks (share the actual list)
6. Reddit as an SEO strategy (your posts get indexed by Google, Reddit ranks for everything now)
7. Realistic timeline expectations
8. What I've learned doing this with GSCdaddy (personal anecdotes)

Rules:
- This should feel like a founder talking to other founders
- Include specific tools, specific directories, specific numbers
- GSCdaddy mentions are natural and not forced
- No "game-changer" language, no em dashes, no colons in headings
```

**Also publish 2 more alternatives pages:**

- `/blog/se-ranking-alternatives` — "Best SE Ranking Alternatives"
- `/blog/ubersuggest-alternatives` — "Best Ubersuggest Alternatives"

(Use the alternatives prompt template from Day 17)

### DISTRIBUTE

- [ ] Submit to Launching Next, MicroLaunch, LaunchVault
- [ ] Comment on 5 Reddit posts
- [ ] Share on Twitter targeting indie hacker audience

---

## Day 23 (Friday Apr 24) — Blog Post #15 + Product Hunt Prep

### PUBLISH

**Blog Post #15: "How to Use Regex in Google Search Console (With Examples)"**

Target URL: `/blog/regex-google-search-console`
Target keyword: "regex google search console" / "GSC regex filter"
Word count: 1,500-2,000 words
Schema: BlogPosting + HowTo + FAQPage

**Claude prompt for first draft:**

```
Write a tutorial titled "How to Use Regex in Google Search Console: Practical Examples for SEO" for the GSCdaddy blog.

Voice: Ayush. Technical but accessible, explain regex as simply as possible. No colons or em dashes.

Structure:
1. What regex is and why GSC supports it (filter queries and pages using patterns instead of exact matches)
2. Where to use regex in GSC (Performance report > Filter > Custom regex)
3. Basic regex patterns every SEO should know:
   - `.` matches any character
   - `*` matches zero or more
   - `+` matches one or more
   - `|` means OR
   - `^` matches start of string
   - `$` matches end of string
   - `()` groups patterns
4. 10 practical regex examples for SEO:
   - Filter for question queries: `^(how|what|why|when|where|who|can|does|is)`
   - Filter for branded queries: `(gscdaddy|gsc daddy)`
   - Exclude branded queries: use the NOT filter
   - Filter for long-tail queries (4+ words): regex with spaces
   - Filter by specific page sections: `/blog/.*`
   - Find near-duplicate queries
   - And 4 more useful patterns
5. Common regex mistakes in GSC
6. Brief note: GSCdaddy lets you save regex filters as presets

Rules:
- Make regex approachable, not intimidating
- Each example should show: the regex pattern, what it filters for, and why it's useful
- No "game-changer" language, no em dashes, no colons in headings
```

### BUILD

- [ ] **Prepare Product Hunt launch:**
  - Write tagline (under 60 characters): "Find your almost-ranking keywords in Google Search Console"
  - Write description (keep it honest, mention it's bootstrapped)
  - Prepare 4-5 product screenshots/GIFs
  - Set launch date for Day 25 or 26 (Thursday or Friday)
  - Line up 5-10 people to upvote and leave genuine reviews (friends, indie hacker community connections)

### DISTRIBUTE

- [ ] Share regex tutorial on Twitter (regex tips get good engagement in the dev community)
- [ ] Post in r/webdev or r/learnprogramming about the regex GSC tutorial (cross-audience play)

---

## Day 24 (Saturday Apr 25) — Blog Post #16 + More Glossary

### PUBLISH

**Blog Post #16: "How to Find and Fix Content Decay Using Google Search Console"**

Target URL: `/blog/content-decay-google-search-console`
Target keyword: "content decay" / "find content decay GSC"
Word count: 1,500-2,000 words
Schema: BlogPosting + HowTo + FAQPage

**Claude prompt for first draft:**

```
Write a guide titled "How to Find and Fix Content Decay Using Google Search Console" for the GSCdaddy blog.

Voice: Ayush. Practical, data-focused. No colons or em dashes.

Structure:
1. What content decay is (pages that ranked well but have gradually lost traffic/rankings over time)
2. Why it happens (competitors publish better content, your info becomes outdated, Google's algorithm evolves, search intent shifts)
3. How to detect it in GSC:
   - Compare last 3 months vs previous 3 months in Performance report
   - Filter for pages with declining clicks and impressions
   - Look for position drops greater than 3-5 positions
4. The content decay triage process:
   - Minor decay (lost 1-3 positions): Update stats, add new sections, freshen the date
   - Major decay (lost 5+ positions): Rewrite and re-optimize, study what's now ranking above you
   - Complete decay (fell off page 1 entirely): Evaluate whether the page is still worth targeting or if it should be consolidated
5. Prevention strategy (quarterly content audits, evergreen formatting)
6. Mention that GSCdaddy is building automated content decay alerts (coming soon feature from your roadmap)

Rules:
- Include specific examples with numbers
- Show exact GSC comparison steps
- No "game-changer" language, no em dashes, no colons in headings
```

**Also publish 3 more glossary pages:**

- `/blog/what-is-e-e-a-t`
- `/blog/what-is-a-sitemap`
- `/blog/what-is-a-canonical-url`

### DISTRIBUTE

- [ ] Share on Twitter
- [ ] Comment on 5 Reddit posts
- [ ] Follow up on guest post pitches from Day 17

---

## Day 25 (Sunday Apr 26) — Product Hunt Launch Day

### BUILD

- [ ] **Launch on Product Hunt**
- [ ] Be online and responsive ALL DAY to answer questions, reply to comments, thank upvoters
- [ ] Share the PH link on Twitter immediately upon launch
- [ ] Post in Indie Hackers
- [ ] DM 5-10 people who might be interested to check it out

### PUBLISH

No new blog post today. Focus entirely on the Product Hunt launch.

### DISTRIBUTE

- [ ] Twitter: 5-8 tweets throughout the day about the launch
- [ ] Reddit: Post in r/SideProject about the launch (allowed for self-promotion)
- [ ] Update all directory listings with "Featured on Product Hunt" badge if you get decent traction
- [ ] Screenshot all metrics and comments for future content

---

## Day 26 (Monday Apr 27) — Post-Launch Content + Blog Post #17

### PUBLISH

**Blog Post #17: "We Just Launched on Product Hunt. Here's Exactly What Happened."**

Target URL: `/blog/product-hunt-launch-results`
Target keyword: n/a (narrative content)
Word count: 800-1,200 words
Schema: BlogPosting

**Claude prompt for first draft:**

```
Write a launch recap titled "We Just Launched on Product Hunt. Here's Exactly What Happened." for the GSCdaddy blog.

Voice: Ayush. Raw, transparent, sharing real numbers. No colons or em dashes.

Structure:
1. Why we launched on PH (and why I was nervous)
2. Pre-launch prep (what I did in the 2 weeks before)
3. Launch day timeline (hour by hour, what happened)
4. The numbers (leave placeholders for real data):
   - Upvotes: [X]
   - Comments: [X]
   - Website visits from PH: [X]
   - Signups: [X]
   - Ranking position on PH: [X]
5. What worked
6. What I'd do differently
7. Impact on GSC data (did the traffic spike show up in Search Console?)
8. What's next

Rules:
- Include screenshots
- Be honest about what went well AND what flopped
- This is transparency content, not a victory lap
- No "game-changer" language, no em dashes, no colons in headings
```

### DISTRIBUTE

- [ ] Share the recap on Twitter thread
- [ ] Share on Indie Hackers
- [ ] Comment on 5 Reddit posts
- [ ] Continue responding to any PH comments from yesterday

---

## Day 27 (Tuesday Apr 28) — Blog Post #18 + Internal Linking Overhaul

### PUBLISH

**Blog Post #18: "The Best Free SEO Tools in 2026 (I've Tested All of Them)"**

Target URL: `/blog/best-free-seo-tools`
Target keyword: "best free SEO tools" / "free SEO tools 2026"
Word count: 2,500-3,000 words
Schema: BlogPosting + FAQPage

**Claude prompt for first draft:**

```
Write a comprehensive listicle titled "The Best Free SEO Tools in 2026: I've Tested All of Them" for the GSCdaddy blog.

Voice: Ayush. Personal experience with each tool. No colons or em dashes.

Cover these tools organized by category:

Keyword Research (Free):
1. Google Keyword Planner
2. Google Trends
3. Keyword Surfer (Chrome extension)
4. Answer Socrates
5. AlsoAsked.com

Site Analysis (Free):
6. Google Search Console
7. Ahrefs Webmaster Tools
8. Bing Webmaster Tools
9. Google PageSpeed Insights

Technical Audit (Free):
10. Screaming Frog (free up to 500 URLs)
11. Seobility SEO Checker

Content Optimization (Free):
12. Hemingway Editor
13. Grammarly (free tier)

Striking Distance Analysis:
14. GSCdaddy (free 14-day trial, then $19/month — not fully free but far cheaper than alternatives)

For each tool: what it does, what I actually use it for, rating out of 5, and one pro tip.

End with "My actual daily stack" showing which 4-5 tools you use together.

Rules:
- Genuine first-person reviews
- GSCdaddy positioned honestly as "free trial, not fully free"
- Include a summary comparison table
- No "game-changer" language, no em dashes, no colons in headings
```

### BUILD

- [ ] **Major internal linking pass:**
  - Open every blog post in order
  - Add links to newer posts that weren't linked before
  - Ensure every glossary page links to at least 2 editorial posts
  - Ensure every alternatives page links to the main comparison post (Post #5) and relevant tutorials
  - Add "Related Posts" section at the bottom of each post if not already there

### DISTRIBUTE

- [ ] Light Twitter engagement
- [ ] 10 Reddit comments

---

## Day 28 (Wednesday Apr 29) — Rest + Comprehensive Review

### BUILD

- [ ] **Full month review:**
  - Total blog posts published: count
  - Total pages indexed in GSC: screenshot
  - Total impressions: screenshot
  - Total clicks: screenshot
  - Number of keywords showing in GSC: screenshot
  - Any keywords in striking distance (positions 5-15): this is the golden metric
  - Backlinks detected in Ahrefs Webmaster Tools: screenshot
  - Directory submissions completed: count
  - Reddit karma: check
  - Twitter followers change: check
- [ ] Save all screenshots for the final experiment post

### DISTRIBUTE

- [ ] Plan the final experiment summary post for Day 29-30
- [ ] Light social engagement

---

## Day 29 (Thursday Apr 30) — The Experiment Summary Post

### PUBLISH

**Blog Post #19: "30 Days of Building Organic Traffic from Zero: The Complete GSCdaddy Experiment"**

Target URL: `/blog/30-day-seo-experiment-results`
Target keyword: n/a (narrative + build-in-public)
Word count: 2,000-3,000 words
Schema: BlogPosting

**Claude prompt for first draft:**

```
Write a comprehensive experiment summary titled "30 Days of Building Organic Traffic from Zero: The Complete GSCdaddy Experiment" for the GSCdaddy blog.

Voice: Ayush. Completely honest. This is the culmination of the public accountability experiment. No colons or em dashes.

Structure:
1. The setup: "30 days ago, gscdaddy.com had zero organic traffic. I committed to building traction from scratch with $0 budget using only content, free directories, and community distribution. Here's everything that happened."

2. The strategy overview (brief):
   - Content: X posts published across Y categories
   - Distribution: Z directory submissions, Reddit, Twitter
   - Technical: Schema markup, IndexNow, sitemap optimization

3. The results (leave placeholders for real data):
   - Pages published: [X]
   - Pages indexed: [X] out of [Y]
   - Total impressions: [X]
   - Total clicks: [X]
   - Unique keywords in GSC: [X]
   - Keywords in striking distance: [X]
   - Backlinks acquired: [X]
   - Directory referral traffic: [X]
   - Reddit referral traffic: [X]
   - Twitter impressions: [X]
   - Product Hunt impact: [X]
   - Trial signups: [X]

4. What worked (top 3 tactics by impact)
5. What didn't work (be honest)
6. What surprised me
7. The irony of using my own tool (did GSCdaddy's recommendations help gscdaddy.com?)
8. Month 2 plan (what I'm doubling down on)
9. Call to action: "If you want to try this yourself, GSCdaddy has a free 14-day trial. No credit card required."

Rules:
- Include charts/graphs if possible (even simple ones from Google Sheets)
- Every metric should have a real number (I'll fill them in)
- Be honest about failures
- This is THE post that proves the dogfooding narrative
- No "game-changer" language, no em dashes, no colons in headings
```

### DISTRIBUTE

- [ ] **Post on Reddit r/juststart:** Share the full 30-day experiment with numbers. This is the kind of content r/juststart loves. Include methodology, real numbers, what worked, what didn't. Mention GSCdaddy only as "the tool I built" not as a pitch.
- [ ] **Twitter thread:** 10-15 tweet thread covering the highlights. Include screenshots of GSC data.
- [ ] **Post on Indie Hackers:** Full write-up with revenue ($0 still? honest about that), traffic growth, lessons learned.
- [ ] Share in r/SaaS and r/entrepreneur if the numbers are interesting enough

---

## Day 30 (Friday May 1) — Publish Final Post + Set Up Month 2

### PUBLISH

**Blog Post #20: "The SEO Strategy That Works for Bootstrapped SaaS in 2026 (What I Learned Building GSCdaddy)"**

Target URL: `/blog/bootstrapped-saas-seo-strategy`
Target keyword: "bootstrapped SaaS SEO" / "SaaS SEO strategy"
Word count: 2,000-2,500 words
Schema: BlogPosting + FAQPage

**Claude prompt for first draft:**

```
Write a strategy piece titled "The SEO Strategy That Actually Works for Bootstrapped SaaS in 2026" for the GSCdaddy blog.

Voice: Ayush. Speaking from 30 days of hands-on experience, not theory. No colons or em dashes.

Structure:
1. Why bootstrapped SaaS SEO is different (no budget for Ahrefs, no team of writers, competing against funded companies)
2. The framework I used (and what worked):
   - Bottom-of-funnel first: comparison and alternatives pages
   - Tutorial content targeting specific GSC tasks
   - Glossary pages for topical authority
   - Programmatic templates for scale
3. The free tool stack I used (GSC, Ahrefs Webmaster Tools, Screaming Frog free, Google Keyword Planner)
4. Distribution matters as much as content (Reddit, Twitter, directories)
5. The metrics that actually matter at this stage (indexed pages, impressions growth rate, striking distance keywords found)
6. What I'd tell myself 30 days ago (lessons learned)
7. The 90-day plan going forward

Rules:
- Reference specific results from the 30-day experiment
- This should be useful for any bootstrapped SaaS founder, not just SEO tools
- GSCdaddy is the example, not the pitch
- No "game-changer" language, no em dashes, no colons in headings
```

### BUILD

- [ ] **Set up Month 2 foundations:**
  - [ ] Create a content calendar for the next 30 days
  - [ ] Identify which topics from Month 1 performed best (by impressions) and plan deeper content around those
  - [ ] Plan next batch of programmatic pages (20-30 more alternatives and comparisons)
  - [ ] Set up Google Alerts for "striking distance keywords," "GSC tools," and competitor names to find new content angles and journalist opportunities
- [ ] Request indexing for any remaining unindexed pages

### DISTRIBUTE

- [ ] Share the strategy post on Twitter
- [ ] Respond to all comments across Reddit, Twitter, Indie Hackers, and Product Hunt
- [ ] Send a thank-you DM to anyone who gave feedback during the 30 days

---

# 30-Day Scorecard

Track these numbers and fill them in as you go:

| Metric                       | Week 1 | Week 2 | Week 3 | Week 4 | Total |
| ---------------------------- | ------ | ------ | ------ | ------ | ----- |
| Blog posts published         |        |        |        |        |       |
| Glossary pages published     |        |        |        |        |       |
| Alternatives pages published |        |        |        |        |       |
| Total pages indexed (GSC)    |        |        |        |        |       |
| Total impressions (GSC)      |        |        |        |        |       |
| Total clicks (GSC)           |        |        |        |        |       |
| Striking distance keywords   |        |        |        |        |       |
| Backlinks (Ahrefs WT)        |        |        |        |        |       |
| Directory submissions        |        |        |        |        |       |
| Reddit posts                 |        |        |        |        |       |
| Reddit comments              |        |        |        |        |       |
| Twitter posts                |        |        |        |        |       |
| Newsletter pitches sent      |        |        |        |        |       |
| Guest post pitches sent      |        |        |        |        |       |
| Trial signups                |        |        |        |        |       |

---

# Content Published (Master List)

Check off as you publish:

**Editorial Posts:**

- [ ] Day 3: Striking Distance Keywords Guide (Pillar)
- [ ] Day 4: Low-Hanging Fruit Keywords in GSC
- [ ] Day 5: GSC Beginners Guide (Pillar)
- [x] Day 6: Improve CTR Using GSC
- [ ] Day 8: Ahrefs vs Semrush vs GSC
- [ ] Day 9: Keyword Cannibalization in GSC
- [ ] Day 10: GSC Alternatives and Companion Tools
- [ ] Day 11: GSC WordPress Setup
- [ ] Day 12: What is CTR in SEO
- [ ] Day 13: Content Audit Using GSC
- [ ] Day 16: Move Keywords Page 2 to Page 1
- [ ] Day 18: Dogfooding Week 3 Update
- [ ] Day 19: Free SEO Audit Checklist
- [ ] Day 23: Regex in GSC
- [ ] Day 24: Content Decay in GSC
- [ ] Day 26: Product Hunt Launch Recap
- [ ] Day 27: Best Free SEO Tools 2026
- [ ] Day 29: 30-Day Experiment Results
- [ ] Day 30: Bootstrapped SaaS SEO Strategy

**Glossary Pages:**

- [ ] Day 15: What is Crawl Budget
- [ ] Day 15: What is Keyword Difficulty
- [ ] Day 15: What is Search Intent
- [ ] Day 15: What is Content Decay
- [ ] Day 15: What are Long-Tail Keywords
- [ ] Day 19: What is Domain Authority
- [ ] Day 19: What is a Backlink
- [ ] Day 19: What is Indexing in SEO
- [ ] Day 24: What is E-E-A-T
- [ ] Day 24: What is a Sitemap
- [ ] Day 24: What is a Canonical URL

**Alternatives/Comparison Pages:**

- [ ] Day 17: Ahrefs Alternatives
- [ ] Day 17: Semrush Alternatives
- [ ] Day 17: Moz Alternatives
- [ ] Day 22: SE Ranking Alternatives
- [ ] Day 22: Ubersuggest Alternatives

**Directory Submissions:**

- [ ] Day 2: AlternativeTo, F6S, StartuPage
- [ ] Day 3: SaaSHub
- [x] Day 5: SourceForge, StackShare, Product Hunt (prep)
- [ ] Day 8: BetaList, G2, GetApp, Indie Hackers
- [ ] Day 11: TrustRadius, Trustpilot, SaaSWorthy, Crunchbase
- [ ] Day 15: TAAFT, ToolPilot, SaaSBison
- [ ] Day 22: Launching Next, MicroLaunch, LaunchVault
- [ ] Day 25: Product Hunt (launch)

---

# Quick Reference: Claude Prompt Template for Future Posts

Save this for posts beyond Day 30:

```
Write a [type: tutorial/guide/listicle/comparison] titled "[TITLE]" for the GSCdaddy blog.

Target URL: /blog/[slug]
Target keyword: "[primary keyword]"
Word count: [X] words

Voice: Write as Ayush, a solo indie developer from Bangalore who built GSCdaddy. First person, specific, honest. Never corporate, never salesy. No colons in headings. No em dashes anywhere in the text. No phrases like "game-changer," "revolutionary," or "unlock your potential."

Structure:
[List the specific sections you want]

Rules:
- [Include any post-specific rules]
- Mention GSCdaddy naturally in at most 1-2 places
- Include FAQPage schema content (5-6 Q&As at the bottom)
- Link to these existing posts where relevant: [list URLs]
- Use specific numbers and examples throughout
- Write for [target audience description]
```
