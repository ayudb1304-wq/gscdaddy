# GSCdaddy × Index Watch: Claude Code kit

This kit turns GSCdaddy from "striking-distance keywords" into **"Google Search Console that tells you what's broken: pages Google won't index, and keywords that almost rank."** It adds one new module, **Index Watch**, built on the read-only Search Console scope GSCdaddy already has.

Why this feature: the Nov 2, 2026 Opportunity Brief found a fresh, repeated pain (new and growing sites stuck in "Crawled / Discovered – currently not indexed") with a search cluster of about 9,290 searches a month (US) that passed all five SEO tests. GSCdaddy already has the OAuth, token storage, cron jobs, billing and email that a standalone indexing tool would need to build from scratch.

## What's in the box

Unzip into the root of the `gscdaddy` repo. Nothing here overwrites an existing file (the repo has no `CLAUDE.md` or `.claude/` folder yet).

| Path | What it is |
| --- | --- |
| `CLAUDE.md` | Project memory: stack, commands, conventions, known gotchas. Claude Code reads it automatically. |
| `docs/index-watch/SPEC.md` | The product spec: who it's for, features, non-goals, Google API facts, data model, scheduling, plan gating. |
| `docs/index-watch/DIAGNOSIS-RULES.md` | The heart of the product: how each Google status and on-page signal maps to a plain-English reason and fix. |
| `docs/index-watch/PLAN.md` | 8 phases of small, checkable tasks with acceptance criteria. Claude Code ticks them off. |
| `docs/index-watch/SEO-PAGES.md` | The first 10 pages to publish, the programmatic page pattern, and internal links, with keyword data. |
| `docs/index-watch/LAUNCH.md` | Week-one go-to-market, threads to answer, kill criteria. For you, not Claude. |
| `docs/index-watch/drafts/015_index_watch.sql` | Draft migration. Claude Code checks it against the live schema before applying. |
| `docs/index-watch/drafts/url-inspection.ts`, `sitemaps.ts` | Reference API clients for the two Google endpoints, written against the official docs. |
| `.claude/commands/*.md` | Slash commands: `/iw-next`, `/iw-verify`, `/iw-review`, `/iw-seo-page`, `/iw-status`. |
| `.claude/agents/iw-reviewer.md` | A reviewer subagent that checks a diff against the spec and the Google quota rules. |
| `.claude/settings.json` | Permissions: allows typecheck/lint/build, blocks reading `.env*` files and pushing to master. |
| `START-HERE.md` | The exact first prompt to paste into Claude Code. |

## How to use it

1. Unzip into the repo root and commit the kit on a branch: `git checkout -b feat/index-watch`.
2. Open Claude Code in the repo. Paste the prompt from `START-HERE.md`.
3. Then loop: `/iw-next` → review → `/iw-verify` → commit. One task per loop. `/iw-status` shows progress.
4. Before merging each phase, run `/iw-review`.
5. Publish SEO pages with `/iw-seo-page <slug>` from Phase 7 on.

## Decisions already made (change them in SPEC.md if you disagree)

- **Same brand, same domain.** gscdaddy.com keeps its domain age and 24 blog posts. Index Watch is a new sidebar section plus a homepage repositioning.
- **No "force indexing".** Google says its Indexing API is only for JobPosting and livestream (BroadcastEvent) pages. Index Watch never uses it. That's both the safe choice and the marketing angle.
- **No new OAuth scope.** `webmasters.readonly` already covers URL Inspection and Sitemaps, so no new consent screen and no new Google verification.
- **Included in every paid plan**, with page caps per plan. No new price tier in v1.
- **Rules first, AI later.** Diagnosis is deterministic in v1. Claude Haiku only writes optional "explain this page" text in Phase 8.

## Things I found in the repo that the plan fixes first (Phase 0)

- `scripts/cron-sync-gsc.ts`, the script GitHub Actions actually runs, syncs **every** site, including expired trials. The API route version filters to active users; the script doesn't. Index Watch would double that waste, so it's fixed first.
- `email_unsubscribed` is used in `scripts/cron-send-emails.ts`, but no migration creates it. It probably exists only in the live database; Phase 0 checks and adds a catch-up migration.
- Two migrations share the number `011`. New migrations start at `015`.
- `gscdaddy-log-export-2026-04-14T07-01-25.json` (production request logs with site IDs) is committed to the repo. Consider deleting it from git.
- There are no tests. Phase 1 adds Vitest for the new pure logic only (diagnosis rules, scheduler), not a full test suite.

I couldn't run `npm ci`, typecheck or build here, so Phase 0 starts by recording that baseline on your machine.
