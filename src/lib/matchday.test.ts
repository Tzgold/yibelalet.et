import { describe,expect,it } from 'vitest';
import { fixtureUtcDays,matchDay,withinMatchDays,shiftMatchDay } from './matchday';
import { COMPETITION_CODES } from '../pipeline/data/api-football';
import { ESPN_SLUGS } from '../pipeline/providers/espn';
import { canonicalTeam } from '../pipeline/data/teams';

describe('matchday coverage',()=>{
  it('uses Ethiopian midnight, including the previous UTC date and excluding the next midnight',()=>{
    expect(matchDay('2026-10-21T21:00:00Z')).toBe('2026-10-22');
    expect(withinMatchDays('2026-10-21T21:00:00Z','2026-10-22')).toBe(true);
    expect(withinMatchDays('2026-10-22T21:00:00Z','2026-10-22')).toBe(false);
    expect(withinMatchDays('2026-10-24T00:00:00Z','2026-10-22',2)).toBe(false);
    expect(fixtureUtcDays('2026-10-22',2)).toEqual(['2026-10-21','2026-10-22','2026-10-23']);
    expect(shiftMatchDay('2026-12-31',1)).toBe('2027-01-01');
  });
  it('maps all eight domestic leagues and all three UEFA competitions',()=>{
    expect(COMPETITION_CODES).toHaveLength(11);
    expect(COMPETITION_CODES.every(code=>Boolean(ESPN_SLUGS[code]))).toBe(true);
    expect(ESPN_SLUGS.UEL).toBe('uefa.europa');
    expect(ESPN_SLUGS.UECL).toBe('uefa.europa.conf');
  });
  it('keeps new clubs distinct instead of merging names by shared tokens',()=>{
    expect(canonicalTeam('Manchester City')).not.toBe(canonicalTeam('Bristol City'));
    expect(canonicalTeam('Sporting Braga')).toBe(canonicalTeam('SC Braga'));
    expect(canonicalTeam('FC Utrecht')).toBe(canonicalTeam('Utrecht'));
    expect(canonicalTeam('Telstar 1963')).toBe(canonicalTeam('Telstar'));
    expect(canonicalTeam('Sporting Charleroi')).toBe(canonicalTeam('Royal Charleroi'));
    expect(canonicalTeam('CF Estrela da Amadora')).toBe(canonicalTeam('Estrela'));
    expect(canonicalTeam('Willem II Tilburg')).toBe(canonicalTeam('Willem II'));
    expect(canonicalTeam('CS Marítimo')).toBe(canonicalTeam('Maritimo'));
  });
});
