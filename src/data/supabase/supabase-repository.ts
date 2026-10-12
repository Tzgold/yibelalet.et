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
  BettingRecord,
  Competition,
  FootballMatch,
  Prediction,
  PredictionView,
  PredictorProfile,
  Team,
  TimeRangeKey,
} from "@/domain/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  HistoryQuery,
  LeaderboardQuery,
  PredictorRepository,
  ProfileDetail,
  RecentSettledTip,
  UpcomingMatchCard,
} from "../repository";
import {
  mapBetting,
  mapCompetition,
  mapMatch,
  mapPrediction,
  mapProfile,
  mapTeam,
} from "./mappers";

interface WorldCache {
  profiles: PredictorProfile[];
  competitions: Competition[];
  teams: Team[];
  matches: FootballMatch[];
  predictions: Prediction[];
  bettingRecords: BettingRecord[];
}

async function loadWorld(): Promise<WorldCache> {
  const supabase = await createSupabaseServerClient();

  const [profilesRes, compsRes, teamsRes, matchesRes, predsRes, betsRes] =
    await Promise.all([
      supabase.from("predictor_profiles").select("*").eq("visibility", "public"),
      supabase.from("competitions").select("*"),
      supabase.from("teams").select("*"),
      supabase.from("football_matches").select("*"),
      supabase.from("predictions").select("*"),
      supabase.from("betting_records").select("*"),
    ]);

  const firstError =
    profilesRes.error ||
    compsRes.error ||
    teamsRes.error ||
    matchesRes.error ||
    predsRes.error ||
    betsRes.error;
  if (firstError) {
    throw new Error(`Supabase load failed: ${firstError.message}`);
  }

  return {
    profiles: (profilesRes.data ?? []).map((r) => mapProfile(r as Record<string, unknown>)),
    competitions: (compsRes.data ?? []).map((r) => mapCompetition(r as Record<string, unknown>)),
    teams: (teamsRes.data ?? []).map((r) => mapTeam(r as Record<string, unknown>)),
    matches: (matchesRes.data ?? []).map((r) => mapMatch(r as Record<string, unknown>)),
    predictions: (predsRes.data ?? []).map((r) => mapPrediction(r as Record<string, unknown>)),
    bettingRecords: (betsRes.data ?? []).map((r) => mapBetting(r as Record<string, unknown>)),
  };
}

function toView(prediction: Prediction, world: WorldCache): PredictionView | null {
  const match = world.matches.find((m) => m.id === prediction.matchId);
  if (!match) return null;
  const competition = world.competitions.find((c) => c.id === match.competitionId);
  const homeTeam = world.teams.find((t) => t.id === match.homeTeamId);
  const awayTeam = world.teams.find((t) => t.id === match.awayTeamId);
  if (!competition || !homeTeam || !awayTeam) return null;
  const betting =
    world.bettingRecords.find((b) => b.predictionId === prediction.id) ?? null;
  return { ...prediction, match, competition, homeTeam, awayTeam, betting };
}

export class SupabaseRepository implements PredictorRepository {
  getDataSourceInfo() {
    return {
      mode: "supabase" as const,
      isDemo: false,
      label: "Live Supabase data",
    };
  }

  async listCompetitions() {
    const world = await loadWorld();
    return world.competitions;
  }

  async getLeaderboard(query: LeaderboardQuery) {
    const world = await loadWorld();
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
    const world = await loadWorld();
    return world.profiles.find((p) => p.slug === slug) ?? null;
  }

  async getProfileDetail(
    slug: string,
    rankingPeriod: TimeRangeKey = "30d",
  ): Promise<ProfileDetail | null> {
    const world = await loadWorld();
    const profile = world.profiles.find((p) => p.slug === slug);
    if (!profile) return null;

    const board = await this.getLeaderboard({
      metric: "default",
      timeRange: rankingPeriod,
      profileType: "all",
    });
    const entry = board.find((e) => e.profile.slug === slug);
    const views = world.predictions
      .filter((p) => p.profileId === profile.id)
      .map((p) => toView(p, world))
      .filter((v): v is PredictionView => v != null)
      .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

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
        overlap:
          p.competitions.filter((c) => profile.competitions.includes(c)).length +
          (p.profileType === profile.profileType ? 1 : 0),
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
    const world = await loadWorld();
    const profile = world.profiles.find((p) => p.slug === query.slug);
    if (!profile) return { items: [], total: 0, page: 1, pageSize: 20 };

    let items = world.predictions
      .filter((p) => p.profileId === profile.id)
      .map((p) => toView(p, world))
      .filter((v): v is PredictionView => v != null)
      .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

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
        items = items.filter((v) => v.settlementOutcome == null);
      } else {
        items = items.filter((v) => v.settlementOutcome === query.resultStatus);
      }
    }

    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 15;
    const total = items.length;
    const start = (page - 1) * pageSize;
    return { items: items.slice(start, start + pageSize), total, page, pageSize };
  }

  async getCalendar(slug: string, month: string) {
    const views = await this.getTipsForMonth(slug, month);
    return [...buildCalendarSummaries(views).values()].sort((a, b) =>
      a.date.localeCompare(b.date),
    );
  }

  async getTipsForDay(slug: string, day: string) {
    const world = await loadWorld();
    const profile = world.profiles.find((p) => p.slug === slug);
    if (!profile) return [];
    return world.predictions
      .filter((p) => p.profileId === profile.id && p.publishedAt.startsWith(day))
      .map((p) => toView(p, world))
      .filter((v): v is PredictionView => v != null)
      .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  }

  async getTipsForMonth(slug: string, month: string) {
    const world = await loadWorld();
    const profile = world.profiles.find((p) => p.slug === slug);
    if (!profile) return [];
    const prefix = month.slice(0, 7);
    return world.predictions
      .filter((p) => p.profileId === profile.id && p.publishedAt.startsWith(prefix))
      .map((p) => toView(p, world))
      .filter((v): v is PredictionView => v != null)
      .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  }

  async getChartSeries(slug: string, range: "week" | "month" | "year" | "all") {
    const world = await loadWorld();
    const profile = world.profiles.find((p) => p.slug === slug);
    if (!profile) {
      return { mode: "accuracy" as const, points: [], settledSeries: [] };
    }
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
    const world = await loadWorld();
    const profile = world.profiles.find((p) => p.slug === slug);
    if (!profile) return { byCompetition: [], byMarket: [] };
    const views = world.predictions
      .filter((p) => p.profileId === profile.id)
      .map((p) => toView(p, world))
      .filter((v): v is PredictionView => v != null);
    return {
      byCompetition: breakdownByCompetition(views),
      byMarket: breakdownByMarket(views),
    };
  }

  async getUpcomingMatches(limit = 12): Promise<UpcomingMatchCard[]> {
    const world = await loadWorld();
    return world.matches
      .filter((m) => m.matchStatus === "scheduled")
      .sort((a, b) => a.kickoffAt.localeCompare(b.kickoffAt))
      .slice(0, limit)
      .map((match) => {
        const competition = world.competitions.find((c) => c.id === match.competitionId)!;
        const homeTeam = world.teams.find((t) => t.id === match.homeTeamId)!;
        const awayTeam = world.teams.find((t) => t.id === match.awayTeamId)!;
        return {
          match,
          competition,
          homeTeam,
          awayTeam,
          isDemo: match.dataSource === "demo",
        };
      });
  }

  async getSampleOpenTip() {
    const world = await loadWorld();
    const open = world.predictions
      .filter((p) => p.status === "upcoming")
      .sort((a, b) => a.publishedAt.localeCompare(b.publishedAt));
    for (const p of open) {
      const view = toView(p, world);
      if (view) return view;
    }
    return null;
  }

  async getShowcaseMatch() {
    const world = await loadWorld();
    const homeTeam = world.teams.find((t) => t.id === "t-ars" || t.shortName === "ARS");
    const awayTeam = world.teams.find((t) => t.id === "t-che" || t.shortName === "CHE");
    const competition = world.competitions.find(
      (c) => c.id === "comp-epl" || c.shortName === "EPL",
    );
    if (!homeTeam || !awayTeam || !competition) {
      const upcoming = await this.getUpcomingMatches(1);
      return upcoming[0] ?? null;
    }
    const existing = world.matches.find(
      (m) =>
        m.matchStatus === "scheduled" &&
        m.homeTeamId === homeTeam.id &&
        m.awayTeamId === awayTeam.id,
    );
    if (existing) {
      return {
        match: existing,
        competition,
        homeTeam,
        awayTeam,
        isDemo: existing.dataSource === "demo",
      };
    }
    const upcoming = await this.getUpcomingMatches(1);
    return upcoming[0] ?? null;
  }

  async getRecentSettledTips(limit = 8): Promise<RecentSettledTip[]> {
    const world = await loadWorld();
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
    for (const p of settled) {
      const view = toView(p, world);
      const profile = world.profiles.find((pr) => pr.id === p.profileId);
      if (!view || !profile) continue;
      items.push({ view, profile });
      if (items.length >= limit) break;
    }
    return items;
  }
}
