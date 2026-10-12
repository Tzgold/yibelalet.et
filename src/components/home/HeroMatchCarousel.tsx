"use client";

import { useEffect, useState } from "react";
import type { UpcomingMatchCard } from "@/data/repository";
import { ClubLogo } from "@/components/ui/ClubLogo";

const DEMO_ODDS = [
  [
    { label: "Home win", value: 0.48, color: "var(--accent)" },
    { label: "Draw", value: 0.27, color: "#5b8def" },
    { label: "Away win", value: 0.25, color: "#ef5a6f" },
  ],
  [
    { label: "Home win", value: 0.41, color: "var(--accent)" },
    { label: "Draw", value: 0.29, color: "#5b8def" },
    { label: "Away win", value: 0.3, color: "#ef5a6f" },
  ],
  [
    { label: "Home win", value: 0.36, color: "var(--accent)" },
    { label: "Draw", value: 0.31, color: "#5b8def" },
    { label: "Away win", value: 0.33, color: "#ef5a6f" },
  ],
] as const;

const FALLBACK: UpcomingMatchCard = {
  match: {
    id: "fallback-ars-che",
    providerMatchId: null,
    competitionId: "comp-epl",
    homeTeamId: "t-ars",
    awayTeamId: "t-che",
    kickoffAt: new Date(Date.now() + 86400000 * 3).toISOString(),
    matchStatus: "scheduled",
    homeScore: null,
    awayScore: null,
    dataSource: "demo",
    updatedAt: new Date().toISOString(),
  },
  competition: {
    id: "comp-epl",
    name: "Premier League",
    shortName: "EPL",
    country: "England",
  },
  homeTeam: {
    id: "t-ars",
    name: "Arsenal",
    shortName: "ARS",
    logoUrl: "https://crests.football-data.org/57.png",
  },
  awayTeam: {
    id: "t-che",
    name: "Chelsea",
    shortName: "CHE",
    logoUrl: "https://crests.football-data.org/61.png",
  },
  isDemo: true,
};

export function HeroMatchCarousel({ matches }: { matches: UpcomingMatchCard[] }) {
  const slides = matches.length > 0 ? matches : [FALLBACK];
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState<"left" | "right">("right");
  const [animKey, setAnimKey] = useState(0);

  const total = slides.length;
  const current = slides[((index % total) + total) % total];
  const rows = DEMO_ODDS[index % DEMO_ODDS.length];

  function go(delta: number) {
    setDir(delta >= 0 ? "right" : "left");
    setIndex((i) => ((i + delta) % total + total) % total);
    setAnimKey((k) => k + 1);
  }

  useEffect(() => {
    if (total < 2) return;
    const id = window.setInterval(() => {
      setDir("right");
      setIndex((i) => (i + 1) % total);
      setAnimKey((k) => k + 1);
    }, 8000);
    return () => window.clearInterval(id);
  }, [total]);

  const when = new Date(current.match.kickoffAt).toLocaleString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="relative mx-auto w-full max-w-[400px] lg:mx-0 lg:justify-self-end">
      <aside
        key={animKey}
        className={`relative min-h-[400px] overflow-hidden rounded-xl border border-[var(--border)] bg-black p-6 sm:p-7 ${
          dir === "right" ? "animate-slide-in-right" : "animate-slide-in-left"
        }`}
      >
        {/* Soft stadium wash — contained inside the card so nothing clips */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-[0.22]"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=900&q=70)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/50 via-black/80 to-black"
        />

        <div className="relative flex h-full flex-col">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
              {current.competition.shortName}
            </span>
            <span className="text-[11px] text-[var(--text-dim)]">
              {index + 1}/{total}
            </span>
          </div>

          <div className="mt-8 flex items-center justify-between gap-3">
            <div className="flex flex-1 flex-col items-center gap-3 text-center">
              <ClubLogo
                name={current.homeTeam.name}
                logoUrl={current.homeTeam.logoUrl}
                size={58}
              />
              <span className="text-sm font-semibold leading-tight">
                {current.homeTeam.name}
              </span>
            </div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--text-dim)]">
              vs
            </span>
            <div className="flex flex-1 flex-col items-center gap-3 text-center">
              <ClubLogo
                name={current.awayTeam.name}
                logoUrl={current.awayTeam.logoUrl}
                size={58}
              />
              <span className="text-sm font-semibold leading-tight">
                {current.awayTeam.name}
              </span>
            </div>
          </div>

          <p className="mt-5 text-center text-sm text-[var(--text-muted)]">{when}</p>

          <div className="mt-auto space-y-3.5 pt-7">
            {rows.map((row) => (
              <div key={row.label}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="text-[var(--text-muted)]">{row.label}</span>
                  <span className="tabular font-semibold">{Math.round(row.value * 100)}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-1.5 rounded-full transition-[width] duration-700 ease-out"
                    style={{ width: `${row.value * 100}%`, background: row.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {total > 1 ? (
        <div className="mt-4 flex items-center justify-center gap-3">
          <button
            type="button"
            aria-label="Previous match"
            onClick={() => go(-1)}
            className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] bg-black text-[var(--text)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            <ChevronLeft />
          </button>
          <div className="flex items-center gap-1.5 px-1">
            {slides.map((s, i) => (
              <button
                key={s.match.id}
                type="button"
                aria-label={`Show match ${i + 1}`}
                onClick={() => {
                  setDir(i > index ? "right" : "left");
                  setIndex(i);
                  setAnimKey((k) => k + 1);
                }}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === index
                    ? "w-6 bg-[var(--accent)]"
                    : "w-1.5 bg-[var(--border-strong)] hover:bg-[var(--text-dim)]"
                }`}
              />
            ))}
          </div>
          <button
            type="button"
            aria-label="Next match"
            onClick={() => go(1)}
            className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] bg-black text-[var(--text)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            <ChevronRight />
          </button>
        </div>
      ) : null}
    </div>
  );
}

function ChevronLeft() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M14.5 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M9.5 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
