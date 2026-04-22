import type { BlogPost } from "@/lib/blog"

export const whatIsABacklink: BlogPost = {
  slug: "what-is-a-backlink",
  title: "What is a Backlink? Types, Quality Signals, and How to Earn Them",
  description:
    "A backlink is a link from one website to another. Learn the different types of backlinks, what makes one valuable, and how to earn them ethically in 2026.",
  publishedAt: "2026-04-20",
  author: {
    name: "Ayush",
    url: "https://x.com/ayu_theindiedev",
  },
  tags: ["Link Building", "SEO Strategy", "SEO Glossary"],
  schema: ["FAQPage"],
  faqs: [
    {
      question: "Are all backlinks good for SEO?",
      answer:
        "No. Backlinks from spammy, irrelevant, or penalized sites can actually hurt your rankings. What matters is quality over quantity. One link from a respected, relevant site in your niche is worth more than hundreds of links from random low-quality blogs.",
    },
    {
      question: "What is the difference between dofollow and nofollow backlinks?",
      answer:
        "A dofollow link passes authority from the linking site to your site, which is what helps with rankings. A nofollow link includes a rel='nofollow' attribute that tells search engines not to pass authority. Nofollow links still have value for referral traffic and a natural-looking backlink profile, but dofollow links are the ones that directly support rankings.",
    },
    {
      question: "How many backlinks do I need to rank?",
      answer:
        "There is no fixed number. It depends entirely on the competition for your target keyword. For a low-competition long-tail keyword, you might rank with zero backlinks just based on strong content. For a high-competition commercial keyword, you might need hundreds or thousands of high-quality backlinks. Look at what the top-ranking pages have and aim to match or exceed their link profiles.",
    },
  ],
  content: `
<p>A backlink is a link from one website to another. When another site links to your content, that link is a "backlink" from your perspective. Backlinks are one of Google's oldest and strongest ranking signals, and they remain one of the most reliable ways to grow organic search traffic in 2026. But not all backlinks are equal. Understanding what makes a backlink valuable is more important than chasing raw link counts.</p>

<h2>Why Backlinks Matter for SEO</h2>

<p>Backlinks matter because search engines treat them as votes of confidence. When a respected website links to your content, that is a signal that your content is worth reading. Google's original PageRank algorithm was built entirely on this idea, and while the algorithm has evolved enormously since then, the core principle still holds: links from trusted sites carry authority.</p>

<p>Three specific things backlinks do for your SEO.</p>

<p><strong>They pass authority.</strong> A backlink from a high-authority site passes some of that authority to your page and, to a lesser extent, to your whole domain. This is what drives <a href="/blog/what-is-domain-authority">Domain Authority</a> and similar third-party metrics.</p>

<p><strong>They drive referral traffic.</strong> Backlinks are not just SEO signals. They are actual links that real people click. A mention on a popular blog can send meaningful referral traffic that lasts for years, independent of any ranking impact.</p>

<p><strong>They help with discovery and indexing.</strong> Google crawls the web by following links. A new page with no backlinks can take weeks to be discovered. A new page with a few quality backlinks often gets crawled and indexed within hours. For a deeper dive, see <a href="/blog/what-is-indexing-in-seo">how indexing works</a>.</p>

<h2>Types of Backlinks</h2>

<p>Backlinks are not all created the same way. Here are the main categories you will see in practice.</p>

<p><strong>Editorial backlinks.</strong> These are links earned because someone decided your content was worth linking to. A writer references your original research. A blogger mentions your tool in a roundup. These are the gold standard because they come from genuine editorial judgment.</p>

<p><strong>Guest post backlinks.</strong> You write an article for another site and include a link back to your own content. These are common, generally accepted by Google when done thoughtfully, and a reliable way to build links if you can write well.</p>

<p><strong>Directory backlinks.</strong> Links from business directories, niche directories, and resource pages. Quality varies wildly. Links from respected directories like AlternativeTo, Crunchbase, or G2 are valuable. Links from low-quality "submit your URL here" directories are mostly worthless and sometimes harmful.</p>

<p><strong>Forum and community backlinks.</strong> Links from Reddit, Stack Overflow, Hacker News, Indie Hackers, and niche forums. Most are nofollow but they still drive referral traffic and help with brand signals.</p>

<p><strong>Social media backlinks.</strong> Links from Twitter, LinkedIn, Facebook, and similar platforms. These are almost always nofollow and pass minimal authority, but they help with brand visibility and can indirectly lead to editorial links when your content gets wider exposure.</p>

<p><strong>Image and embed backlinks.</strong> Links earned by publishing shareable assets like infographics, embeddable widgets, or original images. Someone uses your asset with attribution and you earn a link from each use.</p>

<h2>Dofollow vs Nofollow Links</h2>

<p>Every backlink is either dofollow or nofollow. This distinction matters because it determines whether the link passes authority to your site.</p>

<p>A <strong>dofollow link</strong> is the default. It has no special attribute and passes PageRank from the linking site to your site. These are the links that directly help rankings.</p>

<p>A <strong>nofollow link</strong> includes a rel="nofollow" attribute. Google treats these as hints rather than directives, meaning they might pass some small amount of authority but significantly less than a dofollow link.</p>

<p>Google also introduced two more specific attributes in recent years. A <strong>rel="ugc"</strong> link marks user-generated content (like forum posts and comments). A <strong>rel="sponsored"</strong> link marks paid or sponsored content. Both behave similarly to nofollow for ranking purposes.</p>

<p>Do not obsess over dofollow vs nofollow. A healthy backlink profile has both types. A site with only dofollow links looks unnatural and can actually trigger penalties. Focus on earning links from relevant, quality sites and let the mix of attributes sort itself out.</p>

<h2>What Makes a Backlink Valuable</h2>

<p>Five factors separate a valuable backlink from a worthless one.</p>

<p><strong>Authority of the linking site.</strong> A link from a site with high <a href="/blog/what-is-domain-authority">Domain Authority</a> or strong organic traffic carries more weight than a link from an unknown site. This is why a single link from nytimes.com can move rankings more than 50 links from random blogs.</p>

<p><strong>Relevance to your niche.</strong> A link from a related site in your space is worth far more than an unrelated link. If you run an SEO tool, a link from searchenginejournal.com is more valuable than a link from a cooking blog, even if both have similar authority.</p>

<p><strong>Context and anchor text.</strong> A link embedded naturally in a relevant paragraph, with descriptive anchor text, is worth more than a link dumped in a footer with anchor text like "click here." Over-optimized exact-match anchor text can actually trigger penalties, so natural variation is important.</p>

<p><strong>Placement on the page.</strong> Links in the main content area are more valuable than links in sidebars, footers, or author bio sections. Google weighs links based on where they appear.</p>

<p><strong>The uniqueness of the link.</strong> A link from a site that has never linked to you before is worth more than the tenth link from a site that already links to you. Linking root domains matter more than total backlink count.</p>

<h2>How to Earn Backlinks</h2>

<p>The easiest way to earn backlinks in 2026 is the same as it has been for years: create content and assets worth linking to, then get them in front of people who might link to them. Here are tactics that actually work.</p>

<p><strong>Publish original research.</strong> Surveys, data analyses, and proprietary studies earn links because journalists and bloggers need to cite sources. A single good data study can earn dozens of quality backlinks over time.</p>

<p><strong>Build a free tool.</strong> Useful free tools (calculators, generators, checkers) are highly linkable. Tools create reasons for sites to link naturally when discussing your topic.</p>

<p><strong>Write guest posts.</strong> Pitch specific, relevant article ideas to blogs in your niche. Expect most pitches to be ignored. A few per week compounds into real link velocity over time.</p>

<p><strong>Submit to quality directories.</strong> AlternativeTo, Crunchbase, G2, GetApp, and similar high-authority directories are worth the effort. Skip the low-quality "submit here for free" spam directories.</p>

<p><strong>Engage on Reddit and Twitter.</strong> Most links from these platforms are nofollow, but they lead to editorial links and brand awareness. A thoughtful Reddit comment can earn you a mention in someone's blog post a few weeks later.</p>

<p><strong>Create linkable assets.</strong> Templates, checklists, comprehensive guides, and "ultimate" resources tend to attract links because other writers use them as reference material. A good comparison or alternatives page can earn links for years.</p>

<h2>Common Mistakes</h2>

<ul>
<li><strong>Buying backlinks.</strong> Paid link schemes violate Google's guidelines and routinely result in penalties. The short-term ranking boost (if any) is not worth the long-term risk of a manual action on your site.</li>
<li><strong>Spamming forums and comment sections.</strong> Dropping links in irrelevant forum threads and blog comments does not build authority. It builds a toxic backlink profile that Google may penalize you for.</li>
<li><strong>Ignoring anchor text variety.</strong> If every backlink to your page uses the exact same keyword-rich anchor text, that looks manipulative. Natural backlink profiles have variation (brand names, URLs, generic phrases like "this guide", and sometimes exact match).</li>
<li><strong>Focusing on quantity over quality.</strong> A thousand low-quality backlinks will not outrank a site with ten great ones. Always prioritize quality and relevance.</li>
<li><strong>Not disavowing toxic links.</strong> If your site has been targeted by negative SEO or has bad links from a previous strategy, use Google's disavow tool to tell Google to ignore them. This is especially important after any penalty.</li>
</ul>

<h2>Frequently Asked Questions</h2>

<h3>Are all backlinks good for SEO?</h3>

<p>No. Backlinks from spammy, irrelevant, or penalized sites can actually hurt your rankings. What matters is quality over quantity. One link from a respected, relevant site in your niche is worth more than hundreds of links from random low-quality blogs.</p>

<h3>What is the difference between dofollow and nofollow backlinks?</h3>

<p>A dofollow link passes authority from the linking site to your site, which is what helps with rankings. A nofollow link includes a rel="nofollow" attribute that tells search engines not to pass authority. Nofollow links still have value for referral traffic and a natural-looking backlink profile, but dofollow links are the ones that directly support rankings.</p>

<h3>How many backlinks do I need to rank?</h3>

<p>There is no fixed number. It depends entirely on the competition for your target keyword. For a low-competition long-tail keyword, you might rank with zero backlinks just based on strong content. For a high-competition commercial keyword, you might need hundreds or thousands of high-quality backlinks. Look at what the top-ranking pages have and aim to match or exceed their link profiles.</p>

<h2>Related Terms</h2>

<p>Backlinks are closely related to <a href="/blog/what-is-domain-authority">Domain Authority</a> (backlinks are the primary input to DA), <a href="/blog/what-is-indexing-in-seo">indexing</a> (backlinks help pages get discovered and indexed), and <a href="/blog/what-is-keyword-difficulty">keyword difficulty</a> (the backlink profiles of ranking pages determine how competitive a keyword is).</p>
`,
}
