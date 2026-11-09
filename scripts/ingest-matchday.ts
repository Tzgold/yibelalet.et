/**
 * Matchday ingest: refresh OpenFootball history and cache recent finished scores.
 * Writes only scores/provenance under .data/ (gitignored). Never writes API keys.
 */
import { refreshOpenHistory } from "../src/pipeline/data/openfootball";
import {
  fetchRecentFinishedResults,
  writeRecentResultsCache,
} from "../src/pipeline/data/recent-results";

async function main() {
  const now = new Date();
  const season = now.getUTCMonth() >= 6 ? now.getUTCFullYear() : now.getUTCFullYear() - 1;
  const cutoff = new Date(`${now.toISOString().slice(0, 10)}T00:00:00Z`);

  const open = await refreshOpenHistory([season - 2, season - 1, season], cutoff);
  if (!open.length) throw new Error("OpenFootball training history is empty");

  const recent = await fetchRecentFinishedResults(cutoff);
  const file = writeRecentResultsCache(cutoff, recent);
  const newest = [...open, ...recent.matches]
    .map((m) => m.date.getTime())
    .reduce((a, b) => Math.max(a, b), 0);

  console.log(
    JSON.stringify(
      {
        openMatches: open.length,
        recentMatches: recent.matches.length,
        sources: recent.sources,
        newest: newest ? new Date(newest).toISOString().slice(0, 10) : null,
        cache: file,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Matchday ingest failed");
  process.exitCode = 1;
});
