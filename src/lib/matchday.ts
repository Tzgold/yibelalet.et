/** The product's matchday is midnight-to-midnight in Ethiopia (UTC+3, no DST). */
export const MATCHDAY_TIME_ZONE = 'Africa/Addis_Ababa';
export function matchDay(value: Date | string): string {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: MATCHDAY_TIME_ZONE }).format(new Date(value));
}
export function shiftMatchDay(day: string, delta: number): string {
  return new Date(new Date(`${day}T12:00:00Z`).getTime() + delta * 86400000).toISOString().slice(0, 10);
}
export function matchDayWindow(day: string, days = 1) {
  const start = new Date(`${day}T00:00:00+03:00`);
  const end = new Date(start.getTime() + days * 86400000);
  return { start, end };
}
export function withinMatchDays(kickoff: Date | string, day: string, days = 1) {
  const { start, end } = matchDayWindow(day, days);
  const time = new Date(kickoff).getTime();
  return time >= start.getTime() && time < end.getTime();
}
export function fixtureUtcDays(day: string, days: number) {
  const { start, end } = matchDayWindow(day, days);
  const first = start.toISOString().slice(0, 10);
  const last = new Date(end.getTime() - 1).toISOString().slice(0, 10);
  const dates: string[] = [];
  for (let cursor = first; cursor <= last; cursor = shiftMatchDay(cursor, 1)) dates.push(cursor);
  return dates;
}
