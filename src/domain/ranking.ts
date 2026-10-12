import {
  buildPerformanceSummary,
  computeAccuracy,
  computeProfitability,
  MIN_SAMPLE_SIZE,
  timeRangeStart,
} from "./metrics";
import type {
  BettingRecord,
  LeaderboardEntry,
  Prediction,
  PredictorProfile,
  RankingMetric,
  TimeRangeKey,
} from "./types";

export interface RankableBundle {
  profile: PredictorProfile;
  predictions: Prediction[];
  bettingRecords: BettingRecord[];
}

function recentForm(predictions: Prediction[], limit = 5): Array<"W" | "L" | "V" | "P"> {
  const settled = predictions
    .filter((p) => p.status === "settled" || p.status === "void")
    .sort((a, b) => (b.settledAt ?? b.publishedAt).localeCompare(a.settledAt ?? a.publishedAt))
    .slice(0, limit);

  return settled.map((p) => {
    if (p.settlementOutcome === "win") return "W";
    if (p.settlementOutcome === "loss") return "L";
    if (p.settlementOutcome === "push") return "P";
    return "V";
  });
}

function rankingScore(
  metric: RankingMetric,
  predictions: Prediction[],
  betting: BettingRecord[],
): { score: number; eligible: boolean; reason: string | null } {
  const summary = buildPerformanceSummary(predictions, betting);
  const sample = summary.wins + summary.losses;

  if (metric === "profitability") {
    const { netProfitUnits, hasBettingRecords } = computeProfitability(betting);
    if (!hasBettingRecords || netProfitUnits == null) {
      return {
        score: Number.NEGATIVE_INFINITY,
        eligible: false,
        reason: "No valid betting records for profitability ranking.",
      };
    }
    if (sample < MIN_SAMPLE_SIZE) {
      return {
        score: netProfitUnits,
        eligible: false,
        reason: `Needs at least ${MIN_SAMPLE_SIZE} settled win/loss predictions.`,
      };
    }
    return { score: netProfitUnits, eligible: true, reason: null };
  }

  if (sample < MIN_SAMPLE_SIZE) {
    return {
      score: summary.accuracy ?? 0,
      eligible: false,
      reason: `Needs at least ${MIN_SAMPLE_SIZE} settled win/loss predictions.`,
    };
  }

  if (metric === "accuracy" || metric === "default" || metric === "recent") {
    const accuracy = computeAccuracy(predictions) ?? 0;
    // Slight sample-size confidence for default ranking (not raw win count).
    const confidence =
      metric === "default" ? Math.min(1, sample / (MIN_SAMPLE_SIZE * 3)) : 1;
    return { score: accuracy * confidence, eligible: true, reason: null };
  }

  return { score: 0, eligible: false, reason: "Unknown ranking metric." };
}

function tieBreak(a: LeaderboardEntry, b: LeaderboardEntry): number {
  if (b.rankingScore !== a.rankingScore) return b.rankingScore - a.rankingScore;
  const bSettled = b.summary.wins + b.summary.losses;
  const aSettled = a.summary.wins + a.summary.losses;
  if (bSettled !== aSettled) return bSettled - aSettled;
  const join = a.profile.joinDate.localeCompare(b.profile.joinDate);
  if (join !== 0) return join;
  return a.profile.slug.localeCompare(b.profile.slug);
}

export function buildLeaderboard(
  bundles: RankableBundle[],
  options: {
    metric: RankingMetric;
    timeRange: TimeRangeKey;
    profileType?: "all" | "human" | "ai";
    search?: string;
    competitionId?: string | null;
    now?: Date;
  },
): LeaderboardEntry[] {
  const now = options.now ?? new Date();
  const start = timeRangeStart(options.timeRange, now);
  const q = options.search?.trim().toLowerCase() ?? "";

  const filtered = bundles.filter(({ profile }) => {
    if (profile.visibility !== "public") return false;
    if (options.profileType && options.profileType !== "all") {
      if (profile.profileType !== options.profileType) return false;
    }
    if (q) {
      const hay = [
        profile.displayName,
        profile.handle,
        profile.bio,
        profile.specialties.join(" "),
        profile.methodology,
      ]
        .join(" ")
        .toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  const entries: LeaderboardEntry[] = filtered.map(({ profile, predictions, bettingRecords }) => {
    let preds = predictions;
    if (start) {
      preds = predictions.filter((p) => new Date(p.publishedAt) >= start);
    }
    if (options.competitionId) {
      // competition filtering applied by caller attaching only matching preds,
      // or via match map — kept here as no-op if not prefiltered.
    }

    const betIds = new Set(preds.map((p) => p.id));
    const bets = bettingRecords.filter((b) => betIds.has(b.predictionId));
    const summary = buildPerformanceSummary(preds, bets);
    const { score, eligible, reason } = rankingScore(options.metric, preds, bets);

    return {
      profile,
      rank: 0,
      eligible,
      ineligibleReason: reason,
      summary,
      recentForm: recentForm(preds),
      rankingScore: score,
    };
  });

  const eligible = entries.filter((e) => e.eligible).sort(tieBreak);
  const ineligible = entries.filter((e) => !e.eligible).sort(tieBreak);

  [...eligible, ...ineligible].forEach((entry, index) => {
    entry.rank = index + 1;
  });

  return [...eligible, ...ineligible];
}
