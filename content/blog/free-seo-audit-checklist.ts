import type { BlogPost } from "@/lib/blog"

export const freeSeoAuditChecklist: BlogPost = {
  slug: "free-seo-audit-checklist",
  title: "Free SEO Audit Checklist for New Websites in 2026",
  description:
    "A practical 29-point SEO audit checklist for new websites in 2026. Technical, on-page, content, and off-page fundamentals you can work through in an afternoon, no paid tools required.",
  publishedAt: "2026-04-20",
  author: {
    name: "Ayush",
    url: "https://x.com/ayu_theindiedev",
  },
  tags: ["SEO Strategy", "SEO Checklist", "Technical SEO"],
  schema: ["FAQPage"],
  faqs: [
    {
      question: "How long does a full SEO audit take for a new website?",
      answer:
        "For a small site under 50 pages, you can work through this checklist in 3 to 5 hours. Larger sites take longer because you have to spot-check more pages. The technical and on-page sections are the most time-consuming. Content and off-page checks are faster if you are honest with yourself about what is actually done.",
    },
    {
      question: "Do I need paid tools to audit my website?",
      answer:
        "No. Google Search Console, Google Analytics, Google PageSpeed Insights, Bing Webmaster Tools, and Screaming Frog's free tier cover 90% of what you need. Paid tools like Ahrefs and Semrush are useful for competitor research and backlink analysis, but they are not required to run a technical SEO audit of your own site.",
    },
    {
      question: "How often should I run an SEO audit?",
      answer:
        "Run a full audit when you launch a new site, and then once per quarter after that. For specific sections, the cadence is different. Check Google Search Console weekly for new errors. Check Core Web Vitals monthly. Re-check your content and internal linking every few months as you publish new pages.",
    },
    {
      question: "What should I fix first if my audit finds many issues?",
      answer:
        "Fix anything that blocks indexing first. That means robots.txt issues, noindex tags on important pages, broken sitemaps, and critical crawl errors. After that, prioritize HTTPS, mobile responsiveness, and Core Web Vitals. On-page issues like missing meta descriptions or thin content can be fixed in batches after the blocking issues are resolved.",
    },
  ],
  content: `
<p>If you launched a website in the last few months and have not run an SEO audit, this is the post for you. I built gscdaddy.com from zero and audited it against exactly this checklist, so every item here is battle-tested on a real site, not copied from a generic template.</p>

<p>No paid tools required. Every item uses free resources like Google Search Console, Bing Webmaster Tools, Google PageSpeed Insights, and Screaming Frog's free tier. Work through each section in order. When something is already done, check it off. When something is broken or missing, fix it before moving on.</p>

<h2>How to Use This Checklist</h2>

<p>There are four sections covering 29 items total.</p>

<ul>
<li><strong>Technical SEO</strong> (10 items) — the foundation that controls whether Google can even crawl and index your site</li>
<li><strong>On-Page SEO</strong> (8 items) — how each page tells Google what it is about</li>
<li><strong>Content SEO</strong> (6 items) — whether your content matches what people actually search for</li>
<li><strong>Off-Page SEO</strong> (5 items) — the signals other sites and platforms send about you</li>
</ul>

<p>For a new site, expect 3 to 5 hours to work through everything once. Fix the blocking issues first (anything that stops indexing), then batch through the rest.</p>

<h2>Technical SEO (10 items)</h2>

<h3>1. Google Search Console is verified</h3>

<p>Without <a href="/blog/google-search-console-beginners-guide">Google Search Console</a>, you are flying blind. Verify your property using DNS verification (works for both www and non-www automatically). Submit your sitemap. Check the Coverage report for any crawl errors on day one.</p>

<h3>2. Bing Webmaster Tools is set up</h3>

<p>Bing is small but not irrelevant, and setting up Bing Webmaster Tools also gets you picked up by DuckDuckGo and Yahoo. You can import your site directly from Google Search Console in one click, so there is no real reason to skip this.</p>

<h3>3. Sitemap is submitted and accessible</h3>

<p>Visit yourdomain.com/sitemap.xml in an incognito window. It should load a valid XML file listing your pages. Submit it in both Google Search Console and Bing Webmaster Tools. If you are on Next.js, Vercel generates this automatically from app/sitemap.ts.</p>

<h3>4. Robots.txt is configured correctly</h3>

<p>Visit yourdomain.com/robots.txt. It should exist, allow crawling of important pages, and include a line pointing to your sitemap like "Sitemap: https://yourdomain.com/sitemap.xml". Do not accidentally block your entire site. I have seen new sites ship with "Disallow: /" left over from staging and wonder why they have zero impressions.</p>

<h3>5. HTTPS is enabled sitewide</h3>

<p>Every page should load on HTTPS. Visit the HTTP version of your site in an incognito window and confirm it redirects to HTTPS. Mixed content warnings (HTTPS pages loading HTTP resources) hurt both user trust and rankings.</p>

<h3>6. Core Web Vitals are passing</h3>

<p>Run your homepage and a few key pages through Google PageSpeed Insights. Look for green scores on Largest Contentful Paint (under 2.5 seconds), Interaction to Next Paint (under 200 milliseconds), and Cumulative Layout Shift (under 0.1). Check both mobile and desktop because mobile is usually the weak spot.</p>

<h3>7. Mobile responsive design is working</h3>

<p>Load your site on an actual phone. Not just a narrow browser window. Real phones expose issues that desktop emulators miss, like tap targets being too close together, horizontal scrolling on small screens, and fixed-position elements covering content.</p>

<h3>8. No broken links or 404s on important pages</h3>

<p>Run your site through the Screaming Frog free crawler (up to 500 URLs) or check the "Not found (404)" section in Google Search Console. Broken links waste crawl budget and send poor signals about site quality. Fix them by either restoring the content, adding a 301 redirect, or updating the link.</p>

<h3>9. Schema markup is implemented on key pages</h3>

<p>At minimum, add WebSite schema and BreadcrumbList schema sitewide, BlogPosting schema on blog posts, and FAQPage schema where you have Q&A sections. Test each page with Google's Rich Results Test. Rich results can lift CTR by 20 to 30% for the same ranking position.</p>

<h3>10. IndexNow is configured</h3>

<p>IndexNow tells Bing and other search engines instantly when you publish or update a page. It takes 15 minutes to set up. Generate a key, host it at a known location on your site, and POST to the IndexNow API when content changes. Skipping this means slower indexing on every search engine except Google.</p>

<h2>On-Page SEO (8 items)</h2>

<h3>11. Every page has a unique title tag</h3>

<p>Run Screaming Frog or check manually. No two pages should have the same title tag. Each title should include the primary keyword near the beginning and be between 50 and 60 characters so it does not get truncated in search results.</p>

<h3>12. Every page has a unique meta description</h3>

<p>Meta descriptions do not directly affect rankings, but they strongly affect <a href="/blog/what-is-ctr-seo">CTR</a>. Target 140 to 160 characters. Include the primary keyword naturally. Write like an ad, not like a summary. A clickable meta description can move a position 5 result to perform like a position 3.</p>

<h3>13. Heading hierarchy is clean</h3>

<p>Each page should have exactly one H1 tag, which usually matches the title. Use H2 tags for main sections and H3 tags for subsections. Do not skip levels (H1 to H3 with no H2 in between). Screaming Frog's H1 report catches pages missing H1s or with multiple H1s.</p>

<h3>14. Images have descriptive alt text</h3>

<p>Every meaningful image should have alt text that describes what the image shows. Not keyword stuffing. Just plain accurate description. This helps screen readers, image search, and gives Google extra context about your page topic.</p>

<h3>15. Internal linking is in place</h3>

<p>Every page should link to at least 2 to 3 other relevant pages on your site and receive links from at least 2 to 3 other pages. Orphan pages (no incoming internal links) rarely rank well. Use contextual anchor text, not generic phrases like "click here."</p>

<h3>16. Primary keyword appears in the first 100 words</h3>

<p>Open each of your main pages and check the intro. The primary keyword or a close variant should appear naturally in the first paragraph. Not stuffed in, just used where it fits the sentence. This is a small signal but a consistent one.</p>

<h3>17. Content length matches the search intent</h3>

<p>A 400-word page will not rank for a keyword where the top results are all 2,500-word guides. Look at what is ranking on page 1 for your target keyword and match or exceed the depth. Do not pad for the sake of word count, but do cover the topic completely.</p>

<h3>18. FAQ schema on pages with Q&A content</h3>

<p>If a page has a "Frequently Asked Questions" section, add FAQPage schema. FAQ schema can take up significant space in search results, which both improves CTR and pushes competitors lower on the page.</p>

<h2>Content SEO (6 items)</h2>

<h3>19. Target keyword research is documented</h3>

<p>For every page, you should know the primary keyword you are targeting and why you think you can rank for it. Use Google Search Console's Queries report, Google Autocomplete, and "People Also Ask" boxes to validate that real people are searching for this term. <a href="/blog/what-is-long-tail-keywords">Long-tail keywords</a> are where new sites actually get traction.</p>

<h3>20. Content matches search intent</h3>

<p>Before writing, search your target keyword in Google and look at the top 10 results. Are they tutorials, listicles, comparison pages, or tools? Your content format should match. Writing a tutorial when Google wants a comparison page means you will not rank, no matter how good the content is. Read the <a href="/blog/what-is-search-intent">search intent guide</a> if this is new to you.</p>

<h3>21. Content covers the topic comprehensively</h3>

<p>Compare your page to the top 3 ranking pages. List every subtopic they cover that you do not. Fill the gaps. You do not need to copy their structure, but you cannot leave major subtopics uncovered. This is the single biggest lever for rankings on any competitive keyword.</p>

<h3>22. Content is updated with current year information</h3>

<p>References to "2023" or "2024" in 2026 content are a freshness signal problem. Update stats, tool recommendations, screenshots, and dates to the current year. Check your top pages every 6 to 12 months for <a href="/blog/what-is-content-decay">content decay</a>.</p>

<h3>23. Original insights are included</h3>

<p>AI-generated filler content is everywhere in 2026. The pages that rank consistently are the ones that include something the others cannot: personal experience, proprietary data, original screenshots, unique frameworks. Add at least one thing to each post that could not be generated by pulling from existing content.</p>

<h3>24. No keyword stuffing</h3>

<p>If you read your page out loud and it sounds unnatural, you are stuffing. Modern search engines understand synonyms, related terms, and natural language. Write for humans first. The keyword should appear often enough to establish topical relevance and no more.</p>

<h2>Off-Page SEO (5 items)</h2>

<h3>25. Google Business Profile is created (even for SaaS)</h3>

<p>If you have a business name and a location (even a home office in a city), create a Google Business Profile. It is a free link, it shows up in knowledge panel results for branded searches, and it helps establish entity recognition.</p>

<h3>26. Directory submissions are in progress</h3>

<p>Submit your site to relevant directories. For SaaS, that means AlternativeTo, F6S, SaaSHub, BetaList, Product Hunt, Indie Hackers, G2, GetApp, Crunchbase, and similar. Each submission is a potential backlink plus referral traffic. Batch this over a few weeks so you are not spamming everything in one day.</p>

<h3>27. Social profiles are created and consistent</h3>

<p>Create profiles on Twitter/X, LinkedIn, and any platform relevant to your audience. Link them back to your site. Use the same bio, branding, and handle across platforms. These profiles often rank for your brand name and give you controlled surfaces in branded search results.</p>

<h3>28. Build-in-public presence is active</h3>

<p>For indie founders, a build-in-public presence on Twitter or Reddit compounds over time. Share progress weekly. Share what you learn. Share failures. This generates both branded search interest and natural backlinks from people who reference your work. I have been doing this openly with GSCdaddy and it has been the single highest-ROI distribution channel.</p>

<h3>29. Guest post outreach has started</h3>

<p>Identify 10 to 20 blogs in your niche that publish guest posts. Pitch 2 or 3 per week with a specific, relevant idea. Even a few guest posts on relevant sites will generate real referral traffic and quality backlinks. This is slow work, but the backlinks you earn this way are the kind that actually move rankings.</p>

<h2>After the Audit</h2>

<p>The point of an audit is not to feel good about checking boxes. It is to find what is broken and fix it. When you work through the list, you will probably find 5 to 10 items that need real attention. Prioritize like this.</p>

<ol>
<li><strong>Blocking issues first.</strong> Anything stopping Google from indexing your site (robots.txt, noindex tags, broken sitemap) goes to the top.</li>
<li><strong>Technical foundation second.</strong> HTTPS, Core Web Vitals, mobile issues. Fix these before spending time on content work.</li>
<li><strong>On-page optimizations third.</strong> Title tags, meta descriptions, heading hierarchy. Batch these across your top 10 to 20 pages first.</li>
<li><strong>Content and distribution last.</strong> Content depth, search intent alignment, backlinks. These are the slowest to show results, which is why they benefit from being worked on continuously rather than in a single audit.</li>
</ol>

<p>Re-run this audit quarterly. New issues will show up as you publish more content and as search engines change. Catching them early is cheaper than fixing them after traffic has already declined.</p>

<p>Want to automate the ongoing monitoring? GSCdaddy checks your striking distance keywords daily and surfaces the pages that need attention before they slip off page 1. You can read more about <a href="/blog/striking-distance-keywords-guide">striking distance keywords</a> and why monitoring them beats quarterly audits for ongoing optimization.</p>

<h2>Frequently Asked Questions</h2>

<h3>How long does a full SEO audit take for a new website?</h3>

<p>For a small site under 50 pages, you can work through this checklist in 3 to 5 hours. Larger sites take longer because you have to spot-check more pages. The technical and on-page sections are the most time-consuming. Content and off-page checks are faster if you are honest with yourself about what is actually done.</p>

<h3>Do I need paid tools to audit my website?</h3>

<p>No. Google Search Console, Google Analytics, Google PageSpeed Insights, Bing Webmaster Tools, and Screaming Frog's free tier cover 90% of what you need. Paid tools like Ahrefs and Semrush are useful for competitor research and backlink analysis, but they are not required to run a technical SEO audit of your own site.</p>

<h3>How often should I run an SEO audit?</h3>

<p>Run a full audit when you launch a new site, and then once per quarter after that. For specific sections, the cadence is different. Check Google Search Console weekly for new errors. Check Core Web Vitals monthly. Re-check your content and internal linking every few months as you publish new pages.</p>

<h3>What should I fix first if my audit finds many issues?</h3>

<p>Fix anything that blocks indexing first. That means robots.txt issues, noindex tags on important pages, broken sitemaps, and critical crawl errors. After that, prioritize HTTPS, mobile responsiveness, and Core Web Vitals. On-page issues like missing meta descriptions or thin content can be fixed in batches after the blocking issues are resolved.</p>
`,
}
