import type { MarketType } from '../domain/types';
import type { CompetitionCode } from './data/api-football';
import type { MatchContext } from './rooms/config';
import { COMPETITIONS } from './data/api-football';

export type ForecastStyle = 'result'|'favourite'|'home'|'away'|'draw'|'over'|'under'|'totals'|'btts'|'btts-no'|'double-chance'|'form';
export interface ProfileStrategy {
  slug: string; title: string; style: ForecastStyle; leagues?: CompetitionCode[];
  minProbability: number; minEvidence: number; maxTips: number; description: string;
}
function strategy(slug:string,title:string,style:ForecastStyle,minProbability:number,leagues?:CompetitionCode[],maxTips=3,minEvidence=8):ProfileStrategy {
  return {slug,title,style,minProbability,minEvidence,maxTips,leagues,description:`${title}. ${leagues?.map(code=>COMPETITIONS[code].name).join(', ') ?? 'Eight domestic leagues and three European cups'}. Up to ${maxTips} picks per matchday (Ethiopian time), with at least ${minEvidence} weighted matches per team.`};
}

/** Profile-specific rules over the same documented statistical model, not independently trained models. */
export const PROFILE_STRATEGIES: ProfileStrategy[] = [
  strategy('matchday-desk','Daily match-result coverage','result',1/3,undefined,100,8),
  strategy('abel-desta','Evidence-led match results','favourite',.55,undefined,2,12),
  strategy('bereket-mulugeta','Italian match-result specialist','result',.48,['I1'],3),
  strategy('bethlehem-hailu','Low-scoring match selection','under',.57,undefined,2),
  strategy('dawit-bekele','Premier League home advantage','home',.50,['E0'],3),
  strategy('henok-gebre','Bundesliga goals and pressure','over',.56,['D1'],2),
  strategy('hiwot-tadesse','Serie A double-chance coverage','double-chance',.73,['I1'],2),
  strategy('kirubel-tesfaye','Both-teams-to-score specialist','btts',.56,undefined,3),
  strategy('liya-mekonnen','Premier League recent form','form',.52,['E0'],2),
  strategy('mahlet-assefa','Strong-evidence match results','result',.56,undefined,2,14),
  strategy('meron-kebede','Selective away results','away',.42,undefined,2,10),
  strategy('natnael-worku','Balanced-game draw selection','draw',.24,undefined,2,10),
  strategy('selam-girma','Conservative double-chance selection','double-chance',.78,undefined,3,10),
  strategy('yonas-alemu','La Liga home results','home',.50,['SP1'],3),
  strategy('model-1','Core match-result model','result',.50,undefined,3),
  strategy('model-2','Total-goals probability model','totals',.54,undefined,3),
  strategy('model-3','Bundesliga scoring model','btts',.54,['D1'],3),
  strategy('model-4','European cup result model','result',.45,['UCL','UEL','UECL'],3),
  strategy('model-5','Attacking-game model','over',.58,undefined,3),
  strategy('model-6','Cross-league conservative model','double-chance',.76,undefined,4,10),
  strategy('model-7','Defensive-game model','btts-no',.54,undefined,3),
  strategy('model-8','Selective favourite model','favourite',.60,undefined,2,12),
  strategy('model-9','European cup home model','home',.43,['UCL','UEL','UECL'],2,10),
  strategy('model-10','Draw probability model','draw',.25,undefined,2),
  strategy('model-11','High-evidence reference model','result',.45,undefined,1,15),
  strategy('model-12','Recent-form agreement model','form',.52,undefined,3,10),
  strategy('habeshatips-safe-bet','High-probability statistical selection','double-chance',.80,undefined,3),
  strategy('habeshatips-value-hunter','Selective result forecasts; prices assessed separately','result',.57,undefined,2,10),
  strategy('habeshatips-goal-rush','Open-game goal selection','over',.60,undefined,3),
  strategy('habeshatips-lockdown','Low-goal defensive selection','under',.58,undefined,3),
  strategy('habeshatips-home-fortress','Home form and venue strength','form',.55,undefined,3),
  strategy('habeshatips-draw-master','Evenly matched draw selection','draw',.26,undefined,2,10),
];

export interface ForecastPick {marketType:MarketType;selection:string;probability:number;score:number;}
export function selectForecast(rule:ProfileStrategy, ctx:MatchContext):ForecastPick|null {
  if (rule.leagues && !rule.leagues.includes(ctx.match.league as CompetitionCode)) return null;
  const p=ctx.rawPred;
  if (p.homeWeight<rule.minEvidence || p.awayWeight<rule.minEvidence) return null;
  const pick=(marketType:MarketType,selection:string,probability:number,score=probability)=>({marketType,selection,probability,score});
  const home=pick('match_result','home',p.pH), away=pick('match_result','away',p.pA), draw=pick('match_result','draw',p.pD);
  let chosen:ForecastPick;
  switch(rule.style) {
    case 'home': chosen=home; break;
    case 'away': chosen=away; break;
    case 'draw':
      if (Math.abs(p.pH-p.pA)>.28) return null;
      chosen=draw; break;
    case 'over': chosen=pick('over_under_2_5','over_2.5',p.pOver25); break;
    case 'under': chosen=pick('over_under_2_5','under_2.5',p.pUnder25); break;
    case 'totals': chosen=p.pOver25>=p.pUnder25?pick('over_under_2_5','over_2.5',p.pOver25):pick('over_under_2_5','under_2.5',p.pUnder25); break;
    case 'btts': chosen=pick('both_teams_to_score','btts_yes',p.pBtts); break;
    case 'btts-no': chosen=pick('both_teams_to_score','btts_no',1-p.pBtts); break;
    case 'double-chance': chosen=p.pH>=p.pA?pick('double_chance','home_or_draw',p.pH+p.pD):pick('double_chance','away_or_draw',p.pA+p.pD); break;
    case 'form': {
      const delta=ctx.homeHomeForm.ppg-ctx.awayAwayForm.ppg;
      if (ctx.homeHomeForm.played<3 || ctx.awayAwayForm.played<3 || Math.abs(delta)<.4) return null;
      chosen=delta>0?home:away;
      chosen={...chosen,score:chosen.probability+Math.min(Math.abs(delta),2)*.04}; break;
    }
    case 'favourite': chosen=p.pH>=p.pA?home:away; break;
    default: chosen=[home,away,draw].sort((a,b)=>b.probability-a.probability)[0];
  }
  return Number.isFinite(chosen.probability)&&chosen.probability>=rule.minProbability&&chosen.probability<=1?chosen:null;
}

export function forecastNote(rule:ProfileStrategy,ctx:MatchContext,pick:ForecastPick) {
  const p=ctx.rawPred;
  const selection:Record<string,string>={home:`${ctx.match.home} to win`,away:`${ctx.match.away} to win`,draw:'draw','over_2.5':'over 2.5 goals','under_2.5':'under 2.5 goals',btts_yes:'both teams to score',btts_no:'at least one team not to score',home_or_draw:`${ctx.match.home} or draw`,away_or_draw:`${ctx.match.away} or draw`};
  const focus=rule.style==='form'||rule.style==='home'?`Venue form: ${ctx.match.home} ${ctx.homeHomeForm.ppg.toFixed(2)} points per game at home; ${ctx.match.away} ${ctx.awayAwayForm.ppg.toFixed(2)} away.`:
    ['over','under','totals','btts','btts-no'].includes(rule.style)?`Expected goals: ${ctx.match.home} ${p.lambda.toFixed(2)}, ${ctx.match.away} ${p.mu.toFixed(2)}; total ${(p.lambda+p.mu).toFixed(2)}.`:
    rule.style==='draw'?'The model identifies this as a closely balanced fixture.':
    `Recent form: ${ctx.match.home} ${ctx.homeForm.ppg.toFixed(2)} points per game; ${ctx.match.away} ${ctx.awayForm.ppg.toFixed(2)}.`;
  return `${rule.title}: ${selection[pick.selection]}. ${focus} Evidence: ${p.homeWeight.toFixed(1)} / ${p.awayWeight.toFixed(1)} weighted matches. This is a pre-match forecast; no bookmaker price or betting return is assumed.`;
}
