# Football Leaderboard Implementation Plan

> **For agentic workers:** Implement task-by-task. Steps use checkbox syntax.

**Goal:** Ship `/leaderboard` + `/predictors/[slug]` with 25 seeded profiles, domain metrics, Supabase schema, and demo fallback.

**Architecture:** Next.js App Router UI → repository interface → Supabase or deterministic demo seed. Business logic in `src/domain`.

**Tech Stack:** Next.js, TypeScript, Tailwind, Supabase, Vitest, Recharts

## Global Constraints

- Football only; labeled demo data; no fake paywall; ROI only with betting records
- Dark premium UI; reuse single app shell; env provided later by user

---

### Task 1: Scaffold + deps
- [x] create-next-app
- [ ] add @supabase/supabase-js, @supabase/ssr, vitest, recharts, date-fns

### Task 2: Domain types + metrics + tests
- [ ] types, ranking, accuracy, brier, profit/ROI, chart series
- [ ] vitest unit tests for edge cases

### Task 3: Demo seed + repository
- [ ] deterministic 25 profiles + matches + predictions
- [ ] repository interface + demo + supabase adapters

### Task 4: Supabase migration + seed SQL
- [ ] tables, indexes, RLS public read, seed script

### Task 5: Leaderboard UI
- [ ] filters, search, ranking, responsive table/cards

### Task 6: Profile UI
- [ ] header, metrics, open/history calendar+table, charts, breakdown, similar

### Task 7: Verify
- [ ] test, lint, tsc, build
