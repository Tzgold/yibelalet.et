import type {
  BreakdownRow,
  CalendarDaySummary,
  ChartPoint,
  ChartRangeKey,
  Competition,
  DataSourceInfo,
  FootballMatch,
  LeaderboardEntry,
  PerformanceSummary,
  PredictionView,
  PredictorProfile,
  RankingMetric,
  Team,
  TimeRangeKey,
} from "@/domain/types";

export interface UpcomingMatchCard {
  match: FootballMatch;
  competition: Competition;
  homeTeam: Team;
  awayTeam: Team;
  isDemo: boolean;
}

export interface RecentSettledTip {
  view: PredictionView;
  profile: PredictorProfile;
}

export interface LeaderboardQuery {
  search?: string;
  profileType?: "all" | "human" | "ai";
  timeRange: TimeRangeKey;
  metric: RankingMetric;
  competitionId?: string | null;
}

export interface HistoryQuery {
  slug: string;
  from?: string | null;
  to?: string | null;
  competitionId?: string | null;
  marketType?: string | null;
  resultStatus?: "all" | "win" | "loss" | "void" | "pending";
  page?: number;
  pageSize?: number;
}

export interface HistoryPage {
  items: PredictionView[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ProfileDetail {
  profile: PredictorProfile;
  rank: number;
  rankingPeriod: TimeRangeKey;
  summary: PerformanceSummary;
  openPredictions: PredictionView[];
  similar: PredictorProfile[];
}

export interface PredictorRepository {
  getDataSourceInfo(): DataSourceInfo;
  listCompetitions(): Promise<Competition[]>;
  getLeaderboard(query: LeaderboardQuery): Promise<LeaderboardEntry[]>;
  getProfileBySlug(slug: string): Promise<PredictorProfile | null>;
  getProfileDetail(slug: string, rankingPeriod?: TimeRangeKey): Promise<ProfileDetail | null>;
  getHistory(query: HistoryQuery): Promise<HistoryPage>;
  getCalendar(slug: string, month: string): Promise<CalendarDaySummary[]>;
  /** All tips published on a single calendar day (YYYY-MM-DD). */
  getTipsForDay(slug: string, day: string): Promise<PredictionView[]>;
  /** All tips published in a month (YYYY-MM), grouped for calendar clicks. */
  getTipsForMonth(slug: string, month: string): Promise<PredictionView[]>;
  getChartSeries(
    slug: string,
    range: ChartRangeKey,
  ): Promise<{ mode: "profit" | "accuracy"; points: ChartPoint[]; settledSeries: ChartPoint[] }>;
  getBreakdowns(slug: string): Promise<{
    byCompetition: BreakdownRow[];
    byMarket: BreakdownRow[];
  }>;
  getUpcomingMatches(limit?: number): Promise<UpcomingMatchCard[]>;
  getSampleOpenTip(): Promise<PredictionView | null>;
  /** Fixed showcase fixture for landing hero (Arsenal vs Chelsea when available). */
  getShowcaseMatch(): Promise<UpcomingMatchCard | null>;
  /** Latest settled tips across profiles for landing activity. */
  getRecentSettledTips(limit?: number): Promise<RecentSettledTip[]>;
}
