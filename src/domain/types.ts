export type ProfileType = "human" | "ai";

export type Visibility = "public" | "unlisted" | "private";

export type MatchStatus =
  | "scheduled"
  | "live"
  | "finished"
  | "postponed"
  | "cancelled";

export type MarketType =
  | "match_result"
  | "over_under_2_5"
  | "both_teams_to_score"
  | "double_chance";

export type PredictionStatus =
  | "upcoming"
  | "live"
  | "pending_settlement"
  | "settled"
  | "void"
  | "postponed";

export type SettlementOutcome = "win" | "loss" | "void" | "push" | null;

export type RankingMetric = "default" | "accuracy" | "recent" | "profitability";

export type TimeRangeKey = "7d" | "30d" | "90d" | "all";

export type ChartRangeKey = "week" | "month" | "year" | "all";

export interface Competition {
  id: string;
  name: string;
  shortName: string;
  country: string;
}

export interface Team {
  id: string;
  name: string;
  shortName: string;
  /** Official crest URL when available */
  logoUrl: string | null;
}

export interface PredictorProfile {
  id: string;
  slug: string;
  displayName: string;
  handle: string;
  profileType: ProfileType;
  avatarUrl: string | null;
  bio: string;
  specialties: string[];
  competitions: string[];
  joinDate: string;
  visibility: Visibility;
  modelType: string | null;
  modelVersion: string | null;
  methodology: string;
  isDemo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FootballMatch {
  id: string;
  providerMatchId: string | null;
  competitionId: string;
  homeTeamId: string;
  awayTeamId: string;
  kickoffAt: string;
  matchStatus: MatchStatus;
  homeScore: number | null;
  awayScore: number | null;
  dataSource: string;
  updatedAt: string;
}

export interface Prediction {
  id: string;
  profileId: string;
  matchId: string;
  marketType: MarketType;
  selection: string;
  /** Short tipster-style note published with the tip */
  note: string | null;
  /** Probability of the published selection in [0, 1], when recorded */
  probability: number | null;
  publishedAt: string;
  lockedAt: string;
  modelVersion: string | null;
  status: PredictionStatus;
  settlementOutcome: SettlementOutcome;
  settledAt: string | null;
  sourceMetadata: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Optional betting record — financial metrics require this. */
export interface BettingRecord {
  id: string;
  predictionId: string;
  oddsAtPublication: number;
  stakeUnits: number;
  netReturnUnits: number | null;
  settledAt: string | null;
  settlementRule: string;
  createdAt: string;
  updatedAt: string;
}

export interface PredictionView extends Prediction {
  match: FootballMatch;
  competition: Competition;
  homeTeam: Team;
  awayTeam: Team;
  betting: BettingRecord | null;
}

export interface PerformanceSummary {
  settledCount: number;
  wins: number;
  losses: number;
  voids: number;
  pushes: number;
  accuracy: number | null;
  averageProbability: number | null;
  brierScore: number | null;
  netProfitUnits: number | null;
  roi: number | null;
  hasBettingRecords: boolean;
  insufficientSample: boolean;
  sampleMinimum: number;
}

export interface LeaderboardEntry {
  profile: PredictorProfile;
  rank: number;
  eligible: boolean;
  ineligibleReason: string | null;
  summary: PerformanceSummary;
  recentForm: Array<"W" | "L" | "V" | "P">;
  rankingScore: number;
}

export interface BreakdownRow {
  key: string;
  label: string;
  settledCount: number;
  wins: number;
  losses: number;
  voids: number;
  accuracy: number | null;
  netProfitUnits: number | null;
}

export interface ChartPoint {
  date: string;
  value: number;
  label: string;
}

export interface CalendarDaySummary {
  date: string;
  wins: number;
  losses: number;
  voids: number;
  pending: number;
  settledCount: number;
  netProfitUnits: number | null;
}

export interface DataSourceInfo {
  mode: "demo" | "supabase";
  isDemo: boolean;
  label: string;
}
