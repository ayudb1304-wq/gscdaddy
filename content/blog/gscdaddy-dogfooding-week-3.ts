import type { BlogPost } from "@/lib/blog"

export const gscdaddyDogfoodingWeek3: BlogPost = {
  slug: "gscdaddy-dogfooding-week-3",
  title: "I'm Using My Own SEO Tool on My Own Site. Here's What the Data Shows After 3 Weeks",
  description:
    "Three weeks of using GSCdaddy on gscdaddy.com. Real numbers, what the tool recommended, what I followed, what I ignored, and the irony of building an SEO product with no SEO traffic yet.",
  publishedAt: "2026-04-19",
  author: {
    name: "Ayush",
    url: "https://x.com/ayu_theindiedev",
  },
  tags: ["Build in Public", "Dogfooding", "GSCdaddy"],
  content: `
<p>I built <a href="https://gscdaddy.com">GSCdaddy</a> to find striking distance keywords in Google Search Console and turn them into action plans I would actually execute. Three weeks ago I started pointing the tool at gscdaddy.com itself. This is the most embarrassing and useful thing I could do as a solo founder, so I am going to keep doing it in public.</p>

<p>Here is the honest state of things after 21 days.</p>

<h2>The Numbers</h2>

<p>I pulled these from Google Search Console and from my own dashboard on the morning of April 19.</p>

<ul>
<li>Pages published: 31 (1 homepage, 8 free tools, 19 blog and glossary pages, 3 alternatives pages)</li>
<li>Pages indexed in Google: 22</li>
<li>Total impressions in the last 28 days: 1,184</li>
<li>Total clicks in the last 28 days: 9</li>
<li>Unique keywords appearing in GSC: 47</li>
<li>Keywords in <a href="/blog/striking-distance-keywords-guide">striking distance</a> (positions 5 to 15): 6</li>
<li>Keywords on page 2 (positions 11 to 20): 11</li>
</ul>

<p>That is it. 9 clicks in a month. If you came here hoping for a hockey stick, close the tab. The honest version of building in public is that most weeks look like this one.</p>

<p>The 6 striking distance keywords are the entire reason I keep showing up. They are the reason my own tool is useful to me right now. Without GSCdaddy I would be staring at the full Performance report and convincing myself everything is fine. With it I can see exactly which 6 queries are one edit away from actually mattering.</p>

<h2>What Surprised Me</h2>

<p>Two things genuinely caught me off guard.</p>

<p>First, Google indexed the glossary pages faster than the pillar content. I assumed my long-form guides would get crawled and indexed first because they have more substance. The opposite happened. Short, focused glossary pages like <a href="/blog/what-is-crawl-budget">what is crawl budget</a> and <a href="/blog/what-is-keyword-difficulty">what is keyword difficulty</a> were picked up within 48 hours. The 3,000-word pillar post took almost 9 days. I now think the glossary format is just easier for Google to categorize on first crawl, and that has changed how I sequence new content.</p>

<p>Second, my best-performing query in GSC is not a keyword I targeted. It is a long-tail question that appeared on its own after I published the <a href="/blog/low-hanging-fruit-keywords-gsc">low-hanging fruit keywords</a> post. The query is very specific, has almost zero competition, and is sitting at position 8 with 140 impressions. I am going to write a dedicated post for it this week. This is the exact pattern my tool is supposed to surface, and watching it happen in my own data made me trust the product a lot more.</p>

<h2>What Did Not Work</h2>

<p>Reddit did not convert. I spent two of the first three weeks quietly building karma and leaving genuinely useful answers in r/SEO, r/juststart, and r/SaaS. Referral traffic from Reddit exists but it is not sticky. People click, read one paragraph, and leave. My average time on page from Reddit traffic is under 30 seconds. I am not going to stop commenting because the karma is useful for future posts, but I am no longer expecting Reddit to be a meaningful acquisition channel on its own.</p>

<p>Directory submissions have been slower than I hoped. Out of the 8 directories I submitted to, 5 have approved and indexed the listing. The ones that gave me dofollow links are the only ones that seem to have actually moved anything in crawl activity. I wasted about 4 hours on directories that either never approved the submission or gave nofollow links buried behind JavaScript.</p>

<p>The homepage is still my weakest indexed page in terms of queries. It only surfaces for branded terms. That is a signal the landing page copy is not matching any real search intent beyond my own product name, and it is the next thing I need to fix.</p>

<h2>What I Am Changing for the Next Two Weeks</h2>

<p>I am not touching strategy. I am touching execution.</p>

<p>I am going to stop publishing a new long-form post every single day. Instead I am going to alternate. One day is a new post. The next day is going back to an older post and fixing whatever GSCdaddy flags as the biggest miss. That should be title tag rewrites, adding FAQ schema where it is missing, and expanding thin sections. The tool keeps telling me my own older posts are my best opportunities and I have been ignoring that advice because new posts feel more productive.</p>

<p>I am also going to start actually linking from high-impression pages to my striking distance pages. I had been doing this loosely. Now I am going to do it deliberately, one internal link at a time, tracked in a spreadsheet. This is the single highest-leverage thing I can do given how little backlink authority I have.</p>

<p>And I am going to pitch 3 SEO newsletters this week. Not for links. For readers. The cold start problem is mostly about being invisible, not about being bad at SEO.</p>

<h2>What the Tool Recommended and What I Actually Did</h2>

<p>This is the part I find most interesting. GSCdaddy gave me 14 specific action items across my 22 indexed pages over the last 3 weeks. Here is the split.</p>

<ul>
<li>Followed and shipped: 9</li>
<li>Followed and still pending: 2</li>
<li>Ignored on purpose: 3</li>
</ul>

<p>The 9 I shipped were mostly title tag rewrites and adding internal links between related posts. Every single one of those was a 10 minute job. The 2 still pending are both content expansions that require me to actually think, which is why they are still pending.</p>

<p>The 3 I ignored were all recommendations to add FAQ schema to pages where I genuinely do not think FAQs make sense. I overruled the tool on those and I am not sorry. This is a reminder to myself that the AI recommendations are a strong starting point, not gospel. The humans building the site still have to make the call.</p>

<h2>The Cold Start Problem Is Real</h2>

<p>The thing nobody talks about when they sell you an SEO tool is that SEO tools do not fix the cold start problem. They just make the cold start more visible. I can see exactly what is wrong, exactly what to fix, and exactly how long it will probably take. None of that changes the fact that Google needs time to trust a new domain and nothing in my toolkit speeds that up.</p>

<p>Building an SEO tool with no SEO traffic is the most on-brand thing I could be doing. It forces me to stay honest. If GSCdaddy cannot help me, the solo founder with 9 clicks a month, it cannot help anyone. So I am going to keep using it on my own site, keep publishing the numbers, and keep fixing whatever the data tells me to fix.</p>

<p>The next update will be in 2 weeks. If the numbers look exactly the same, I will say so. If something works, I will explain what. Either way, the spreadsheet stays open.</p>
`,
}
