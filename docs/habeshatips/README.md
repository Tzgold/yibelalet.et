# HabeshaTips engine in Yibelalet

The statistical engine in `src/pipeline/` is adapted from
[HabeshaTips](https://github.com/yihalem123/habeshatips) at commit
`8c9dfec78f2cff0f024cf6a5d031e440d29ab30a`. Its copyright and license are
preserved in `LICENSE` in this directory. Authentication, payments and the website
remain Yibelalet's implementations.

## Run the live profile pipeline

1. Apply `supabase/migrations/20261012170000_football_leaderboard.sql` if the
   database is new, then `20261021090000_prediction_pipeline.sql` and
   `20261022120000_matchday_subscriptions.sql`. Do not rerun
   the base migration on an existing database.
2. Configure `.env.local` with `NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`, server-only `SUPABASE_SERVICE_ROLE_KEY`, and
   `LEADERBOARD_DATA_SOURCE=supabase`. Never expose the service key in the browser.
3. Run `npm run pipeline:history`. This downloads the current and previous two
   seasons of completed results across eight domestic leagues from
   [OpenFootball football.json](https://github.com/openfootball/football.json),
   published under CC0. Cache files and provenance are in `.data/openfootball`.
4. Run `npm run pipeline:profiles` (also available as `pipeline:daily`). It reads
   actual fixtures from ESPN's public scoreboard and publishes qualifying picks
   across all 31 configured profiles, including the 13 existing human profile
   identities. These test identities keep their existing demo-profile status;
   their new forecasts are statistical model outputs.
5. Run `npm run pipeline:settle` to refresh results and settle open forecasts.

The live profile path does not require Football Data, Odds API or Anthropic keys
and does not make paid model calls. It refuses mock provider input. ESPN is an
unofficial public endpoint; failures are reported and no fixture is invented.
The optional older six-room odds/analysis pipeline remains available as
`npm run pipeline:rooms` and uses its own provider keys and criteria.

Useful options: `--days 2` (today and tomorrow by default; allowed 1–14), `--date YYYY-MM-DD`,
`--dry-run`, `--refresh-history` and `--settle-only`. Matchdays use Ethiopian time
(UTC+3); UTC provider queries include the overlapping previous date. Publication always uses the
actual current timestamp and requires kickoff to be more than two minutes away.
Dry runs read providers and usage accounting, but do not publish or configure profiles.

## Forecast and result contract

- `profile-strategies.ts` defines different markets, league focus, probability
  thresholds, evidence requirements and daily caps. These are filters over a
  shared time-decayed Dixon-Coles model, not 31 independently trained models.
- Only completed historical scores before the training cutoff enter fitting.
  Missing scores are skipped. History older than 45 days blocks new publication.
  Teams without sufficient weighted evidence are skipped, including UCL teams
  not covered by the domestic training history.
- Notes are specific to the fixture and strategy: venue/recent form, expected
  goals or balanced-result probabilities. Metadata records the model version,
  source, training cutoff, evidence, expected goals and publication hash.
- Current statistical forecasts have no verified bookmaker price. They create
  predictions without betting records; no odds, returns or ROI are manufactured.
- Deterministic profile/matchday/slot IDs make repeated runs idempotent and enforce
  this runner's cap per kickoff day. Existing match/market picks are skipped. Published
  selections and probabilities are locked by the existing database trigger.
  This path does not use the legacy priced-publication RPC's cross-publisher cap.
- The Supabase repository excludes demo matches, demo-seeded predictions and
  their betting records from live history, rankings, calendars and charts.
  Those database rows are preserved. Profiles build a new record as real results
  settle; insufficient samples do not display a rank.
- Settlement uses verified regulation-time scores, including double chance.
  Cancelled matches void predictions; postponed matches remain pending. Missing
  scores and extra-time/penalty totals cannot settle a regulation-time pick.
  Settlement RPCs preserve the first result on retries.
- Provider fixture IDs preserve identity across rescheduling when the upstream
  ID is stable. Provider request usage is tracked privately in Supabase.
  Original profile metadata is backed up locally before first configuration.

## Ongoing operation

The website reads stored records; page requests do not run the model. A GitHub
Actions workflow is prepared in `.github/workflows/matchday-pipeline.yml`; enable
it by publishing it to the default branch and configuring its Supabase secrets.
Alternatively, on a persistent Node host with this repository, dependencies,
`.env.local` and `.data/openfootball`, run `pipeline:history` daily,
`pipeline:daily` each morning and `pipeline:settle` during/after matches.
Monitor exit codes and published/settled/provider-error counts. A profile can
have no new pick when its rules do not qualify any actual fixture.

See [WORKFLOW.md](WORKFLOW.md) for the original repository's full flow, the matchday
adaptation, subscriber access and the remaining deployment setup. Do not accept
real payments until the subscription migration has been applied and Chapa tested.

## Validation

Run `npm test`, `npm run typecheck`, `npm run lint` and `npm run build`.
Tests cover score validation, distinct strategies, immutable publication slots,
demo exclusion, regulation-time settlement, database locking/idempotency and
publication permissions. Unit tests use local fixtures and embedded PostgreSQL;
they make no network or paid API calls.
