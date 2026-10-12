import {
  breakdownByCompetition,
  breakdownByMarket,
  buildAccuracySeries,
  buildCalendarSummaries,
  buildProfitSeries,
  buildSettledCountSeries,
} from "@/domain/charts";
import { buildPerformanceSummary, timeRangeStart } from "@/domain/metrics";
import { buildLeaderboard } from "@/domain/ranking";
import type {
  CalendarDaySummary,
  ChartRangeKey,
  PredictionView,
  TimeRangeKey,
} from "@/domain/types";
import type {
  HistoryQuery,
  LeaderboardQuery,
  PredictorRepository,
  ProfileDetail,
  RecentSettledTip,
  UpcomingMatchCard,
} from "../repository";
import { DEMO_AS_OF, getDemoWorld } from "./seed";

function toView(
  predictionId: string,
  world: ReturnType<typeof getDemoWorld>,
): PredictionView | null {
  const prediction = world.predictions.find((p) => p.id === predictionId);
  if (!prediction) return null;
  const match = world.matches.find((m) => m.id === prediction.matchId);
  if (!match) return null;
  const competition = world.competitions.find((c) => c.id === match.competitionId);
  const homeTeam = world.teams.find((t) => t.id === match.homeTeamId);
  const awayTeam = world.teams.find((t) => t.id === match.awayTeamId);
  if (!competition || !homeTeam || !awayTeam) return null;
  const betting =
    world.bettingRecords.find((b) => b.predictionId === prediction.id) ?? null;
  return {
    ...prediction,
    match,
    competition,
    homeTeam,
    awayTeam,
    betting,
  };
}

function viewsForProfile(profileId: string): PredictionView[] {
  const world = getDemoWorld();
  return world.predictions
    .filter((p) => p.profileId === profileId)
    .map((p) => toView(p.id, world))
    .filter((v): v is PredictionView => v != null)
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export class DemoRepository implements PredictorRepository {
  getDataSourceInfo() {
    return {
      mode: "demo" as const,
      isDemo: true,
      label: "Demonstration data — not real-world tipster performance",
    };
  }

  async listCompetitions() {
    return getDemoWorld().competitions;
  }

  async getLeaderboard(query: LeaderboardQuery) {
    const world = getDemoWorld();
    const bundles = world.profiles.map((profile) => {
      let predictions = world.predictions.filter((p) => p.profileId === profile.id);
      if (query.competitionId) {
        const matchIds = new Set(
          world.matches
            .filter((m) => m.competitionId === query.competitionId)
            .map((m) => m.id),
        );
        predictions = predictions.filter((p) => matchIds.has(p.matchId));
      }
      const predIds = new Set(predictions.map((p) => p.id));
      const bettingRecords = world.bettingRecords.filter((b) =>
        predIds.has(b.predictionId),
      );
      return { profile, predictions, bettingRecords };
    });

    return buildLeaderboard(bundles, {
      metric: query.metric,
      timeRange: query.timeRange,
      profileType: query.profileType ?? "all",
      search: query.search,
      competitionId: query.competitionId,
    });
  }

  async getProfileBySlug(slug: string) {
    return getDemoWorld().profiles.find((p) => p.slug === slug) ?? null;
  }

  async getProfileDetail(
    slug: string,
    rankingPeriod: TimeRangeKey = "30d",
  ): Promise<ProfileDetail | null> {
    const world = getDemoWorld();
    const profile = world.profiles.find((p) => p.slug === slug);
    if (!profile) return null;

    const board = await this.getLeaderboard({
      metric: "default",
      timeRange: rankingPeriod,
      profileType: "all",
    });
    const entry = board.find((e) => e.profile.slug === slug);
    const views = viewsForProfile(profile.id);
    const start = timeRangeStart(rankingPeriod);
    const periodPreds = start
      ? views.filter((v) => new Date(v.publishedAt) >= start)
      : views;
    const bets = periodPreds
      .map((v) => v.betting)
      .filter((b): b is NonNullable<typeof b> => b != null);

    const openPredictions = views.filter(
      (v) =>
        v.status === "upcoming" ||
        v.status === "live" ||
        v.status === "pending_settlement" ||
        v.status === "postponed",
    );

    const similar = world.profiles
      .filter((p) => p.slug !== slug)
      .map((p) => ({
        profile: p,
        overlap: p.competitions.filter((c) => profile.competitions.includes(c))
          .length + (p.profileType === profile.profileType ? 1 : 0),
      }))
      .sort((a, b) => b.overlap - a.overlap)
      .slice(0, 3)
      .map((x) => x.profile);

    return {
      profile,
      rank: entry?.rank ?? 0,
      rankingPeriod,
      summary: buildPerformanceSummary(periodPreds, bets),
      openPredictions,
      similar,
    };
  }

  async getHistory(query: HistoryQuery) {
    const profile = await this.getProfileBySlug(query.slug);
    if (!profile) return { items: [], total: 0, page: 1, pageSize: 20 };

    let items = viewsForProfile(profile.id);

    if (query.from) {
      const from = new Date(query.from);
      items = items.filter((v) => new Date(v.publishedAt) >= from);
    }
    if (query.to) {
      const to = new Date(query.to);
      items = items.filter((v) => new Date(v.publishedAt) <= to);
    }
    if (query.competitionId) {
      items = items.filter((v) => v.competition.id === query.competitionId);
    }
    if (query.marketType) {
      items = items.filter((v) => v.marketType === query.marketType);
    }
    if (query.resultStatus && query.resultStatus !== "all") {
      if (query.resultStatus === "pending") {
        items = items.filter(
          (v) =>
            v.settlementOutcome == null ||
            v.status === "upcoming" ||
            v.status === "pending_settlement" ||
            v.status === "postponed",
        );
      } else {
        items = items.filter((v) => v.settlementOutcome === query.resultStatus);
      }
    }

    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 15;
    const total = items.length;
    const start = (page - 1) * pageSize;
    return {
      items: items.slice(start, start + pageSize),
      total,
      page,
      pageSize,
    };
  }

  async getCalendar(slug: string, month: string): Promise<CalendarDaySummary[]> {
    const views = await this.getTipsForMonth(slug, month);
    return [...buildCalendarSummaries(views).values()].sort((a, b) =>
      a.date.localeCompare(b.date),
    );
  }

  async getTipsForDay(slug: string, day: string): Promise<PredictionView[]> {
    const profile = await this.getProfileBySlug(slug);
    if (!profile) return [];
    return viewsForProfile(profile.id)
      .filter((v) => v.publishedAt.startsWith(day))
      .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  }

  async getTipsForMonth(slug: string, month: string): Promise<PredictionView[]> {
    const profile = await this.getProfileBySlug(slug);
    if (!profile) return [];
    const prefix = month.slice(0, 7);
    return viewsForProfile(profile.id)
      .filter((v) => v.publishedAt.startsWith(prefix))
      .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  }

  async getChartSeries(slug: string, range: ChartRangeKey) {
    const profile = await this.getProfileBySlug(slug);
    if (!profile) {
      return { mode: "accuracy" as const, points: [], settledSeries: [] };
    }
    const world = getDemoWorld();
    const preds = world.predictions.filter((p) => p.profileId === profile.id);
    const bets = world.bettingRecords.filter((b) =>
      preds.some((p) => p.id === b.predictionId),
    );
    const settledSeries = buildSettledCountSeries(preds, range);
    if (bets.some((b) => b.netReturnUnits != null)) {
      return {
        mode: "profit" as const,
        points: buildProfitSeries(bets, range),
        settledSeries,
      };
    }
    return {
      mode: "accuracy" as const,
      points: buildAccuracySeries(preds, range),
      settledSeries,
    };
  }

  async getBreakdowns(slug: string) {
    const profile = await this.getProfileBySlug(slug);
    if (!profile) return { byCompetition: [], byMarket: [] };
    const views = viewsForProfile(profile.id);
    return {
      byCompetition: breakdownByCompetition(views),
      byMarket: breakdownByMarket(views),
    };
  }

  async getUpcomingMatches(limit = 12): Promise<UpcomingMatchCard[]> {
    const world = getDemoWorld();
    const featuredIds = [
      "match-feat-liv-mun",
      "match-feat-rma-bar",
      "match-feat-int-mil",
      "match-feat-ars-che",
    ];
    const scheduled = world.matches.filter((m) => m.matchStatus === "scheduled");
    const featured = featuredIds
      .map((id) => scheduled.find((m) => m.id === id))
      .filter((m): m is (typeof scheduled)[number] => Boolean(m));
    const rest = scheduled
      .filter((m) => !featuredIds.includes(m.id))
      .sort((a, b) => a.kickoffAt.localeCompare(b.kickoffAt));
    return [...featured, ...rest].slice(0, limit).map((match) => {
      const competition = world.competitions.find((c) => c.id === match.competitionId)!;
      const homeTeam = world.teams.find((t) => t.id === match.homeTeamId)!;
      const awayTeam = world.teams.find((t) => t.id === match.awayTeamId)!;
      return { match, competition, homeTeam, awayTeam, isDemo: true };
    });
  }

  async getSampleOpenTip() {
    const world = getDemoWorld();
    const open = world.predictions
      .filter((p) => p.status === "upcoming")
      .sort((a, b) => a.publishedAt.localeCompare(b.publishedAt));
    for (const p of open) {
      const view = toView(p.id, world);
      if (view) return view;
    }
    return null;
  }

  async getShowcaseMatch() {
    const world = getDemoWorld();
    const homeTeam = world.teams.find((t) => t.id === "t-ars");
    const awayTeam = world.teams.find((t) => t.id === "t-che");
    const competition = world.competitions.find((c) => c.id === "comp-epl");
    if (!homeTeam || !awayTeam || !competition) return null;

    const existing =
      world.matches.find((m) => m.id === "match-feat-ars-che") ??
      world.matches.find(
        (m) =>
          m.matchStatus === "scheduled" &&
          m.homeTeamId === "t-ars" &&
          m.awayTeamId === "t-che",
      );

    if (existing) {
      return { match: existing, competition, homeTeam, awayTeam, isDemo: true };
    }

    return {
      match: {
        id: "match-showcase-ars-che",
        providerMatchId: "demo-showcase",
        competitionId: competition.id,
        homeTeamId: homeTeam.id,
        awayTeamId: awayTeam.id,
        kickoffAt: world.matches.find((m) => m.matchStatus === "scheduled")?.kickoffAt
          ?? new Date(DEMO_AS_OF.getTime() + 86400000 * 3).toISOString(),
        matchStatus: "scheduled" as const,
        homeScore: null,
        awayScore: null,
        dataSource: "demo",
        updatedAt: DEMO_AS_OF.toISOString(),
      },
      competition,
      homeTeam,
      awayTeam,
      isDemo: true,
    };
  }

  async getRecentSettledTips(limit = 8): Promise<RecentSettledTip[]> {
    const world = getDemoWorld();
    const settled = world.predictions
      .filter(
        (p) =>
          p.status === "settled" &&
          (p.settlementOutcome === "win" || p.settlementOutcome === "loss"),
      )
      .sort((a, b) =>
        (b.settledAt ?? b.publishedAt).localeCompare(a.settledAt ?? a.publishedAt),
      );

    const items: RecentSettledTip[] = [];
    const seenMatches = new Set<string>();
    const seenClubs = new Set<string>();

    // Prefer unique fixtures / clubs so the feed shows more crests.
    for (const p of settled) {
      const view = toView(p.id, world);
      const profile = world.profiles.find((pr) => pr.id === p.profileId);
      if (!view || !profile) continue;
      if (seenMatches.has(view.match.id)) continue;
      const clubs = [view.homeTeam.id, view.awayTeam.id];
      const newClub = clubs.some((id) => !seenClubs.has(id));
      if (!newClub && items.length >= Math.ceil(limit * 0.6)) continue;
      seenMatches.add(view.match.id);
      for (const id of clubs) seenClubs.add(id);
      items.push({ view, profile });
      if (items.length >= limit) break;
    }

    if (items.length < limit) {
      for (const p of settled) {
        const view = toView(p.id, world);
        const profile = world.profiles.find((pr) => pr.id === p.profileId);
        if (!view || !profile) continue;
        if (items.some((i) => i.view.id === view.id)) continue;
        items.push({ view, profile });
        if (items.length >= limit) break;
      }
    }

    return items;
  }
}
