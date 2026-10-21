import { describe, expect, it } from 'vitest';
import { sourceFixture, selectionFor, marketTypes, validOdds, tipHash } from './mapping';
import { outcomeFor } from './run';
import { regulationScore } from './providers/espn';
import { blendPrediction } from './model/blend';
import { ROOMS } from './rooms/config';

describe('HabeshaTips adapter', () => {
  it('matches fixtures and prices from providers using canonical team names', () => {
    const fixture = sourceFixture({ competition: 'E0', kickoffUtc: new Date('2026-10-21T16:00:00Z'), homeRaw: 'Arsenal FC', awayRaw: 'Chelsea FC' });
    const price = sourceFixture({ competition: 'E0', kickoffUtc: new Date('2026-10-21T16:00:00Z'), homeRaw: 'Arsenal', awayRaw: 'Chelsea' });
    expect(fixture).toEqual(price);
    expect(fixture?.id).toContain('ht-E0-2026-10-21');
  });
  it('uses the website selections and settles each supported market', () => {
    const cases = [
      ['H', '1X2', 'home', 2, 1, 'win'], ['D', '1X2', 'draw', 1, 1, 'win'], ['A', '1X2', 'away', 0, 1, 'win'],
      ['O', 'OU25', 'over_2.5', 2, 1, 'win'], ['U', 'OU25', 'under_2.5', 1, 1, 'win'],
      ['Y', 'BTTS', 'btts_yes', 0, 1, 'loss'], ['N', 'BTTS', 'btts_no', 0, 0, 'win'],
    ] as const;
    for (const [selection, market, expected, home, away, outcome] of cases) {
      expect(selectionFor({ selection })).toBe(expected);
      expect(outcomeFor(expected, marketTypes[market], home, away)).toBe(outcome);
    }
    expect(() => outcomeFor('bad', 'match_result', 0, 0)).toThrow();
  });
  it('does not treat missing scores or extra-time totals as zero', () => {
    expect(regulationScore(undefined, 'STATUS_FULL_TIME')).toBeNull();
    expect(regulationScore('', 'STATUS_FULL_TIME')).toBeNull();
    expect(regulationScore('3', 'STATUS_FINAL_PENALTIES')).toBeNull();
    expect(regulationScore('0', 'STATUS_FULL_TIME')).toBe(0);
  });
  it('rejects invalid odds and hashes publication content consistently', () => {
    for (const odds of [null, NaN, Infinity, 0, 1]) expect(validOdds(odds)).toBe(false);
    expect(validOdds(1.5)).toBe(true);
    expect(tipHash({ selection: 'H', odds: 1.5 })).toBe(tipHash({ odds: 1.5, selection: 'H' }));
    expect(tipHash({ selection: 'A', odds: 1.5 })).not.toBe(tipHash({ selection: 'H', odds: 1.5 }));
  });
  it('anchors probabilities 80% to margin-free prices and retains six strategies', () => {
    const raw = { lambda: 1.5, mu: 1, pH: 0.6, pD: 0.2, pA: 0.2, pOver25: 0.6, pUnder25: 0.4, pBtts: 0.6, homeWeight: 20, awayWeight: 20 };
    const blended = blendPrediction(raw, { h: 2, d: 4, a: 4 }, null, 0.8);
    expect(blended.pH).toBeCloseTo(0.52);
    expect(blended.pH + blended.pD + blended.pA).toBeCloseTo(1);
    expect(ROOMS).toHaveLength(6);
  });
});
