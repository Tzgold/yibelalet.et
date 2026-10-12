"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Competition, LeaderboardEntry, RankingMetric, TimeRangeKey } from "@/domain/types";
import { formatPercent, formatUnits } from "@/lib/format";
import { Avatar } from "@/components/ui/Avatar";
import { TypeBadge } from "@/components/ui/TypeBadge";
import { profileAccessHref } from "@/lib/auth-paths";

const METRICS: { value: RankingMetric; label: string }[] = [
  { value: "default", label: "Default (sample-adjusted accuracy)" },
  { value: "accuracy", label: "Accuracy" },
  { value: "recent", label: "Recent form window" },
  { value: "profitability", label: "Profitability (betting records)" },
];

const RANGES: { value: TimeRangeKey; label: string }[] = [
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "90d", label: "90 days" },
  { value: "all", label: "All time" },
];

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
    <div className="space-y-6">
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-dim)]">
          Football analytics
        </p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Football Leaderboard
        </h1>
        <p className="max-w-3xl text-sm leading-relaxed text-[var(--text-muted)] sm:text-base">
          Rankings are computed from settled predictions over the selected period.
          Profiles need at least 10 win/loss settlements to be eligible. Profitability
          ranking only appears when unit stakes and odds were recorded — accuracy alone
          never implies profit.
        </p>
        <p className="text-sm text-[var(--text-dim)]">
          {profileCount} public profiles
        </p>
      </header>

      <form
        className="surface grid gap-3 rounded-xl p-4 sm:grid-cols-2 lg:grid-cols-5"
        method="get"
        action="/leaderboard"
      >
        <label className="block text-xs text-[var(--text-dim)] lg:col-span-2">
          Search
          <input
            name="q"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Name, handle, specialty…"
            className="focus-ring mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text)]"
          />
        </label>
        <label className="block text-xs text-[var(--text-dim)]">
          Creator type
          <select
            name="type"
            value={profileType}
            onChange={(e) => setProfileType(e.target.value as "all" | "human" | "ai")}
            className="focus-ring mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm"
          >
            <option value="all">All</option>
            <option value="human">Human</option>
            <option value="ai">AI</option>
          </select>
        </label>
        <label className="block text-xs text-[var(--text-dim)]">
          Time range
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
          Ranking metric
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
          Competition
          <select
            name="competition"
            value={competitionId}
            onChange={(e) => setCompetitionId(e.target.value)}
            className="focus-ring mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm"
          >
            <option value="">All competitions</option>
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
            Apply filters
          </button>
        </div>
      </form>

      {visible.length === 0 ? (
        <div className="surface rounded-xl p-10 text-center">
          <h2 className="text-lg font-medium">No profiles match</h2>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Try clearing search or widening the creator-type filter.
          </p>
        </div>
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-xl border border-[var(--border)] md:block">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-[var(--bg-soft)] text-xs uppercase tracking-wide text-[var(--text-dim)]">
                <tr>
                  <th className="px-4 py-3 font-medium">Rank</th>
                  <th className="px-4 py-3 font-medium">Profile</th>
                  <th className="px-4 py-3 font-medium">Record</th>
                  <th className="px-4 py-3 font-medium">Settled</th>
                  <th className="px-4 py-3 font-medium">Accuracy</th>
                  <th className="px-4 py-3 font-medium">ROI</th>
                  <th className="px-4 py-3 font-medium">Form</th>
                  <th className="px-4 py-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {visible.map((entry) => (
                  <tr
                    key={entry.profile.id}
                    className="border-t border-[var(--border)] bg-[var(--bg-elevated)] hover:bg-[var(--bg-soft)]"
                  >
                    <td className="px-4 py-3 font-mono text-[var(--text-muted)]">
                      #{entry.rank}
                      {!entry.eligible ? (
                        <span className="ml-2 text-[10px] uppercase text-[var(--text-dim)]">
                          n/a
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
                        <span className="text-[var(--text-dim)]" title="No betting records">
                          —
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <FormPills form={entry.recentForm} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={profileHref(entry.profile.slug)}
                        className="focus-ring text-xs font-medium text-[var(--accent)] hover:underline"
                      >
                        View profile →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="space-y-3 md:hidden">
            {visible.map((entry) => (
              <li key={entry.profile.id}>
                <Link
                  href={profileHref(entry.profile.slug)}
                  className="surface focus-ring block rounded-xl p-4"
                >
                  <div className="flex items-start gap-3">
                    <span className="font-mono text-sm text-[var(--text-dim)]">
                      #{entry.rank}
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
                      <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <p className="text-[var(--text-dim)]">Record</p>
                          <p className="tabular-nums">
                            {entry.summary.wins}-{entry.summary.losses}
                          </p>
                        </div>
                        <div>
                          <p className="text-[var(--text-dim)]">Accuracy</p>
                          <p className="tabular-nums">
                            {formatPercent(entry.summary.accuracy)}
                          </p>
                        </div>
                        <div>
                          <p className="text-[var(--text-dim)]">ROI</p>
                          <p className="tabular-nums">
                            {entry.summary.roi != null
                              ? formatPercent(entry.summary.roi)
                              : "—"}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2">
                        <FormPills form={entry.recentForm} />
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
        Net profit reference (when available):{" "}
        {visible
          .filter((e) => e.summary.netProfitUnits != null)
          .slice(0, 1)
          .map((e) => formatUnits(e.summary.netProfitUnits))
          .join("") || "shown only for profiles with betting records"}
        .
      </p>
    </div>
  );
}

function FormPills({ form }: { form: Array<"W" | "L" | "V" | "P"> }) {
  if (form.length === 0) {
    return <span className="text-xs text-[var(--text-dim)]">No recent results</span>;
  }
  return (
    <span className="inline-flex gap-1" aria-label={`Recent form ${form.join(" ")}`}>
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
