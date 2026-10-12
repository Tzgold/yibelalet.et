import type {
  BettingRecord,
  Competition,
  FootballMatch,
  Prediction,
  PredictorProfile,
  Team,
} from "@/domain/types";

export function mapProfile(row: Record<string, unknown>): PredictorProfile {
  return {
    id: String(row.id),
    slug: String(row.slug),
    displayName: String(row.display_name),
    handle: String(row.handle),
    profileType: row.profile_type as PredictorProfile["profileType"],
    avatarUrl: (row.avatar_url as string | null) ?? null,
    bio: String(row.bio ?? ""),
    specialties: (row.specialties as string[]) ?? [],
    competitions: (row.competition_ids as string[]) ?? [],
    joinDate: String(row.join_date).slice(0, 10),
    visibility: row.visibility as PredictorProfile["visibility"],
    modelType: (row.model_type as string | null) ?? null,
    modelVersion: (row.model_version as string | null) ?? null,
    methodology: String(row.methodology ?? ""),
    isDemo: Boolean(row.is_demo),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export function mapCompetition(row: Record<string, unknown>): Competition {
  return {
    id: String(row.id),
    name: String(row.name),
    shortName: String(row.short_name),
    country: String(row.country),
  };
}

export function mapTeam(row: Record<string, unknown>): Team {
  return {
    id: String(row.id),
    name: String(row.name),
    shortName: String(row.short_name),
    logoUrl: (row.logo_url as string | null) ?? null,
  };
}

export function mapMatch(row: Record<string, unknown>): FootballMatch {
  return {
    id: String(row.id),
    providerMatchId: (row.provider_match_id as string | null) ?? null,
    competitionId: String(row.competition_id),
    homeTeamId: String(row.home_team_id),
    awayTeamId: String(row.away_team_id),
    kickoffAt: String(row.kickoff_at),
    matchStatus: row.match_status as FootballMatch["matchStatus"],
    homeScore: (row.home_score as number | null) ?? null,
    awayScore: (row.away_score as number | null) ?? null,
    dataSource: String(row.data_source ?? "supabase"),
    updatedAt: String(row.updated_at),
  };
}

export function mapPrediction(row: Record<string, unknown>): Prediction {
  return {
    id: String(row.id),
    profileId: String(row.profile_id),
    matchId: String(row.match_id),
    marketType: row.market_type as Prediction["marketType"],
    selection: String(row.selection),
    note: (row.note as string | null) ?? null,
    probability: (row.probability as number | null) ?? null,
    publishedAt: String(row.published_at),
    lockedAt: String(row.locked_at),
    modelVersion: (row.model_version as string | null) ?? null,
    status: row.status as Prediction["status"],
    settlementOutcome: (row.settlement_outcome as Prediction["settlementOutcome"]) ?? null,
    settledAt: (row.settled_at as string | null) ?? null,
    sourceMetadata: (row.source_metadata as string | null) ?? null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export function mapBetting(row: Record<string, unknown>): BettingRecord {
  return {
    id: String(row.id),
    predictionId: String(row.prediction_id),
    oddsAtPublication: Number(row.odds_at_publication),
    stakeUnits: Number(row.stake_units),
    netReturnUnits:
      row.net_return_units == null ? null : Number(row.net_return_units),
    settledAt: (row.settled_at as string | null) ?? null,
    settlementRule: String(row.settlement_rule ?? ""),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}
