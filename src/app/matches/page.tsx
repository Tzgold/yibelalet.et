import { connection } from "next/server";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { ClubLogo } from "@/components/ui/ClubLogo";
import { getRepository } from "@/data/get-repository";
import { formatKickoffLocal } from "@/lib/format";

export const instant = false;

export default async function MatchesPage() {
  await connection();
  const repo = getRepository();
  const info = repo.getDataSourceInfo();
  const matches = await repo.getUpcomingMatches(18);

  return (
    <AppShell dataLabel={info.label}>
      <div className="space-y-4">
        <header>
          <h1 className="text-xl font-semibold tracking-tight">Matches</h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Upcoming fixtures available in the current data source.
            {info.isDemo
              ? " Demonstration schedule — not a live fixture provider feed."
              : ""}
          </p>
        </header>

        {matches.length === 0 ? (
          <div className="border border-[var(--border)] px-4 py-10 text-center text-sm text-[var(--text-muted)]">
            No upcoming matches available. Connect a fixture provider to populate this page.
          </div>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {matches.map((m) => (
              <li
                key={m.match.id}
                className="rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] p-4"
              >
                <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--text-dim)]">
                  {m.competition.shortName}
                  {m.isDemo ? " · Demo" : ""}
                </p>
                <div className="mt-4 flex items-center justify-between gap-2">
                  <div className="flex flex-1 flex-col items-center gap-2 text-center">
                    <ClubLogo name={m.homeTeam.name} logoUrl={m.homeTeam.logoUrl} size={44} />
                    <span className="text-xs font-semibold">{m.homeTeam.name}</span>
                  </div>
                  <span className="text-[11px] font-semibold text-[var(--text-dim)]">vs</span>
                  <div className="flex flex-1 flex-col items-center gap-2 text-center">
                    <ClubLogo name={m.awayTeam.name} logoUrl={m.awayTeam.logoUrl} size={44} />
                    <span className="text-xs font-semibold">{m.awayTeam.name}</span>
                  </div>
                </div>
                <p className="mt-3 text-center text-xs text-[var(--text-dim)]">
                  {formatKickoffLocal(m.match.kickoffAt)}
                </p>
                <Link
                  href="/signin?next=%2Fleaderboard"
                  className="focus-ring mt-4 inline-flex w-full justify-center text-xs text-[var(--accent)] hover:underline"
                >
                  Sign in for analysis →
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AppShell>
  );
}
