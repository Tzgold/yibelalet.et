import { describe, expect, it } from 'vitest';
import { parseOpenSeason } from './data/openfootball';
import {
  mergeTrainingHistory,
  providerFixtureToMatch,
  writeRecentResultsCache,
  loadRecentResultsCache,
  RECENT_RESULTS_FILE,
} from './data/recent-results';
import fs from 'node:fs';
import { PROFILE_STRATEGIES, selectForecast, forecastNote } from './profile-strategies';
import { forecastOutcome, forecastSlotId, forecastSnapshotHash } from './live-profiles';
import type { MatchContext } from './rooms/config';
import type { Match } from './data/football-data';
import type { ProviderFixture } from './providers/types';

const form={played:5,points:11,ppg:2.2,goalsFor:10,goalsAgainst:4};
const raw={lambda:1.9,mu:1.2,pH:.55,pD:.25,pA:.2,pOver25:.63,pUnder25:.37,pBtts:.62,homeWeight:30,awayWeight:30};
const ctx:MatchContext={match:{home:'Arsenal',away:'Chelsea',league:'E0',date:new Date('2026-10-25T14:00:00Z')},rawPred:raw,pred:raw,odds1x2:null,oddsOU:null,oddsBtts:null,homeHomeForm:form,awayAwayForm:{...form,ppg:.8},homeForm:form,awayForm:{...form,ppg:1.2}};

describe('live profile forecasts',()=>{
  it('trains only from real completed scores before the cutoff',()=>{
    const rows=parseOpenSeason({matches:[
      {date:'2026-10-01',team1:'Arsenal FC',team2:'Chelsea FC',score:{ft:[0,0]}},
      {date:'2026-10-02',team1:'Arsenal FC',team2:'Chelsea FC'},
      {date:'2026-10-03',team1:'Arsenal FC',team2:'Chelsea FC',score:{ft:[null,0]} as never},
      {date:'2026-10-23',team1:'Arsenal FC',team2:'Chelsea FC',score:[3,0]},
    ]},'E0','2026-27',new Date('2026-10-22T00:00:00Z'));
    expect(rows).toHaveLength(1);expect(rows[0].hg).toBe(0);expect(rows[0].home).toBe('Arsenal');
  });
  it('uses distinct market rules and skips weak evidence or wrong competitions',()=>{
    const over=PROFILE_STRATEGIES.find(p=>p.slug==='model-5')!;
    const conservative=PROFILE_STRATEGIES.find(p=>p.slug==='selam-girma')!;
    expect(selectForecast(over,ctx)?.selection).toBe('over_2.5');
    expect(selectForecast(conservative,ctx)?.selection).toBe('home_or_draw');
    expect(selectForecast(PROFILE_STRATEGIES.find(p=>p.slug==='bereket-mulugeta')!,ctx)).toBeNull();
    expect(selectForecast(over,{...ctx,rawPred:{...ctx.rawPred,homeWeight:1}})).toBeNull();
    const note=forecastNote(over,ctx,selectForecast(over,ctx)!);
    expect(note).toContain('Arsenal 1.90');expect(note).not.toContain('%');
    expect(PROFILE_STRATEGIES).toHaveLength(32);
    expect(new Set(PROFILE_STRATEGIES.map(p=>p.slug)).size).toBe(32);
  });
  it('covers balanced major fixtures while refusing teams without sufficient history',()=>{
    const desk=PROFILE_STRATEGIES.find(p=>p.slug==='matchday-desk')!;
    expect(desk.maxTips).toBeGreaterThanOrEqual(50);
    expect(selectForecast(desk,{...ctx,rawPred:{...raw,pH:.34,pD:.33,pA:.33}})?.selection).toBe('home');
    expect(selectForecast(desk,{...ctx,rawPred:{...raw,awayWeight:7}})).toBeNull();
  });
  it('uses immutable daily slots for idempotent publication',()=>{
    expect(forecastSlotId('p','2026-10-22',1)).toBe(forecastSlotId('p','2026-10-22',1));
    expect(forecastSlotId('p','2026-10-22',1)).not.toBe(forecastSlotId('p','2026-10-23',1));
  });
  it('keeps the snapshot verifiable after database numeric and timestamp normalization',()=>{
    const hash=forecastSnapshotHash('p','home',.7654321,'2026-10-22T00:00:00.000Z');
    expect(forecastSnapshotHash('p','home',.7654,'2026-10-22T00:00:00+00:00')).toBe(hash);
    expect(forecastSnapshotHash('p','away',.7654,'2026-10-22T00:00:00Z')).not.toBe(hash);
  });
  it('settles double chance and refuses missing scores',()=>{
    expect(forecastOutcome('home_or_draw','double_chance',0,0)).toBe('win');
    expect(forecastOutcome('away_or_draw','double_chance',2,1)).toBe('loss');
    expect(()=>forecastOutcome('home','match_result',NaN,0)).toThrow();
  });
  it('merges recent finished provider scores over OpenFootball history',()=>{
    const before=new Date('2026-11-09T00:00:00Z');
    const base:Match[]=[{league:'E0',season:'2026-27',date:new Date('2026-09-20T00:00:00Z'),home:'Arsenal',away:'Chelsea',hg:2,ag:1,result:'H',odds:{open:null,close:null,avg:null,max:null,ou25:null,ou25Close:null}}];
    const fixture:ProviderFixture={provider:'footballDataOrg',externalId:'1',competition:'E0',season:2026,kickoffUtc:new Date('2026-11-08T15:00:00Z'),homeRaw:'Arsenal FC',awayRaw:'Chelsea FC',status:'finished',homeGoals:1,awayGoals:1,round:null};
    const recent=providerFixtureToMatch(fixture,before)!;
    expect(recent.home).toBe('Arsenal');expect(recent.result).toBe('D');
    const merged=mergeTrainingHistory(base,[recent]);
    expect(merged).toHaveLength(2);
    expect(merged.at(-1)!.date.toISOString().slice(0,10)).toBe('2026-11-08');
    expect(providerFixtureToMatch({...fixture,status:'scheduled'},before)).toBeNull();
  });
  it('persists recent results cache without secrets',()=>{
    const before=new Date('2026-11-09T00:00:00Z');
    const match:Match={league:'E0',season:'2026-27',date:new Date('2026-11-08T00:00:00Z'),home:'Arsenal',away:'Chelsea',hg:1,ag:0,result:'H',odds:{open:null,close:null,avg:null,max:null,ou25:null,ou25Close:null}};
    const file=writeRecentResultsCache(before,{matches:[match],sources:['footballDataOrg']},new Date('2026-11-09T01:00:00Z'));
    expect(file).toBe(RECENT_RESULTS_FILE);
    const text=fs.readFileSync(file,'utf8');
    expect(text).not.toMatch(/apiKey|token|FOOTBALL_DATA|THE_ODDS|sk-/i);
    const loaded=loadRecentResultsCache(24*60*60*1000);
    expect(loaded?.matches).toHaveLength(1);
    expect(loaded?.sources).toEqual(['footballDataOrg']);
    expect(loaded?.matches[0]?.home).toBe('Arsenal');
  });
});
