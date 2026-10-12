import { connection } from "next/server";
import { AppShell } from "@/components/layout/AppShell";
import { LeaderboardClient } from "@/components/leaderboard/LeaderboardClient";
import { getRepository } from "@/data/get-repository";
import { getSessionUser } from "@/lib/auth";
import type {
  Competition,
  LeaderboardEntry,
  RankingMetric,
  TimeRangeKey,
} from "@/domain/types";

/** Leaderboard reads request searchParams and live/demo data. */
export const instant = false;

function asMetric(value: string | undefined): RankingMetric {
  if (
    value === "accuracy" ||
    value === "recent" ||
    value === "profitability" ||
    value === "default"
  ) {
    return value;
  }
  return "default";
}

function asRange(value: string | undefined): TimeRangeKey {
  if (value === "7d" || value === "30d" || value === "90d" || value === "all") {
    return value;
  }
  return "30d";
}

function asType(value: string | undefined): "all" | "human" | "ai" {
  if (value === "human" || value === "ai") return value;
  return "all";
}

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await connection();
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : "";
  const type = asType(typeof params.type === "string" ? params.type : undefined);
  const range = asRange(typeof params.range === "string" ? params.range : undefined);
  const metric = asMetric(typeof params.metric === "string" ? params.metric : undefined);
  const competition =
    typeof params.competition === "string" && params.competition
      ? params.competition
      : null;

  const repo = getRepository();
  const info = repo.getDataSourceInfo();
  const user = await getSessionUser();

  let entries: LeaderboardEntry[] = [];
  let competitions: Competition[] = [];
  let error: string | null = null;

  try {
    [entries, competitions] = await Promise.all([
      repo.getLeaderboard({
        search: q,
        profileType: type,
        timeRange: range,
        metric,
        competitionId: competition,
      }),
      repo.listCompetitions(),
    ]);
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load leaderboard";
  }

  return (
    <AppShell dataLabel={info.label}>
      {error ? (
        <div className="surface rounded-xl p-8 text-center">
          <h1 className="text-xl font-semibold">Could not load leaderboard</h1>
          <p className="mt-2 text-sm text-[var(--text-muted)]">{error}</p>
        </div>
      ) : entries.length === 0 && !q ? (
        <div className="surface rounded-xl p-8 text-center">
          <h1 className="text-xl font-semibold">Leaderboard is empty</h1>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            No public profiles are available for the current data source.
          </p>
        </div>
      ) : (
        <LeaderboardClient
          initialEntries={entries}
          competitions={competitions}
          profileCount={entries.length}
          initialSearch={q}
          initialType={type}
          initialRange={range}
          initialMetric={metric}
          initialCompetition={competition ?? ""}
          isAuthenticated={Boolean(user)}
        />
      )}
    </AppShell>
  );
}
