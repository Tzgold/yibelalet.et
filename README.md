# Yibelalet — Football Prediction Leaderboard

Next.js + Supabase football tipster/AI predictor leaderboard with full profile analytics.

## Quick start (demo data, no credentials)

```bash
npm install
npm run dev
```

Open [http://localhost:3000/leaderboard](http://localhost:3000/leaderboard).

Without Supabase env vars the app uses a deterministic **demonstration** dataset (25 profiles), clearly labeled in the UI.

## Open the local app on a phone

1. Connect the phone and development computer to the same Wi-Fi network.
2. Stop any existing dev server with `Ctrl+C`, then run `npm run dev:lan` on the computer.
3. In PowerShell, run `ipconfig` and find the **IPv4 Address** under the active Wi-Fi adapter. Open `http://<Wi-Fi-IPv4>:3000/` in the phone's browser. For example, if the address is `192.168.1.6`, open `http://192.168.1.6:3000/`.

The phone cannot use `localhost`, because that points back to the phone. Ignore virtual-adapter addresses (for example WSL, Docker or VPN) shown in the Next.js `Network` line if they differ from the active Wi-Fi address. If Windows asks whether to allow Node.js through the firewall, allow access on **Private networks** for this trusted Wi-Fi. Keep the terminal running while using the phone; the Wi-Fi address can change later.

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
| `npm run dev:lan` | Local app reachable from another device on the same Wi-Fi |
| `npm test` | Domain unit tests |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript |
| `npm run build` | Production build |
| `npm run seed:supabase` | Upsert demo world into Supabase |

## Notes

- ROI / net profit only appear when `betting_records` exist.
- Settled/locked predictions cannot silently change selection (DB trigger + domain guards).
- Demo records are flagged `is_demo` and labeled in the UI.
