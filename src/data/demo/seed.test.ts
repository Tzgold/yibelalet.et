import { describe, expect, it, beforeEach } from "vitest";
import { DEMO_PROFILE_COUNT, getDemoWorld, resetDemoWorldCache } from "./seed";
import { DemoRepository } from "./demo-repository";

describe("demo seed", () => {
  beforeEach(() => {
    resetDemoWorldCache();
  });

  it("creates a stable set of unique public profiles", () => {
    const a = getDemoWorld(new Date("2026-10-12T12:00:00.000Z"));
    resetDemoWorldCache();
    const b = getDemoWorld(new Date("2026-10-12T12:00:00.000Z"));

    expect(a.profiles).toHaveLength(Math.min(DEMO_PROFILE_COUNT, 25));
    expect(new Set(a.profiles.map((p) => p.slug)).size).toBe(a.profiles.length);
    expect(a.profiles.every((p) => p.isDemo)).toBe(true);
    expect(a.profiles.map((p) => p.slug)).toEqual(b.profiles.map((p) => p.slug));
  });

  it("exposes all profiles on the leaderboard repository", async () => {
    const repo = new DemoRepository();
    const board = await repo.getLeaderboard({
      metric: "default",
      timeRange: "all",
      profileType: "all",
    });
    expect(board.length).toBe(Math.min(DEMO_PROFILE_COUNT, 25));
    expect(repo.getDataSourceInfo().isDemo).toBe(true);
  });
});
