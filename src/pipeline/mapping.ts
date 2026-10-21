import { createHash } from "node:crypto";
import { canonicalTeam, fixtureId, slugTeam } from "./data/teams";
import type { ProviderFixture, ProviderOdds } from "./providers/types";
import type { Candidate, Market, Selection } from "./rooms/config";
import type { MarketType } from "@/domain/types";

export const MODEL_VERSION = "habeshatips-8c9dfec-supabase-v1";
export const marketTypes: Record<Market, MarketType> = {
  '1X2': 'match_result', OU25: 'over_under_2_5', BTTS: 'both_teams_to_score',
};
const selections: Record<Selection, string> = { H: 'home', D: 'draw', A: 'away', O: 'over_2.5', U: 'under_2.5', Y: 'btts_yes', N: 'btts_no' };
export function selectionFor(candidate: Pick<Candidate, 'selection'>) { return selections[candidate.selection]; }
export function sourceFixture(f: Pick<ProviderFixture | ProviderOdds, 'competition' | 'kickoffUtc' | 'homeRaw' | 'awayRaw'>) {
  const home = canonicalTeam(f.homeRaw);
  const away = canonicalTeam(f.awayRaw);
  if (!home || !away) return null;
  return { home, away, id: `ht-${fixtureId(f.competition, f.kickoffUtc, home, away)}`,
    homeId: `ht-team-${slugTeam(home)}`, awayId: `ht-team-${slugTeam(away)}` };
}
export function validOdds(n: number | null): n is number { return n !== null && Number.isFinite(n) && n > 1; }
export function tipHash(parts: Record<string, unknown>) {
  return createHash('sha256').update(JSON.stringify(Object.fromEntries(Object.entries(parts).sort(([a], [b]) => a.localeCompare(b))))).digest('hex');
}
