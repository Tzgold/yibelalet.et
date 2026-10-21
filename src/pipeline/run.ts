import { randomUUID } from 'node:crypto';
import { pipelineDb, allRows, type PipelineDb } from './db';
import { COMPETITIONS, COMPETITION_CODES, type CompetitionCode } from './data/api-football';
import { LEAGUE_CODES, loadSeasons, type Match } from './data/football-data';
import { canonicalTeam } from './data/teams';
import { withProvider } from './providers/registry';
import type { ProviderFixture, ProviderOdds, ProviderStanding } from './providers/types';
import { fit } from './model/dixon-coles';
import { ROOMS, type Candidate, type MatchContext } from './rooms/config';
import { settle } from './rooms/settle';
import { buildPacket } from './packet';
import { analyzeMatch } from './analysis/claude';
import { MODEL_VERSION, sourceFixture, marketTypes, selectionFor, tipHash, validOdds } from './mapping';

const profileId = (slug: string) => `ht-strategy-${slug}`;
function check(error: { message: string } | null) { if (error) throw new Error(error.message); }
function seasonCode(year: number) { return `${String(year % 100).padStart(2, '0')}${String((year + 1) % 100).padStart(2, '0')}`; }

export async function seedStrategies(db: PipelineDb) {
  const competitionIds = COMPETITION_CODES.map((code) => `ht-comp-${code}`);
  check((await db.from('competitions').upsert(COMPETITION_CODES.map((code) => ({
    id: `ht-comp-${code}`, name: COMPETITIONS[code].name, short_name: code, country: COMPETITIONS[code].country,
  })))).error);
  // Preserve the original join date when rerunning the seed.
  const existing = await allRows(db, 'predictor_profiles');
  check((await db.from('predictor_profiles').upsert(ROOMS.map((room) => ({
    id: profileId(room.slug), slug: `habeshatips-${room.slug}`, display_name: room.nameEn,
    handle: `habeshatips_${room.slug.replaceAll('-', '_')}`, profile_type: 'ai',
    bio: room.tag, specialties: room.markets.map((m) => marketTypes[m]), competition_ids: competitionIds,
    join_date: existing.find((p) => p.id === profileId(room.slug))?.join_date ?? new Date().toISOString().slice(0, 10),
    visibility: 'public', model_type: 'Dixon-Coles + market strategy', model_version: MODEL_VERSION,
    methodology: `Shared statistical model blended 80% toward bookmaker probabilities. ${room.rules.map((r) => `${r.label}: ${r.value}`).join('; ')}. Written analysis uses Claude when configured.`,
    is_demo: false, updated_at: new Date().toISOString(),
  })))).error);
}

async function storeFixtures(db: PipelineDb, fixtures: ProviderFixture[]) {
  for (const f of fixtures) {
    const mapped = sourceFixture(f);
    if (!mapped || !Number.isFinite(f.kickoffUtc.getTime())) continue;
    if (f.status === 'finished' && (f.homeGoals === null || f.awayGoals === null || !Number.isInteger(f.homeGoals) || !Number.isInteger(f.awayGoals))) continue;
    check((await db.from('teams').upsert([
      { id: mapped.homeId, name: mapped.home, short_name: mapped.home.slice(0, 3).toUpperCase() },
      { id: mapped.awayId, name: mapped.away, short_name: mapped.away.slice(0, 3).toUpperCase() },
    ])).error);
    check((await db.from('football_matches').upsert({
      id: mapped.id, provider_match_id: mapped.id, competition_id: `ht-comp-${f.competition}`,
      home_team_id: mapped.homeId, away_team_id: mapped.awayId, kickoff_at: f.kickoffUtc.toISOString(),
      match_status: f.status, home_score: f.homeGoals, away_score: f.awayGoals,
      data_source: `habeshatips:${f.provider}`, updated_at: new Date().toISOString(),
    })).error);
  }
}

export function outcomeFor(selection: string, market: string, home: number, away: number) {
  const choices = { home: 'H', draw: 'D', away: 'A', 'over_2.5': 'O', 'under_2.5': 'U', btts_yes: 'Y', btts_no: 'N' } as const;
  const markets = { match_result: '1X2', over_under_2_5: 'OU25', both_teams_to_score: 'BTTS' } as const;
  const s = choices[selection as keyof typeof choices];
  const m = markets[market as keyof typeof markets];
  if (!s || !m) throw new Error(`Unsupported pipeline selection: ${market}/${selection}`);
  return settle({ market: m, selection: s }, home, away);
}

export async function settleTips(db: PipelineDb) {
  const [predictions, matches] = await Promise.all([allRows(db, 'predictions'), allRows(db, 'football_matches')]);
  let count = 0;
  for (const p of predictions) {
    if (!String(p.profile_id).startsWith('ht-strategy-') || ['settled', 'void'].includes(String(p.status))) continue;
    const m = matches.find((m) => m.id === p.match_id);
    if (!m) continue;
    let outcome: string;
    if (m.match_status === 'cancelled') outcome = 'void';
    else if (m.match_status === 'finished' && Number.isInteger(m.home_score) && Number.isInteger(m.away_score)) {
      outcome = outcomeFor(String(p.selection), String(p.market_type), Number(m.home_score), Number(m.away_score));
    } else {
      const status = m.match_status === 'live' ? 'live' : m.match_status === 'postponed' ? 'postponed' : 'upcoming';
      if (status !== p.status) check((await db.from('predictions').update({ status }).eq('id', p.id)).error);
      continue;
    }
    const result = await db.rpc('settle_pipeline_tip', { p_prediction_id: p.id, p_outcome: outcome });
    check(result.error);
    if (result.data) count++;
  }
  return count;
}

export interface RunOptions { date: string; only?: 'seed' | 'settle'; skipClaude?: boolean; limit?: number }
export async function runPipeline(options: RunOptions) {
  const mockVariables = ['PROVIDER_MOCK', 'ANALYSIS_MOCK', 'ESPN_MOCK', 'FOOTBALLDATAORG_MOCK', 'OPENLIGADB_MOCK', 'THEODDSAPI_MOCK'];
  if (mockVariables.some((key) => process.env[key] === '1')) throw new Error('Mock data cannot be published into live profiles.');
  const date = new Date(`${options.date}T00:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(options.date) || !Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== options.date) throw new Error('Use a valid UTC date (YYYY-MM-DD).');
  if (options.limit !== undefined && (!Number.isInteger(options.limit) || options.limit < 1)) throw new Error('limit must be a positive integer');
  const db = pipelineDb();
  await seedStrategies(db);
  if (options.only === 'seed') return { profiles: ROOMS.length, published: 0, settled: 0 };
  const season = date.getUTCMonth() >= 6 ? date.getUTCFullYear() : date.getUTCFullYear() - 1;
  const fixtures: ProviderFixture[] = [];
  const odds = new Map<string, ProviderOdds>();
  const standings = new Map<string, Map<string, ProviderStanding>>();
  // Refresh every unresolved tip's match day, including previous days.
  const [existingPredictions, existingMatches] = await Promise.all([allRows(db, 'predictions'), allRows(db, 'football_matches')]);
  const pendingIds = new Set(existingPredictions.filter((p) => String(p.profile_id).startsWith('ht-strategy-') && !['settled', 'void'].includes(String(p.status))).map((p) => p.match_id));
  const refresh = new Map<CompetitionCode, Set<string>>(COMPETITION_CODES.map((code) => [code, new Set([options.date])]));
  for (const match of existingMatches) {
    if (!pendingIds.has(match.id)) continue;
    const code = String(match.competition_id).replace('ht-comp-', '') as CompetitionCode;
    refresh.get(code)?.add(String(match.kickoff_at).slice(0, 10));
  }
  for (const code of COMPETITION_CODES) {
    for (const day of refresh.get(code)!) {
      const dayDate = new Date(day);
      const daySeason = dayDate.getUTCMonth() >= 6 ? dayDate.getUTCFullYear() : dayDate.getUTCFullYear() - 1;
      const result = await withProvider('fixtures', code, (p) => p.fixtures!(code, daySeason, { from: day, to: day }), { accept: (r) => r.length > 0 });
      if (result) { await storeFixtures(db, result.result); if (day === options.date) fixtures.push(...result.result); }
    }
    if (options.only === 'settle') continue;
    const prices = await withProvider('odds', code, (p) => p.odds!(code), { credits: 2, accept: (r) => r.length > 0 });
    for (const price of prices?.result ?? []) { const mapped = sourceFixture(price); if (mapped) odds.set(mapped.id, price); }
    const table = await withProvider('standings', code, (p) => p.standings!(code, season), { accept: (r) => r.length > 0 });
    standings.set(code, new Map((table?.result ?? []).flatMap((s) => { const team = canonicalTeam(s.teamRaw); return team ? [[team, s] as const] : []; })));
  }
  const settled = await settleTips(db);
  if (options.only === 'settle') return { profiles: ROOMS.length, published: 0, settled };
  const history = loadSeasons(LEAGUE_CODES, [seasonCode(season - 2), seasonCode(season - 1), seasonCode(season)])
    .filter((m) => m.date < date && m.date >= new Date(Date.UTC(season - 2, 6, 1)));
  if (!history.length) throw new Error('No training history. Run npm run pipeline:history before generating tips.');
  const model = fit(history, { asOf: date, xi: 0.002 });
  const candidates = new Map<string, { matchId: string; c: Candidate; note: string; metadata: Record<string, unknown> }[]>();
  let analyzed = 0;
  for (const f of fixtures) {
    if (f.status !== 'scheduled' || f.kickoffUtc <= new Date()) continue;
    const mapped = sourceFixture(f);
    if (!mapped || !odds.has(mapped.id)) continue;
    if (options.limit !== undefined && analyzed >= options.limit) break;
    const price = odds.get(mapped.id)!;
    const cleanPrice = { ...price };
    for (const key of ['h', 'd', 'a', 'over25', 'under25', 'bttsYes', 'bttsNo'] as const) if (!validOdds(cleanPrice[key])) cleanPrice[key] = null;
    const built = buildPacket({ home: mapped.home, away: mapped.away, leagueCode: f.competition, leagueName: COMPETITIONS[f.competition].name, kickoffAt: f.kickoffUtc, round: f.round }, model, history as Match[], standings, cleanPrice);
    let llm: Awaited<ReturnType<typeof analyzeMatch>> | null = null;
    if (!options.skipClaude && process.env.ANTHROPIC_API_KEY) {
      try { llm = await analyzeMatch(built.packet); }
      catch { console.warn(`Analysis unavailable for ${mapped.id}; using statistical model.`); }
    }
    const analysisId = randomUUID();
    const metadata = { source: 'habeshatips', basis: 'model', analysisId, modelVersion: MODEL_VERSION,
      rationaleAm: llm?.analysis.rationaleAm ?? null, headlineAm: llm?.analysis.headlineAm ?? null,
      bookmaker: price.bookmaker, oddsProvider: price.provider, fixtureProvider: f.provider, externalId: f.externalId,
      marketBlend: 0.8, trainingCutoff: date.toISOString(), mock: process.env.ANALYSIS_MOCK === '1' };
    check((await db.from('pipeline_analyses').insert({ id: analysisId, match_id: mapped.id, model_version: MODEL_VERSION,
      payload: { ...built, llm, metadata } })).error);
    analyzed++;
    const ctx: MatchContext = { match: { home: mapped.home, away: mapped.away, league: f.competition as Match['league'], date: f.kickoffUtc },
      pred: built.blended, rawPred: built.rawPred, odds1x2: built.features.odds1x2, oddsOU: built.features.oddsOU, oddsBtts: built.features.oddsBtts, ...built.features.forms };
    for (const room of ROOMS) {
      if (built.rawPred.homeWeight < room.minEvidence || built.rawPred.awayWeight < room.minEvidence) continue;
      const c = room.select(ctx);
      if (!c || !validOdds(c.odds) || !Number.isFinite(c.modelProb) || c.modelProb < 0 || c.modelProb > 1) continue;
      const note = llm ? `${llm.analysis.headlineEn}\n\n${llm.analysis.rationaleEn}` : `${mapped.home} vs ${mapped.away}: statistical model pick. Written analysis unavailable.`;
      candidates.set(room.slug, [...(candidates.get(room.slug) ?? []), { matchId: mapped.id, c, note, metadata }]);
    }
  }
  let published = 0;
  for (const room of ROOMS) {
    for (const pick of (candidates.get(room.slug) ?? []).sort((a, b) => b.c.score - a.c.score)) {
      const tip = { id: `ht-tip-${randomUUID()}`, profile_id: profileId(room.slug), match_id: pick.matchId,
        market_type: marketTypes[pick.c.market], selection: selectionFor(pick.c), probability: pick.c.modelProb,
        odds: pick.c.odds, note: pick.note, model_version: MODEL_VERSION, published_at: new Date().toISOString() };
      const { error, data } = await db.rpc('publish_pipeline_tip', { p_tip: { ...tip,
        source_metadata: JSON.stringify({ ...pick.metadata, hash: tipHash(tip) }) }, p_daily_cap: room.maxTipsPerDay });
      check(error); if (data) published++;
    }
  }
  return { profiles: ROOMS.length, analyzed, published, settled };
}
