import Link from "next/link";
import type { UpcomingMatchCard } from "@/data/repository";
import { ClubLogo } from "@/components/ui/ClubLogo";

export function LandingHero({
  featuredMatch,
}: {
  featuredMatch: UpcomingMatchCard | null;
}) {
  return (
    <section className="grid items-center gap-10 py-10 sm:py-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--accent)]">
          Football prediction analytics
        </p>
        <h1 className="mt-4 max-w-xl text-[2.65rem] font-semibold leading-[1.05] tracking-tight text-[var(--text)] sm:text-5xl lg:text-[3.35rem]">
          Know who gets it right.
        </h1>
        <p className="mt-5 max-w-md text-[15px] leading-relaxed text-[var(--text-muted)]">
          Compare human tipsters and AI models by their recorded football predictions. Not
          their biggest win.
        </p>
        <div className="mt-7 flex flex-wrap items-center gap-3">
          <a
            href="#leaderboard"
            className="focus-ring inline-flex items-center gap-2 rounded-md bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-[var(--accent-ink)] transition-transform hover:brightness-105 active:scale-[0.98]"
          >
            Explore rankings
            <span aria-hidden>→</span>
          </a>
          <a
            href="#how-it-works"
            className="focus-ring inline-flex items-center rounded-md border border-[var(--border-strong)] px-5 py-2.5 text-sm text-[var(--text-muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--text)]"
          >
            Methodology
          </a>
          <Link
            href="/signin"
            className="focus-ring text-sm text-[var(--text-dim)] hover:text-[var(--accent)]"
          >
            Sign in
          </Link>
        </div>
        <p className="mt-6 flex items-center gap-2 text-sm text-[var(--text-dim)]">
          <ShieldIcon />
          Every prediction timestamped. Every result tracked.
        </p>
      </div>

      <HeroPredictionCard match={featuredMatch} />
    </section>
  );
}

function HeroPredictionCard({ match }: { match: UpcomingMatchCard | null }) {
  const home = match?.homeTeam.name ?? "Arsenal";
  const away = match?.awayTeam.name ?? "Chelsea";
  const homeLogo = match?.homeTeam.logoUrl ?? "https://crests.football-data.org/57.png";
  const awayLogo = match?.awayTeam.logoUrl ?? "https://crests.football-data.org/61.png";
  const league = match?.competition.name ?? "Premier League";
  const when = match
    ? new Date(match.match.kickoffAt).toLocaleString(undefined, {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Sat 26 Apr 2025 · 18:30";

  const rows = [
    { label: "Home win", value: 0.48, color: "var(--accent)" },
    { label: "Draw", value: 0.27, color: "#5b8def" },
    { label: "Away win", value: 0.25, color: "#ef5a6f" },
  ];

  return (
    <aside className="relative mx-auto w-full max-w-[352px] overflow-hidden rounded-xl border border-[var(--border)] bg-[rgba(18,21,26,0.92)] p-5 shadow-[0_28px_90px_rgba(0,0,0,0.55)] backdrop-blur-sm lg:mx-0 lg:justify-self-end">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-[rgba(245,158,11,0.12)] blur-3xl"
      />
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-dim)]">
        {league}
      </p>

      <div className="mt-5 flex items-center justify-between gap-3">
        <div className="flex flex-1 flex-col items-center gap-2.5 text-center">
          <ClubLogo name={home} logoUrl={homeLogo} size={56} />
          <span className="text-[13px] font-semibold leading-tight">{home}</span>
        </div>
        <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--text-dim)]">
          vs
        </span>
        <div className="flex flex-1 flex-col items-center gap-2.5 text-center">
          <ClubLogo name={away} logoUrl={awayLogo} size={56} />
          <span className="text-[13px] font-semibold leading-tight">{away}</span>
        </div>
      </div>

      <p className="mt-3.5 text-center text-xs text-[var(--text-dim)]">{when}</p>

      <div className="mt-5 space-y-3.5">
        {rows.map((row) => (
          <div key={row.label}>
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <span className="text-[var(--text-muted)]">{row.label}</span>
              <span className="tabular font-semibold">{Math.round(row.value * 100)}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-[var(--bg-soft)]">
              <div
                className="h-1.5 rounded-full"
                style={{ width: `${row.value * 100}%`, background: row.color }}
              />
            </div>
          </div>
        ))}
      </div>
      <p className="mt-5 text-center text-[10px] tracking-wide text-[var(--text-dim)]">
        Example prediction — Demo data
      </p>
    </aside>
  );
}

function ShieldIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3l7 3v6c0 5-3.5 8.5-7 9-3.5-.5-7-4-7-9V6l7-3z"
        stroke="var(--accent)"
        strokeWidth="1.6"
      />
      <path d="M9 12l2 2 4-4" stroke="var(--accent)" strokeWidth="1.6" />
    </svg>
  );
}
