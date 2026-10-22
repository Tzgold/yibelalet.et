import { allRows, pipelineDb } from '../src/pipeline/db';
import { loadOpenHistory } from '../src/pipeline/data/openfootball';
import { canonicalTeam } from '../src/pipeline/data/teams';
import { fit, predict } from '../src/pipeline/model/dixon-coles';
import { forecastSnapshotHash, isManagedForecast } from '../src/pipeline/live-profiles';
import { matchDay, withinMatchDays } from '../src/lib/matchday';

async function main() {
  const db = pipelineDb(), now = new Date(), today = matchDay(now);
  const [matches, predictions, teams] = await Promise.all(['football_matches', 'predictions', 'teams'].map(table => allRows(db, table)));
  const year = now.getUTCMonth() >= 6 ? now.getUTCFullYear() : now.getUTCFullYear() - 1;
  const cutoff = new Date(now.toISOString().slice(0, 10) + 'T00:00:00Z');
  const history = loadOpenHistory([year - 2, year - 1, year], cutoff);
  if (!history.length) throw new Error('Training history missing');
  const model = fit(history, {asOf:cutoff, xi:.002});
  const fixtures = matches.filter(m => String(m.data_source).startsWith('habeshatips:') && m.match_status === 'scheduled' && new Date(String(m.kickoff_at)) > now && withinMatchDays(String(m.kickoff_at), today, 2));
  const issues: string[] = [];
  const coverage = fixtures.map(m => {
    const team = (id:unknown) => String(teams.find(t => t.id === id)?.name ?? 'Unknown');
    const home = team(m.home_team_id), away = team(m.away_team_id);
    const estimate = predict(model, canonicalTeam(home) ?? home, canonicalTeam(away) ?? away);
    const picks = predictions.filter(p => p.match_id === m.id && isManagedForecast(p) && p.status !== 'void');
    for (const p of picks) {
      const meta = JSON.parse(String(p.source_metadata));
      if (new Date(String(p.published_at)) >= new Date(String(m.kickoff_at))) issues.push(`Late publication: ${p.id}`);
      if (meta.hashVersion === 2 && meta.hash !== forecastSnapshotHash(String(p.id), String(p.selection), Number(p.probability), String(p.published_at))) issues.push(`Changed snapshot: ${p.id}`);
    }
    return {match:`${home} vs ${away}`,day:matchDay(String(m.kickoff_at)),competition:m.competition_id,picks:picks.length,
      reason:picks.length ? 'published' : Math.min(estimate.homeWeight,estimate.awayWeight) < 8 ? 'insufficient-team-history' : 'eligible-without-pick'};
  });
  const missing = coverage.filter(c => !c.picks);
  console.log(JSON.stringify({today,fixtures:coverage.length,covered:coverage.length-missing.length,picks:coverage.reduce((sum,c)=>sum+c.picks,0),uncovered:missing,issues},null,2));
  if (issues.length || missing.some(c => c.reason === 'eligible-without-pick')) process.exitCode = 1;
}
main().catch(() => { console.error('Coverage audit failed; check database access and training history.'); process.exitCode = 1; });
