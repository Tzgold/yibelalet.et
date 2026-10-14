import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { AppShell } from "@/components/layout/AppShell";
import { ProfileClient } from "@/components/predictors/ProfileClient";
import { getRepository } from "@/data/get-repository";
import { requireUser } from "@/lib/auth";
import { getSubscribeAmountEtb, getSubscribeDays } from "@/lib/chapa";
import { getSocialStatus } from "@/lib/social-store";
import { getViewer } from "@/lib/viewer";
import type { ChartRangeKey } from "@/domain/types";

/** Profile pages depend on slug params and request filters. */
export const instant = false;

function asChart(value: string | undefined): ChartRangeKey {
  if (value === "week" || value === "month" || value === "year" || value === "all") {
    return value;
  }
  return "month";
}

export default async function PredictorProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await connection();
  const { slug } = await params;
  await requireUser(`/predictors/${slug}`);
  const sp = await searchParams;
  const page = Number(typeof sp.page === "string" ? sp.page : "1") || 1;
  const selectedDayParam =
    typeof sp.day === "string" && /^\d{4}-\d{2}-\d{2}$/.test(sp.day) ? sp.day : null;
  const month =
    typeof sp.month === "string" && /^\d{4}-\d{2}$/.test(sp.month)
      ? sp.month
      : selectedDayParam
        ? selectedDayParam.slice(0, 7)
        : new Date().toISOString().slice(0, 7);
  const chart = asChart(typeof sp.chart === "string" ? sp.chart : undefined);
  const from = typeof sp.from === "string" ? sp.from : null;
  const to = typeof sp.to === "string" ? sp.to : null;
  const competition =
    typeof sp.competition === "string" && sp.competition ? sp.competition : null;
  const market = typeof sp.market === "string" && sp.market ? sp.market : null;
  const result =
    typeof sp.result === "string" &&
    ["all", "win", "loss", "void", "pending"].includes(sp.result)
      ? (sp.result as "all" | "win" | "loss" | "void" | "pending")
      : "all";

  const repo = getRepository();
  const info = repo.getDataSourceInfo();

  let detail;
  try {
    detail = await repo.getProfileDetail(slug, "30d");
  } catch (e) {
    return (
      <AppShell dataLabel={info.label}>
        <div className="surface rounded-xl p-8 text-center">
          <h1 className="text-xl font-semibold">Could not load profile</h1>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            {e instanceof Error ? e.message : "Unknown error"}
          </p>
          <Link href="/leaderboard" className="mt-4 inline-block text-[var(--accent)]">
            Back to leaderboard
          </Link>
        </div>
      </AppShell>
    );
  }

  if (!detail) notFound();

  const viewer = await getViewer();
  const justSubscribed = sp.subscribed === "1" || sp.subscribed === "true";
  const subscribeError =
    typeof sp.subscribe_error === "string" ? sp.subscribe_error : null;

  const [
    history,
    monthTips,
    dayTips,
    calendarDays,
    chartData,
    breakdowns,
    competitions,
    socialStatus,
  ] = await Promise.all([
    repo.getHistory({
      slug,
      page,
      pageSize: 15,
      from,
      to,
      competitionId: competition,
      marketType: market,
      resultStatus: result,
    }),
    repo.getTipsForMonth(slug, month),
    selectedDayParam ? repo.getTipsForDay(slug, selectedDayParam) : Promise.resolve([]),
    repo.getCalendar(slug, month),
    repo.getChartSeries(slug, chart),
    repo.getBreakdowns(slug),
    repo.listCompetitions(),
    getSocialStatus(viewer?.id ?? null, detail.profile.id),
  ]);

  return (
    <AppShell dataLabel={info.label}>
      <div className="mb-4">
        <Link
          href="/leaderboard"
          className="focus-ring text-sm text-[var(--text-muted)] hover:text-[var(--accent)]"
        >
          ← Football Leaderboard
        </Link>
      </div>
      <ProfileClient
        profile={detail.profile}
        rank={detail.rank}
        rankingPeriod={detail.rankingPeriod}
        summary={detail.summary}
        openPredictions={detail.openPredictions}
        similar={detail.similar}
        historyItems={history.items}
        historyTotal={history.total}
        historyPage={history.page}
        historyPageSize={history.pageSize}
        monthHistoryItems={monthTips}
        selectedDayTips={dayTips}
        initialSelectedDay={selectedDayParam}
        calendarDays={calendarDays}
        calendarMonth={month}
        chartMode={chartData.mode}
        chartPoints={chartData.points}
        settledSeries={chartData.settledSeries}
        byCompetition={breakdowns.byCompetition}
        byMarket={breakdowns.byMarket}
        competitions={competitions}
        initialChartRange={chart}
        socialStatus={socialStatus}
        subscribePriceEtb={getSubscribeAmountEtb()}
        subscribeDays={getSubscribeDays()}
        justSubscribed={justSubscribed}
        subscribeError={subscribeError}
      />
    </AppShell>
  );
}
