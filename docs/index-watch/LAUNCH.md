# Index Watch: launch notes (for Ayush)

## Positioning in one line

"GSCdaddy checks your pages in Google every day, tells you why some aren't indexed, and finds the keywords one push from page 1. No indexing hacks."

## Who to talk to first

Freelance SEOs and small agencies with 3–25 client sites, and bloggers publishing weekly. Not one-off new-site owners; they churn once they're indexed.

## Threads to answer this week (no links; r/SEO removes low-reputation accounts and bans self-promotion)

- r/SEO, Nov 1: "How to speed up indexation and SEO for a brand-new website?" https://www.reddit.com/r/SEO/comments/1xl6nhi/how_to_speed_up_indexation_and_seo_for_a_brandnew/ → give the exact order: Search Console + sitemap, inspect 3–5 money pages, link to them from pages Google already indexed, then wait 1–2 weeks.
- r/SEO, Nov 1: "Did Google change something on the 26th?" https://www.reddit.com/r/SEO/comments/1xl9dcp/did_google_change_something_on_the_26th/ → explain how to tell a ranking swing from a de-indexing problem (Page indexing report vs Performance report).
- X, Nov 1: @iraiansar (134 pages not indexed across 16 sites, triaged by hand) https://x.com/iraiansar/status/2116905966189080770 → ask how long the triage took; offer to run his sites through the beta.
- X, Nov 1: @c100k_ (Search Console's unhelpful "not indexed" message) https://x.com/c100k_/status/2116864523919671696 → reply with what "Crawled – currently not indexed" usually means and the 3 checks.

## Week one after Phases 0–5 ship

| Day | Do |
| --- | --- |
| 1 | Run Index Watch on gscdaddy.com and thecurately.com. Screenshot real numbers for the homepage and posts. |
| 2 | Ship the public index checker (7.1) and status pages 1–2 (7.2). Answer the threads above. |
| 3 | Email past signups (the ones who connected and left): "We now check whether Google indexed your pages. Your site has N pages; want me to run it?" |
| 4 | Build-in-public post on X with the real before/after from day 1. Reddit post in r/juststart with the numbers (no link in body). |
| 5 | DM 10 freelance SEOs who posted about indexing; offer a free month for feedback calls. |
| 6 | Show HN: "Show HN: An index checker that won't touch Google's Indexing API" with the honest angle. |
| 7 | Read every reply; turn the top 3 questions into the next posts. |

Launch sites worth it: Show HN (honest angle), Product Hunt (once the homepage is updated and screenshots are real), AlternativeTo and SaaSHub (list against IndexCheckr and Omega Indexer), Indie Hackers milestone post.

## Kill criteria

| By | Stop Index Watch work and move on if |
| --- | --- |
| 30 days after launch | Fewer than 300 visits to `/tools/index-checker` + status pages, or fewer than 30 sites connected |
| 60 days | Fewer than 5 paying customers who use `/indexing` weekly |
| 90 days | Under $300 MRR, or monthly churn above 15% |

## Pricing check after 30 days

If agencies use it and bloggers don't: raise the Agency plan's URL cap and lead with agency copy. If many free checker users sign in but don't start trials: test the reverse-trial free tier (Phase 8.1).
