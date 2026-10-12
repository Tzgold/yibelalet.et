import { connection } from "next/server";
import { AppShell } from "@/components/layout/AppShell";
import { HomeLeaderboard } from "@/components/home/HomeLeaderboard";
import { LandingAbout } from "@/components/home/LandingAbout";
import { LandingActivity } from "@/components/home/LandingActivity";
import { LandingCta } from "@/components/home/LandingCta";
import { LandingFaq } from "@/components/home/LandingFaq";
import { LandingHero } from "@/components/home/LandingHero";
import { LandingHowItWorks } from "@/components/home/LandingHowItWorks";
import { LandingMatches } from "@/components/home/LandingMatches";
import { LandingStats } from "@/components/home/LandingStats";
import { getRepository } from "@/data/get-repository";
import type { RankingMetric, TimeRangeKey } from "@/domain/types";

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
  return "accuracy";
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

export default async function HomePage({
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

  const repo = getRepository();
  const info = repo.getDataSourceInfo();

  let entries: Awaited<ReturnType<typeof repo.getLeaderboard>> = [];
  let totalProfiles = 25;
  let upcoming: Awaited<ReturnType<typeof repo.getUpcomingMatches>> = [];
  let showcase: Awaited<ReturnType<typeof repo.getShowcaseMatch>> = null;
  let recentTips: Awaited<ReturnType<typeof repo.getRecentSettledTips>> = [];
  let error: string | null = null;

  try {
    const [board, allBoard, matches, heroMatch, activity] = await Promise.all([
      repo.getLeaderboard({
        search: q || undefined,
        profileType: type,
        timeRange: range,
        metric,
      }),
      repo.getLeaderboard({
        profileType: "all",
        timeRange: "all",
        metric: "accuracy",
      }),
      repo.getUpcomingMatches(6),
      repo.getShowcaseMatch(),
      repo.getRecentSettledTips(10),
    ]);
    entries = board;
    totalProfiles = allBoard.length;
    upcoming = matches;
    showcase = heroMatch;
    recentTips = activity;
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load landing data";
  }

  return (
    <AppShell variant="landing" dataLabel={info.label}>
      <div>
        <LandingHero
          showcaseMatches={[
            ...(showcase ? [showcase] : []),
            ...upcoming.filter((m) => m.match.id !== showcase?.match.id).slice(0, 4),
          ]}
        />
        <LandingStats profileCount={totalProfiles} />

        {error ? (
          <div className="my-6 rounded-lg border border-[var(--border)] px-4 py-8 text-center text-sm text-[var(--text-muted)]">
            {error}
          </div>
        ) : (
          <HomeLeaderboard
            entries={entries}
            totalProfiles={totalProfiles}
            initialType={type}
            initialRange={range}
            initialMetric={metric}
            initialSearch={q}
          />
        )}

        <LandingActivity tips={recentTips} />
        <LandingMatches matches={upcoming} />
        <LandingHowItWorks />
        <LandingAbout />
        <LandingFaq />
        <div className="pb-6 pt-2">
          <LandingCta />
        </div>
      </div>
    </AppShell>
  );
}
