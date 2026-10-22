import fs from 'node:fs';
import path from 'node:path';
import { pipelineDb, allRows, type PipelineDb } from './db';
import { COMPETITION_CODES, type CompetitionCode } from './data/api-football';
import { loadOpenHistory, refreshOpenHistory } from './data/openfootball';
import { canonicalTeam } from './data/teams';
import { fit } from './model/dixon-coles';
import { buildPacket } from './packet';
import { sourceFixture, tipHash } from './mapping';
import { espn } from './providers/espn';
import { usageFor } from './providers/usage';
import type { ProviderFixture } from './providers/types';
import { seedStrategies, outcomeFor } from './run';
import { PROFILE_STRATEGIES, selectForecast, forecastNote, type ForecastPick } from './profile-strategies';
import type { MatchContext } from './rooms/config';
import { fixtureUtcDays, matchDay, shiftMatchDay, withinMatchDays } from '../lib/matchday';

export const LIVE_MODEL_VERSION = 'yibelalet-dc-profile-v1';
type Row = Record<string, unknown>;
const check=(error:{message:string}|null)=>{if(error)throw new Error(error.message)};
function metadata(row:Row):Record<string,unknown> {try{return JSON.parse(String(row.source_metadata))}catch{return {}}}
export function isManagedForecast(row:Row) {return ['yibelalet-live','habeshatips'].includes(String(metadata(row).source));}
export function forecastSlotId(profileId:string,day:string,slot:number) {return `live-tip-${tipHash({profileId,day,slot}).slice(0,32)}`;}
/** Match PostgreSQL's numeric(5,4) probability and normalize its timestamp representation. */
export function forecastSnapshotHash(id:string,selection:string,probability:number,publishedAt:string) {
  return tipHash({id,selection,probability:Number(probability.toFixed(4)),publishedAt:new Date(publishedAt).toISOString()});
}
export function forecastOutcome(selection:string,market:string,home:number,away:number) {
  if(![home,away].every(n=>Number.isInteger(n)&&n>=0)) throw new Error('A verified regulation-time score is required');
  if(market==='double_chance') {
    if(selection==='home_or_draw')return home>=away?'win':'loss';
    if(selection==='away_or_draw')return away>=home?'win':'loss';
    throw new Error('Unsupported double-chance selection');
  }
  return outcomeFor(selection,market,home,away);
}

function fixtureIdentity(f:ProviderFixture,existing:Row[]) {
  const mapped=sourceFixture(f);
  if(!mapped)return null;
  const prior=existing.find(m=>m.provider_match_id===`${f.provider}:${f.externalId}`||m.id===mapped.id);
  return {...mapped,id:prior?String(prior.id):mapped.id,providerId:`${f.provider}:${f.externalId}`};
}

async function persistFixtures(db:PipelineDb,fixtures:ProviderFixture[],existing:Row[],catalog:Row[]) {
  const teams=new Map<string,Row>(), matches=new Map<string,Row>();
  for(const f of fixtures) {
    const m=fixtureIdentity(f,existing);
    if(!m||!Number.isFinite(f.kickoffUtc.getTime()))continue;
    if(f.status==='finished'&&![f.homeGoals,f.awayGoals].every(n=>typeof n==='number'&&Number.isInteger(n)&&n>=0))continue;
    const prior=existing.find(row=>row.id===m.id);
    if(prior?.match_status==='finished'&&f.status!=='finished')continue;
    for(const [id,name] of [[m.homeId,m.home],[m.awayId,m.away]]) {
      const old=catalog.find(t=>canonicalTeam(String(t.name))===name&&t.logo_url);
      teams.set(id,{id,name,short_name:String(name).split(' ').map(w=>w.slice(0,3)).join(' ').slice(0,7).toUpperCase(),...(old?{logo_url:old.logo_url}:{})});
    }
    matches.set(m.id,{id:m.id,provider_match_id:m.providerId,competition_id:`ht-comp-${f.competition}`,home_team_id:m.homeId,away_team_id:m.awayId,kickoff_at:f.kickoffUtc.toISOString(),match_status:f.status,home_score:f.homeGoals,away_score:f.awayGoals,data_source:`habeshatips:${f.provider}`,updated_at:new Date().toISOString()});
  }
  if(teams.size)check((await db.from('teams').upsert([...teams.values()])).error);
  if(matches.size)check((await db.from('football_matches').upsert([...matches.values()])).error);
}

export async function configureProfiles(db:PipelineDb,profiles:Row[]) {
  const configured=profiles.flatMap(profile=>{
    const rule=PROFILE_STRATEGIES.find(s=>s.slug===profile.slug);
    return rule?[{profile,rule}]:[];
  });
  fs.mkdirSync('.data',{recursive:true});
  const backup=path.join('.data','profile-config-before-live.json');
  if(!fs.existsSync(backup))fs.writeFileSync(backup,JSON.stringify(configured.map(c=>c.profile),null,2));
  const rows=configured.map(({profile,rule})=>({...profile,
    bio:rule.description,
    methodology:`${rule.description} A shared Dixon-Coles model is fitted to CC0 OpenFootball completed results using exponential time decay. Selection rule: ${rule.style}. Probabilities come from the statistical model, not invented personal results. Forecasts without verified prices have no betting record or ROI. Publication locks immediately; outcomes use regulation-time scores.`,
    specialties:[rule.title],competition_ids:(rule.leagues??COMPETITION_CODES).map(c=>`ht-comp-${c}`),
    model_type:profile.profile_type==='ai'?'Dixon-Coles statistical model':null,
    model_version:LIVE_MODEL_VERSION,updated_at:new Date().toISOString(),
  }));
  if(rows.length)check((await db.from('predictor_profiles').upsert(rows)).error);
  return configured;
}

export async function settleLiveForecasts(db:PipelineDb) {
  const [predictions,matches,bets]=await Promise.all(['predictions','football_matches','betting_records'].map(t=>allRows(db,t)));
  let settled=0;
  for(const p of predictions) {
    if(!isManagedForecast(p)||['settled','void'].includes(String(p.status)))continue;
    const m=matches.find(m=>m.id===p.match_id);
    if(!m)continue;
    let outcome:string|null=null;
    if(m.match_status==='cancelled')outcome='void';
    if(m.match_status==='finished'&&[m.home_score,m.away_score].every(n=>typeof n==='number'&&Number.isInteger(n)&&n>=0))outcome=forecastOutcome(String(p.selection),String(p.market_type),Number(m.home_score),Number(m.away_score));
    if(outcome) {
      const result=bets.some(b=>b.prediction_id===p.id)?await db.rpc('settle_pipeline_tip',{p_prediction_id:p.id,p_outcome:outcome}):await db.rpc('settle_prediction',{p_prediction_id:p.id,p_outcome:outcome,p_settled_at:new Date().toISOString()});
      check(result.error);settled++;
    } else {
      const status=m.match_status==='live'?'live':m.match_status==='postponed'?'postponed':new Date(String(m.kickoff_at))<=new Date()?'pending_settlement':'upcoming';
      if(status!==p.status)check((await db.from('predictions').update({status}).eq('id',p.id)).error);
    }
  }
  return settled;
}

export interface LiveRunOptions {date:string;days:number;refreshHistory?:boolean;dryRun?:boolean;settleOnly?:boolean;}
export async function runLiveProfiles(options:LiveRunOptions) {
  if(!/^\d{4}-\d{2}-\d{2}$/.test(options.date)||new Date(options.date).toISOString().slice(0,10)!==options.date)throw new Error('Invalid fixture date');
  if(!Number.isInteger(options.days)||options.days<1||options.days>14)throw new Error('days must be between 1 and 14');
  if(['PROVIDER_MOCK','ANALYSIS_MOCK','ESPN_MOCK'].some(k=>process.env[k]==='1'))throw new Error('Mock data cannot be published as live forecasts');
  const db=pipelineDb();
  if(!options.dryRun) {
    await seedStrategies(db);
    // Insert only: reruns preserve the profile identity and original join date.
    check((await db.from('predictor_profiles').upsert({
      id:'live-matchday-desk',slug:'matchday-desk',display_name:'Matchday Desk',handle:'matchday_desk',
      profile_type:'ai',bio:'Daily match-result coverage across major leagues and European cups.',
      specialties:['Daily match-result coverage'],competition_ids:COMPETITION_CODES.map(c=>`ht-comp-${c}`),
      join_date:new Date().toISOString().slice(0,10),visibility:'public',is_demo:false,
      model_type:'Dixon-Coles statistical model',model_version:LIVE_MODEL_VERSION,
    },{onConflict:'id',ignoreDuplicates:true})).error);
  }
  const [profiles,oldPredictions,oldMatches,teams]=await Promise.all(['predictor_profiles','predictions','football_matches','teams'].map(t=>allRows(db,t)));
  const targets=options.dryRun?profiles.flatMap(profile=>{const rule=PROFILE_STRATEGIES.find(r=>r.slug===profile.slug);return rule?[{profile,rule}]:[]}):await configureProfiles(db,profiles);
  const dates=new Map<CompetitionCode,Set<string>>(COMPETITION_CODES.map(c=>[c,new Set<string>()]));
  if(!options.settleOnly)for(const set of dates.values())for(const day of fixtureUtcDays(options.date, options.days))set.add(day);
  for(const p of oldPredictions.filter(p=>isManagedForecast(p)&&!['settled','void'].includes(String(p.status)))) {
    const m=oldMatches.find(m=>m.id===p.match_id);
    if(m&&new Date(String(m.kickoff_at))<=new Date())dates.get(String(m.competition_id).replace('ht-comp-','') as CompetitionCode)?.add(String(m.kickoff_at).slice(0,10));
  }
  const fixtures:ProviderFixture[]=[];
  let providerErrors=0;
  for(const [code,days]of dates)for(const day of days) {
    const usage=await usageFor('espn');
    if(usage.requestsToday>=400)throw new Error('Public fixture request budget reached');
    try {
      const date=new Date(day),season=date.getUTCMonth()>=6?date.getUTCFullYear():date.getUTCFullYear()-1;
      fixtures.push(...await espn.fixtures!(code,season,{from:day,to:day}));
    }catch{providerErrors++;console.warn(`Fixtures unavailable: ${code} ${day}`);}
  }
  console.log(`Fixture refresh: ${fixtures.length} records; ${providerErrors} unavailable competition-days`);
  if(!fixtures.length&&providerErrors)throw new Error('No live fixtures could be verified');
  if(!options.dryRun)await persistFixtures(db,fixtures,oldMatches,teams);
  const settled=options.dryRun?0:await settleLiveForecasts(db);
  if(options.settleOnly)return {settled,fixtures:fixtures.length,providerErrors};
  const now=new Date(),season=now.getUTCMonth()>=6?now.getUTCFullYear():now.getUTCFullYear()-1;
  const cutoff=new Date(now.toISOString().slice(0,10)+'T00:00:00Z');
  const history=options.refreshHistory?await refreshOpenHistory([season-2,season-1,season],cutoff):loadOpenHistory([season-2,season-1,season],cutoff);
  if(!history.length)throw new Error('Training history missing. Run npm run pipeline:open-history');
  const newest=history.at(-1)!.date;
  if(now.getTime()-newest.getTime()>45*86400000)throw new Error('Training results are stale. Refresh history before publishing');
  const model=fit(history,{asOf:cutoff,xi:.002});
  const pool=new Map<string,{fixture:ProviderFixture;matchId:string;pick:ForecastPick;ctx:MatchContext}[]>();
  const seen=new Set<string>();
  for(const f of fixtures) {
    const identity=fixtureIdentity(f,oldMatches);
    if(!identity||seen.has(identity.id)||f.status!=='scheduled'||!withinMatchDays(f.kickoffUtc,options.date,options.days)||f.kickoffUtc.getTime()<=Date.now()+120000)continue;
    seen.add(identity.id);
    const built=buildPacket({home:identity.home,away:identity.away,leagueCode:f.competition,leagueName:f.competition,round:f.round,kickoffAt:f.kickoffUtc},model,history,new Map(),null,0);
    const ctx:MatchContext={match:{home:identity.home,away:identity.away,league:f.competition as MatchContext['match']['league'],date:f.kickoffUtc},pred:built.rawPred,rawPred:built.rawPred,odds1x2:null,oddsOU:null,oddsBtts:null,...built.features.forms};
    for(const {profile,rule}of targets) {
      const pick=selectForecast(rule,ctx);
      if(pick)pool.set(String(profile.id),[...(pool.get(String(profile.id))??[]),{fixture:f,matchId:identity.id,pick,ctx}]);
    }
  }
  let published=0;
  const counts:{slug:string;available:number;published:number}[]=[];
  for(const {profile,rule}of targets) {
    const existing=oldPredictions.filter(p=>p.profile_id===profile.id);
    const used=new Set(existing.map(p=>`${p.match_id}:${p.market_type}`));
    let count=0;
    for(let offset=0;offset<options.days;offset++) {
    const day=shiftMatchDay(options.date,offset);
    const available=[...(pool.get(String(profile.id))??[])].filter(c=>matchDay(c.fixture.kickoffUtc)===day).sort((a,b)=>b.pick.score-a.pick.score||a.fixture.kickoffUtc.getTime()-b.fixture.kickoffUtc.getTime());
    let dayCount=existing.filter(p=>{const m=oldMatches.find(m=>m.id===p.match_id);return isManagedForecast(p)&&m&&matchDay(String(m.kickoff_at))===day}).length;
    for(let slot=1;slot<=rule.maxTips;slot++) {
      if(dayCount>=rule.maxTips)break;
      const id=forecastSlotId(String(profile.id),`matchday-v2:${day}`,slot);
      if(existing.some(p=>p.id===id))continue;
      while(available.length) {
        const next=available.shift()!;
        const key=`${next.matchId}:${next.pick.marketType}`;
        if(used.has(key)||next.fixture.kickoffUtc.getTime()<=Date.now()+120000)continue;
        used.add(key);
        if(options.dryRun){count++;dayCount++;break;}
        const match=await db.from('football_matches').select('match_status,kickoff_at').eq('id',next.matchId).single();
        check(match.error);
        if(!match.data||match.data.match_status!=='scheduled'||new Date(match.data.kickoff_at).getTime()<=Date.now()+120000)continue;
        const publishedAt=new Date().toISOString();
        const source={source:'yibelalet-live',basis:'model',matchday:day,matchdayTimeZone:'Africa/Addis_Ababa',strategy:rule.style,strategyTitle:rule.title,fixtureProvider:next.fixture.provider,externalId:next.fixture.externalId,modelVersion:LIVE_MODEL_VERSION,trainingSource:'OpenFootball CC0',trainingCutoff:cutoff.toISOString(),trainingMatches:history.length,evidence:{home:next.ctx.rawPred.homeWeight,away:next.ctx.rawPred.awayWeight},expectedGoals:{home:next.ctx.rawPred.lambda,away:next.ctx.rawPred.mu},pricesAvailable:false,generatedAt:publishedAt,hashVersion:2};
        const probability=Number(next.pick.probability.toFixed(4));
        const tip={id,profile_id:profile.id,match_id:next.matchId,market_type:next.pick.marketType,selection:next.pick.selection,probability,note:forecastNote(rule,next.ctx,next.pick),published_at:publishedAt,locked_at:publishedAt,model_version:LIVE_MODEL_VERSION,status:'upcoming',source_metadata:JSON.stringify({...source,hash:forecastSnapshotHash(id,next.pick.selection,probability,publishedAt)})};
        const result=await db.from('predictions').insert(tip);
        if(result.error?.code==='23505')break; // An immutable slot or match/market already won the race.
        check(result.error);published++;count++;dayCount++;break;
      }
    }
    }
    counts.push({slug:String(profile.slug),available:pool.get(String(profile.id))?.length??0,published:count});
  }
  return {profiles:targets.length,fixtures:fixtures.length,trainingMatches:history.length,published,settled,dryRun:Boolean(options.dryRun),providerErrors,perProfile:counts};
}
