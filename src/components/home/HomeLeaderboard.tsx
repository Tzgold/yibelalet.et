"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { LeaderboardEntry, RankingMetric, TimeRangeKey } from "@/domain/types";
import { formatPercent } from "@/lib/format";
import { Avatar } from "@/components/ui/Avatar";
import { TypeBadge } from "@/components/ui/TypeBadge";
import { profileAccessHref } from "@/lib/auth-paths";
import { useT } from "@/i18n/I18nProvider";

function RecentForm({ form }: { form: LeaderboardEntry["recentForm"] }) {
  const t = useT();
  const labels = { W: "common.win", L: "common.loss", V: "common.void", P: "common.push" } as const;
  return <span className="recent-form" aria-label={t("leaderboard.recentForm")}>
    {form.length ? form.slice(0, 5).map((result, i) => <span key={i} className={`form-result form-result-${result.toLowerCase()}`} title={t(labels[result])}><span className="sr-only">{t(labels[result])}</span><span aria-hidden>{result}</span></span>) : <span className="muted">—</span>}
  </span>;
}

export function HomeLeaderboard({
  entries,
  featuredEntries = entries,
  isAuthenticated = false,
  totalProfiles,
  initialType = "all",
  initialRange = "30d",
  initialMetric = "accuracy",
  initialSearch = "",
}: {
  entries: LeaderboardEntry[];
  featuredEntries?: LeaderboardEntry[];
  isAuthenticated?: boolean;
  totalProfiles: number;
  initialType?: "all" | "human" | "ai";
  initialRange?: TimeRangeKey;
  initialMetric?: RankingMetric;
  initialSearch?: string;
}) {
  const t = useT();
  const profileHref = (slug: string) => profileAccessHref(slug, isAuthenticated);
  const [profileType, setProfileType] = useState<"all" | "human" | "ai">(initialType);
  const [timeRange, setTimeRange] = useState<TimeRangeKey>(initialRange);
  const [metric, setMetric] = useState<RankingMetric>(initialMetric);
  const [search, setSearch] = useState(initialSearch);

  const RANGES: { value: TimeRangeKey; label: string }[] = [
    { value: "7d", label: t("leaderboard.range7d") },
    { value: "30d", label: t("leaderboard.range30d") },
    { value: "90d", label: t("leaderboard.range90d") },
    { value: "all", label: t("leaderboard.rangeAll") },
  ];

  const METRICS: { value: RankingMetric; label: string }[] = [
    { value: "accuracy", label: t("leaderboard.accuracy") },
    { value: "default", label: t("leaderboard.default") },
    { value: "recent", label: t("leaderboard.recentForm") },
    { value: "profitability", label: t("leaderboard.profitability") },
  ];

  const typeLabels = {
    all: t("leaderboard.all"),
    human: t("leaderboard.human"),
    ai: t("leaderboard.ai"),
  } as const;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return entries.filter((e) => {
      if (profileType !== "all" && e.profile.profileType !== profileType) return false;
      if (!q) return true;
      const hay = [
        e.profile.displayName,
        e.profile.handle,
        e.profile.specialties.join(" "),
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [entries, profileType, search]);

  const visible = filtered.slice(0, 5);
  const topAi = useMemo(
    () => featuredEntries.filter((e) => e.profile.profileType === "ai").slice(0, 3),
    [featuredEntries],
  );
  const topHumans = featuredEntries.filter((e) => e.profile.profileType === "human").slice(0, 6);

  return (
    <section id="leaderboard" className="company-leaderboard company-section">
      <p className="company-eyebrow">01 / {t("leaderboard.title")}</p>
      <h2>{t("company.leaderboardTitle")}</h2>
      <div className="mt-3 flex flex-col items-center gap-2 text-center sm:flex-row sm:justify-between sm:text-left">
        <p className="text-sm text-[var(--text-muted)]">
          {t("leaderboard.subtitle")}
        </p>
        <Link
          href="/leaderboard"
          className="focus-ring text-sm font-medium text-[var(--accent)] hover:underline"
        >
          {t("leaderboard.viewAll", { count: totalProfiles })}
        </Link>
      </div>

      <form
        method="get"
        action="/"
        className="company-board-filters mt-5 flex flex-col gap-3 rounded-lg border border-[var(--border)] bg-black p-3 sm:flex-row sm:flex-wrap sm:items-center"
      >
        <label className="min-w-[12rem] flex-1">
          <span className="sr-only">{t("leaderboard.search")}</span>
          <input
            type="search"
            name="q"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("leaderboard.searchPlaceholder")}
            className="focus-ring w-full rounded-md border border-[var(--border)] bg-[var(--bg)] px-2.5 py-1.5 text-xs text-[var(--text)] placeholder:text-[var(--text-dim)]"
          />
        </label>
        <fieldset>
          <legend className="sr-only">{t("leaderboard.creatorType")}</legend>
          <div className="inline-flex overflow-hidden rounded-md border border-[var(--border)]">
            {(["all", "human", "ai"] as const).map((value) => (
              <label
                key={value}
                className={`cursor-pointer px-3 py-1.5 text-xs font-medium ${
                  profileType === value
                    ? "bg-[var(--accent)] text-[var(--accent-ink)]"
                    : "text-[var(--text-muted)] hover:text-[var(--text)]"
                }`}
              >
                <input
                  type="radio"
                  name="type"
                  value={value}
                  checked={profileType === value}
                  onChange={() => setProfileType(value)}
                  className="sr-only"
                />
                {typeLabels[value]}
              </label>
            ))}
          </div>
        </fieldset>
        <div className="flex flex-wrap items-center gap-2">
          <select
            name="range"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as TimeRangeKey)}
            className="focus-ring rounded-md border border-[var(--border)] bg-[var(--bg)] px-2.5 py-1.5 text-xs text-[var(--text)]"
            aria-label={t("leaderboard.timeRange")}
          >
            {RANGES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
          <select
            name="metric"
            value={metric}
            onChange={(e) => setMetric(e.target.value as RankingMetric)}
            className="focus-ring rounded-md border border-[var(--border)] bg-[var(--bg)] px-2.5 py-1.5 text-xs text-[var(--text)]"
            aria-label={t("leaderboard.rankingMetric")}
          >
            {METRICS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="focus-ring rounded-md border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            {t("leaderboard.apply")}
          </button>
        </div>
      </form>

      {visible.length === 0 ? (
        <div className="mt-3 rounded-lg border border-[var(--border)] px-4 py-10 text-center text-sm text-[var(--text-muted)]">
          {t("leaderboard.empty")}
        </div>
      ) : (
        <>
          <div className="leaderboard-table-region mt-3 hidden rounded-lg border border-[var(--border)] bg-black lg:block" role="region" aria-label={t("leaderboard.title")} tabIndex={0}>
            <table className="w-full text-left text-sm">
              <caption className="sr-only">{t("leaderboard.subtitle")}</caption>
              <thead className="text-[11px] uppercase tracking-wide text-[var(--text-dim)]">
                <tr className="border-b border-[var(--border)]">
                  <th className="px-4 py-2.5 font-medium">#</th>
                  <th className="px-3 py-2.5 font-medium">{t("leaderboardPage.name")}</th>
                  <th className="px-3 py-2.5 font-medium">{t("leaderboardPage.type")}</th>
                  <th className="px-3 py-2.5 font-medium">{t("leaderboardPage.focus")}</th>
                  <th className="px-3 py-2.5 font-medium">{t("aiModelsPage.settledCol")}</th>
                  <th className="px-3 py-2.5 font-medium">{t("common.accuracy")}</th>
                  <th className="px-3 py-2.5 font-medium">{t("leaderboard.recentForm")}</th>
                  <th className="px-4 py-2.5 font-medium"><span className="sr-only">{t("common.viewProfile")}</span></th>
                </tr>
              </thead>
              <tbody>
                {visible.map((entry) => {
                  return (
                    <tr
                      key={entry.profile.id}
                      className="border-b border-[var(--border)] last:border-0 hover:bg-white/[0.03]"
                    >
                      <td className="px-4 py-3 font-mono text-xs text-[var(--text-dim)]">
                        {entry.eligible ? entry.rank : "—"}
                      </td>
                      <td className="px-3 py-3">
                        <Link
                          href={profileHref(entry.profile.slug)}
                          className="focus-ring flex items-center gap-2.5"
                        >
                          <Avatar
                            name={entry.profile.displayName}
                            url={entry.profile.avatarUrl}
                            size="sm"
                          />
                          <span>
                            <span className="block font-medium">{entry.profile.displayName}</span>
                            <span className="block text-[11px] text-[var(--text-dim)]">
                              {entry.profile.handle}
                            </span>
                          </span>
                        </Link>
                      </td>
                      <td className="px-3 py-3">
                        <TypeBadge type={entry.profile.profileType} />
                      </td>
                      <td className="board-specialty px-3 py-3 text-sm text-[var(--text-muted)]">
                        {entry.profile.specialties[0] ?? "—"}
                      </td>
                      <td className="px-3 py-3 tabular text-[var(--text-muted)]">
                        {entry.summary.settledCount}
                      </td>
                      <td className="px-3 py-3 tabular">
                        <span className="font-medium">
                          {formatPercent(entry.summary.accuracy)}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <RecentForm form={entry.recentForm} />
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
                  );
                })}
              </tbody>
            </table>
          </div>

          <ul className="board-mobile mt-3 divide-y divide-[var(--border)] overflow-hidden rounded-lg border border-[var(--border)] bg-black lg:hidden">
            {visible.map((entry) => (
              <li key={entry.profile.id}>
                <Link
                  href={profileHref(entry.profile.slug)}
                  className="focus-ring flex items-center gap-3 px-4 py-3 hover:bg-white/[0.03]"
                >
                  <span className="w-5 font-mono text-xs text-[var(--text-dim)]">
                    {entry.eligible ? entry.rank : "—"}
                  </span>
                  <Avatar
                    name={entry.profile.displayName}
                    url={entry.profile.avatarUrl}
                    size="sm"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="board-profile-name text-sm font-medium">
                        {entry.profile.displayName}
                      </span>
                      <TypeBadge type={entry.profile.profileType} />
                    </span>
                    <span className="board-mobile-focus">{entry.profile.specialties[0] ?? "—"}</span>
                    <span className="board-mobile-metrics"><span><strong>{formatPercent(entry.summary.accuracy)}</strong> {t("common.accuracy")}</span><span>{entry.summary.settledCount} {t("common.settled")}</span></span>
                    <RecentForm form={entry.recentForm} />
                  </span>
                  <span className="board-mobile-arrow" aria-hidden>↗</span>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}

      {topAi.length > 0 ? (
        <div className="ai-spotlight mt-10">
          <div className="mb-5 flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--accent)]">
                {t("leaderboardPage.topAi")}
              </p>
              <p className="mt-1 text-sm text-[var(--text-muted)]">
                {t(topAi.some(e => e.eligible) ? "leaderboardPage.topAiSubtitle" : "leaderboardPage.buildingRecord")}
              </p>
            </div>
            <Link
              href="/leaderboard?type=ai&range=all&metric=accuracy"
              className="focus-ring shrink-0 text-sm font-medium text-[var(--accent)] hover:underline"
            >
              {t("leaderboardPage.filterAi")}
            </Link>
          </div>
          <ul className="grid gap-4 sm:grid-cols-3">
            {topAi.map((e, i) => (
              <li key={e.profile.id}>
                <Link
                  href={profileHref(e.profile.slug)}
                  className="focus-ring group flex h-full flex-col items-center rounded-xl border border-[var(--border)] bg-black px-5 py-6 text-center transition hover:border-[var(--accent)]"
                >
                  <span className="mb-4 inline-flex h-6 min-w-6 items-center justify-center rounded-full border border-[rgba(245,158,11,0.35)] bg-[var(--accent-soft)] px-2 text-[11px] font-bold text-[var(--accent)]">
                    {e.eligible ? `#${i + 1}` : "—"}
                  </span>
                  <Avatar name={e.profile.displayName} url={e.profile.avatarUrl} size="lg" />
                  <span className="mt-4 flex flex-wrap items-center justify-center gap-1.5">
                    <span className="text-base font-semibold tracking-tight text-[var(--text)] group-hover:text-[var(--accent)]">
                      {e.profile.displayName}
                    </span>
                    <TypeBadge type="ai" />
                  </span>
                  <span className="mt-3 text-2xl font-semibold tabular tracking-tight text-[var(--text)]">
                    {formatPercent(e.summary.accuracy)}
                  </span>
                  <span className="mt-1 text-xs uppercase tracking-wide text-[var(--text-dim)]">
                    {e.profile.modelType ?? t("common.model")} · {e.summary.settledCount}{" "}
                    {t("common.settled")}
                  </span>
                  <span className="mt-5 text-xs font-medium text-[var(--accent)]">
                    {t("common.viewProfile")}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {topHumans.length > 0 ? <section className="human-spotlight" aria-labelledby="top-humans-title">
        <div className="spotlight-heading"><div><h3 id="top-humans-title">{t("leaderboardPage.topHumans")}</h3><p>{t(topHumans.some(e => e.eligible) ? "leaderboardPage.topHumansSubtitle" : "leaderboardPage.buildingRecord")}</p></div><Link href="/leaderboard?type=human&range=all&metric=accuracy" className="company-text-link focus-ring">{t("leaderboardPage.viewHumans")} ↗</Link></div>
        <ul className="human-profile-grid">{topHumans.map((entry, index) => <li key={entry.profile.id}><Link className="human-profile-card focus-ring" href={profileHref(entry.profile.slug)}>
          <div className="human-profile-identity"><Avatar name={entry.profile.displayName} url={entry.profile.avatarUrl} size="lg" /><span className="spotlight-position">{entry.eligible ? String(index + 1).padStart(2, "0") : "—"}</span></div>
          <div className="human-profile-name"><h4>{entry.profile.displayName}</h4><TypeBadge type="human" /></div><p className="human-profile-handle">{entry.profile.handle}</p>
          <p className="human-profile-bio">{entry.profile.bio}</p><p className="human-profile-specialty">{entry.profile.specialties.slice(0, 2).join(" · ")}{entry.profile.isDemo ? <span className="profile-demo-label">{t("common.demoProfile")}</span> : null}</p>
          <div className="human-profile-record"><div><strong>{formatPercent(entry.summary.accuracy)}</strong><span>{t("common.accuracy")}</span></div><div><strong>{entry.summary.settledCount}</strong><span>{t("common.settled")}</span></div></div>
          <span className="human-profile-link">{t("common.viewProfile")}<span aria-hidden>↗</span></span>
        </Link></li>)}</ul>
      </section> : null}
    </section>
  );
}
