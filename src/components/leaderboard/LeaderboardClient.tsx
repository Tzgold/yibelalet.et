"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Competition, LeaderboardEntry, RankingMetric, TimeRangeKey } from "@/domain/types";
import { formatPercent, formatUnits } from "@/lib/format";
import { Avatar } from "@/components/ui/Avatar";
import { TypeBadge } from "@/components/ui/TypeBadge";
import { profileAccessHref } from "@/lib/auth-paths";
import { useT } from "@/i18n/I18nProvider";

export function LeaderboardClient({
  initialEntries,
  competitions,
  profileCount,
  initialSearch = "",
  initialType = "all",
  initialRange = "30d",
  initialMetric = "default",
  initialCompetition = "",
  isAuthenticated = false,
}: {
  initialEntries: LeaderboardEntry[];
  competitions: Competition[];
  profileCount: number;
  initialSearch?: string;
  initialType?: "all" | "human" | "ai";
  initialRange?: TimeRangeKey;
  initialMetric?: RankingMetric;
  initialCompetition?: string;
  isAuthenticated?: boolean;
}) {
  const t = useT();
  const METRICS: { value: RankingMetric; label: string }[] = [
    { value: "default", label: t("leaderboardPage.metricDefault") },
    { value: "accuracy", label: t("leaderboardPage.metricAccuracy") },
    { value: "recent", label: t("leaderboardPage.metricRecent") },
    { value: "profitability", label: t("leaderboardPage.metricProfit") },
  ];
  const RANGES: { value: TimeRangeKey; label: string }[] = [
    { value: "7d", label: t("leaderboard.range7d") },
    { value: "30d", label: t("leaderboard.range30d") },
    { value: "90d", label: t("leaderboard.range90d") },
    { value: "all", label: t("leaderboard.rangeAll") },
  ];
  const profileHref = (slug: string) => profileAccessHref(slug, isAuthenticated);
  const [search, setSearch] = useState(initialSearch);
  const [profileType, setProfileType] = useState<"all" | "human" | "ai">(initialType);
  const [timeRange, setTimeRange] = useState<TimeRangeKey>(initialRange);
  const [metric, setMetric] = useState<RankingMetric>(initialMetric);
  const [competitionId, setCompetitionId] = useState<string>(initialCompetition);

  // Client-side re-rank using the same payload (server already calculated once).
  // For filter changes we re-fetch via query params navigation would be ideal;
  // here we filter the provided board for search/type and note time/metric
  // require server refresh — we use URL searchParams via form submit below.

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return initialEntries.filter((e) => {
      if (profileType !== "all" && e.profile.profileType !== profileType) return false;
      if (!q) return true;
      const hay = [
        e.profile.displayName,
        e.profile.handle,
        e.profile.bio,
        e.profile.specialties.join(" "),
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [initialEntries, search, profileType]);

  return (
    <div className="workspace-board space-y-6">
      <header className="workspace-page-header">
        <p className="company-eyebrow">YIBELALET / {t("nav.rankings")}</p>
        <h1>{t("leaderboardPage.title")}</h1>
        <p className="workspace-page-intro">
          {t("leaderboardPage.subtitle")}
        </p>
        <p className="workspace-result-count" aria-live="polite">
          {t("leaderboardPage.publicProfiles", { count: profileCount })}
        </p>
      </header>

      <form
        className="workspace-filters grid gap-3 rounded-xl border border-[var(--border)] bg-black p-4 sm:grid-cols-2 lg:grid-cols-5"
        method="get"
        action="/leaderboard"
      >
        <label className="block text-xs text-[var(--text-dim)] lg:col-span-2">
          {t("common.search")}
          <input
            name="q"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("leaderboardPage.searchPlaceholder")}
            className="focus-ring mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text)]"
          />
        </label>
        <label className="block text-xs text-[var(--text-dim)]">
          {t("leaderboardPage.creatorType")}
          <select
            name="type"
            value={profileType}
            onChange={(e) => setProfileType(e.target.value as "all" | "human" | "ai")}
            className="focus-ring mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm"
          >
            <option value="all">{t("common.all")}</option>
            <option value="human">{t("common.human")}</option>
            <option value="ai">{t("common.ai")}</option>
          </select>
        </label>
        <label className="block text-xs text-[var(--text-dim)]">
          {t("leaderboardPage.timeRange")}
          <select
            name="range"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as TimeRangeKey)}
            className="focus-ring mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm"
          >
            {RANGES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-xs text-[var(--text-dim)]">
          {t("leaderboardPage.rankingMetric")}
          <select
            name="metric"
            value={metric}
            onChange={(e) => setMetric(e.target.value as RankingMetric)}
            className="focus-ring mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm"
          >
            {METRICS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-xs text-[var(--text-dim)] sm:col-span-2 lg:col-span-3">
          {t("leaderboardPage.competition")}
          <select
            name="competition"
            value={competitionId}
            onChange={(e) => setCompetitionId(e.target.value)}
            className="focus-ring mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm"
          >
            <option value="">{t("leaderboardPage.allCompetitions")}</option>
            {competitions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <div className="flex items-end sm:col-span-2 lg:col-span-2">
          <button
            type="submit"
            className="focus-ring w-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[var(--accent-ink)] hover:brightness-110"
          >
            {t("common.applyFilters")}
          </button>
        </div>
        <Link href="/leaderboard" className="workspace-reset focus-ring">{t("common.clearFilters")}</Link>
      </form>

      {visible.length === 0 ? (
        <div className="rounded-xl border border-[var(--border)] bg-black p-10 text-center">
          <h2 className="text-lg font-medium">{t("leaderboardPage.emptyTitle")}</h2>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            {t("leaderboardPage.emptyHint")}
          </p>
        </div>
      ) : (
        <>
          <div className="workspace-table-region hidden rounded-xl border border-[var(--border)] bg-black lg:block" role="region" aria-label={t("leaderboardPage.title")} tabIndex={0}>
            <table className="min-w-full text-left text-sm">
              <caption className="sr-only">{t("leaderboardPage.title")}</caption>
              <thead className="text-xs uppercase tracking-wide text-[var(--text-dim)]">
                <tr className="border-b border-[var(--border)]">
                  <th className="px-4 py-3 font-medium">{t("common.rank")}</th>
                  <th className="px-4 py-3 font-medium">{t("common.profile")}</th>
                  <th className="px-4 py-3 font-medium">{t("common.record")}</th>
                  <th className="px-4 py-3 font-medium">{t("aiModelsPage.settledCol")}</th>
                  <th className="px-4 py-3 font-medium">{t("common.accuracy")}</th>
                  <th className="px-4 py-3 font-medium">{t("common.roi")}</th>
                  <th className="px-4 py-3 font-medium">{t("common.form")}</th>
                  <th className="px-4 py-3 font-medium"><span className="sr-only">{t("common.viewProfile")}</span></th>
                </tr>
              </thead>
              <tbody>
                {visible.map((entry) => (
                  <tr
                    key={entry.profile.id}
                    className="border-t border-[var(--border)] hover:bg-white/[0.03]"
                  >
                    <td className="px-4 py-3 font-mono text-[var(--text-muted)]">
                      {entry.eligible ? `#${entry.rank}` : "—"}
                      {!entry.eligible ? (
                        <span className="ml-2 text-[10px] uppercase text-[var(--text-dim)]">
                          {t("common.na")}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={profileHref(entry.profile.slug)}
                        className="focus-ring flex items-center gap-3 rounded-md"
                      >
                        <Avatar name={entry.profile.displayName} url={entry.profile.avatarUrl} />
                        <span>
                          <span className="flex items-center gap-2 font-medium">
                            {entry.profile.displayName}
                            <TypeBadge type={entry.profile.profileType} />
                          </span>
                          <span className="mt-0.5 block text-xs text-[var(--text-dim)]">
                            {entry.profile.specialties.slice(0, 2).join(" · ") ||
                              entry.profile.handle}
                          </span>
                        </span>
                      </Link>
                    </td>
                    <td className="px-4 py-3 tabular-nums">
                      {entry.summary.wins}-{entry.summary.losses}
                      {entry.summary.voids ? `-${entry.summary.voids}v` : ""}
                    </td>
                    <td className="px-4 py-3 tabular-nums">{entry.summary.settledCount}</td>
                    <td className="px-4 py-3 tabular-nums">
                      {formatPercent(entry.summary.accuracy)}
                    </td>
                    <td className="px-4 py-3 tabular-nums">
                      {entry.summary.roi != null ? (
                        <span className={entry.summary.roi >= 0 ? "pos" : "neg"}>
                          {formatPercent(entry.summary.roi)}
                        </span>
                      ) : (
                        <span className="text-[var(--text-dim)]" title={t("leaderboardPage.noBetting")}>
                          —
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <FormPills
                        form={entry.recentForm}
                        emptyLabel={t("leaderboardPage.noRecent")}
                        formLabel={t("leaderboardPage.recentForm", {
                          form: entry.recentForm.join(" "),
                        })}
                      />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={profileHref(entry.profile.slug)}
                        className="focus-ring text-xs font-medium text-[var(--accent)] hover:underline"
                      >
                        {t("common.viewProfile")}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="workspace-mobile-board space-y-3 lg:hidden">
            {visible.map((entry) => (
              <li key={entry.profile.id}>
                <Link
                  href={profileHref(entry.profile.slug)}
                  className="focus-ring block rounded-xl border border-[var(--border)] bg-black p-4"
                >
                  <div className="flex items-start gap-3">
                    <span className="font-mono text-sm text-[var(--text-dim)]">
                      {entry.eligible ? `#${entry.rank}` : "—"}
                    </span>
                    <Avatar name={entry.profile.displayName} url={entry.profile.avatarUrl} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">{entry.profile.displayName}</span>
                        <TypeBadge type={entry.profile.profileType} />
                      </div>
                      <p className="mt-1 text-xs text-[var(--text-dim)]">
                        {entry.profile.specialties.slice(0, 2).join(" · ")}
                      </p>
                      <div className="workspace-mobile-metrics mt-3 grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <p className="text-[var(--text-dim)]">{t("common.record")}</p>
                          <p className="tabular-nums">
                            {entry.summary.wins}-{entry.summary.losses}
                          </p>
                        </div>
                        <div>
                          <p className="text-[var(--text-dim)]">{t("common.accuracy")}</p>
                          <p className="tabular-nums">
                            {formatPercent(entry.summary.accuracy)}
                          </p>
                        </div>
                        <div>
                          <p className="text-[var(--text-dim)]">{t("common.roi")}</p>
                          <p className="tabular-nums">
                            {entry.summary.roi != null
                              ? formatPercent(entry.summary.roi)
                              : "—"}
                          </p>
                        </div>
                        <div><p className="text-[var(--text-dim)]">{t("aiModelsPage.settledCol")}</p><p className="tabular-nums">{entry.summary.settledCount}</p></div>
                      </div>
                      <div className="mt-2">
                        <FormPills form={entry.recentForm} emptyLabel={t("leaderboardPage.noRecent")} formLabel={t("leaderboardPage.recentForm", { form: entry.recentForm.join(" ") })} />
                      </div>
                      {!entry.eligible && entry.ineligibleReason ? (
                        <p className="mt-2 text-[11px] text-[var(--text-dim)]">
                          {entry.ineligibleReason}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}

      <p className="text-xs text-[var(--text-dim)]">
        {t("leaderboardPage.netProfitRef")}{" "}
        {visible
          .filter((e) => e.summary.netProfitUnits != null)
          .slice(0, 1)
          .map((e) => formatUnits(e.summary.netProfitUnits))
          .join("") || t("leaderboardPage.bettingOnly")}
        .
      </p>
    </div>
  );
}

function FormPills({
  form,
  emptyLabel,
  formLabel,
}: {
  form: Array<"W" | "L" | "V" | "P">;
  emptyLabel: string;
  formLabel: string;
}) {
  if (form.length === 0) {
    return <span className="text-xs text-[var(--text-dim)]">{emptyLabel}</span>;
  }
  return (
    <span className="inline-flex gap-1" aria-label={formLabel}>
      {form.map((f, i) => (
        <span
          key={`${f}-${i}`}
          className="inline-flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold"
          style={{
            background:
              f === "W"
                ? "var(--positive-soft)"
                : f === "L"
                  ? "var(--negative-soft)"
                  : "rgba(109,122,137,0.2)",
            color:
              f === "W" ? "var(--positive)" : f === "L" ? "var(--negative)" : "var(--text-dim)",
          }}
        >
          {f}
        </span>
      ))}
    </span>
  );
}
