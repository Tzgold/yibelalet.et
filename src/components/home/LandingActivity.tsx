"use client";

import Link from "next/link";
import type { RecentSettledTip } from "@/data/repository";
import { Avatar } from "@/components/ui/Avatar";
import { ClubLogo } from "@/components/ui/ClubLogo";
import { TypeBadge } from "@/components/ui/TypeBadge";
import { profileAccessHref } from "@/lib/auth-paths";
import { formatRelative, selectionLabel } from "@/lib/format";
import { useT } from "@/i18n/I18nProvider";

export function LandingActivity({ tips }: { tips: RecentSettledTip[] }) {
  const t = useT();
  if (tips.length === 0) return null;

  const visibleTips = tips.slice(0, 5);
  const wins = visibleTips.filter((tip) => tip.view.settlementOutcome === "win").length;
  const losses = visibleTips.filter((tip) => tip.view.settlementOutcome === "loss").length;

  return (
    <section className="company-activity company-section">
      <p className="company-eyebrow">{t("activity.title")}</p>
      <h2>{t("company.activityTitle")}</h2>
      <p className="mx-auto mt-3 max-w-xl text-center text-sm text-[var(--text-muted)]">
        {t("activity.subtitle")}
      </p>

      <div className="mt-4 flex items-center justify-center gap-4 text-[11px] font-semibold uppercase tracking-wide">
        <span className="text-[#22c55e]">
          {t(wins === 1 ? "activity.win" : "activity.wins", { count: wins })}
        </span>
        <span className="text-[#ef4444]">
          {t(losses === 1 ? "activity.loss" : "activity.losses", { count: losses })}
        </span>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-[var(--border)] bg-black">
        <div className="hidden border-b border-[var(--border)] px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-dim)] md:grid md:grid-cols-[minmax(0,1.35fr)_minmax(0,1.4fr)_minmax(0,0.9fr)_4.5rem_6.5rem] md:gap-4">
          <span>{t("activity.predictor")}</span>
          <span>{t("activity.match")}</span>
          <span>{t("activity.selection")}</span>
          <span className="text-center">{t("activity.result")}</span>
          <span className="text-right">{t("activity.when")}</span>
        </div>

        <ul className="divide-y divide-[var(--border)]">
          {visibleTips.map(({ view, profile }) => {
            const win = view.settlementOutcome === "win";
            return (
              <li key={view.id}>
                <Link
                  href={profileAccessHref(profile.slug, false)}
                  className="focus-ring group flex flex-col gap-3 px-4 py-4 transition hover:bg-white/[0.03] md:grid md:grid-cols-[minmax(0,1.35fr)_minmax(0,1.4fr)_minmax(0,0.9fr)_4.5rem_6.5rem] md:items-center md:gap-4 md:px-5"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <Avatar name={profile.displayName} url={profile.avatarUrl} size="sm" />
                    <span className="min-w-0">
                      <span className="flex min-w-0 flex-wrap items-center gap-1.5">
                        <span className="truncate text-sm font-semibold text-[var(--text)] group-hover:text-[var(--accent)]">
                          {profile.displayName}
                        </span>
                        <TypeBadge type={profile.profileType} />
                      </span>
                      <span className="mt-0.5 block text-[11px] text-[var(--text-dim)] md:hidden">
                        {view.competition.shortName}
                      </span>
                    </span>
                  </span>

                  <span className="flex min-w-0 items-center gap-2">
                    <span className="inline-flex items-center gap-1.5">
                      <ClubLogo
                        name={view.homeTeam.name}
                        logoUrl={view.homeTeam.logoUrl}
                        size={22}
                      />
                      <span className="text-[11px] font-bold uppercase tracking-wide text-[var(--text)]">
                        {view.homeTeam.shortName}
                      </span>
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-dim)]">
                      {t("common.vs")}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <ClubLogo
                        name={view.awayTeam.name}
                        logoUrl={view.awayTeam.logoUrl}
                        size={22}
                      />
                      <span className="text-[11px] font-bold uppercase tracking-wide text-[var(--text)]">
                        {view.awayTeam.shortName}
                      </span>
                    </span>
                    <span className="ml-1 hidden text-[11px] text-[var(--text-dim)] md:inline">
                      · {view.competition.shortName}
                    </span>
                  </span>

                  <span>
                    <span className="inline-flex max-w-full items-center bg-[var(--bg)] px-2 py-1 text-xs font-medium text-[var(--text-muted)]">
                      <span className="truncate">{selectionLabel(view.selection, view.homeTeam.name, view.awayTeam.name)}</span>
                    </span>
                  </span>

                  <span className="flex items-center justify-between gap-3 md:justify-center">
                    <span
                      className={`text-[12px] font-bold uppercase tracking-wide ${
                        win ? "text-[#22c55e]" : "text-[#ef4444]"
                      }`}
                    >
                      {win ? t("common.win") : t("common.loss")}
                    </span>
                    <span className="text-[11px] text-[var(--text-dim)] md:hidden">
                      {view.settledAt ? formatRelative(view.settledAt) : "—"}
                    </span>
                  </span>

                  <span className="hidden text-right text-xs text-[var(--text-dim)] md:block">
                    {view.settledAt ? formatRelative(view.settledAt) : "—"}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
