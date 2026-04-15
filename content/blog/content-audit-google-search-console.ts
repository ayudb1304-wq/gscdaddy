import type { BlogPost } from "@/lib/blog"

export const contentAuditGoogleSearchConsole: BlogPost = {
  slug: "content-audit-google-search-console",
  title:
    "How to Do a Content Audit Using Google Search Console Data (Free Method)",
  description:
    "A practical step-by-step guide to auditing your content using Google Search Console. Sort pages into 4 buckets, identify dead weight, and find striking distance opportunities.",
  publishedAt: "2026-04-14",
  author: {
    name: "Ayush",
    url: "https://x.com/ayu_theindiedev",
  },
  tags: ["Google Search Console", "SEO Strategy", "Tutorial"],
  schema: ["FAQPage", "HowTo"],
  faqs: [
    {
      question: "How often should I do a content audit?",
      answer:
        "Quarterly is the sweet spot for most sites. It is frequent enough to catch content decay before it costs you significant traffic, but not so frequent that you are constantly auditing instead of creating. If your site publishes more than 10 posts per month, consider auditing monthly.",
    },
    {
      question:
        "Should I delete underperforming pages or try to fix them first?",
      answer:
        "Try to fix them first unless the content is completely irrelevant or outdated beyond repair. Update the content with fresh information, improve the title and meta description, add internal links from stronger pages, and give it 6 to 8 weeks to respond. If it still shows zero impressions after that, consolidate it into a related page or remove it.",
    },
    {
      question:
        "Can a content audit hurt my rankings if I delete or noindex pages?",
      answer:
        "Removing genuinely low-quality pages typically helps your overall site quality in Google's eyes. However, do not noindex or delete pages that still receive organic traffic, even if the traffic is small. Focus on pages with zero impressions and zero clicks over a 3-month period. Those pages are not contributing anything and may be dragging down your site's average quality.",
    },
    {
      question:
        "What is the difference between a content audit and a technical SEO audit?",
      answer:
        "A content audit evaluates the performance and quality of your individual pages and posts. You are asking whether each piece of content is helping or hurting your site. A technical SEO audit focuses on infrastructure like crawlability, site speed, mobile usability, and indexing issues. Both are important, but they answer different questions. A content audit tells you what to write, update, or remove. A technical audit tells you what to fix.",
    },
    {
      question: "How much GSC data do I need before running a content audit?",
      answer:
        "You need at least 3 months of data to make confident decisions. With less data, you might delete a page that was simply in a seasonal dip or had not been indexed long enough to find its audience. If your site is brand new with less than 3 months of GSC data, wait before running a full audit.",
    },
  ],
  content: `
<p>Last quarter I finally sat down and audited all the content on one of my side project blogs. It had 47 published posts. I expected most of them to be doing at least something in search. The reality was painful. 19 of those 47 posts had exactly zero impressions over the previous 3 months. Not low impressions. Zero. Almost 40% of my content was invisible to Google.</p>

<p>After consolidating 8 of those posts, deleting 6, and updating the remaining 5, my overall impressions went up 22% in the following 6 weeks. Not because I created anything new, but because I removed the dead weight that was diluting my site's quality signals.</p>

<p>That experience convinced me that content audits are one of the most underrated activities in SEO. Everyone talks about publishing more content. Almost nobody talks about evaluating whether the content you already have is helping or hurting. Here is the exact process I use, and you can do the entire thing for free using <a href="/blog/google-search-console-beginners-guide">Google Search Console</a> and Google Sheets.</p>

<h2>Why Content Audits Matter</h2>

<p>Most websites accumulate dead weight over time. You publish posts, some perform well, some do not, and you move on to the next one. After a year or two, you end up with a significant chunk of content that Google has evaluated and decided is not worth showing to anyone.</p>

<p>This is not just a missed opportunity. It can actively hurt your site. Google evaluates your entire site when deciding how much to trust your content. If 30% of your pages are thin, outdated, or irrelevant, that drags down the perceived quality of your entire domain. This is especially true after Google's Helpful Content updates, which specifically target sites with a high ratio of unhelpful pages.</p>

<p>A content audit forces you to look at every page through Google's eyes and make a clear decision about each one. Keep it, improve it, consolidate it, or remove it. No page gets to just sit there doing nothing.</p>

<h2>How to Export Your GSC Data</h2>

<p>The first step is getting your data out of Google Search Console and into a spreadsheet where you can work with it.</p>

<h3>Step 1. Open the Performance Report</h3>

<p>Log into Google Search Console, click Performance in the left sidebar, and select Search Results. Enable all four metrics at the top: Total clicks, Total impressions, Average CTR, and Average position.</p>

<h3>Step 2. Set the Date Range to the Last 3 Months</h3>

<p>Click the date filter and select "Last 3 months." Three months gives you enough data to see real patterns without being skewed by seasonal fluctuations or one-off spikes.</p>

<h3>Step 3. Switch to the Pages Tab</h3>

<p>Below the chart, click the "Pages" tab. This shows performance data for every URL on your site that received at least one impression during the period.</p>

<h3>Step 4. Export the Data</h3>

<p>Click the Export button in the top right corner and choose Google Sheets or download as a CSV. If you choose Google Sheets, it creates a new spreadsheet automatically with your data already formatted.</p>

<h2>The 4 Buckets to Sort Your Pages Into</h2>

<p>Once you have your data in a spreadsheet, you need a framework for evaluating each page. I sort every URL into one of four buckets based on its performance data.</p>

<h3>Bucket 1. Winners</h3>

<p>Pages ranking in positions 1 through 4 with strong and growing click-through rates. These are your best performing pages. The action here is simple: leave them alone. Do not try to "optimize" a page that is already winning. You are more likely to break something than improve it.</p>

<p>The one exception is if a winner page has declining impressions over the 3-month period. That could signal early content decay, and a refresh might be warranted before it drops further.</p>

<h3>Bucket 2. Striking Distance</h3>

<p>Pages ranking in positions 5 through 15 with decent impressions but low clicks. These are your biggest opportunities. A page at position 8 with 2,400 impressions and 1.2% CTR is sitting on a goldmine. Small improvements to the content, title tag, or internal linking could push it to page 1 and multiply its traffic.</p>

<p>I wrote an entire guide on <a href="/blog/striking-distance-keywords-guide">striking distance keywords</a> that covers exactly how to identify and act on these opportunities. If you have never worked on striking distance optimization, that guide is the place to start.</p>

<h3>Bucket 3. Underperformers</h3>

<p>Pages that are indexed and have some impressions but almost no clicks. These are pages where Google has seen the content, decided it is somewhat relevant, but does not think it deserves a good ranking. Typical characteristics are an average position between 20 and 50, fewer than 10 clicks in 3 months, and content that is thin, outdated, or covers a topic you have addressed better in another post.</p>

<p>The action for underperformers is to update or consolidate. If the topic is still relevant, rewrite the content with better depth and freshness. If another page on your site covers the same topic more thoroughly, redirect the underperformer to that page and let the stronger page absorb its signals. Watch out for <a href="/blog/keyword-cannibalization-google-search-console">keyword cannibalization</a> here, because underperforming pages are often the ones cannibalizing your better content.</p>

<h3>Bucket 4. Dead Weight</h3>

<p>Pages with zero impressions over the entire 3-month period. Google is not showing these pages to anyone for any query. They are invisible. A page at position 22 with 3 clicks in 90 days is an underperformer. A page with literally zero impressions is dead weight.</p>

<p>The action for dead weight depends on the content. If the topic is genuinely valuable and the content just needs a complete rewrite, update it. If the content is thin, outdated, or covers something nobody is searching for, either noindex it or delete it entirely. Removing dead weight is the fastest way to improve your site's overall content quality ratio.</p>

<h2>Setting Up Your Audit Spreadsheet</h2>

<p>Here is how I structure the spreadsheet after exporting from GSC.</p>

<h3>Step 1. Clean Up the Raw Data</h3>

<p>Your export will have columns for Page, Clicks, Impressions, CTR, and Position. Add a new column called "Bucket" and another called "Action." These are where you will record your decisions.</p>

<h3>Step 2. Sort by Impressions</h3>

<p>Sort the entire sheet by impressions from highest to lowest. Start your evaluation from the top. Pages with the most impressions represent the most traffic potential, so you want to evaluate those first.</p>

<h3>Step 3. Color-Code by Bucket</h3>

<p>Go through each row and assign a bucket based on the criteria above. I use green for Winners, yellow for Striking Distance, orange for Underperformers, and red for Dead Weight. Apply conditional formatting or manually highlight each row.</p>

<p>For a site with 50 pages, this takes about 30 minutes. For a site with 200 pages, budget about 90 minutes. It is tedious but you only need to do it once per quarter.</p>

<h3>Step 4. Add Context for Each Page</h3>

<p>For Striking Distance and Underperformer pages, add notes about what might be causing the low performance. Is the content outdated? Is the title tag weak? Is there a better page on your site covering the same topic? These notes will guide your optimization work over the next few weeks.</p>

<h3>Step 5. Identify Pages Not in GSC at All</h3>

<p>Your GSC export only includes pages that received at least one impression. But you might have published pages that Google never showed to anyone. Cross-reference your export against your full list of published URLs (check your sitemap or CMS). Any page that does not appear in the GSC data at all is either not indexed or has been completely ignored by Google. Add those to the Dead Weight bucket.</p>

<h2>What to Do With Each Bucket</h2>

<p>After sorting, here is your action plan for each bucket.</p>

<p><strong>Winners (green).</strong> Monitor monthly. Set a calendar reminder to check these pages each month for any decline in impressions or position. Otherwise, do not touch them.</p>

<p><strong>Striking Distance (yellow).</strong> Prioritize these for optimization in the next 2 to 4 weeks. For each page, evaluate the title tag, content depth, internal linking, and whether the content matches the search intent of its primary keyword. Even small improvements can push a page from position 8 to position 4 and double or triple its traffic.</p>

<p><strong>Underperformers (orange).</strong> Schedule these for content updates over the next 1 to 2 months. For each page, decide whether to update, consolidate into a stronger page, or redirect. If two pages target the same keyword, always consolidate. Two weak pages will never outperform one strong page.</p>

<p><strong>Dead Weight (red).</strong> Handle these immediately. For each page, choose one of three actions. Update the content completely if the topic is still valuable. Redirect to a related, stronger page using a 301 redirect. Or noindex the page to remove it from Google's index while keeping it live for anyone who has a direct link.</p>

<h2>How Often to Repeat This</h2>

<p>Quarterly is the right cadence for most sites. Every 3 months, export fresh GSC data and re-evaluate your pages. Content that was performing well last quarter might have started decaying. New posts you published might have entered the Striking Distance bucket and need optimization work.</p>

<p>I mark it on my calendar for the first Monday of every quarter. The entire process takes 1 to 2 hours depending on the size of the site. That investment pays for itself many times over in recovered traffic and cleaner site architecture.</p>

<p>If you want to skip the manual spreadsheet work, <a href="https://gscdaddy.com">GSCdaddy</a> automates the content decay detection by continuously monitoring your Google Search Console data. It flags pages that are losing rankings or impressions over time and gives you AI-powered recommendations for what to do about each one. But the manual process described in this guide works perfectly well on its own, especially for sites with fewer than 100 published pages.</p>

<h2>Frequently Asked Questions</h2>

<h3>How often should I do a content audit?</h3>

<p>Quarterly is the sweet spot for most sites. It is frequent enough to catch content decay before it costs you significant traffic, but not so frequent that you are constantly auditing instead of creating. If your site publishes more than 10 posts per month, consider auditing monthly.</p>

<h3>Should I delete underperforming pages or try to fix them first?</h3>

<p>Try to fix them first unless the content is completely irrelevant or outdated beyond repair. Update the content with fresh information, improve the title and meta description, add internal links from stronger pages, and give it 6 to 8 weeks to respond. If it still shows zero impressions after that, consolidate it into a related page or remove it.</p>

<h3>Can a content audit hurt my rankings if I delete or noindex pages?</h3>

<p>Removing genuinely low-quality pages typically helps your overall site quality in Google's eyes. However, do not noindex or delete pages that still receive organic traffic, even if the traffic is small. Focus on pages with zero impressions and zero clicks over a 3-month period. Those pages are not contributing anything and may be dragging down your site's average quality.</p>

<h3>What is the difference between a content audit and a technical SEO audit?</h3>

<p>A content audit evaluates the performance and quality of your individual pages and posts. You are asking whether each piece of content is helping or hurting your site. A technical SEO audit focuses on infrastructure like crawlability, site speed, mobile usability, and indexing issues. Both are important, but they answer different questions. A content audit tells you what to write, update, or remove. A technical audit tells you what to fix.</p>

<h3>How much GSC data do I need before running a content audit?</h3>

<p>You need at least 3 months of data to make confident decisions. With less data, you might delete a page that was simply in a seasonal dip or had not been indexed long enough to find its audience. If your site is brand new with less than 3 months of GSC data, wait before running a full audit.</p>
`,
}
