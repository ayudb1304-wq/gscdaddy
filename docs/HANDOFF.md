# Handoff: redesign done, Index Watch next

Branch: `redesign/marketing-and-app` (not merged). Written Nov 2, 2026 at the end of a local Claude Code session, for the cloud session that picks this up.

## What's done on this branch

| Commit | What |
| --- | --- |
| `55299bb` | **Fix:** dashboard totals, chart and metrics API summed one PostgREST query (max 1,000 rows), so busy sites were undercounted. New `lib/supabase/fetch-all.ts` pages through. Migration `015_fix_refresh_striking_distance.sql` (refresh as SECURITY DEFINER, service-role only) — **already applied to the live DB** and verified. |
| `b327880` | Design system in `app/globals.css`: Archivo (headings), Gabarito (body), JetBrains Mono; lime brand + ink; pastel `tile-*` colours; status tokens `critical/warning/info/ok` (+ `-soft`). Bigger shadcn primitives; `Button variant="ink"`, `Badge` status variants. |
| `4a65b07` | Reasonal-style homepage (`app/page.tsx`, `components/marketing/*`), Higgsfield art in `public/marketing/` (regenerate with `scripts/generate-marketing-art.mjs`), real app screenshots in the hero and Today tile. Public pages moved into `app/(marketing)/` (same URLs) with shared nav/footer. Login redesigned. |
| `7f0e442` | App shell/sidebar/header redesign, Today focus tile, keyword table bars. **Fixes:** shipped-fix results hit the 1,000-row cap (now one paged query per fix); "Yesterday's movers" counted back from *now* while GSC lags 2–3 days, so everything looked like a drop (now anchored to each site's newest data). `scripts/demo-site.mjs` seeds/removes a fictional demo site. |
| `c9bd734` | Sidebar wrapped in Suspense (it reads search params) — fixed Radix hydration-id mismatches. |
| `1643f9c` | Onboarding in the new style (no forced dark). |

Checks at hand-off: `npm run typecheck` passes, `next build` passes. `npm run lint` still reports pre-existing problems in files this branch didn't touch (`components/logo.tsx`, `components/theme-toggle.tsx`, `components/dashboard/welcome-modal.tsx`: setState in effect).

## Open decisions for Ayush

1. **Ship the fixes.** The three data fixes only reach users once this branch is merged and deployed. Open a PR to `master`.
2. **Billing page promises features that don't exist.** `app/(dashboard)/settings/billing/page.tsx` shows "Decay alerts" (all plans) and "PDF exports" (Agency) from `lib/billing/plans.ts`; nothing implements them. Recommendation: remove until built. Don't change prices.
3. **Start Index Watch.** Plan docs are in `docs/index-watch/` (see `START-HERE.md`). Two updates already recorded in its PLAN decision log: its migration becomes **016**, and Phase 7.4 (homepage) is mostly covered by the new homepage.

## Not in git (set these up in the cloud environment)

- **Env vars** (from `.env.local`, never commit): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`, `ANTHROPIC_API_KEY`, `DODO_*`, `RESEND_API_KEY`, `NEXT_PUBLIC_APP_URL`, `CRON_SECRET`, `ENCRYPTION_KEY`, `INDEXNOW_SECRET`, `HIGGSFIELD_API_KEY` (only for regenerating art). The Supabase project (`woeyotulbielflkyofwy`) is **production**: every write is live.
- **Kit agent config.** The Index Watch kit also ships `CLAUDE.md` and `.claude/` (slash commands `/iw-next`, `/iw-verify`, `/iw-review`, `/iw-seo-page`, `/iw-status`, the `iw-reviewer` agent, permissions). They weren't committed from the local session; copy them from `~/Downloads/gscdaddy-index-watch-kit/` into the repo root yourself if you want them. Update `CLAUDE.md`'s "new migrations start at 015" line to 016.

## Things to know

- **Supabase was paused** (free tier) from about Jul 7 until Nov 2 and has been restored. Daily GitHub Actions jobs run against it again.
- **Demo site** for screenshots: `node --env-file=.env.local scripts/demo-site.mjs seed <user-id>`, then `... remove <user-id>` **before 04:00 UTC** (the sync would try to fetch Google data for it and the recs job would spend AI credits). It is currently removed.
- **Still known from the kit's review:** `scripts/cron-sync-gsc.ts` syncs every site including expired trials; `users.email_unsubscribed` exists live but no migration creates it; two migrations share `011`; a production log export (`gscdaddy-log-export-2026-04-14T07-01-25.json`) is committed. These are Index Watch Phase 0 tasks.
