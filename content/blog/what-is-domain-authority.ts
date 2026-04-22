import type { BlogPost } from "@/lib/blog"

export const whatIsDomainAuthority: BlogPost = {
  slug: "what-is-domain-authority",
  title: "What is Domain Authority? How It's Calculated and Why It Matters",
  description:
    "Domain Authority is a third-party score from 1 to 100 that predicts how well a website will rank in search. Learn how it's calculated, why Google does not use it directly, and how to improve yours.",
  publishedAt: "2026-04-20",
  author: {
    name: "Ayush",
    url: "https://x.com/ayu_theindiedev",
  },
  tags: ["SEO Strategy", "Link Building", "SEO Glossary"],
  schema: ["FAQPage"],
  faqs: [
    {
      question: "Does Google use Domain Authority?",
      answer:
        "No. Domain Authority is a metric created by Moz, not Google. Google has publicly confirmed multiple times that they do not use Domain Authority or any similar third-party score as a ranking factor. However, because DA correlates with the factors Google does use (primarily backlinks), it remains a useful proxy for gauging site strength.",
    },
    {
      question: "What is a good Domain Authority score?",
      answer:
        "For a new website under a year old, a DA of 10 to 20 is normal and healthy. Established blogs and small business sites typically score 30 to 50. Major publications and authority sites score 70 and above. Domain Authority is logarithmic, so moving from 20 to 30 is much easier than moving from 60 to 70.",
    },
    {
      question: "How do I increase my Domain Authority?",
      answer:
        "The single biggest lever is earning high-quality backlinks from authoritative sites in your niche. Beyond that, publishing consistent high-quality content, building internal linking structure, and having a clean technical SEO foundation all help. Paid link schemes will not move DA in a sustainable way and can get your site penalized.",
    },
  ],
  content: `
<p>Domain Authority (DA) is a third-party metric created by Moz that predicts how well a website will rank in search results. It is scored on a logarithmic scale from 1 to 100, where higher scores indicate stronger ranking potential. Domain Authority is one of the most widely cited SEO metrics, but it is also one of the most misunderstood. This post covers what it actually is, what it is not, and how to use it without falling into common traps.</p>

<h2>Why Domain Authority Matters for SEO</h2>

<p>Domain Authority matters because it gives you a quick, comparable number to gauge the relative strength of any website, including your own. Without a metric like this, assessing whether a site is authoritative would require digging through backlink profiles, content quality, and technical fundamentals manually. DA compresses all of that into a single score.</p>

<p>The metric is primarily driven by a site's backlink profile. Sites with many high-quality <a href="/blog/what-is-a-backlink">backlinks</a> from authoritative sources score higher. Sites with few backlinks or spammy backlinks score lower. Because backlinks are one of Google's strongest ranking signals, DA tends to correlate with actual ranking performance, even though Google does not use DA itself.</p>

<p>For practical SEO work, Domain Authority is useful in three ways. It helps you benchmark your site against competitors. It helps you evaluate potential guest post and partnership opportunities. And it gives you a progress marker over time as your site grows.</p>

<h2>How Domain Authority Is Calculated</h2>

<p>Moz calculates Domain Authority using a machine learning model trained to predict how sites will rank against each other. The model considers dozens of factors, but the biggest drivers are:</p>

<ul>
<li><strong>Linking root domains.</strong> The number of unique websites that link to your site. More is better, and variety matters more than raw link count.</li>
<li><strong>Quality of linking domains.</strong> A single link from a high-DA site like nytimes.com is worth more than 100 links from low-DA blogs.</li>
<li><strong>Relevance of linking domains.</strong> Links from sites in your niche carry more weight than random unrelated links.</li>
<li><strong>Total number of backlinks.</strong> The raw count of links, though this matters less than linking root domains.</li>
<li><strong>Spam score.</strong> Sites with links from known spam sources get penalized.</li>
</ul>

<p>The scale is logarithmic. Moving from DA 20 to DA 30 might take a handful of good backlinks. Moving from DA 60 to DA 70 typically requires years of sustained link-earning at a level most sites never reach. This is why you see a lot more sites with DA 20 than DA 80.</p>

<p>It is also worth knowing that DA is relative. Moz recalibrates the scale periodically based on the overall backlink graph of the web. If the top sites on the internet gain backlinks faster than everyone else, your DA can actually drop even if your own backlink profile is improving. This is confusing but normal.</p>

<h2>Domain Authority vs Other Authority Metrics</h2>

<p>Domain Authority is the most famous of these scores, but it is not the only one. Each major SEO tool has its own version.</p>

<ul>
<li><strong>Domain Rating (DR)</strong> from Ahrefs is conceptually similar to DA but calculated with Ahrefs' own index of the web. Many SEOs prefer DR because Ahrefs' index is widely considered the most comprehensive.</li>
<li><strong>Authority Score</strong> from Semrush combines backlink data with organic traffic and other signals, making it slightly more holistic than DA or DR.</li>
<li><strong>Trust Flow and Citation Flow</strong> from Majestic split authority into two separate scores, one measuring link quality and one measuring link quantity.</li>
</ul>

<p>All of these metrics are useful and all of them are imperfect. None of them are used by Google directly. The takeaway is to pick one and use it consistently. Do not obsess over small differences between tools because the underlying truth is the same: sites with strong, relevant backlink profiles rank better.</p>

<h2>What Domain Authority Is Not</h2>

<p>Three things about Domain Authority that often confuse people.</p>

<p><strong>Google does not use DA.</strong> This is worth repeating. Google has stated publicly many times that they do not use Domain Authority, Domain Rating, or any third-party score as a ranking signal. Google has their own internal scoring systems based on their own crawl and analysis. DA correlates with ranking because DA is built from the same backlink data Google also uses, not because Google looks at DA.</p>

<p><strong>DA is not a fixed number.</strong> Your DA can go up or down even if you do nothing. Moz updates their index regularly, competitors gain or lose backlinks, and the overall scale shifts. Month-to-month fluctuations of 1 to 3 points are normal and not a cause for concern.</p>

<p><strong>DA alone does not determine whether you rank.</strong> A page on a DA 20 site can absolutely outrank a page on a DA 80 site for a specific keyword if the DA 20 page has better content, better <a href="/blog/what-is-search-intent">search intent</a> match, and strong topical relevance. DA is one factor among many, and for <a href="/blog/what-is-long-tail-keywords">long-tail keywords</a> in particular, high DA is often not required.</p>

<h2>How to Improve Your Domain Authority</h2>

<p>Improving DA is really just doing good SEO over time. The shortcuts are all scams that eventually hurt you.</p>

<p><strong>Earn high-quality backlinks.</strong> This is the biggest lever by far. Pitch guest posts to relevant blogs. Build linkable assets like original research, tools, and templates. Submit to quality directories. Get featured in industry roundups. The best backlinks come from sites that are both relevant to your niche and respected by your audience.</p>

<p><strong>Publish consistently.</strong> Sites that publish quality content regularly tend to accumulate backlinks faster. Each piece of content is an opportunity to earn a link. A site with 10 articles earns fewer natural links than a site with 200.</p>

<p><strong>Build out internal linking.</strong> Internal links do not directly affect DA, but they help Google understand your site structure and distribute authority across pages. A well-linked site tends to perform better, which tends to attract more external links.</p>

<p><strong>Fix your technical SEO.</strong> A site with crawl errors, slow load times, and broken pages is less likely to earn backlinks and more likely to lose the ones it has. Basic technical hygiene like HTTPS, mobile responsiveness, and Core Web Vitals indirectly supports DA growth.</p>

<p><strong>Disavow spammy backlinks if necessary.</strong> If you have a history of bad backlinks from link schemes or spam networks, disavow them through Google Search Console. Moz's spam score is part of the DA calculation, so cleaning up toxic links can actually raise your score.</p>

<h2>Common Mistakes</h2>

<ul>
<li><strong>Treating DA as a ranking factor.</strong> DA predicts ranking, it does not cause ranking. Focus on the underlying work (content, backlinks, technical SEO) rather than the score itself.</li>
<li><strong>Buying links to boost DA.</strong> Paid link schemes can temporarily raise DA but they violate Google's guidelines and often get penalized. The short-term boost is not worth the long-term risk.</li>
<li><strong>Comparing DA across different niches.</strong> A DA 40 in a low-competition niche like "indie SaaS tools" is very different from a DA 40 in a competitive niche like "credit cards." Always compare within your own space.</li>
<li><strong>Expecting DA to move fast.</strong> Because DA is logarithmic, progress slows down at higher scores. A brand new site can go from DA 1 to DA 25 in a year. Moving from DA 50 to DA 60 can easily take 3 to 5 years.</li>
</ul>

<h2>Frequently Asked Questions</h2>

<h3>Does Google use Domain Authority?</h3>

<p>No. Domain Authority is a metric created by Moz, not Google. Google has publicly confirmed multiple times that they do not use Domain Authority or any similar third-party score as a ranking factor. However, because DA correlates with the factors Google does use (primarily backlinks), it remains a useful proxy for gauging site strength.</p>

<h3>What is a good Domain Authority score?</h3>

<p>For a new website under a year old, a DA of 10 to 20 is normal and healthy. Established blogs and small business sites typically score 30 to 50. Major publications and authority sites score 70 and above. Domain Authority is logarithmic, so moving from 20 to 30 is much easier than moving from 60 to 70.</p>

<h3>How do I increase my Domain Authority?</h3>

<p>The single biggest lever is earning high-quality backlinks from authoritative sites in your niche. Beyond that, publishing consistent high-quality content, building internal linking structure, and having a clean technical SEO foundation all help. Paid link schemes will not move DA in a sustainable way and can get your site penalized.</p>

<h2>Related Terms</h2>

<p>Domain Authority is closely related to <a href="/blog/what-is-a-backlink">backlinks</a> (the primary input to DA calculations), <a href="/blog/what-is-keyword-difficulty">keyword difficulty</a> (DA of top-ranking sites influences KD), and <a href="/blog/what-is-indexing-in-seo">indexing</a> (pages on higher-DA sites tend to get indexed faster).</p>
`,
}
