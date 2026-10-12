import { describe, expect, it } from "vitest";
import {
  applySettlement,
  buildPerformanceSummary,
  canEditPrediction,
  computeAccuracy,
  computeBrierScore,
  computeProfitability,
  MIN_SAMPLE_SIZE,
} from "./metrics";
import { buildLeaderboard } from "./ranking";
import type { BettingRecord, Prediction, PredictorProfile } from "./types";

function pred(partial: Partial<Prediction> & Pick<Prediction, "id">): Prediction {
  return {
    profileId: "p1",
    matchId: "m1",
    marketType: "match_result",
    selection: "home",
    note: null,
    probability: 0.55,
    publishedAt: "2026-01-01T12:00:00.000Z",
    lockedAt: "2026-01-01T15:00:00.000Z",
    modelVersion: null,
    status: "settled",
    settlementOutcome: "win",
    settledAt: "2026-01-01T17:00:00.000Z",
    sourceMetadata: null,
    createdAt: "2026-01-01T12:00:00.000Z",
    updatedAt: "2026-01-01T17:00:00.000Z",
    ...partial,
  };
}

const baseProfile = (slug: string): PredictorProfile => ({
  id: `id-${slug}`,
  slug,
  displayName: slug,
  handle: `@${slug}`,
  profileType: "human",
  avatarUrl: null,
  bio: "",
  specialties: [],
  competitions: [],
  joinDate: "2025-01-01",
  visibility: "public",
  modelType: null,
  modelVersion: null,
  methodology: "",
  isDemo: true,
  createdAt: "2025-01-01T00:00:00.000Z",
  updatedAt: "2025-01-01T00:00:00.000Z",
});

describe("computeAccuracy", () => {
  it("returns null with no settled win/loss", () => {
    expect(computeAccuracy([])).toBeNull();
    expect(
      computeAccuracy([pred({ id: "1", settlementOutcome: "void", status: "void" })]),
    ).toBeNull();
  });

  it("excludes voids and pushes from denominator", () => {
    const list = [
      pred({ id: "1", settlementOutcome: "win" }),
      pred({ id: "2", settlementOutcome: "loss" }),
      pred({ id: "3", settlementOutcome: "void", status: "void" }),
      pred({ id: "4", settlementOutcome: "push" }),
    ];
    expect(computeAccuracy(list)).toBe(0.5);
  });
});

describe("computeBrierScore", () => {
  it("computes mean squared error of probabilities", () => {
    const list = [
      pred({ id: "1", probability: 1, settlementOutcome: "win" }),
      pred({ id: "2", probability: 0, settlementOutcome: "loss" }),
    ];
    expect(computeBrierScore(list)).toBe(0);
  });
});

describe("computeProfitability", () => {
  it("does not invent profit without settled betting returns", () => {
    expect(computeProfitability([])).toEqual({
      netProfitUnits: null,
      roi: null,
      hasBettingRecords: false,
    });
  });

  it("aggregates net return and ROI from stakes", () => {
    const bets: BettingRecord[] = [
      {
        id: "b1",
        predictionId: "1",
        oddsAtPublication: 2,
        stakeUnits: 1,
        netReturnUnits: 1,
        settledAt: "2026-01-01T17:00:00.000Z",
        settlementRule: "decimal_odds_unit_stake",
        createdAt: "2026-01-01T12:00:00.000Z",
        updatedAt: "2026-01-01T17:00:00.000Z",
      },
      {
        id: "b2",
        predictionId: "2",
        oddsAtPublication: 2,
        stakeUnits: 1,
        netReturnUnits: -1,
        settledAt: "2026-01-02T17:00:00.000Z",
        settlementRule: "decimal_odds_unit_stake",
        createdAt: "2026-01-02T12:00:00.000Z",
        updatedAt: "2026-01-02T17:00:00.000Z",
      },
    ];
    const result = computeProfitability(bets);
    expect(result.netProfitUnits).toBe(0);
    expect(result.roi).toBe(0);
  });
});

describe("settlement and lock rules", () => {
  it("is idempotent for already settled predictions", () => {
    const original = pred({ id: "1", settlementOutcome: "win" });
    const again = applySettlement(original, "loss", "2026-02-01T00:00:00.000Z");
    expect(again.settlementOutcome).toBe("win");
  });

  it("blocks edits after lock and after settlement", () => {
    const locked = pred({
      id: "1",
      status: "upcoming",
      settlementOutcome: null,
      settledAt: null,
      lockedAt: "2020-01-01T00:00:00.000Z",
    });
    expect(canEditPrediction(locked).allowed).toBe(false);

    const settled = pred({ id: "2" });
    expect(canEditPrediction(settled).allowed).toBe(false);
  });
});

describe("buildPerformanceSummary", () => {
  it("marks insufficient sample below minimum", () => {
    const preds = Array.from({ length: MIN_SAMPLE_SIZE - 1 }, (_, i) =>
      pred({ id: String(i), settlementOutcome: i % 2 === 0 ? "win" : "loss" }),
    );
    const summary = buildPerformanceSummary(preds, []);
    expect(summary.insufficientSample).toBe(true);
    expect(summary.hasBettingRecords).toBe(false);
    expect(summary.netProfitUnits).toBeNull();
  });
});

describe("buildLeaderboard", () => {
  it("ranks eligible profiles and applies stable tie-break", () => {
    const makeBundle = (slug: string, wins: number, losses: number) => {
      const predictions = [
        ...Array.from({ length: wins }, (_, i) =>
          pred({ id: `${slug}-w-${i}`, settlementOutcome: "win", profileId: `id-${slug}` }),
        ),
        ...Array.from({ length: losses }, (_, i) =>
          pred({ id: `${slug}-l-${i}`, settlementOutcome: "loss", profileId: `id-${slug}` }),
        ),
      ];
      return {
        profile: baseProfile(slug),
        predictions,
        bettingRecords: [] as BettingRecord[],
      };
    };

    const board = buildLeaderboard(
      [makeBundle("alpha", 8, 2), makeBundle("beta", 7, 3), makeBundle("gamma", 2, 1)],
      { metric: "accuracy", timeRange: "all" },
    );

    expect(board[0].profile.slug).toBe("alpha");
    expect(board[0].eligible).toBe(true);
    expect(board.find((e) => e.profile.slug === "gamma")?.eligible).toBe(false);
  });

  it("filters by search and profile type", () => {
    const bundles = [
      {
        profile: { ...baseProfile("north"), profileType: "ai" as const, displayName: "North Model" },
        predictions: Array.from({ length: 12 }, (_, i) =>
          pred({ id: `n-${i}`, settlementOutcome: "win" }),
        ),
        bettingRecords: [],
      },
      {
        profile: { ...baseProfile("south"), profileType: "human" as const, displayName: "South Tip" },
        predictions: Array.from({ length: 12 }, (_, i) =>
          pred({ id: `s-${i}`, settlementOutcome: "win" }),
        ),
        bettingRecords: [],
      },
    ];

    const aiOnly = buildLeaderboard(bundles, {
      metric: "accuracy",
      timeRange: "all",
      profileType: "ai",
    });
    expect(aiOnly).toHaveLength(1);
    expect(aiOnly[0].profile.slug).toBe("north");

    const search = buildLeaderboard(bundles, {
      metric: "accuracy",
      timeRange: "all",
      search: "south",
    });
    expect(search).toHaveLength(1);
    expect(search[0].profile.slug).toBe("south");
  });
});
