# Start here

1. Unzip this kit into the root of your `gscdaddy` checkout (it adds `CLAUDE.md`, `.claude/`, `docs/index-watch/`, `KIT-README.md` and this file; it doesn't overwrite anything).
2. `git checkout -b feat/index-watch && git add -A && git commit -m "docs: add Index Watch Claude Code kit"`
3. Open Claude Code in the repo and paste the prompt below.

---

## First prompt (paste as-is)

```
We're adding a new module to GSCdaddy called Index Watch. Before writing any code:

1. Read CLAUDE.md, docs/index-watch/SPEC.md, docs/index-watch/DIAGNOSIS-RULES.md and docs/index-watch/PLAN.md.
2. Skim the code those docs point to: lib/google/*, lib/sync/gsc-sync.ts, lib/billing/plans.ts and access.ts, app/(dashboard)/layout.tsx, components/dashboard/sidebar.tsx, app/api/sites/[siteId]/sync/route.ts, scripts/cron-*.ts, .github/workflows/crons.yml, lib/health-check/crawler.ts, supabase/migrations/.
3. Tell me, in under 20 lines:
   - anything in the spec or plan that conflicts with how the code actually works,
   - any task you think is mis-ordered or missing,
   - your questions for me.
Don't change files yet. After I answer, start Phase 0 with /iw-next.
```

## Then the loop

```
/iw-next            # does the next task, stops for my OK before committing
/iw-verify          # typecheck, lint, tests, build + guardrails
/iw-status          # where are we
/iw-review master   # independent review before merging a phase
/iw-seo-page 3      # write SEO page #3 from SEO-PAGES.md (Phase 7)
```

## Things only you can do

- Approve the migration before it's applied to the live Supabase project (task 1.1).
- Add any new secrets to GitHub Actions (none expected; the index-watch job reuses the sync-gsc secrets).
- Approve homepage and pricing copy (task 7.4) and any change to prices.
- Decide on the free tier (Phase 8.1).
- Supply real screenshots and numbers for posts (marked `TODO screenshot`).
