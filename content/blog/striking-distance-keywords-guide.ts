import type { BlogPost } from "@/lib/blog"

export const strikingDistanceKeywordsGuide: BlogPost = {
  slug: "striking-distance-keywords-guide",
  title: "The Complete Guide to Striking Distance Keywords in 2026",
  description:
    "Learn how to find keywords ranking positions 5-15 in Google Search Console and turn them into page 1 rankings with proven optimization tactics.",
  publishedAt: "2026-04-05",
  author: {
    name: "Ayush",
    url: "https://x.com/ayu_theindiedev",
  },
  tags: ["SEO Strategy", "Google Search Console", "Keywords"],
  schema: ["FAQPage"],
  faqs: [
    {
      question: "How long does it take to move from position 8 to position 3?",
      answer:
        "Most people see movement in 2 to 4 weeks after making on-page changes. Full stabilization of a new position can take 6 to 8 weeks. Do not judge a change as a failure until at least 30 days have passed.",
    },
    {
      question: "What is a good CTR for position 5 versus position 10?",
      answer:
        "Position 5 typically sees 5 to 7% CTR. Position 10 sees 1 to 2.5% CTR. If your page is significantly below these benchmarks for its position, the problem is your title tag and meta description, not your ranking.",
    },
    {
      question: "How many striking distance keywords should I work on at once?",
      answer:
        "Pick 5 to 10 and do them properly. Spreading effort across 30 keywords at once leads to shallow changes that move nothing. Depth on a small batch beats shallow work on a large batch every time.",
    },
    {
      question: "Do striking distance keywords work for brand new sites with no data yet?",
      answer:
        "No. You need enough GSC data to identify which keywords you are actually ranking for. Typically this means at least 2 to 3 months of indexed content. For brand new sites, the priority is getting content indexed and building topical authority first.",
    },
    {
      question: "What is the difference between striking distance keywords and low-hanging fruit keywords?",
      answer:
        "Striking distance refers specifically to positions 5 to 15. Low-hanging fruit is a broader term for any keyword that is easy to improve. Striking distance is a subset of low-hanging fruit.",
    },
  ],
  content: `
<p>I spent months staring at Google Search Console data before I realized something obvious. The biggest SEO opportunity for most websites is not ranking for new keywords. It is pushing the keywords you already rank for from page 2 to page 1.</p>

<p>These are called striking distance keywords. They are the queries where your site sits between positions 5 and 15 in Google. Close enough to page 1 that a few targeted improvements can make a real difference, but far enough away that you are probably getting almost zero clicks.</p>

<p>This is exactly the problem I built GSCdaddy to solve. But before I talk about tools, let me walk you through everything I have learned about striking distance keywords and how to turn them into actual traffic.</p>

<h2>What Are Striking Distance Keywords</h2>

<p>Striking distance keywords are search queries where your pages rank between positions 5 and 15 in Google. Some people define the range as 4 to 20, but I have found that 5 to 15 is the sweet spot where optimization effort produces the most predictable returns.</p>

<p>Here is why this range matters. A keyword at position 8 with 2,400 monthly impressions and 1.2% CTR is giving you roughly 29 clicks per month. If you move that same keyword to position 3, you are looking at roughly 7% CTR, which means 168 clicks per month. That is a 5x increase in traffic from a single keyword, without writing a single new page.</p>

<p>Multiply that across 10 or 20 striking distance keywords and the impact on your traffic is massive.</p>

<h2>Why Most People Ignore Them</h2>

<p>Most website owners fall into one of two traps. They either obsess over the keywords they already rank #1 for (trying to protect their position), or they chase entirely new keywords with fresh content.</p>

<p>Both approaches miss the easiest wins sitting right in front of them.</p>

<p>The reason is simple. Google Search Console shows you the data, but it does not tell you what to do with it. You see thousands of rows of queries, clicks, impressions, CTR, and position numbers. Without a clear framework, it is overwhelming. So people either ignore it entirely or focus on vanity metrics like total clicks.</p>

<p>Striking distance keywords hide in that noise. They are not your top performers (those are already on page 1), and they are not your worst performers (those need too much work). They sit in the middle, easy to overlook, but incredibly profitable to optimize.</p>

<h2>How to Find Them Manually in Google Search Console</h2>

<p>Here is the exact process I use. Open Google Search Console and follow these steps.</p>

<ol>
<li><strong>Go to Performance and click Search Results</strong>. Make sure you have Clicks, Impressions, CTR, and Average Position all enabled at the top.</li>
<li><strong>Set the date range to the last 3 months</strong>. This gives you enough data to be meaningful without being skewed by seasonal changes.</li>
<li><strong>Click the filter row (the + New button)</strong> and add a filter for Position. Set it to "Greater than 4" and "Smaller than 16". This narrows your view to only striking distance keywords.</li>
<li><strong>Sort by Impressions, highest first</strong>. Keywords with more impressions represent bigger opportunities because there is more traffic to capture.</li>
<li><strong>Look for keywords with high impressions but low CTR</strong>. A keyword with 3,000 impressions and 0.8% CTR at position 9 is screaming for attention. That low CTR relative to the impression count means people are searching for this but not clicking your result.</li>
</ol>

<figure>
<img src="/images/filters.png" alt="GSCdaddy striking distance keywords filter showing positions 5-15 with minimum impressions, min position, and max position fields" width="1200" />
<figcaption>GSCdaddy's striking distance report filters keywords by position range and minimum impressions automatically</figcaption>
</figure>

<p>Export this filtered data to a spreadsheet. This is your striking distance keyword list.</p>

<h2>How to Prioritize Which Ones to Work On First</h2>

<p>Not all striking distance keywords are equal. You want to focus on the ones where a small effort produces the biggest return. I use a simple opportunity score to prioritize.</p>

<p>The formula looks like this. High impressions plus low CTR plus position between 8 and 15 equals gold. A keyword at position 12 with 5,000 impressions and 0.5% CTR is a better opportunity than a keyword at position 6 with 200 impressions and 4% CTR. The first one has massive untapped potential. The second one is already performing reasonably well for its position.</p>

<p>Here is how I rank them in practice.</p>

<ul>
<li><strong>Tier 1 (work on these first)</strong>. Position 8-15, impressions above 1,000, CTR below 2%. These keywords have the most room to grow and the highest traffic ceiling.</li>
<li><strong>Tier 2 (work on these next)</strong>. Position 5-8, impressions above 500, CTR below average for that position. These are close to the top of page 1 and need a smaller push.</li>
<li><strong>Tier 3 (nice to have)</strong>. Anything else in the 5-15 range with lower impressions. Still worth optimizing, but do not prioritize over Tier 1 and 2.</li>
</ul>

<p>If you want this prioritization automated, GSCdaddy does this in one click. It pulls your GSC data, calculates opportunity scores, and ranks your keywords by potential impact. But you can absolutely do it manually with the method above.</p>

<h2>Five Optimization Tactics for Each Striking Distance Keyword</h2>

<p>Once you have your prioritized list, here is what to actually do for each keyword.</p>

<h3>1. Improve Your Title Tag</h3>

<p>Your title tag is the single biggest lever for both rankings and CTR. For striking distance keywords, make sure your target keyword appears in the title, ideally near the beginning. Add a compelling reason to click. Numbers, the current year, and words like "complete," "proven," or "free" all increase click rates.</p>

<p>Before. "Keyword Research Tips for Your Blog"</p>
<p>After. "7 Keyword Research Tips That Actually Work in 2026 (With Examples)"</p>

<p>That second version is more specific, includes a number, has the year, and promises something concrete.</p>

<h3>2. Expand Your Content</h3>

<p>Search the keyword yourself and look at what the top 3 results cover. If they have sections your page is missing, add them. Google wants comprehensive content. If position 1 has a 3,000-word guide with comparison tables and your page is an 800-word overview, you know what needs to change.</p>

<p>This does not mean writing fluff to hit a word count. It means covering the topic thoroughly so that someone who lands on your page does not need to hit the back button and click another result.</p>

<h3>3. Build Internal Links</h3>

<p>Find your highest-authority pages (the ones with the most backlinks and traffic) and add internal links from those pages to your striking distance page. Use descriptive anchor text that includes your target keyword naturally.</p>

<p>Internal links pass authority within your site. A link from your most popular blog post to a struggling page can be enough to push it up 2 to 3 positions.</p>

<h3>4. Optimize for Featured Snippets</h3>

<p>If a featured snippet exists for your keyword, structure your content to capture it. Add a clear, concise answer in 40 to 60 words right after the relevant heading. Use lists, tables, or step-by-step formats since Google pulls these into snippets more often than plain paragraphs.</p>

<p>Winning the featured snippet can jump you from position 8 to position 0, which sits above all regular results.</p>

<h3>5. Improve CTR with a Better Meta Description</h3>

<p>Your meta description does not directly affect rankings, but it affects CTR, and CTR sends engagement signals to Google. Write a meta description that includes your keyword, states a clear benefit, and creates curiosity or urgency.</p>

<p>Keep it under 155 characters. Include a specific number or result if you can. "Learn the 5-step process that moved 23 keywords to page 1 in under 6 weeks" is more clickable than "A guide to improving your keyword rankings."</p>

<h2>Common Mistakes People Make with Striking Distance Keywords</h2>

<p>I have made all of these mistakes myself, so learn from my experience.</p>

<p><strong>Optimizing too many keywords at once.</strong> Pick 5 to 10 and do them well. Trying to optimize 50 keywords simultaneously means you do shallow work on each one and see minimal results across the board.</p>

<p><strong>Ignoring search intent.</strong> If your page targets "best project management tools" but Google is showing comparison listicles and you have a single product page, no amount of optimization will help. Match the format Google is already rewarding.</p>

<p><strong>Only looking at position, not impressions.</strong> A keyword at position 6 with 50 impressions per month is not worth your time. Focus on keywords where the traffic ceiling justifies the optimization effort.</p>

<p><strong>Not waiting long enough.</strong> Changes take 2 to 4 weeks to reflect in Google Search Console data. Do not make an optimization, check the next day, see no change, and assume it did not work. Give it time.</p>

<p><strong>Forgetting to re-check.</strong> After optimizing, come back in 4 weeks and look at the data again. Did the position improve? Did CTR change? If not, you need to dig deeper into what the top results are doing differently.</p>

<h2>What I Learned Using This on My Own Site</h2>

<p>gscdaddy.com launched this week with zero data. Zero clicks, zero impressions, zero ranking keywords. I am running this exact experiment in public right now. Connecting my own tool to my own brand new site and sharing everything that happens weekly.</p>

<p>Every week I will share what GSCdaddy finds on its own site, which keywords enter striking distance, which ones I pushed to page 1, and which AI recommendations actually worked. Including the ones that did not.</p>

<p>If you want to follow along in real time, I am documenting the whole thing on Twitter at <a href="https://x.com/ayu_theindiedev">@ayu_theindiedev</a>.</p>

<h2>Your Next Steps</h2>

<p>Here is what to do right now.</p>

<ol>
<li>Open Google Search Console and filter for positions 5 to 15, sorted by impressions.</li>
<li>Export the data and identify your top 5 to 10 opportunities using the prioritization framework above.</li>
<li>For each keyword, search it yourself and compare your page to the top 3 results.</li>
<li>Apply the five optimization tactics to each page, starting with title tags and content gaps.</li>
<li>Wait 3 to 4 weeks and re-check your positions.</li>
</ol>

<p>If you want to skip the manual spreadsheet work, <a href="https://gscdaddy.com">GSCdaddy</a> automates the entire process. It connects to your Google Search Console, finds your striking distance keywords, scores them by opportunity, and gives you AI-generated action plans for each one. But the framework above works perfectly well on its own.</p>

<p>If you want a broader view beyond positions 5 to 15, read my tutorial on <a href="/blog/low-hanging-fruit-keywords-gsc">how to find low-hanging fruit keywords in Google Search Console</a>. It covers the wider range of positions 5 to 20 and includes three quick wins you can implement in under an hour.</p>

<h2>Frequently Asked Questions</h2>

<p><strong>How long does it take to move from position 8 to position 3?</strong><br/>Most people see movement in 2 to 4 weeks after making on-page changes. Full stabilization of a new position can take 6 to 8 weeks. Do not judge a change as a failure until at least 30 days have passed.</p>

<p><strong>What is a good CTR for position 5 versus position 10?</strong><br/>Position 5 typically sees 5 to 7% CTR. Position 10 sees 1 to 2.5% CTR. If your page is significantly below these benchmarks for its position, the problem is your title tag and meta description, not your ranking.</p>

<p><strong>How many striking distance keywords should I work on at once?</strong><br/>Pick 5 to 10 and do them properly. Spreading effort across 30 keywords at once leads to shallow changes that move nothing. Depth on a small batch beats shallow work on a large batch every time.</p>

<p><strong>Do striking distance keywords work for brand new sites with no data yet?</strong><br/>No. You need enough GSC data to identify which keywords you are actually ranking for. Typically this means at least 2 to 3 months of indexed content. For brand new sites, the priority is getting content indexed and building topical authority first. The striking distance opportunity comes later.</p>

<p><strong>What is the difference between striking distance keywords and low-hanging fruit keywords?</strong><br/>They are often used interchangeably but striking distance is more specific. Striking distance means positions 5 to 15 specifically. Low-hanging fruit is a broader term that can include any keyword that is easy to improve, including ones outside that range. Striking distance is a subset of low-hanging fruit.</p>

<p>The keywords you need are already in your data. You just have to go find them.</p>
`,
}
