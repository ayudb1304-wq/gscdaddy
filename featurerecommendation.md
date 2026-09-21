# Feature Recommendations

Ideas and feedback collected from community conversations, user feedback, and build-in-public interactions.

---

## From Reddit (r/TechSEO — April 6, 2026)

### 1. Provisional data label for recent days
**Source:** Reddit user on r/TechSEO
**Problem:** GSC data has a 2-3 day delay. We removed the delay buffer so new sites see data faster, but recent days show incomplete numbers that silently shift later.
**Recommendation:** Keep the recent data visible but label it as "provisional" or "partial." Users get less upset seeing incomplete data when it is clearly marked than by making decisions on numbers that quietly change 48 hours later.
**Priority:** High
**Status:** Not started

### 2. Archive historical data beyond 16-month API limit
**Source:** Reddit user on r/TechSEO
**Problem:** The GSC API only retains 16 months of data. After that it is gone.
**Recommendation:** Since data is already in Postgres, add a retention flag so synced data never gets deleted even after it falls outside the 16-month API window. Own the historical layer instead of depending on Google keeping it available.
**Priority:** Medium
**Status:** Not started

### 3. Bulk Data Export gap filling
**Source:** Reddit user on r/TechSEO
**Context:** Google's Bulk Data Export to BigQuery is not retroactive. By the time someone sets it up they have already lost the historical data they wanted. GSCdaddy fills this gap for smaller sites that do not need BigQuery.
**Priority:** Low (informational, validates existing approach)
**Status:** N/A

---

## From Community Feedback

### 4. Free tools for link bait and organic reach
**Source:** Ahrefs footer strategy analysis
**Recommendation:** Build more free tools that target high-volume keywords and attract backlinks naturally. Candidates:
- GSC Data Checker (paste a URL, check if indexed)
- Title Tag Analyzer
- Meta Description Length Checker
**Priority:** Medium
**Status:** Keyword calculator shipped (`/tools/keyword-calculator`)

### 5. RSS feed
**Source:** Bot crawlers hitting /rss, /atom, /feed and getting 404s
**Recommendation:** Add RSS feed for blog content discovery.
**Priority:** Low
**Status:** Done (`/feed.xml`)

---

## From Build-in-Public Learnings

### 6. Relaxed thresholds for small sites
**Source:** Own testing with gscdaddy.com and thecurately.com
**Problem:** Default materialized view required 50+ impressions and 28-day window. Small sites with low traffic showed zero striking distance keywords.
**Recommendation:** Lowered to 10 impressions and 90-day window. Works for small sites without affecting large site experience.
**Priority:** High
**Status:** Done

### 7. Skip cron jobs for expired trial users
**Source:** Cost analysis
**Problem:** Dormant users with expired trials still had their sites synced daily, consuming API calls and database storage.
**Recommendation:** Cron sync only processes sites belonging to users with active trial or paid subscription.
**Priority:** High
**Status:** Done
