import { chartRangeStart } from "./metrics";
import type {
  BettingRecord,
  BreakdownRow,
  CalendarDaySummary,
  ChartPoint,
  ChartRangeKey,
  FootballMatch,
  Prediction,
  PredictionView,
} from "./types";

function dayKey(iso: string): string {
  return iso.slice(0, 10);
}

/**
 * Cumulative net-profit series from betting records only.
 */
export function buildProfitSeries(
  bettingRecords: BettingRecord[],
  range: ChartRangeKey,
  now: Date = new Date(),
): ChartPoint[] {
  const start = chartRangeStart(range, now);
  const settled = bettingRecords
    .filter((b) => b.netReturnUnits != null && b.settledAt)
    .filter((b) => !start || new Date(b.settledAt!) >= start)
    .sort((a, b) => (a.settledAt!).localeCompare(b.settledAt!));

  let cumulative = 0;
  return settled.map((b) => {
    cumulative += b.netReturnUnits ?? 0;
    return {
      date: dayKey(b.settledAt!),
      value: Number(cumulative.toFixed(2)),
      label: "Cumulative net profit (units)",
    };
  });
}

/**
 * Settled prediction accuracy cumulative series when no betting data.
 */
export function buildAccuracySeries(
  predictions: Prediction[],
  range: ChartRangeKey,
  now: Date = new Date(),
): ChartPoint[] {
  const start = chartRangeStart(range, now);
  const settled = predictions
    .filter((p) => p.status === "settled")
    .filter((p) => p.settlementOutcome === "win" || p.settlementOutcome === "loss")
    .filter((p) => !start || new Date(p.settledAt ?? p.publishedAt) >= start)
    .sort((a, b) =>
      (a.settledAt ?? a.publishedAt).localeCompare(b.settledAt ?? b.publishedAt),
    );

  let wins = 0;
  let total = 0;
  return settled.map((p) => {
    total += 1;
    if (p.settlementOutcome === "win") wins += 1;
    return {
      date: dayKey(p.settledAt ?? p.publishedAt),
      value: Number(((wins / total) * 100).toFixed(1)),
      label: "Rolling accuracy (%)",
    };
  });
}

export function buildSettledCountSeries(
  predictions: Prediction[],
  range: ChartRangeKey,
  now: Date = new Date(),
): ChartPoint[] {
  const start = chartRangeStart(range, now);
  const settled = predictions
    .filter((p) => p.status === "settled" || p.status === "void")
    .filter((p) => !start || new Date(p.settledAt ?? p.publishedAt) >= start)
    .sort((a, b) =>
      (a.settledAt ?? a.publishedAt).localeCompare(b.settledAt ?? b.publishedAt),
    );

  const byDay = new Map<string, number>();
  for (const p of settled) {
    const key = dayKey(p.settledAt ?? p.publishedAt);
    byDay.set(key, (byDay.get(key) ?? 0) + 1);
  }

  let cumulative = 0;
  return [...byDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => {
      cumulative += count;
      return { date, value: cumulative, label: "Settled predictions" };
    });
}

export function buildCalendarSummaries(
  views: PredictionView[],
): Map<string, CalendarDaySummary> {
  const map = new Map<string, CalendarDaySummary>();

  for (const v of views) {
    const key = dayKey(v.publishedAt);
    const current = map.get(key) ?? {
      date: key,
      wins: 0,
      losses: 0,
      voids: 0,
      pending: 0,
      settledCount: 0,
      netProfitUnits: null,
    };

    if (v.settlementOutcome === "win") {
      current.wins += 1;
      current.settledCount += 1;
    } else if (v.settlementOutcome === "loss") {
      current.losses += 1;
      current.settledCount += 1;
    } else if (v.settlementOutcome === "void") {
      current.voids += 1;
      current.settledCount += 1;
    } else {
      current.pending += 1;
    }

    if (v.betting?.netReturnUnits != null) {
      current.netProfitUnits =
        (current.netProfitUnits ?? 0) + v.betting.netReturnUnits;
    }

    map.set(key, current);
  }

  return map;
}

export function breakdownByCompetition(
  views: PredictionView[],
): BreakdownRow[] {
  const groups = new Map<string, PredictionView[]>();
  for (const v of views) {
    if (v.status !== "settled" && v.status !== "void") continue;
    const list = groups.get(v.competition.id) ?? [];
    list.push(v);
    groups.set(v.competition.id, list);
  }

  return [...groups.entries()]
    .map(([id, list]) => toBreakdown(id, list[0].competition.name, list))
    .sort((a, b) => b.settledCount - a.settledCount);
}

export function breakdownByMarket(views: PredictionView[]): BreakdownRow[] {
  const groups = new Map<string, PredictionView[]>();
  for (const v of views) {
    if (v.status !== "settled" && v.status !== "void") continue;
    const list = groups.get(v.marketType) ?? [];
    list.push(v);
    groups.set(v.marketType, list);
  }

  const labels: Record<string, string> = {
    match_result: "Match result",
    over_under_2_5: "Over/Under 2.5",
    both_teams_to_score: "BTTS",
    double_chance: "Double chance",
  };

  return [...groups.entries()]
    .map(([key, list]) => toBreakdown(key, labels[key] ?? key, list))
    .sort((a, b) => b.settledCount - a.settledCount);
}

function toBreakdown(
  key: string,
  label: string,
  list: PredictionView[],
): BreakdownRow {
  let wins = 0;
  let losses = 0;
  let voids = 0;
  let profit: number | null = null;

  for (const v of list) {
    if (v.settlementOutcome === "win") wins += 1;
    else if (v.settlementOutcome === "loss") losses += 1;
    else if (v.settlementOutcome === "void") voids += 1;
    if (v.betting?.netReturnUnits != null) {
      profit = (profit ?? 0) + v.betting.netReturnUnits;
    }
  }

  const denom = wins + losses;
  return {
    key,
    label,
    settledCount: list.length,
    wins,
    losses,
    voids,
    accuracy: denom > 0 ? wins / denom : null,
    netProfitUnits: profit,
  };
}

export function matchResultDistribution(views: PredictionView[]): {
  home: number;
  draw: number;
  away: number;
} {
  const dist = { home: 0, draw: 0, away: 0 };
  for (const v of views) {
    if (v.marketType !== "match_result") continue;
    if (v.settlementOutcome !== "win") continue;
    const sel = v.selection.toLowerCase();
    if (sel.includes("draw")) dist.draw += 1;
    else if (sel.includes("away")) dist.away += 1;
    else dist.home += 1;
  }
  return dist;
}

export function filterViewsByMatchCompetition(
  views: PredictionView[],
  competitionId: string | null,
): PredictionView[] {
  if (!competitionId) return views;
  return views.filter((v) => v.competition.id === competitionId);
}

export function attachMatchMeta(
  prediction: Prediction,
  match: FootballMatch,
): { kickoffAt: string; matchStatus: string } {
  return { kickoffAt: match.kickoffAt, matchStatus: match.matchStatus };
}
