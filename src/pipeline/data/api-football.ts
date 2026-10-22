// Competition identifiers retained from HabeshaTips; no API-Football key is needed.
export const COMPETITIONS = {
  E0: { id: 39, name: "Premier League", country: "England" },
  SP1: { id: 140, name: "La Liga", country: "Spain" },
  I1: { id: 135, name: "Serie A", country: "Italy" },
  D1: { id: 78, name: "Bundesliga", country: "Germany" },
  F1: { id: 61, name: "Ligue 1", country: "France" },
  P1: { id: 94, name: "Primeira Liga", country: "Portugal" },
  N1: { id: 88, name: "Eredivisie", country: "Netherlands" },
  B1: { id: 144, name: "Belgian Pro League", country: "Belgium" },
  UCL: { id: 2, name: "UEFA Champions League", country: "World" },
  UEL: { id: 3, name: "UEFA Europa League", country: "Europe" },
  UECL: { id: 848, name: "UEFA Conference League", country: "Europe" },
} as const;
export type CompetitionCode = keyof typeof COMPETITIONS;
export const COMPETITION_CODES = Object.keys(COMPETITIONS) as CompetitionCode[];
