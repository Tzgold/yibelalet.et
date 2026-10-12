# Football Prediction Leaderboard — Design

## Goal

Public football prediction leaderboard (25 demo/seeded profiles) and full per-profile pages with history, analytics, and ranking calculated from stored records.

## Stack

- Next.js App Router + TypeScript + Tailwind
- Supabase Postgres (schema, RLS, seed SQL)
- Repository interface: Supabase when env present; deterministic demo repository when not
- Domain layer for metrics/ranking (unit-tested with Vitest)
- No fake subscription wall; no invented verification

## Routes

- `/` → redirect to `/leaderboard`
- `/leaderboard` — filters, search, ranking metric, time range
- `/predictors/[slug]` — profile header, metrics, open/history, charts, breakdown, similar

## Data model

Profiles, competitions, teams, matches, predictions, optional betting_records. Predictions lock at kickoff; settlement is idempotent. Demo data clearly labeled via `is_demo` / UI banner.

## Ranking

Default: accuracy with min sample size over selected period. Alternatives: recent form, profitability (only with betting records). Stable tie-break: settled count → join date → slug.

## Env (user provides after)

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (seed/admin only, server-side)
- `LEADERBOARD_DATA_SOURCE=supabase|demo` (optional; auto-demo if URL missing)
