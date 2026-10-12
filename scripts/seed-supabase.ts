/**
 * Upserts deterministic demo world into Supabase.
 * Requires NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
 *
 * Usage: npm run seed:supabase
 */

import { createClient } from "@supabase/supabase-js";
import { getDemoWorld, resetDemoWorldCache } from "../src/data/demo/seed";

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.",
    );
    process.exit(1);
  }

  resetDemoWorldCache();
  const world = getDemoWorld(new Date());
  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  console.log(`Seeding ${world.profiles.length} demo profiles…`);

  const steps: Array<[string, unknown]> = [
    [
      "competitions",
      await supabase.from("competitions").upsert(
        world.competitions.map((c) => ({
          id: c.id,
          name: c.name,
          short_name: c.shortName,
          country: c.country,
        })),
      ),
    ],
    [
      "teams",
      await supabase.from("teams").upsert(
        world.teams.map((t) => ({
          id: t.id,
          name: t.name,
          short_name: t.shortName,
          logo_url: t.logoUrl,
        })),
      ),
    ],
    [
      "predictor_profiles",
      await supabase.from("predictor_profiles").upsert(
        world.profiles.map((p) => ({
          id: p.id,
          slug: p.slug,
          display_name: p.displayName,
          handle: p.handle,
          profile_type: p.profileType,
          avatar_url: p.avatarUrl,
          bio: p.bio,
          specialties: p.specialties,
          competition_ids: p.competitions,
          join_date: p.joinDate,
          visibility: p.visibility,
          model_type: p.modelType,
          model_version: p.modelVersion,
          methodology: p.methodology,
          is_demo: true,
          created_at: p.createdAt,
          updated_at: p.updatedAt,
        })),
      ),
    ],
    [
      "football_matches",
      await supabase.from("football_matches").upsert(
        world.matches.map((m) => ({
          id: m.id,
          provider_match_id: m.providerMatchId,
          competition_id: m.competitionId,
          home_team_id: m.homeTeamId,
          away_team_id: m.awayTeamId,
          kickoff_at: m.kickoffAt,
          match_status: m.matchStatus,
          home_score: m.homeScore,
          away_score: m.awayScore,
          data_source: "demo",
          updated_at: m.updatedAt,
        })),
      ),
    ],
    [
      "predictions",
      await supabase.from("predictions").upsert(
        world.predictions.map((p) => ({
          id: p.id,
          profile_id: p.profileId,
          match_id: p.matchId,
          market_type: p.marketType,
          selection: p.selection,
          note: p.note,
          probability: p.probability,
          published_at: p.publishedAt,
          locked_at: p.lockedAt,
          model_version: p.modelVersion,
          status: p.status,
          settlement_outcome: p.settlementOutcome,
          settled_at: p.settledAt,
          source_metadata: p.sourceMetadata,
          created_at: p.createdAt,
          updated_at: p.updatedAt,
        })),
      ),
    ],
    [
      "betting_records",
      await supabase.from("betting_records").upsert(
        world.bettingRecords.map((b) => ({
          id: b.id,
          prediction_id: b.predictionId,
          odds_at_publication: b.oddsAtPublication,
          stake_units: b.stakeUnits,
          net_return_units: b.netReturnUnits,
          settled_at: b.settledAt,
          settlement_rule: b.settlementRule,
          created_at: b.createdAt,
          updated_at: b.updatedAt,
        })),
      ),
    ],
  ];

  for (const [name, result] of steps) {
    const res = result as { error: { message: string } | null };
    if (res.error) {
      throw new Error(`${name}: ${res.error.message}`);
    }
    console.log(`✓ ${name}`);
  }

  console.log("Seed complete. Rows are flagged is_demo=true.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
