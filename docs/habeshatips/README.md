# HabeshaTips engine in Yibelalet

The engine in `src/pipeline/` is adapted from
https://github.com/yihalem123/habeshatips at commit
`8c9dfec78f2cff0f024cf6a5d031e440d29ab30a`. The original copyright and license
are preserved in `LICENSE` in this directory. The original website, authentication,
payments and delivery services are not imported. Yibelalet keeps its existing UI.

## Setup

1. Apply `supabase/migrations/20261012170000_football_leaderboard.sql` if it has
   not already been applied, then `20261021090000_prediction_pipeline.sql` in the
   Supabase SQL editor. Do not rerun the first migration on an existing database.
2. Configure `.env.local`: `NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY` and the server-only `SUPABASE_SERVICE_ROLE_KEY`.
   Never use the service-role key in the browser or put it in a `NEXT_PUBLIC_` variable.
3. Download history for the previous two seasons and current season:
   `npm run pipeline:history -- --from 2425 --to 2627` (update season codes each year).
4. Run `npm run pipeline:seed`, then
   `npm run pipeline:daily -- --skip-claude --limit 3` for an initial model-only run.
   `--limit` restricts analyzed fixtures; it does not bypass room criteria. No picks
   is valid when evidence, odds or strategy thresholds are missing.
5. After successful ingestion, set `LEADERBOARD_DATA_SOURCE=supabase` and restart
   the site. Do not run the demo seed against production. Existing demo profiles
   are preserved; they should be reviewed separately before switching a demo-seeded
   database to production.

Optional server-side keys: `FOOTBALL_DATA_ORG_TOKEN` for fixtures/standings,
`THE_ODDS_API_KEY` for bookmaker prices, `ANTHROPIC_API_KEY` for English/Amharic
written analysis. Set `ANALYSIS_MODEL` to a model enabled for your Anthropic account.
Without these keys, keyless providers are used and model-only tips can be generated
where real odds and sufficient history exist. Claude failures fall back to model
picks, clearly marked as having no written analysis. Mock data is refused by the
live runner. No network APIs or paid model calls run during unit tests.

## Scheduled operation

Run scripts on a persistent Node host with the repository, dependencies, `.env.local`
and `.data/football-data` present, with its working directory set to this project.
The website does not run the model during page requests. No external scheduler is
installed by this change.

- Run `npm run pipeline:daily` each morning (for example, 06:00 Africa/Addis_Ababa).
- Run `npm run pipeline:settle` periodically during/after matches (for example,
  every 30 minutes). It refreshes the dates of all unresolved tips, not just today.
- Refresh current-season training CSVs daily with `npm run pipeline:history -- --from 2627 --to 2627`.
- Monitor script exit codes and the returned analyzed/published/settled counts.
  Provider failures are logged; fallback exhaustion can leave no new tips or results.

`--date YYYY-MM-DD` selects a UTC fixture day; tips are still published only before
their actual kickoff and publication time is always the real current time.
Historical inputs cannot manufacture a live track record.

## Data contract

- Six strategy profiles use `ht-strategy-*` IDs and `habeshatips-*` slugs.
  They are filters over one Dixon-Coles model blended 80% toward margin-free
  bookmaker prices, not six independently trained models. Claude supplies optional
  commentary; its probabilities do not replace the published model probabilities.
- Normalized teams, matches, predictions and betting records go into the same tables
  the existing repository reads. Rankings/charts recalculate from settled records.
- Each tip records its model version, analysis reference, provider, bookmaker,
  English note, Amharic rationale in source metadata and a SHA-256 content hash.
  Profile tips show the Amharic rationale when the site language is Amharic,
  falling back to the English note when a translation is unavailable.
  Full packets and Claude responses are in the service-only `pipeline_analyses` table.
- Publication and its one-unit betting record are atomic. Original predictions and
  odds survive retries. Database profile locks enforce daily caps across publishers.
  Published picks lock immediately and cannot change selection or probability.
- Settlement is atomic and idempotent. Cancelled matches void the bet; postponed
  matches stay pending. Unknown/missing scores and extra-time totals are not treated
  as regulation-time results. Outcomes use 90 minutes plus stoppage time.
- Provider usage is stored privately in Supabase. Provider responses cache in
  `.data/provider-cache` for at most five minutes when caching is enabled.
- Fixture identity follows the upstream canonical-team/competition/UTC-day key.
  Rescheduling to a different UTC day requires reconciling the original match ID
  with the new provider fixture; until reconciled, the original tip stays pending.
- CSV history covers the big five domestic leagues. UCL fixtures can use the same
  team evidence; teams absent from training are skipped by evidence rules.

## Validation

`npm test` includes model mapping tests and embedded PostgreSQL tests for both
migrations, publication rollback, duplicates, daily caps, kickoff rejection,
settlement idempotency and RPC permissions. Run `npm run typecheck`, `npm run lint`
and `npm run build` before release. A live provider/database smoke test still needs
your project credentials and applied migrations.
