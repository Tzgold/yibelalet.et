import { format, formatDistanceToNowStrict, parseISO } from "date-fns";

export function formatPercent(value: number | null, digits = 1): string {
  if (value == null || Number.isNaN(value)) return "—";
  return `${(value * 100).toFixed(digits)}%`;
}

export function formatUnits(value: number | null, digits = 2): string {
  if (value == null || Number.isNaN(value)) return "—";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(digits)}u`;
}

export function formatKickoff(iso: string): string {
  try {
    return format(parseISO(iso), "MMM d, yyyy · HH:mm");
  } catch {
    return iso;
  }
}

export function formatKickoffLocal(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function formatRelative(iso: string): string {
  try {
    return formatDistanceToNowStrict(parseISO(iso), { addSuffix: true });
  } catch {
    return iso;
  }
}

export function marketLabel(market: string): string {
  switch (market) {
    case "match_result":
      return "Match result";
    case "over_under_2_5":
      return "Over/Under 2.5";
    case "both_teams_to_score":
      return "Both teams to score";
    case "double_chance":
      return "Double chance";
    default:
      return market;
  }
}

export function selectionLabel(
  selection: string,
  homeName?: string,
  awayName?: string,
): string {
  const home = homeName ?? "Home";
  const away = awayName ?? "Away";
  switch (selection) {
    case "home":
      return `${home} to win`;
    case "away":
      return `${away} to win`;
    case "draw":
      return "Draw";
    case "over_2.5":
      return "Over 2.5 goals";
    case "under_2.5":
      return "Under 2.5 goals";
    case "btts_yes":
      return "Both teams to score — Yes";
    case "btts_no":
      return "Both teams to score — No";
    case "home_or_draw":
      return `${home} or draw`;
    case "away_or_draw":
      return `${away} or draw`;
    default:
      return selection.replaceAll("_", " ");
  }
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}
