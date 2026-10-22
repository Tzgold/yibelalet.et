import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { canonicalTeam } from './teams';
import { LEAGUE_CODES, type LeagueCode, type Match } from './football-data';

export const OPEN_HISTORY_DIR = path.resolve(process.cwd(), '.data/openfootball');
export const OPEN_FILES: Record<LeagueCode, string> = { E0: 'en.1', SP1: 'es.1', I1: 'it.1', D1: 'de.1', F1: 'fr.1', P1: 'pt.1', N1: 'nl.1', B1: 'be.1' };
export interface OpenMatch { date: string; team1: string; team2: string; score?: number[] | { ft?: number[] }; }
export interface OpenSeason { name?: string; matches?: OpenMatch[]; }

/** CC0 OpenFootball results. Missing scores are never interpreted as 0–0. */
export function parseOpenSeason(data: OpenSeason, league: LeagueCode, season: string, before: Date): Match[] {
  const result: Match[] = [];
  for (const row of data.matches ?? []) {
    const score = Array.isArray(row.score) ? row.score : row.score?.ft;
    if (!score || score.length !== 2 || !score.every(n => Number.isInteger(n) && n >= 0)) continue;
    const date = new Date(`${row.date}T00:00:00Z`);
    if (!Number.isFinite(date.getTime()) || date >= before || date.toISOString().slice(0, 10) !== row.date) continue;
    const home = canonicalTeam(row.team1);
    const away = canonicalTeam(row.team2);
    if (!home || !away || home === away) continue;
    const [hg, ag] = score;
    result.push({league,season,date,home,away,hg,ag,result:hg>ag?'H':hg<ag?'A':'D',odds:{open:null,close:null,avg:null,max:null,ou25:null,ou25Close:null}});
  }
  return result;
}

export async function refreshOpenHistory(seasons: number[], before: Date) {
  fs.mkdirSync(OPEN_HISTORY_DIR, {recursive:true});
  const provenance: {url:string;sha256:string;fetchedAt:string}[] = [];
  for (const year of seasons) {
    const season = `${year}-${String((year+1)%100).padStart(2,'0')}`;
    for (const league of LEAGUE_CODES) {
      const url = `https://raw.githubusercontent.com/openfootball/football.json/master/${season}/${OPEN_FILES[league]}.json`;
      const file = path.join(OPEN_HISTORY_DIR, `${league}_${season}.json`);
      try {
        const response = await fetch(url, {signal:AbortSignal.timeout(25000)});
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const text = await response.text();
        const parsed = JSON.parse(text) as OpenSeason;
        if (!Array.isArray(parsed.matches)) throw new Error('Invalid results payload');
        fs.writeFileSync(file, text);
        provenance.push({url,sha256:createHash('sha256').update(text).digest('hex'),fetchedAt:new Date().toISOString()});
        console.log(`History ${league} ${season}: ${parseOpenSeason(parsed,league,season,before).length} completed matches`);
      } catch {
        console.warn(`History ${league} ${season}: refresh unavailable${fs.existsSync(file)?'; retaining cached results':''}`);
      }
    }
  }
  fs.writeFileSync(path.join(OPEN_HISTORY_DIR,'provenance.json'),JSON.stringify({source:'openfootball',license:'CC0-1.0',files:provenance},null,2));
  return loadOpenHistory(seasons,before);
}

export function loadOpenHistory(seasons: number[], before: Date) {
  const matches: Match[] = [];
  for (const year of seasons) {
    const season = `${year}-${String((year+1)%100).padStart(2,'0')}`;
    for (const league of LEAGUE_CODES) {
      const file = path.join(OPEN_HISTORY_DIR,`${league}_${season}.json`);
      if (fs.existsSync(file)) matches.push(...parseOpenSeason(JSON.parse(fs.readFileSync(file,'utf8')),league,season,before));
    }
  }
  return matches.sort((a,b)=>a.date.getTime()-b.date.getTime());
}
