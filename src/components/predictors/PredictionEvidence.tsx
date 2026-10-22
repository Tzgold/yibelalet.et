"use client";

import type { PredictionView } from '@/domain/types';
import { formatKickoffLocal } from '@/lib/format';
import { useT } from '@/i18n/I18nProvider';

export function PredictionEvidence({prediction}:{prediction:PredictionView}) {
  const t=useT();
  let data:Record<string,unknown>={};
  try{data=JSON.parse(prediction.sourceMetadata??'{}')}catch{ /* Legacy notes have no structured evidence. */ }
  const goals=data.expectedGoals as {home?:number;away?:number}|undefined;
  const evidence=data.evidence as {home?:number;away?:number}|undefined;
  if(prediction.accessLocked)return null;
  return <details className="prediction-evidence"><summary>{t('profile.forecastDetails')}<span aria-hidden>+</span></summary><dl>
    <div><dt>{t('profile.publishedAt')}</dt><dd>{formatKickoffLocal(prediction.publishedAt)}</dd></div>
    <div><dt>{t('profile.forecastVersion')}</dt><dd>{prediction.modelVersion??'—'}</dd></div>
    {typeof data.strategyTitle==='string'?<div><dt>{t('profile.selectionRule')}</dt><dd>{data.strategyTitle}</dd></div>:null}
    {typeof goals?.home==='number'&&typeof goals.away==='number'?<div><dt>{t('profile.expectedGoals')}</dt><dd>{prediction.homeTeam.name} {goals.home.toFixed(2)} / {prediction.awayTeam.name} {goals.away.toFixed(2)}</dd></div>:null}
    {typeof evidence?.home==='number'&&typeof evidence.away==='number'?<div><dt>{t('profile.matchEvidence')}</dt><dd>{evidence.home.toFixed(1)} / {evidence.away.toFixed(1)}</dd></div>:null}
    {typeof data.fixtureProvider==='string'?<div><dt>{t('profile.fixtureSource')}</dt><dd>{data.fixtureProvider}</dd></div>:null}
    {typeof data.trainingSource==='string'?<div><dt>{t('profile.historySource')}</dt><dd>{data.trainingSource}</dd></div>:null}
  </dl></details>;
}
