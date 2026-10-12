import type {
  BettingRecord,
  PerformanceSummary,
  Prediction,
  SettlementOutcome,
} from "./types";

/** Minimum settled, non-void predictions required for ranking eligibility. */
export const MIN_SAMPLE_SIZE = 10;

export function isSettledOutcome(
  outcome: SettlementOutcome,
): outcome is "win" | "loss" | "void" | "push" {
  return outcome === "win" || outcome === "loss" || outcome === "void" || outcome === "push";
}

/**
 * Accuracy denominator: settled predictions excluding voids.
 * Wins and pushes count as non-losses for push markets; only explicit wins
 * count toward the numerator (pushes are excluded from both sides).
 *
 * Documented rule:
 * - numerator = wins
 * - denominator = wins + losses
 * - voids and pushes are excluded from accuracy
 */
export function computeAccuracy(predictions: Prediction[]): number | null {
  let wins = 0;
  let losses = 0;
  for (const p of predictions) {
    if (p.status !== "settled") continue;
    if (p.settlementOutcome === "win") wins += 1;
    else if (p.settlementOutcome === "loss") losses += 1;
  }
  const denom = wins + losses;
  if (denom === 0) return null;
  return wins / denom;
}

export function countOutcomes(predictions: Prediction[]) {
  let wins = 0;
  let losses = 0;
  let voids = 0;
  let pushes = 0;
  let settledCount = 0;

  for (const p of predictions) {
    if (p.status !== "settled" && p.status !== "void") continue;
    settledCount += 1;
    if (p.settlementOutcome === "win") wins += 1;
    else if (p.settlementOutcome === "loss") losses += 1;
    else if (p.settlementOutcome === "void") voids += 1;
    else if (p.settlementOutcome === "push") pushes += 1;
  }

  return { wins, losses, voids, pushes, settledCount };
}

/**
 * Brier score for binary correctness of the published selection.
 * Uses probability of the selection; outcome y=1 if win, y=0 if loss.
 * Voids/pushes/unsettled excluded. Lower is better.
 */
export function computeBrierScore(predictions: Prediction[]): number | null {
  let sum = 0;
  let n = 0;
  for (const p of predictions) {
    if (p.status !== "settled") continue;
    if (p.probability == null) continue;
    if (p.settlementOutcome !== "win" && p.settlementOutcome !== "loss") continue;
    const y = p.settlementOutcome === "win" ? 1 : 0;
    const f = clamp01(p.probability);
    sum += (f - y) ** 2;
    n += 1;
  }
  if (n === 0) return null;
  return sum / n;
}

export function averageProbability(predictions: Prediction[]): number | null {
  let sum = 0;
  let n = 0;
  for (const p of predictions) {
    if (p.probability == null) continue;
    sum += clamp01(p.probability);
    n += 1;
  }
  if (n === 0) return null;
  return sum / n;
}

/**
 * Net profit and ROI only when betting records exist with settled returns.
 * Never inferred from prediction accuracy alone.
 */
export function computeProfitability(
  bettingRecords: BettingRecord[],
): { netProfitUnits: number | null; roi: number | null; hasBettingRecords: boolean } {
  const settled = bettingRecords.filter(
    (b) => b.netReturnUnits != null && b.settledAt != null,
  );
  if (settled.length === 0) {
    return {
      netProfitUnits: null,
      roi: null,
      hasBettingRecords: bettingRecords.length > 0,
    };
  }
  const net = settled.reduce((acc, b) => acc + (b.netReturnUnits ?? 0), 0);
  const stake = settled.reduce((acc, b) => acc + b.stakeUnits, 0);
  return {
    netProfitUnits: net,
    roi: stake > 0 ? net / stake : null,
    hasBettingRecords: true,
  };
}

export function buildPerformanceSummary(
  predictions: Prediction[],
  bettingRecords: BettingRecord[],
  sampleMinimum: number = MIN_SAMPLE_SIZE,
): PerformanceSummary {
  const { wins, losses, voids, pushes, settledCount } = countOutcomes(predictions);
  const accuracy = computeAccuracy(predictions);
  const rankingSample = wins + losses;
  const profitability = computeProfitability(bettingRecords);

  return {
    settledCount,
    wins,
    losses,
    voids,
    pushes,
    accuracy,
    averageProbability: averageProbability(predictions),
    brierScore: computeBrierScore(predictions),
    netProfitUnits: profitability.netProfitUnits,
    roi: profitability.roi,
    hasBettingRecords: profitability.hasBettingRecords,
    insufficientSample: rankingSample < sampleMinimum,
    sampleMinimum,
  };
}

export function filterByTimeRange<T extends { publishedAt?: string; settledAt?: string | null; kickoffAt?: string }>(
  items: T[],
  rangeStart: Date | null,
  dateField: keyof T = "publishedAt" as keyof T,
): T[] {
  if (!rangeStart) return items;
  return items.filter((item) => {
    const raw = item[dateField];
    if (typeof raw !== "string" || !raw) return false;
    return new Date(raw).getTime() >= rangeStart.getTime();
  });
}

export function timeRangeStart(
  key: "7d" | "30d" | "90d" | "all",
  now: Date = new Date(),
): Date | null {
  if (key === "all") return null;
  const days = key === "7d" ? 7 : key === "30d" ? 30 : 90;
  const d = new Date(now);
  d.setUTCDate(d.getUTCDate() - days);
  return d;
}

export function chartRangeStart(
  key: "week" | "month" | "year" | "all",
  now: Date = new Date(),
): Date | null {
  if (key === "all") return null;
  const d = new Date(now);
  if (key === "week") d.setUTCDate(d.getUTCDate() - 7);
  else if (key === "month") d.setUTCDate(d.getUTCDate() - 30);
  else d.setUTCFullYear(d.getUTCFullYear() - 1);
  return d;
}

function clamp01(n: number): number {
  if (Number.isNaN(n)) return 0;
  return Math.min(1, Math.max(0, n));
}

/**
 * Idempotent settlement helper: applying the same outcome twice does not
 * change an already-settled prediction.
 */
export function applySettlement(
  prediction: Prediction,
  outcome: Exclude<SettlementOutcome, null>,
  settledAt: string,
): Prediction {
  if (prediction.status === "settled" || prediction.status === "void") {
    return prediction;
  }
  return {
    ...prediction,
    status: outcome === "void" ? "void" : "settled",
    settlementOutcome: outcome,
    settledAt,
    updatedAt: settledAt,
  };
}

/**
 * Predictions may not be silently replaced after lock (kickoff cutoff).
 */
export function canEditPrediction(
  prediction: Prediction,
  now: Date = new Date(),
): { allowed: boolean; reason: string | null } {
  if (prediction.status === "settled" || prediction.status === "void") {
    return { allowed: false, reason: "Prediction is already settled." };
  }
  if (new Date(prediction.lockedAt).getTime() <= now.getTime()) {
    return { allowed: false, reason: "Prediction is locked after cutoff." };
  }
  return { allowed: true, reason: null };
}
