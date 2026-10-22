import { describe, expect, it } from 'vitest';
import { getDemoWorld } from './demo/seed';
import { liveRecords } from './live-records';

describe('live records', () => {
  it('excludes seeded results and their bets while allowing new forecasts on an existing profile', () => {
    const seed = getDemoWorld(new Date('2026-10-22T00:00:00Z'));
    const match = { ...seed.matches[0], id: 'verified-fixture', dataSource: 'habeshatips:espn' };
    const tip = { ...seed.predictions[0], id: 'new-tip', matchId: match.id, sourceMetadata: '{"source":"yibelalet-live"}' };
    const orphanedSeed = { ...tip, id: 'seed-on-live', sourceMetadata: 'demo-seed' };
    const bet = { ...seed.bettingRecords[0], id: 'real-bet', predictionId: tip.id };
    const result = liveRecords([...seed.matches, match], [...seed.predictions, tip, orphanedSeed], [...seed.bettingRecords, bet]);
    expect(result.matches).toEqual([match]);
    expect(result.predictions).toEqual([tip]);
    expect(result.bettingRecords).toEqual([bet]);
  });
});
