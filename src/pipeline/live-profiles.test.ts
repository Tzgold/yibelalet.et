import { describe, expect, it } from 'vitest';
import { parseOpenSeason } from './data/openfootball';
import { PROFILE_STRATEGIES, selectForecast, forecastNote } from './profile-strategies';
import { forecastOutcome, forecastSlotId, forecastSnapshotHash } from './live-profiles';
import type { MatchContext } from './rooms/config';

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
});
