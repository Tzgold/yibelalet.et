"use client";

import Link from "next/link";
import { useRef } from "react";
import type { UpcomingMatchCard } from "@/data/repository";
import { ClubLogo } from "@/components/ui/ClubLogo";
import { LinedSectionTitle } from "@/components/ui/LinedSectionTitle";
import { useT } from "@/i18n/I18nProvider";

function splitKickoff(iso: string) {
  const d = new Date(iso);
  return {
    date: d
      .toLocaleDateString(undefined, { day: "2-digit", month: "short" })
      .toUpperCase(),
    time: d.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
}

export function LandingMatches({ matches }: { matches: UpcomingMatchCard[] }) {
  const t = useT();
  const scrollerRef = useRef<HTMLUListElement>(null);

  if (matches.length === 0) return null;

  const cards = matches.slice(0, 6);

  function scrollBy(dir: -1 | 1) {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 320, behavior: "smooth" });
  }

  return (
    <section id="matches" className="scroll-mt-20 py-12">
      <LinedSectionTitle>{t("matches.title")}</LinedSectionTitle>

      <div className="mt-8">
        <ul
          ref={scrollerRef}
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {cards.map((m) => {
            const { date, time } = splitKickoff(m.match.kickoffAt);
            return (
              <li
                key={m.match.id}
                className="w-[280px] shrink-0 snap-start rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-5 py-6"
              >
                <div className="flex items-start justify-center gap-3">
                  <div className="flex w-[40%] flex-col items-center gap-2.5 text-center">
                    <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-[var(--bg)] ring-1 ring-[var(--border)]">
                      <ClubLogo
                        name={m.homeTeam.name}
                        logoUrl={m.homeTeam.logoUrl}
                        size={42}
                      />
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wide">
                      {m.homeTeam.shortName}
                    </span>
                  </div>

                  <span className="mt-4 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--bg)] text-[9px] font-bold uppercase text-[var(--text-muted)] ring-1 ring-[var(--border)]">
                    {t("common.vs")}
                  </span>

                  <div className="flex w-[40%] flex-col items-center gap-2.5 text-center">
                    <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-[var(--bg)] ring-1 ring-[var(--border)]">
                      <ClubLogo
                        name={m.awayTeam.name}
                        logoUrl={m.awayTeam.logoUrl}
                        size={42}
                      />
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wide">
                      {m.awayTeam.shortName}
                    </span>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-[var(--border)] pt-3.5 text-[11px] text-[var(--text-muted)]">
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarIcon />
                    {date}
                  </span>
                  <span className="h-3 w-px bg-[var(--border)]" aria-hidden />
                  <span className="inline-flex items-center gap-1.5">
                    <ClockIcon />
                    {time}
                  </span>
                </div>

                <Link
                  href="/signin?next=%2Fmatches"
                  className="mt-4 inline-flex w-full items-center justify-center gap-1 text-sm font-semibold text-[var(--accent)] hover:underline"
                >
                  {t("common.viewDetails")}
                  <span aria-hidden>›</span>
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="mt-4 flex items-center justify-center gap-3">
          <button
            type="button"
            aria-label={t("matches.previous")}
            onClick={() => scrollBy(-1)}
            className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text)] transition hover:border-[var(--accent)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M14.5 6l-6 6 6 6"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
          <button
            type="button"
            aria-label={t("matches.next")}
            onClick={() => scrollBy(1)}
            className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text)] transition hover:border-[var(--accent)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M9.5 6l6 6-6 6"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </div>

      <p className="mt-5 text-center">
        <Link href="/matches" className="text-xs text-[var(--text-dim)] hover:text-[var(--accent)]">
          {t("matchesPage.viewAll")}
        </Link>
      </p>
    </section>
  );
}

function CalendarIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3.5" y="5" width="17" height="15" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 3.5V7M16 3.5V7M3.5 10h17" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 8v4.5l3 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
