/**
 * Supplement OpenFootball training history with recent finished scores from the
 * live provider registry (football-data.org first, then ESPN). OpenFootball often
 * lags several weeks; without this merge the 45-day freshness gate blocks publish.
 */
import fs from "node:fs";
import path from "node:path";
import { canonicalTeam } from "./teams";
import { LEAGUE_CODES, type LeagueCode, type Match } from "./football-data";
import { withProvider } from "../providers/registry";
import type { ProviderFixture } from "../providers/types";

const EMPTY_ODDS = { open: null, close: null, avg: null, max: null, ou25: null, ou25Close: null } as const;

export const RECENT_RESULTS_DIR = path.resolve(process.cwd(), ".data/recent-results");
export const RECENT_RESULTS_FILE = path.join(RECENT_RESULTS_DIR, "latest.json");
/** Prefer ingest cache written within this window; otherwise re-fetch. */
export const RECENT_RESULTS_MAX_AGE_MS = 12 * 60 * 60 * 1000;

interface RecentResultsCache {
  fetchedAt: string;
  cutoff: string;
  sources: string[];
  matches: Array<{
    league: LeagueCode;
    season: string;
    date: string;
    home: string;
    away: string;
    hg: number;
    ag: number;
    result: "H" | "D" | "A";
  }>;
}

function seasonLabel(year: number): string {
  return `${year}-${String((year + 1) % 100).padStart(2, "0")}`;
}

function matchKey(m: Pick<Match, "league" | "date" | "home" | "away">): string {
  return `${m.league}|${m.date.toISOString().slice(0, 10)}|${m.home}|${m.away}`;
}

export function providerFixtureToMatch(f: ProviderFixture, before: Date): Match | null {
  if (f.status !== "finished") return null;
  if (![f.homeGoals, f.awayGoals].every((n) => typeof n === "number" && Number.isInteger(n) && n >= 0)) {
    return null;
  }
  if (!Number.isFinite(f.kickoffUtc.getTime()) || f.kickoffUtc >= before) return null;
  const home = canonicalTeam(f.homeRaw);
  const away = canonicalTeam(f.awayRaw);
  if (!home || !away || home === away) return null;
  if (!LEAGUE_CODES.includes(f.competition as LeagueCode)) return null;
  const year = f.kickoffUtc.getUTCMonth() >= 6 ? f.kickoffUtc.getUTCFullYear() : f.kickoffUtc.getUTCFullYear() - 1;
  const hg = f.homeGoals as number;
  const ag = f.awayGoals as number;
  return {
    league: f.competition as LeagueCode,
    season: seasonLabel(year),
    date: new Date(`${f.kickoffUtc.toISOString().slice(0, 10)}T00:00:00Z`),
    home,
    away,
    hg,
    ag,
    result: hg > ag ? "H" : hg < ag ? "A" : "D",
    odds: { ...EMPTY_ODDS },
  };
}

/** Merge base history with recent provider results; provider rows win on the same key. */
export function mergeTrainingHistory(base: Match[], recent: Match[]): Match[] {
  const map = new Map<string, Match>();
  for (const m of base) map.set(matchKey(m), m);
  for (const m of recent) map.set(matchKey(m), m);
  return [...map.values()].sort((a, b) => a.date.getTime() - b.date.getTime());
}

/**
 * Pull finished domestic results in [before - lookbackDays, before).
 * One ranged request per league when football-data.org is configured.
 */
export async function fetchRecentFinishedResults(
  before: Date,
  lookbackDays = 55,
): Promise<{ matches: Match[]; sources: string[] }> {
  const toMs = before.getTime() - 86_400_000;
  const fromMs = before.getTime() - lookbackDays * 86_400_000;
  if (toMs < fromMs) return { matches: [], sources: [] };
  const from = new Date(fromMs).toISOString().slice(0, 10);
  const to = new Date(toMs).toISOString().slice(0, 10);
  const seasonYear = before.getUTCMonth() >= 6 ? before.getUTCFullYear() : before.getUTCFullYear() - 1;
  const matches: Match[] = [];
  const sources = new Set<string>();

  // ESPN expands ranges day-by-day; keep its window short. football-data.org takes one ranged call.
  const espnFrom = new Date(Math.max(fromMs, before.getTime() - 21 * 86_400_000)).toISOString().slice(0, 10);

  for (const league of LEAGUE_CODES) {
    const served = await withProvider(
      "results",
      league,
      (p) =>
        p.fixtures!(league, seasonYear, {
          from: p.name === "espn" ? espnFrom : from,
          to,
        }),
      { accept: (rows) => rows.some((r) => r.status === "finished") },
    );
    if (!served) {
      console.warn(`Recent results unavailable: ${league} ${from}..${to}`);
      continue;
    }
    sources.add(served.provider);
    let added = 0;
    for (const row of served.result) {
      const match = providerFixtureToMatch(row, before);
      if (match) {
        matches.push(match);
        added++;
      }
    }
    console.log(`Recent results ${league}: ${added} finished via ${served.provider}`);
  }

  return { matches, sources: [...sources] };
}

function serializeMatch(m: Match): RecentResultsCache["matches"][number] {
  return {
    league: m.league,
    season: m.season,
    date: m.date.toISOString().slice(0, 10),
    home: m.home,
    away: m.away,
    hg: m.hg,
    ag: m.ag,
    result: m.result,
  };
}

function deserializeMatch(row: RecentResultsCache["matches"][number]): Match {
  return {
    league: row.league,
    season: row.season,
    date: new Date(`${row.date}T00:00:00Z`),
    home: row.home,
    away: row.away,
    hg: row.hg,
    ag: row.ag,
    result: row.result,
    odds: { ...EMPTY_ODDS },
  };
}

/** Persist recent scores only (no API keys or request headers). */
export function writeRecentResultsCache(
  cutoff: Date,
  payload: { matches: Match[]; sources: string[] },
  fetchedAt = new Date(),
): string {
  fs.mkdirSync(RECENT_RESULTS_DIR, { recursive: true });
  const body: RecentResultsCache = {
    fetchedAt: fetchedAt.toISOString(),
    cutoff: cutoff.toISOString(),
    sources: payload.sources,
    matches: payload.matches.map(serializeMatch),
  };
  fs.writeFileSync(RECENT_RESULTS_FILE, JSON.stringify(body, null, 2));
  return RECENT_RESULTS_FILE;
}

export function loadRecentResultsCache(
  maxAgeMs = RECENT_RESULTS_MAX_AGE_MS,
): { matches: Match[]; sources: string[]; fetchedAt: Date } | null {
  if (!fs.existsSync(RECENT_RESULTS_FILE)) return null;
  try {
    const raw = JSON.parse(fs.readFileSync(RECENT_RESULTS_FILE, "utf8")) as RecentResultsCache;
    if (!raw?.fetchedAt || !Array.isArray(raw.matches) || !Array.isArray(raw.sources)) return null;
    const fetchedAt = new Date(raw.fetchedAt);
    if (!Number.isFinite(fetchedAt.getTime()) || Date.now() - fetchedAt.getTime() > maxAgeMs) return null;
    return {
      fetchedAt,
      sources: raw.sources,
      matches: raw.matches.map(deserializeMatch),
    };
  } catch {
    return null;
  }
}

/** Use fresh ingest cache when present; otherwise fetch from providers. */
export async function loadOrFetchRecentResults(
  before: Date,
  lookbackDays = 55,
): Promise<{ matches: Match[]; sources: string[]; fromCache: boolean }> {
  const cached = loadRecentResultsCache();
  if (cached) {
    console.log(
      `Recent results cache: ${cached.matches.length} matches from ${cached.fetchedAt.toISOString()} via ${cached.sources.join(",") || "none"}`,
    );
    return { matches: cached.matches, sources: cached.sources, fromCache: true };
  }
  const fresh = await fetchRecentFinishedResults(before, lookbackDays);
  return { ...fresh, fromCache: false };
}
