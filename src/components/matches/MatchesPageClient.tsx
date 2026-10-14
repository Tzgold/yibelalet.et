"use client";

import Link from "next/link";
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

export function MatchesPageClient({ matches }: { matches: UpcomingMatchCard[] }) {
  const t = useT();

  return (
    <div>
      <header className="mb-8">
        <LinedSectionTitle as="h1">{t("matchesPage.title")}</LinedSectionTitle>
        <p className="mx-auto mt-3 max-w-xl text-center text-sm text-[var(--text-muted)]">
          {t("matchesPage.subtitle")}
        </p>
      </header>

      {matches.length === 0 ? (
        <div className="rounded-xl border border-[var(--border)] px-4 py-12 text-center text-sm text-[var(--text-muted)]">
          {t("matchesPage.empty")}
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {matches.map((m) => {
            const { date, time } = splitKickoff(m.match.kickoffAt);
            return (
              <li
                key={m.match.id}
                className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-5 py-6"
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
                  <span>{date}</span>
                  <span className="h-3 w-px bg-[var(--border)]" aria-hidden />
                  <span>{time}</span>
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
      )}
    </div>
  );
}
