# Original HabeshaTips workflow and Yibelalet's matchday adaptation

Reviewed source: `yihalem123/habeshatips`, commit
`8c9dfec78f2cff0f024cf6a5d031e440d29ab30a`. This describes the implementation
at that revision, rather than assuming later upstream changes are present here.

## What the original repository did

Its orchestrator was `pipeline/live/daily.ts`. A scheduled script ran these steps:

1. **Seed six rooms.** Create/update Safe Bet, Value Hunter, Goal Rush, Lockdown,
   Home Fortress and Draw Master. A room is a selection rule set over shared
   probabilities, rather than a separately trained AI.
2. **Ingest the requested date's matches.** The provider registry obtained actual
   fixtures, results, standings and bookmaker prices. It selected providers by
   supported competition, priority, request budget and health. Team aliases joined
   names across providers. Coverage was the big five domestic leagues plus UCL.
3. **Fit the goal model.** Completed historical results trained a time-decayed
   Dixon-Coles model, producing expected home/away goals and probabilities for
   home/draw/away, over/under 2.5 and both teams to score. More recent results had
   more weight. Bookmaker probabilities were de-margined, then blended with 80%
   weight on the market and 20% on the statistical model.
4. **Build a match packet.** The analysis input contained raw/blended probabilities,
   available prices, recent/venue form, rest, head-to-head and standings. Missing
   data was represented as unavailable rather than invented.
5. **Ask Claude for structured analysis.** It returned probabilities and English/
   Amharic rationale. The publisher supported two streams: `model` used blended
   model probabilities; `claude` used the LLM probabilities when analysis existed.
   The `--skip-claude` option avoided that call.
6. **Apply room filters.** Each room checked evidence, market, probability, price
   range, edge/expected value and its daily cap. Candidates were sorted by score.
   A room could publish nothing when no match qualified.
7. **Publish a fixed record.** The original Postgres/Drizzle implementation stored
   selection, publication odds, probability, rationale, basis, timestamp and a
   SHA-256 hash. Duplicate insertions were ignored. Backtests and historical test
   flags were separate from genuine pre-match publication.
8. **Deliver to subscribers.** Published picks appeared on the web and could be
   sent to private Telegram channels or SMS recipients. Chapa handled payments;
   subscription expiry and reminders were separate delivery steps.
9. **Settle and measure.** Result refresh settled the original selections and
   one-unit stakes at publication odds. Leaderboards were recomputed from those
   records, and result posts/expiry/reminders could run afterward.

The website read stored records. It did not discover fixtures or call Claude
every time someone opened a page. The original schedule ran the script externally.

## What now runs in Yibelalet

`src/pipeline/live-profiles.ts` and `scripts/run-live-profiles.ts` provide the
current default flow:

```
Today + tomorrow in Ethiopian time
    -> real fixtures across 11 competitions
    -> completed OpenFootball results
    -> time-decayed Dixon-Coles probabilities
    -> 31 profile-specific selection rules
    -> fixed picks per profile and fixture matchday
    -> Supabase records
    -> server-side subscription check
    -> subscriber selections, probabilities and analysis
    -> verified scores -> settlement -> public performance record
```

- **Fixture coverage:** Premier League, La Liga, Serie A, Bundesliga, Ligue 1,
  Primeira Liga, Eredivisie and Belgian Pro League; Champions League, Europa
  League and Conference League. Cup fixtures appear only on their actual dates.
- **Matchday:** midnight to midnight in `Africa/Addis_Ababa` (UTC+3). Provider
  requests include the previous UTC date to avoid missing matches just after
  local midnight. Picks are selected/capped separately for each kickoff day.
- **History:** CC0 OpenFootball completed domestic results replace the CSV download
  in the default pipeline. A missing result is never interpreted as 0–0. Coverage
  of a fixture does not guarantee enough history on both teams to publish a pick.
  For example, the current Belgian-season history file was unavailable during
  initial verification; available previous-season evidence is used without
  fabricating current-season scores.
- **Predictions:** the same mathematical model supports distinct profile strategies.
  The default path uses statistical probabilities and fixture-specific notes;
  it does not call Claude, blend in missing bookmaker odds or manufacture ROI.
  Existing demonstration identities keep their original identity status.
- **Access:** fixtures and settled performance remain inspectable. Open selections,
  probabilities, notes and source evidence are removed from non-subscriber client
  props. The subscription migration also protects direct Supabase reads.
- **Payments:** real subscriptions live in Supabase, not a local JSON file.
  Activation verifies the stored payment amount, ETB currency, reference, payment
  mode and success status. Duplicate callbacks preserve the original expiry.
  Expired subscriptions do not unlock picks. Local mock authentication and billing
  use local preview records and are disabled in production.
- **Scheduling:** `.github/workflows/matchday-pipeline.yml` prepares daily runs at
  06:00 and 15:00 Ethiopian time, plus result refresh every 30 minutes from 16:00
  through 01:30. This becomes active only after the workflow is pushed to the
  repository's default branch and GitHub Actions secrets are configured. Hosted
  schedules can be delayed. An always-on host can run the same scripts instead.

## Setup still required before charging customers

The live profile runner now includes 32 profiles. Matchday Desk adds a broad
match-result forecast for eligible fixtures across all eleven competitions,
with a ceiling of 100 picks per Ethiopian matchday. It requires at least eight
weighted historical matches for each team; unknown and low-evidence teams are
skipped. Specialist profiles retain their individual limits. Individual pick
cards and analysis hide confidence percentages; historical leaderboard accuracy
continues to use actual settled outcomes. Published snapshots remain unchanged.

1. Apply `supabase/migrations/20261022120000_matchday_subscriptions.sql` in the
   Supabase SQL Editor. It adds subscription storage and changes access policies
   without deleting existing predictions. The configured REST client cannot
   execute schema migrations. Until it is applied, direct database access is not
   protected by the new subscriber policy, so billing is not ready to launch.
2. Configure a real Chapa key and public callback/return URLs, test payment
   verification with a Chapa test account, then disable local mocks for deployment.
3. Publish the workflow and add GitHub Actions secrets
   `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`. Keep the service-role
   key server-only. No repository secret values are committed by this change.

The local checkout preview takes no payment. Telegram/SMS delivery from the
original repository is documented here but is not installed by this adaptation.
