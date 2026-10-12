import Link from "next/link";
import type { UpcomingMatchCard } from "@/data/repository";
import { ClubLogo } from "@/components/ui/ClubLogo";
import { formatKickoffLocal } from "@/lib/format";

export function LandingMatches({ matches }: { matches: UpcomingMatchCard[] }) {
  if (matches.length === 0) return null;

  const cards = matches.slice(0, 3);

  return (
    <section id="matches" className="scroll-mt-20 py-8">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Featured matches</h2>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Upcoming fixtures
            {cards.some((m) => m.isDemo) ? " · Demo schedule" : ""}.
          </p>
        </div>
        <Link
          href="/matches"
          className="shrink-0 text-xs font-medium text-[var(--accent)] hover:underline"
        >
          View all matches →
        </Link>
      </div>
      <ul className="mt-5 grid gap-3 sm:grid-cols-3">
        {cards.map((m) => (
          <li
            key={m.match.id}
            className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-4 transition-colors hover:border-[var(--border-strong)]"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-dim)]">
                {m.competition.name}
              </p>
              {m.isDemo ? (
                <span className="text-[10px] text-[var(--text-dim)]">Demo</span>
              ) : null}
            </div>

            <div className="mt-5 flex items-center justify-between gap-2">
              <div className="flex min-w-0 flex-1 flex-col items-center gap-2.5 text-center">
                <ClubLogo name={m.homeTeam.name} logoUrl={m.homeTeam.logoUrl} size={48} />
                <span className="truncate text-xs font-semibold">{m.homeTeam.name}</span>
              </div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-dim)]">
                vs
              </span>
              <div className="flex min-w-0 flex-1 flex-col items-center gap-2.5 text-center">
                <ClubLogo name={m.awayTeam.name} logoUrl={m.awayTeam.logoUrl} size={48} />
                <span className="truncate text-xs font-semibold">{m.awayTeam.name}</span>
              </div>
            </div>

            <p className="mt-4 text-center text-xs text-[var(--text-dim)]">
              {formatKickoffLocal(m.match.kickoffAt)}
            </p>
            <Link
              href="/signin?next=%2Fmatches"
              className="mt-4 inline-flex w-full justify-center text-xs font-medium text-[var(--accent)] hover:underline"
            >
              Match analysis →
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
