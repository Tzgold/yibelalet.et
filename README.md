# Yibelalet — Football Prediction Leaderboard

Next.js + Supabase football tipster/AI predictor leaderboard with full profile analytics.

## Quick start (demo data, no credentials)

```bash
npm install
npm run dev
```

Open [http://localhost:3000/leaderboard](http://localhost:3000/leaderboard).

Without Supabase env vars the app uses a deterministic **demonstration** dataset (25 profiles), clearly labeled in the UI.

## Connect Supabase

1. Create a Supabase project.
2. Copy `.env.example` → `.env.local` and fill:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (seed only; server-side)
3. Run the migration SQL in the Supabase SQL editor:
   - `supabase/migrations/20261012170000_football_leaderboard.sql`
4. Seed demo rows (idempotent upsert):

```bash
npm run seed:supabase
```

5. Restart `npm run dev`. The app switches to Supabase automatically when URL + anon key are present.

Set `LEADERBOARD_DATA_SOURCE=demo` to force demo mode even with credentials.

## Real prediction engine

The HabeshaTips engine has been adapted to the existing Supabase tables. See
[setup and operations](docs/habeshatips/README.md) for migrations, server-only keys,
history downloads, `npm run pipeline:daily`, and result settlement.

## Routes

- `/leaderboard` — searchable, filterable rankings
- `/predictors/[slug]` — profile, open tips, history calendar/table, charts, breakdowns

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Local app |
| `npm test` | Domain unit tests |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript |
| `npm run build` | Production build |
| `npm run seed:supabase` | Upsert demo world into Supabase |

## Notes

- ROI / net profit only appear when `betting_records` exist.
- Settled/locked predictions cannot silently change selection (DB trigger + domain guards).
- Demo records are flagged `is_demo` and labeled in the UI.
