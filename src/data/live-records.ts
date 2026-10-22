import type { BettingRecord, FootballMatch, Prediction } from '@/domain/types';

/** Seeded demonstrations never contribute to live forecasts, charts or rankings. */
export function liveRecords(matches:FootballMatch[],predictions:Prediction[],bettingRecords:BettingRecord[]) {
  const liveMatches=matches.filter(m=>m.dataSource!=='demo');
  const ids=new Set(liveMatches.map(m=>m.id));
  const livePredictions=predictions.filter(p=>ids.has(p.matchId)&&p.sourceMetadata!=='demo-seed');
  const predictionIds=new Set(livePredictions.map(p=>p.id));
  return {matches:liveMatches,predictions:livePredictions,bettingRecords:bettingRecords.filter(b=>predictionIds.has(b.predictionId))};
}
