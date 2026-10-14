"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type {
  BreakdownRow,
  CalendarDaySummary,
  ChartPoint,
  ChartRangeKey,
  Competition,
  PerformanceSummary,
  PredictionView,
  PredictorProfile,
  TimeRangeKey,
} from "@/domain/types";
import {
  formatKickoffLocal,
  formatPercent,
  formatUnits,
  marketLabel,
  selectionLabel,
} from "@/lib/format";
import { Avatar } from "@/components/ui/Avatar";
import { InfoTip } from "@/components/ui/InfoTip";
import { TypeBadge } from "@/components/ui/TypeBadge";
import { FollowSubscribeBar } from "@/components/predictors/FollowSubscribeBar";
import { useT } from "@/i18n/I18nProvider";

export function ProfileClient({
  profile,
  rank,
  rankingPeriod,
  summary,
  openPredictions,
  similar,
  historyItems,
  historyTotal,
  historyPage,
  historyPageSize,
  monthHistoryItems,
  selectedDayTips = [],
  initialSelectedDay = null,
  calendarDays,
  calendarMonth,
  chartMode,
  chartPoints,
  settledSeries,
  byCompetition,
  byMarket,
  competitions,
  initialChartRange = "month",
  socialStatus,
  subscribePriceEtb,
  subscribeDays = 30,
  justSubscribed = false,
  subscribeError = null,
}: {
  profile: PredictorProfile;
  rank: number;
  rankingPeriod: TimeRangeKey;
  summary: PerformanceSummary;
  openPredictions: PredictionView[];
  similar: PredictorProfile[];
  historyItems: PredictionView[];
  historyTotal: number;
  historyPage: number;
  historyPageSize: number;
  monthHistoryItems: PredictionView[];
  selectedDayTips?: PredictionView[];
  initialSelectedDay?: string | null;
  calendarDays: CalendarDaySummary[];
  calendarMonth: string;
  chartMode: "profit" | "accuracy";
  chartPoints: ChartPoint[];
  settledSeries: ChartPoint[];
  byCompetition: BreakdownRow[];
  byMarket: BreakdownRow[];
  competitions: Competition[];
  initialChartRange?: ChartRangeKey;
  socialStatus: {
    followerCount: number;
    following: boolean;
    subscribed: boolean;
  };
  subscribePriceEtb: number;
  subscribeDays?: number;
  justSubscribed?: boolean;
  subscribeError?: string | null;
}) {
  const t = useT();
  const router = useRouter();
  const weekdayLabels = [
    t("profile.mon"),
    t("profile.tue"),
    t("profile.wed"),
    t("profile.thu"),
    t("profile.fri"),
    t("profile.sat"),
    t("profile.sun"),
  ] as const;
  const dayPanelRef = useRef<HTMLDivElement | null>(null);
  const [historyView, setHistoryView] = useState<"tips" | "calendar" | "table">(
    initialSelectedDay ? "calendar" : "tips",
  );
  /** Optimistic day while the URL updates; URL wins once it arrives. */
  const [pendingDay, setPendingDay] = useState<string | null>(null);
  const selectedDay = initialSelectedDay ?? pendingDay;
  const [chartRange, setChartRange] = useState<ChartRangeKey>(initialChartRange);
  const [shareMsg, setShareMsg] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const bettingUnlocked = socialStatus.subscribed;

  const dayMap = useMemo(() => {
    const map = new Map<string, CalendarDaySummary>();
    for (const d of calendarDays) map.set(d.date, d);
    return map;
  }, [calendarDays]);

  const tipsByDay = useMemo(() => {
    const map = new Map<string, PredictionView[]>();
    for (const tip of monthHistoryItems) {
      const key = tip.publishedAt.slice(0, 10);
      const list = map.get(key) ?? [];
      list.push(tip);
      map.set(key, list);
    }
    return map;
  }, [monthHistoryItems]);

  const selectedDayRows = useMemo(() => {
    if (!selectedDay) return [];
    if (selectedDayTips.length > 0 && initialSelectedDay === selectedDay) {
      return selectedDayTips;
    }
    return tipsByDay.get(selectedDay) ?? [];
  }, [selectedDay, selectedDayTips, initialSelectedDay, tipsByDay]);

  useEffect(() => {
    if (selectedDay && dayPanelRef.current) {
      dayPanelRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [selectedDay]);

  function selectCalendarDay(day: string) {
    setHistoryView("calendar");
    setPendingDay(day);
    const params = new URLSearchParams(window.location.search);
    params.set("month", day.slice(0, 7));
    params.set("day", day);
    startTransition(() => {
      router.push(`/predictors/${profile.slug}?${params.toString()}`, { scroll: false });
    });
  }

  async function onShare() {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setShareMsg(t("profile.linkCopied"));
    } catch {
      setShareMsg(t("profile.copyFailed"));
    }
  }

  function shiftMonth(delta: number) {
    const [y, m] = calendarMonth.split("-").map(Number);
    const date = new Date(Date.UTC(y, m - 1 + delta, 1));
    const next = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
    const params = new URLSearchParams(window.location.search);
    params.set("month", next);
    params.delete("day");
    setPendingDay(null);
    startTransition(() => {
      router.push(`/predictors/${profile.slug}?${params.toString()}`, { scroll: false });
    });
  }

  function setChart(range: ChartRangeKey) {
    setChartRange(range);
    const params = new URLSearchParams(window.location.search);
    params.set("chart", range);
    startTransition(() => {
      router.push(`/predictors/${profile.slug}?${params.toString()}`);
    });
  }

  function goHistoryPage(page: number) {
    const params = new URLSearchParams(window.location.search);
    params.set("page", String(page));
    startTransition(() => {
      router.push(`/predictors/${profile.slug}?${params.toString()}`);
    });
  }

  const calendarCells = buildMonthCells(calendarMonth);

  return (
    <div className="space-y-8">
      <section className="surface rounded-xl p-5 sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <Avatar name={profile.displayName} url={profile.avatarUrl} size="lg" />
          <div className="min-w-0 flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                {profile.displayName}
              </h1>
              <TypeBadge type={profile.profileType} />
              <span className="rounded-md border border-[var(--border)] px-2 py-0.5 text-xs text-[var(--text-muted)]">
                {t("profile.rankHash", { rank: rank || "—" })} · {rankingPeriod}
              </span>
            </div>
            <p className="text-sm text-[var(--text-dim)]">{profile.handle}</p>
            <p className="max-w-3xl text-sm leading-relaxed text-[var(--text-muted)]">
              {profile.bio}
            </p>
            <div className="flex flex-wrap gap-2 text-xs text-[var(--text-dim)]">
              <span>{t("profile.joined", { date: profile.joinDate })}</span>
              {profile.profileType === "ai" && profile.modelType ? (
                <span>
                  {t("profile.modelLabel")} {profile.modelType}
                  {profile.modelVersion ? ` · v${profile.modelVersion}` : ""}
                </span>
              ) : null}
              {profile.specialties.map((s) => (
                <span
                  key={s}
                  className="rounded-md border border-[var(--border)] px-2 py-0.5"
                >
                  {s}
                </span>
              ))}
            </div>
            <FollowSubscribeBar
              slug={profile.slug}
              displayName={profile.displayName}
              initialStatus={socialStatus}
              subscribePriceEtb={subscribePriceEtb}
              subscribeDays={subscribeDays}
            />

            {justSubscribed ? (
              <p className="text-xs text-[var(--positive)]" role="status">
                {t("profile.paymentVerified")}
              </p>
            ) : null}
            {subscribeError ? (
              <p className="text-xs text-[var(--negative)]" role="alert">
                {t("profile.paymentIssue")} {subscribeError}
              </p>
            ) : null}

            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                onClick={onShare}
                className="focus-ring rounded-md border border-[var(--border)] px-3 py-1.5 text-sm hover:border-[var(--accent)]"
              >
                {t("profile.share")}
              </button>
              {shareMsg ? (
                <span className="self-center text-xs text-[var(--positive)]" role="status">
                  {shareMsg}
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Metric
          label={t("profile.netProfit")}
          tip={t("profile.netProfitTip")}
          value={
            !bettingUnlocked ? (
              <span className="text-[var(--text-dim)]">{t("profile.subscribeUnlock")}</span>
            ) : summary.netProfitUnits != null ? (
              <span className={summary.netProfitUnits >= 0 ? "pos" : "neg"}>
                {formatUnits(summary.netProfitUnits)}
              </span>
            ) : (
              <span className="text-[var(--text-dim)]">{t("profile.noBetting")}</span>
            )
          }
        />
        <Metric
          label={t("common.roi")}
          tip={t("profile.roiTip")}
          value={
            !bettingUnlocked ? (
              <span className="text-[var(--text-dim)]">{t("common.locked")}</span>
            ) : summary.roi != null ? (
              <span className={summary.roi >= 0 ? "pos" : "neg"}>
                {formatPercent(summary.roi)}
              </span>
            ) : (
              <span className="text-[var(--text-dim)]">—</span>
            )
          }
        />
        <Metric
          label={t("profile.winLossVoid")}
          tip={t("profile.winLossVoidTip")}
          value={`${summary.wins}-${summary.losses}-${summary.voids}`}
        />
        <Metric
          label={t("profile.settledPredictions")}
          tip={t("profile.settledTip")}
          value={String(summary.settledCount)}
        />
        <Metric
          label={t("common.accuracy")}
          tip={t("profile.accuracyTip")}
          value={formatPercent(summary.accuracy)}
        />
        <Metric
          label={t("profile.avgProbBrier")}
          tip={t("profile.avgProbTip")}
          value={
            <>
              {formatPercent(summary.averageProbability)}
              <span className="mx-1 text-[var(--text-dim)]">/</span>
              {summary.brierScore != null ? summary.brierScore.toFixed(3) : "—"}
            </>
          }
        />
      </section>

      {summary.insufficientSample ? (
        <p className="rounded-lg border border-[var(--border)] bg-[var(--bg-soft)] px-4 py-3 text-sm text-[var(--text-muted)]">
          {t("profile.insufficientSample", { min: summary.sampleMinimum })}
        </p>
      ) : null}

      <section className="surface rounded-xl p-5">
        <h2 className="text-lg font-semibold">{t("profile.aboutMethod")}</h2>
        <p className="mt-3 text-sm leading-relaxed text-[var(--text-muted)]">
          {profile.methodology || t("profile.noMethod")}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {profile.competitions.map((id) => {
            const comp = competitions.find((c) => c.id === id);
            return (
              <span
                key={id}
                className="rounded-md border border-[var(--border)] px-2 py-1 text-xs text-[var(--text-muted)]"
              >
                {comp?.name ?? id}
              </span>
            );
          })}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-end justify-between gap-3">
          <h2 className="text-lg font-semibold">{t("profile.openPredictions")}</h2>
          <p className="text-xs text-[var(--text-dim)]">{t("profile.lockedAtKickoff")}</p>
        </div>
        {openPredictions.length === 0 ? (
          <div className="surface rounded-xl p-6 text-sm text-[var(--text-muted)]">
            {t("profile.noOpen")}
          </div>
        ) : (
          <ul className="grid gap-3 lg:grid-cols-2">
            {openPredictions.map((p) => (
              <li key={p.id} className="surface rounded-xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-[var(--text-dim)]">
                      {p.competition.shortName}
                    </p>
                    <p className="mt-1 font-medium">
                      {p.homeTeam.name} vs {p.awayTeam.name}
                    </p>
                    <p className="mt-1 text-xs text-[var(--text-muted)]">
                      {t("profile.kickoff")} {formatKickoffLocal(p.match.kickoffAt)}
                    </p>
                  </div>
                  <StatusPill status={p.status} />
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <dt className="text-xs text-[var(--text-dim)]">{t("profile.market")}</dt>
                    <dd>{marketLabel(p.marketType)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-[var(--text-dim)]">{t("profile.selection")}</dt>
                    <dd>
                      {selectionLabel(p.selection, p.homeTeam.name, p.awayTeam.name)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-[var(--text-dim)]">{t("profile.probability")}</dt>
                    <dd>{formatPercent(p.probability)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-[var(--text-dim)]">{t("profile.oddsStake")}</dt>
                    <dd>
                      {bettingUnlocked
                        ? p.betting?.oddsAtPublication != null
                          ? `${p.betting.oddsAtPublication.toFixed(2)} · ${p.betting.stakeUnits}u`
                          : "—"
                        : t("common.locked")}
                    </dd>
                  </div>
                </dl>
                {p.note ? (
                  <p className="mt-3 text-sm leading-relaxed text-[var(--text-muted)]">
                    {p.note}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">{t("profile.historical")}</h2>
          <div className="inline-flex rounded-md border border-[var(--border)] p-0.5">
            <button
              type="button"
              className={`focus-ring rounded px-3 py-1.5 text-xs ${historyView === "tips" ? "bg-[var(--bg-soft)] text-[var(--text)]" : "text-[var(--text-dim)]"}`}
              onClick={() => setHistoryView("tips")}
            >
              {t("profile.tips")}
            </button>
            <button
              type="button"
              className={`focus-ring rounded px-3 py-1.5 text-xs ${historyView === "calendar" ? "bg-[var(--bg-soft)] text-[var(--text)]" : "text-[var(--text-dim)]"}`}
              onClick={() => setHistoryView("calendar")}
            >
              {t("profile.calendar")}
            </button>
            <button
              type="button"
              className={`focus-ring rounded px-3 py-1.5 text-xs ${historyView === "table" ? "bg-[var(--bg-soft)] text-[var(--text)]" : "text-[var(--text-dim)]"}`}
              onClick={() => setHistoryView("table")}
            >
              {t("profile.table")}
            </button>
          </div>
        </div>

        <form
          method="get"
          className="surface grid gap-3 rounded-xl p-4 sm:grid-cols-2 lg:grid-cols-5"
        >
          <input type="hidden" name="month" value={calendarMonth} />
          <input type="hidden" name="chart" value={chartRange} />
          <label className="text-xs text-[var(--text-dim)]">
            {t("profile.from")}
            <input
              type="date"
              name="from"
              className="focus-ring mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm"
            />
          </label>
          <label className="text-xs text-[var(--text-dim)]">
            {t("profile.to")}
            <input
              type="date"
              name="to"
              className="focus-ring mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm"
            />
          </label>
          <label className="text-xs text-[var(--text-dim)]">
            {t("profile.competition")}
            <select
              name="competition"
              className="focus-ring mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm"
              defaultValue=""
            >
              <option value="">{t("common.all")}</option>
              {competitions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs text-[var(--text-dim)]">
            {t("profile.market")}
            <select
              name="market"
              className="focus-ring mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm"
              defaultValue=""
            >
              <option value="">{t("common.all")}</option>
              <option value="match_result">Match result</option>
              <option value="over_under_2_5">Over/Under 2.5</option>
              <option value="both_teams_to_score">BTTS</option>
              <option value="double_chance">Double chance</option>
            </select>
          </label>
          <label className="text-xs text-[var(--text-dim)]">
            {t("profile.result")}
            <select
              name="result"
              className="focus-ring mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm"
              defaultValue="all"
            >
              <option value="all">{t("common.all")}</option>
              <option value="win">{t("common.win")}</option>
              <option value="loss">{t("common.loss")}</option>
              <option value="void">{t("common.void")}</option>
              <option value="pending">{t("common.pending")}</option>
            </select>
          </label>
          <div className="sm:col-span-2 lg:col-span-5">
            <button
              type="submit"
              className="focus-ring rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[#1a1208]"
            >
              {t("profile.filterHistory")}
            </button>
          </div>
        </form>

        {historyView === "tips" ? (
          <div className="space-y-3">
            {historyItems.length === 0 ? (
              <div className="surface rounded-xl p-6 text-sm text-[var(--text-muted)]">
                {t("profile.noSettledFilters")}
              </div>
            ) : (
              historyItems.map((row) => (
                <article key={row.id} className="surface rounded-xl p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs uppercase tracking-wide text-[var(--text-dim)]">
                        {row.competition.shortName} · {formatKickoffLocal(row.match.kickoffAt)}
                      </p>
                      <h3 className="mt-1 text-base font-semibold">
                        {row.homeTeam.name} vs {row.awayTeam.name}
                      </h3>
                      <p className="mt-1 text-sm text-[var(--accent)]">
                        {selectionLabel(row.selection, row.homeTeam.name, row.awayTeam.name)}
                        <span className="mx-2 text-[var(--text-dim)]">·</span>
                        <span className="text-[var(--text-muted)]">
                          {marketLabel(row.marketType)}
                        </span>
                      </p>
                    </div>
                    <OutcomeBadge
                      outcome={row.settlementOutcome}
                      status={row.status}
                      score={
                        row.match.homeScore != null
                          ? `${row.match.homeScore}-${row.match.awayScore}`
                          : null
                      }
                    />
                  </div>
                  {row.note ? (
                    <p className="mt-3 text-sm leading-relaxed text-[var(--text-muted)]">
                      {row.note}
                    </p>
                  ) : null}
                  <div className="mt-3 flex flex-wrap gap-4 text-xs text-[var(--text-dim)]">
                    <span>Prob {formatPercent(row.probability)}</span>
                    <BettingBits row={row} unlocked={bettingUnlocked} />
                  </div>
                </article>
              ))
            )}
            <div className="flex items-center justify-between pt-1 text-sm">
              <span className="text-[var(--text-dim)]">
                {t("profile.tipsPage", { count: historyTotal, page: historyPage })}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={historyPage <= 1 || pending}
                  onClick={() => goHistoryPage(historyPage - 1)}
                  className="focus-ring rounded-md border border-[var(--border)] px-3 py-1 disabled:opacity-40"
                >
                  {t("common.previous")}
                </button>
                <button
                  type="button"
                  disabled={historyPage * historyPageSize >= historyTotal || pending}
                  onClick={() => goHistoryPage(historyPage + 1)}
                  className="focus-ring rounded-md border border-[var(--border)] px-3 py-1 disabled:opacity-40"
                >
                  {t("common.next")}
                </button>
              </div>
            </div>
          </div>
        ) : historyView === "calendar" ? (
          <div className="space-y-4">
            <div className="surface rounded-xl p-4">
              <div className="mb-2 flex items-center justify-between">
                <button
                  type="button"
                  className="focus-ring rounded-md border border-[var(--border)] px-3 py-1 text-sm"
                  onClick={() => shiftMonth(-1)}
                  disabled={pending}
                >
                  {t("common.previous")}
                </button>
                <p className="text-sm font-medium">{calendarMonth}</p>
                <button
                  type="button"
                  className="focus-ring rounded-md border border-[var(--border)] px-3 py-1 text-sm"
                  onClick={() => shiftMonth(1)}
                  disabled={pending}
                >
                  {t("common.next")}
                </button>
              </div>
              <p className="mb-3 text-xs text-[var(--text-dim)]">{t("profile.calendarHint")}</p>
              <div className="grid grid-cols-7 gap-1 text-center text-[10px] uppercase text-[var(--text-dim)]">
                {weekdayLabels.map((d) => (
                  <div key={d} className="py-1">
                    {d}
                  </div>
                ))}
              </div>
              <div className="mt-1 grid grid-cols-7 gap-1">
                {calendarCells.map((cell, idx) => {
                  if (!cell) return <div key={`empty-${idx}`} />;
                  const summaryDay = dayMap.get(cell);
                  const tipCount = tipsByDay.get(cell)?.length ?? 0;
                  const isSelected = selectedDay === cell;
                  const tone = !summaryDay
                    ? "empty"
                    : summaryDay.pending > 0 && summaryDay.settledCount === 0
                      ? "pending"
                      : (summaryDay.wins || 0) > (summaryDay.losses || 0)
                        ? "pos"
                        : (summaryDay.losses || 0) > (summaryDay.wins || 0)
                          ? "neg"
                          : "mixed";
                  return (
                    <button
                      key={cell}
                      type="button"
                      onClick={() => selectCalendarDay(cell)}
                      aria-pressed={isSelected}
                      aria-label={`Tips posted on ${cell}${tipCount ? `, ${tipCount} tips` : ""}`}
                      className="focus-ring min-h-14 rounded-md border p-1 text-left text-xs transition-colors"
                      style={{
                        borderColor: isSelected ? "var(--accent)" : "var(--border)",
                        boxShadow: isSelected ? "0 0 0 1px var(--accent)" : undefined,
                        background:
                          tone === "pos"
                            ? "var(--positive-soft)"
                            : tone === "neg"
                              ? "var(--negative-soft)"
                              : tone === "pending"
                                ? "rgba(224,138,44,0.1)"
                                : isSelected
                                  ? "var(--accent-soft)"
                                  : "transparent",
                      }}
                    >
                      <span className="text-[var(--text-dim)]">{Number(cell.slice(8))}</span>
                      {summaryDay ? (
                        <span className="mt-1 block tabular-nums">
                          {summaryDay.wins}W {summaryDay.losses}L
                        </span>
                      ) : tipCount > 0 ? (
                        <span className="mt-1 block text-[var(--text-muted)]">
                          {t(tipCount === 1 ? "profile.tipSingular" : "profile.tipPlural", {
                            count: tipCount,
                          })}
                        </span>
                      ) : (
                        <span className="mt-1 block text-[10px] text-[var(--text-dim)]">—</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div ref={dayPanelRef} className="surface rounded-xl p-4">
              {!selectedDay ? (
                <p className="text-sm text-[var(--text-muted)]">{t("profile.selectDay")}</p>
              ) : (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-base font-semibold">
                      {t("profile.tipsPostedOn", { date: selectedDay })}
                    </h3>
                    <span className="text-xs text-[var(--text-dim)]">
                      {t(
                        selectedDayRows.length === 1
                          ? "profile.tipSingular"
                          : "profile.tipPlural",
                        { count: selectedDayRows.length },
                      )}
                    </span>
                  </div>
                  {selectedDayRows.length === 0 ? (
                    <p className="mt-3 text-sm text-[var(--text-muted)]">
                      {t("profile.noTipsDay")}
                    </p>
                  ) : (
                    <ul className="mt-4 space-y-3">
                      {selectedDayRows.map((row) => (
                        <li key={row.id} className="rounded-lg border border-[var(--border)] bg-[var(--bg)] p-4">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <p className="text-xs uppercase tracking-wide text-[var(--text-dim)]">
                                {row.competition.shortName} ·{" "}
                                {formatKickoffLocal(row.match.kickoffAt)}
                              </p>
                              <p className="mt-1 font-semibold">
                                {row.homeTeam.name} vs {row.awayTeam.name}
                              </p>
                              <p className="mt-1 text-sm text-[var(--accent)]">
                                {selectionLabel(
                                  row.selection,
                                  row.homeTeam.name,
                                  row.awayTeam.name,
                                )}
                                <span className="mx-2 text-[var(--text-dim)]">·</span>
                                <span className="text-[var(--text-muted)]">
                                  {marketLabel(row.marketType)}
                                </span>
                              </p>
                            </div>
                            <OutcomeBadge
                              outcome={row.settlementOutcome}
                              status={row.status}
                              score={
                                row.match.homeScore != null
                                  ? `${row.match.homeScore}-${row.match.awayScore}`
                                  : null
                              }
                            />
                          </div>
                          {row.note ? (
                            <p className="mt-3 text-sm leading-relaxed text-[var(--text-muted)]">
                              {row.note}
                            </p>
                          ) : null}
                          <div className="mt-3 flex flex-wrap gap-4 text-xs text-[var(--text-dim)]">
                            <span>
                              {t("profile.posted", {
                                time: formatKickoffLocal(row.publishedAt),
                              })}
                            </span>
                            <span>Prob {formatPercent(row.probability)}</span>
                            <BettingBits row={row} unlocked={bettingUnlocked} />
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-[var(--bg-soft)] text-xs uppercase text-[var(--text-dim)]">
                <tr>
                  <th className="px-3 py-2">{t("profile.kickoff")}</th>
                  <th className="px-3 py-2">{t("profile.competition")}</th>
                  <th className="px-3 py-2">{t("profile.match")}</th>
                  <th className="px-3 py-2">{t("profile.market")}</th>
                  <th className="px-3 py-2">{t("profile.selection")}</th>
                  <th className="px-3 py-2">{t("profile.probability")}</th>
                  <th className="px-3 py-2">{t("profile.odds")}</th>
                  <th className="px-3 py-2">{t("profile.score")}</th>
                  <th className="px-3 py-2">{t("profile.outcome")}</th>
                  <th className="px-3 py-2">{t("profile.pl")}</th>
                </tr>
              </thead>
              <tbody>
                {historyItems.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-3 py-8 text-center text-[var(--text-muted)]">
                      {t("profile.noHistoryFilters")}
                    </td>
                  </tr>
                ) : (
                  historyItems.map((row) => (
                    <tr key={row.id} className="border-t border-[var(--border)]">
                      <td className="px-3 py-2 whitespace-nowrap text-xs">
                        {formatKickoffLocal(row.match.kickoffAt)}
                      </td>
                      <td className="px-3 py-2">{row.competition.shortName}</td>
                      <td className="px-3 py-2">
                        {row.homeTeam.shortName} {t("common.vs")} {row.awayTeam.shortName}
                      </td>
                      <td className="px-3 py-2">{marketLabel(row.marketType)}</td>
                      <td className="px-3 py-2">
                        {selectionLabel(row.selection, row.homeTeam.name, row.awayTeam.name)}
                      </td>
                      <td className="px-3 py-2">{formatPercent(row.probability)}</td>
                      <td className="px-3 py-2">
                        {bettingUnlocked
                          ? (row.betting?.oddsAtPublication?.toFixed(2) ?? "—")
                          : "•••"}
                      </td>
                      <td className="px-3 py-2 tabular-nums">
                        {row.match.homeScore != null
                          ? `${row.match.homeScore}-${row.match.awayScore}`
                          : "—"}
                      </td>
                      <td className="px-3 py-2">
                        <OutcomeText outcome={row.settlementOutcome} status={row.status} />
                      </td>
                      <td className="px-3 py-2">
                        {!bettingUnlocked ? (
                          "•••"
                        ) : row.betting?.netReturnUnits != null ? (
                          <span
                            className={
                              row.betting.netReturnUnits >= 0 ? "pos" : "neg"
                            }
                          >
                            {formatUnits(row.betting.netReturnUnits)}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <div className="flex items-center justify-between border-t border-[var(--border)] px-3 py-3 text-sm">
              <span className="text-[var(--text-dim)]">
                {t("profile.recordsPage", { count: historyTotal, page: historyPage })}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={historyPage <= 1 || pending}
                  onClick={() => goHistoryPage(historyPage - 1)}
                  className="focus-ring rounded-md border border-[var(--border)] px-3 py-1 disabled:opacity-40"
                >
                  {t("common.previous")}
                </button>
                <button
                  type="button"
                  disabled={historyPage * historyPageSize >= historyTotal || pending}
                  onClick={() => goHistoryPage(historyPage + 1)}
                  className="focus-ring rounded-md border border-[var(--border)] px-3 py-1 disabled:opacity-40"
                >
                  {t("common.next")}
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      <section className="surface rounded-xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">
              {chartMode === "profit" ? t("profile.profitTrend") : t("profile.accuracyTrend")}
            </h2>
            <p className="mt-1 text-xs text-[var(--text-dim)]">
              {chartMode === "profit"
                ? t("profile.profitTrendDesc")
                : t("profile.accuracyTrendDesc")}
            </p>
          </div>
          <div className="flex flex-wrap gap-1">
            {(
              [
                ["week", t("profile.week")],
                ["month", t("profile.month")],
                ["year", t("profile.year")],
                ["all", t("profile.allTime")],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setChart(value)}
                className={`focus-ring rounded-md px-3 py-1.5 text-xs ${
                  chartRange === value
                    ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                    : "border border-[var(--border)] text-[var(--text-muted)]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-4 h-64 w-full">
          {chartPoints.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-[var(--text-muted)]">
              {t("profile.notEnoughData")}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartPoints}>
                <CartesianGrid stroke="rgba(42,51,64,0.8)" strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fill: "#6d7a89", fontSize: 11 }} />
                <YAxis tick={{ fill: "#6d7a89", fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    background: "#12161c",
                    border: "1px solid #2a3340",
                    borderRadius: 8,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={chartMode === "profit" ? "#e08a2c" : "#3ecf8e"}
                  fill={
                    chartMode === "profit"
                      ? "rgba(224,138,44,0.15)"
                      : "rgba(62,207,142,0.12)"
                  }
                  name={chartPoints[0]?.label}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
        {settledSeries.length > 0 ? (
          <p className="mt-3 text-xs text-[var(--text-dim)]">
            {t("profile.settledInRange", {
              count: settledSeries[settledSeries.length - 1]?.value ?? 0,
            })}
          </p>
        ) : null}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <BreakdownPanel title={t("profile.byCompetition")} rows={byCompetition} />
        <BreakdownPanel title={t("profile.byMarket")} rows={byMarket} />
      </section>

      {similar.length > 0 ? (
        <section>
          <h2 className="text-lg font-semibold">{t("profile.related")}</h2>
          <p className="mt-1 text-xs text-[var(--text-dim)]">{t("profile.relatedHint")}</p>
          <ul className="mt-3 grid gap-3 sm:grid-cols-3">
            {similar.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/predictors/${s.slug}`}
                  className="surface focus-ring flex items-center gap-3 rounded-xl p-3"
                >
                  <Avatar name={s.displayName} url={s.avatarUrl} size="sm" />
                  <span>
                    <span className="block text-sm font-medium">{s.displayName}</span>
                    <TypeBadge type={s.profileType} />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function Metric({
  label,
  tip,
  value,
}: {
  label: string;
  tip: string;
  value: React.ReactNode;
}) {
  return (
    <div className="surface rounded-xl p-4">
      <p className="text-xs uppercase tracking-wide text-[var(--text-dim)]">
        {label}
        <InfoTip text={tip} />
      </p>
      <div className="mt-2 text-xl font-semibold tabular-nums">{value}</div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  return (
    <span className="rounded-md border border-[var(--border)] px-2 py-0.5 text-[11px] uppercase tracking-wide text-[var(--text-muted)]">
      {status.replaceAll("_", " ")}
    </span>
  );
}

function OutcomeText({
  outcome,
  status,
}: {
  outcome: string | null;
  status: string;
}) {
  const t = useT();
  if (!outcome) return <span className="text-[var(--text-dim)]">{status}</span>;
  if (outcome === "win") return <span className="pos">{t("common.win")}</span>;
  if (outcome === "loss") return <span className="neg">{t("common.loss")}</span>;
  if (outcome === "void") return <span className="text-[var(--text-muted)]">{t("common.void")}</span>;
  return <span className="text-[var(--text-muted)]">{outcome}</span>;
}

function OutcomeBadge({
  outcome,
  status,
  score,
}: {
  outcome: string | null;
  status: string;
  score: string | null;
}) {
  const t = useT();
  const label =
    outcome === "win"
      ? t("common.win").toUpperCase()
      : outcome === "loss"
        ? t("common.loss").toUpperCase()
        : outcome === "void"
          ? t("common.void").toUpperCase()
          : status.replaceAll("_", " ").toUpperCase();
  const color =
    outcome === "win"
      ? "var(--positive)"
      : outcome === "loss"
        ? "var(--negative)"
        : "var(--text-muted)";
  const bg =
    outcome === "win"
      ? "var(--positive-soft)"
      : outcome === "loss"
        ? "var(--negative-soft)"
        : "rgba(109,122,137,0.15)";
  return (
    <div className="text-right">
      <span
        className="inline-flex rounded-md px-2.5 py-1 text-xs font-bold tracking-wide"
        style={{ color, background: bg }}
      >
        {label}
      </span>
      {score ? (
        <p className="mt-1 font-mono text-xs text-[var(--text-dim)]">FT {score}</p>
      ) : null}
    </div>
  );
}

function BreakdownPanel({ title, rows }: { title: string; rows: BreakdownRow[] }) {
  const t = useT();
  return (
    <div className="surface rounded-xl p-4">
      <h3 className="font-semibold">{title}</h3>
      {rows.length === 0 ? (
        <p className="mt-3 text-sm text-[var(--text-muted)]">{t("profile.noBreakdown")}</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {rows.map((row) => (
            <li
              key={row.key}
              className="flex items-center justify-between gap-3 border-b border-[var(--border)] pb-2 text-sm last:border-0"
            >
              <span>
                {row.label}
                <span className="ml-2 text-xs text-[var(--text-dim)]">
                  n={row.settledCount}
                  {row.settledCount < 5 ? t("profile.smallSample") : ""}
                </span>
              </span>
              <span className="tabular-nums text-[var(--text-muted)]">
                {formatPercent(row.accuracy)}
                {row.netProfitUnits != null ? ` · ${formatUnits(row.netProfitUnits)}` : ""}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function BettingBits({
  row,
  unlocked,
}: {
  row: PredictionView;
  unlocked: boolean;
}) {
  const t = useT();
  if (!unlocked) {
    return <span className="text-[var(--accent)]">{t("profile.bettingLocked")}</span>;
  }
  return (
    <>
      {row.betting?.oddsAtPublication != null ? (
        <span>
          {t("profile.oddsLabel", { odds: row.betting.oddsAtPublication.toFixed(2) })}
        </span>
      ) : null}
      {row.betting?.netReturnUnits != null ? (
        <span className={row.betting.netReturnUnits >= 0 ? "pos" : "neg"}>
          {formatUnits(row.betting.netReturnUnits)}
        </span>
      ) : (
        <span>{t("profile.predictionOnly")}</span>
      )}
    </>
  );
}

function buildMonthCells(month: string): Array<string | null> {
  const [y, m] = month.split("-").map(Number);
  const first = new Date(Date.UTC(y, m - 1, 1));
  const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();
  // Monday-first
  const weekday = (first.getUTCDay() + 6) % 7;
  const cells: Array<string | null> = Array.from({ length: weekday }, () => null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(`${month}-${String(d).padStart(2, "0")}`);
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}
