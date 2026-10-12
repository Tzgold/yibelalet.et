/**
 * Deterministic demonstration seed for football leaderboard development.
 * All records are labeled isDemo=true. Not real-world performance.
 */

import type {
  BettingRecord,
  Competition,
  FootballMatch,
  MarketType,
  Prediction,
  PredictorProfile,
  Team,
} from "@/domain/types";

export const DEMO_PROFILE_COUNT = Number(
  process.env.DEMO_PROFILE_COUNT ?? process.env.NEXT_PUBLIC_DEMO_PROFILE_COUNT ?? 25,
);

const COMPETITIONS: Competition[] = [
  { id: "comp-epl", name: "Premier League", shortName: "EPL", country: "England" },
  { id: "comp-laliga", name: "La Liga", shortName: "LaLiga", country: "Spain" },
  { id: "comp-seriea", name: "Serie A", shortName: "Serie A", country: "Italy" },
  { id: "comp-bundesliga", name: "Bundesliga", shortName: "Bundesliga", country: "Germany" },
  { id: "comp-ucl", name: "UEFA Champions League", shortName: "UCL", country: "Europe" },
];

/** Crests via football-data.org public CDN */
function crest(id: number): string {
  return `https://crests.football-data.org/${id}.png`;
}

const TEAMS: Team[] = [
  { id: "t-ars", name: "Arsenal", shortName: "ARS", logoUrl: crest(57) },
  { id: "t-liv", name: "Liverpool", shortName: "LIV", logoUrl: crest(64) },
  { id: "t-mci", name: "Manchester City", shortName: "MCI", logoUrl: crest(65) },
  { id: "t-mun", name: "Manchester United", shortName: "MUN", logoUrl: crest(66) },
  { id: "t-che", name: "Chelsea", shortName: "CHE", logoUrl: crest(61) },
  { id: "t-tot", name: "Tottenham", shortName: "TOT", logoUrl: crest(73) },
  { id: "t-new", name: "Newcastle", shortName: "NEW", logoUrl: crest(67) },
  { id: "t-avl", name: "Aston Villa", shortName: "AVL", logoUrl: crest(58) },
  { id: "t-bri", name: "Brighton", shortName: "BHA", logoUrl: crest(397) },
  { id: "t-whu", name: "West Ham", shortName: "WHU", logoUrl: crest(563) },
  { id: "t-rma", name: "Real Madrid", shortName: "RMA", logoUrl: crest(86) },
  { id: "t-bar", name: "Barcelona", shortName: "BAR", logoUrl: crest(81) },
  { id: "t-atm", name: "Atletico Madrid", shortName: "ATM", logoUrl: crest(78) },
  { id: "t-sev", name: "Sevilla", shortName: "SEV", logoUrl: crest(559) },
  { id: "t-vil", name: "Villarreal", shortName: "VIL", logoUrl: crest(94) },
  { id: "t-juv", name: "Juventus", shortName: "JUV", logoUrl: crest(109) },
  { id: "t-int", name: "Inter", shortName: "INT", logoUrl: crest(108) },
  { id: "t-mil", name: "Milan", shortName: "MIL", logoUrl: crest(98) },
  { id: "t-nap", name: "Napoli", shortName: "NAP", logoUrl: crest(113) },
  { id: "t-rom", name: "Roma", shortName: "ROM", logoUrl: crest(100) },
  { id: "t-laz", name: "Lazio", shortName: "LAZ", logoUrl: crest(110) },
  { id: "t-bay", name: "Bayern Munich", shortName: "BAY", logoUrl: crest(5) },
  { id: "t-bvb", name: "Borussia Dortmund", shortName: "BVB", logoUrl: crest(4) },
  { id: "t-lev", name: "Bayer Leverkusen", shortName: "B04", logoUrl: crest(3) },
  { id: "t-rbl", name: "RB Leipzig", shortName: "RBL", logoUrl: crest(721) },
  { id: "t-psg", name: "Paris Saint-Germain", shortName: "PSG", logoUrl: crest(524) },
  { id: "t-mar", name: "Marseille", shortName: "OM", logoUrl: crest(516) },
  { id: "t-aja", name: "Ajax", shortName: "AJA", logoUrl: crest(678) },
  { id: "t-por", name: "Porto", shortName: "POR", logoUrl: crest(503) },
  { id: "t-ben", name: "Benfica", shortName: "BEN", logoUrl: crest(1903) },
];

function portrait(id: string): string {
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=256&h=256&q=80`;
}

function aiAvatar(seed: string): string {
  return `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${encodeURIComponent(seed)}&backgroundColor=111827`;
}

interface ProfileSeedDef {
  slug: string;
  displayName: string;
  handle: string;
  profileType: "human" | "ai";
  avatarUrl: string | null;
  bio: string;
  specialties: string[];
  competitions: string[];
  methodology: string;
  modelType: string | null;
  modelVersion: string | null;
  /** Relative skill bias for synthetic outcomes (0.35–0.75). */
  skill: number;
  /** Whether this profile has unit-stake betting records. */
  hasBetting: boolean;
  joinOffsetDays: number;
}

const PROFILE_DEFS: ProfileSeedDef[] = [
  {
    slug: "addis-forecast",
    displayName: "Addis Forecast",
    handle: "@addisforecast",
    profileType: "ai",
    avatarUrl: aiAvatar("placeholder"),
    bio: "Ensemble model focused on top-five league match results.",
    specialties: ["Match results", "Closing-line awareness"],
    competitions: ["comp-epl", "comp-laliga", "comp-ucl"],
    methodology: "Gradient-boosted ratings with form decay and venue adjustments.",
    modelType: "ensemble",
    modelVersion: "1.4.2",
    skill: 0.62,
    hasBetting: true,
    joinOffsetDays: 420,
  },
  {
    slug: "dawit-bekele",
    displayName: "Dawit Bekele",
    handle: "@dawitbekele",
    profileType: "human",
    avatarUrl: portrait("photo-1506277886164-e25aa3f4ef7f"),
    bio: "Addis Ababa tipster specializing in Premier League tempo and set-piece edges.",
    specialties: ["Premier League", "Set pieces"],
    competitions: ["comp-epl"],
    methodology: "Manual film notes plus xG differentials.",
    modelType: null,
    modelVersion: null,
    skill: 0.58,
    hasBetting: true,
    joinOffsetDays: 390,
  },
  {
    slug: "sheba-calibra",
    displayName: "Sheba Calibra",
    handle: "@shebacalibra",
    profileType: "ai",
    avatarUrl: aiAvatar("placeholder"),
    bio: "Probability-calibration model for over/under markets.",
    specialties: ["Over/Under", "Calibration"],
    competitions: ["comp-epl", "comp-bundesliga", "comp-seriea"],
    methodology: "Poisson goals model with league-specific dispersion.",
    modelType: "poisson",
    modelVersion: "0.9.1",
    skill: 0.6,
    hasBetting: false,
    joinOffsetDays: 360,
  },
  {
    slug: "hiwot-tadesse",
    displayName: "Hiwot Tadesse",
    handle: "@hiwottadesse",
    profileType: "human",
    avatarUrl: portrait("photo-1531123897727-8f129e1688ce"),
    bio: "Serie A match results and double chance specialist from Hawassa.",
    specialties: ["Serie A", "Double chance"],
    competitions: ["comp-seriea"],
    methodology: "Squad news tracking and home/away splits.",
    modelType: null,
    modelVersion: null,
    skill: 0.55,
    hasBetting: true,
    joinOffsetDays: 340,
  },
  {
    slug: "yonas-alemu",
    displayName: "Yonas Alemu",
    handle: "@yonasalemu",
    profileType: "human",
    avatarUrl: portrait("photo-1618077360395-f3068be8e001"),
    bio: "La Liga-focused tipster covering match result markets.",
    specialties: ["La Liga", "Match results"],
    competitions: ["comp-laliga"],
    methodology: "Schedule congestion and travel heuristics.",
    modelType: null,
    modelVersion: null,
    skill: 0.57,
    hasBetting: false,
    joinOffsetDays: 310,
  },
  {
    slug: "abay-bayes",
    displayName: "Abay Bayes",
    handle: "@abaybayes",
    profileType: "ai",
    avatarUrl: aiAvatar("placeholder"),
    bio: "Bayesian ratings model for Bundesliga scoring markets.",
    specialties: ["Bundesliga", "BTTS"],
    competitions: ["comp-bundesliga"],
    methodology: "Hierarchical Bayesian attack/defense ratings.",
    modelType: "bayesian",
    modelVersion: "2.0.0",
    skill: 0.61,
    hasBetting: true,
    joinOffsetDays: 300,
  },
  {
    slug: "fasil-lattice",
    displayName: "Fasil Lattice",
    handle: "@fasillattice",
    profileType: "ai",
    avatarUrl: aiAvatar("placeholder"),
    bio: "Champions League knockout and group-stage predictor.",
    specialties: ["Champions League", "Match results"],
    competitions: ["comp-ucl", "comp-epl"],
    methodology: "Club Elo with continental competition adjustments.",
    modelType: "elo",
    modelVersion: "3.1.0",
    skill: 0.59,
    hasBetting: true,
    joinOffsetDays: 280,
  },
  {
    slug: "selam-girma",
    displayName: "Selam Girma",
    handle: "@selamgirma",
    profileType: "human",
    avatarUrl: portrait("photo-1589156280159-27698a70f29e"),
    bio: "Cautious double-chance selections with strong risk control.",
    specialties: ["Double chance", "Risk control"],
    competitions: ["comp-epl", "comp-laliga"],
    methodology: "Avoids low-sample underdogs; disciplined staking notes.",
    modelType: null,
    modelVersion: null,
    skill: 0.54,
    hasBetting: true,
    joinOffsetDays: 260,
  },
  {
    slug: "entoto-grid",
    displayName: "Entoto Grid",
    handle: "@entotogrid",
    profileType: "ai",
    avatarUrl: aiAvatar("placeholder"),
    bio: "Totals-focused model using shot quality proxies.",
    specialties: ["Over/Under 2.5"],
    competitions: ["comp-epl", "comp-bundesliga", "comp-ucl"],
    methodology: "Expected goals simulation grid.",
    modelType: "simulation",
    modelVersion: "1.2.0",
    skill: 0.56,
    hasBetting: false,
    joinOffsetDays: 250,
  },
  {
    slug: "bereket-mulugeta",
    displayName: "Bereket Mulugeta",
    handle: "@bereketm",
    profileType: "human",
    avatarUrl: portrait("photo-1522529599102-193c0d76b5b6"),
    bio: "Italian football tipster with a match-result emphasis.",
    specialties: ["Serie A", "Match results"],
    competitions: ["comp-seriea", "comp-ucl"],
    methodology: "Pressing intensity notes and lineup timing.",
    modelType: null,
    modelVersion: null,
    skill: 0.53,
    hasBetting: false,
    joinOffsetDays: 240,
  },
  {
    slug: "mahlet-assefa",
    displayName: "Mahlet Assefa",
    handle: "@mahletassefa",
    profileType: "human",
    avatarUrl: portrait("photo-1524504388940-b1c1722653e1"),
    bio: "Late-market tipster reacting to confirmed starting XIs.",
    specialties: ["Lineups", "Late markets"],
    competitions: ["comp-epl", "comp-ucl"],
    methodology: "Publishes only after probable lineups are out.",
    modelType: null,
    modelVersion: null,
    skill: 0.6,
    hasBetting: true,
    joinOffsetDays: 220,
  },
  {
    slug: "lalibela-vector",
    displayName: "Lalibela Vector",
    handle: "@lalibelavector",
    profileType: "ai",
    avatarUrl: aiAvatar("placeholder"),
    bio: "Embedding-based similarity model across top leagues.",
    specialties: ["Cross-league", "Match results"],
    competitions: ["comp-epl", "comp-laliga", "comp-seriea", "comp-bundesliga"],
    methodology: "Team-state embeddings with logistic head.",
    modelType: "neural",
    modelVersion: "0.7.5",
    skill: 0.58,
    hasBetting: true,
    joinOffsetDays: 210,
  },
  {
    slug: "kirubel-tesfaye",
    displayName: "Kirubel Tesfaye",
    handle: "@kirubel",
    profileType: "human",
    avatarUrl: portrait("photo-1463453091185-61582044d556"),
    bio: "Hunts soft prices on BTTS markets across Europe.",
    specialties: ["BTTS", "Price shopping"],
    competitions: ["comp-epl", "comp-laliga"],
    methodology: "Compares public odds to personal totals models.",
    modelType: null,
    modelVersion: null,
    skill: 0.52,
    hasBetting: true,
    joinOffsetDays: 200,
  },
  {
    slug: "merkato-tempo",
    displayName: "Merkato Tempo",
    handle: "@merkatotempo",
    profileType: "ai",
    avatarUrl: aiAvatar("placeholder"),
    bio: "Possession and tempo feature model for open-play goals.",
    specialties: ["Tempo", "Over/Under"],
    competitions: ["comp-laliga", "comp-bundesliga"],
    methodology: "Sequence tempo features into a GLM.",
    modelType: "glm",
    modelVersion: "1.0.3",
    skill: 0.57,
    hasBetting: false,
    joinOffsetDays: 190,
  },
  {
    slug: "bethlehem-hailu",
    displayName: "Bethlehem Hailu",
    handle: "@bethlehemh",
    profileType: "human",
    avatarUrl: portrait("photo-1531384441138-273266cdd7fb"),
    bio: "Defensive-structure tipster for low-scoring sides.",
    specialties: ["Under markets", "Defensive form"],
    competitions: ["comp-seriea", "comp-laliga"],
    methodology: "Tracks defensive absences and block height.",
    modelType: null,
    modelVersion: null,
    skill: 0.55,
    hasBetting: false,
    joinOffsetDays: 180,
  },
  {
    slug: "meskel-market",
    displayName: "Meskel Market",
    handle: "@meskelmarket",
    profileType: "ai",
    avatarUrl: aiAvatar("placeholder"),
    bio: "Market-movement aware model for match results.",
    specialties: ["Market moves", "Match results"],
    competitions: ["comp-epl", "comp-ucl"],
    methodology: "Open-to-close price signals with result heads.",
    modelType: "market",
    modelVersion: "4.0.1",
    skill: 0.63,
    hasBetting: true,
    joinOffsetDays: 170,
  },
  {
    slug: "natnael-worku",
    displayName: "Natnael Worku",
    handle: "@natnaelw",
    profileType: "human",
    avatarUrl: portrait("photo-1566492031773-4f4e44671857"),
    bio: "Rivalry-match tipster with narrative caution labels.",
    specialties: ["Derbies", "Match results"],
    competitions: ["comp-epl", "comp-seriea"],
    methodology: "Down-weights narrative bias in derby pricing.",
    modelType: null,
    modelVersion: null,
    skill: 0.5,
    hasBetting: true,
    joinOffsetDays: 160,
  },
  {
    slug: "axum-threat",
    displayName: "Axum Threat",
    handle: "@axumthreat",
    profileType: "ai",
    avatarUrl: aiAvatar("placeholder"),
    bio: "Threat-possession model for Champions League ties.",
    specialties: ["xThreat", "UCL"],
    competitions: ["comp-ucl"],
    methodology: "Possession value chains into match probabilities.",
    modelType: "xthreat",
    modelVersion: "1.1.0",
    skill: 0.6,
    hasBetting: false,
    joinOffsetDays: 150,
  },
  {
    slug: "liya-mekonnen",
    displayName: "Liya Mekonnen",
    handle: "@liyamekonnen",
    profileType: "human",
    avatarUrl: portrait("photo-1573496359142-b8d87734a5a2"),
    bio: "Saturday-slate tipster for volume Premier League cards.",
    specialties: ["Weekend slates", "Premier League"],
    competitions: ["comp-epl"],
    methodology: "Batch publishes Friday evening ahead of kickoffs.",
    modelType: null,
    modelVersion: null,
    skill: 0.54,
    hasBetting: true,
    joinOffsetDays: 140,
  },
  {
    slug: "gondar-draw",
    displayName: "Gondar Draw",
    handle: "@gondardraw",
    profileType: "ai",
    avatarUrl: aiAvatar("placeholder"),
    bio: "Three-way market model with explicit draw calibration.",
    specialties: ["Draws", "Match results"],
    competitions: ["comp-laliga", "comp-seriea", "comp-epl"],
    methodology: "Ordered logit with draw inflation term.",
    modelType: "ordered-logit",
    modelVersion: "2.2.0",
    skill: 0.56,
    hasBetting: true,
    joinOffsetDays: 130,
  },
  {
    slug: "henok-gebre",
    displayName: "Henok Gebre",
    handle: "@henokgebre",
    profileType: "human",
    avatarUrl: portrait("photo-1615109398623-88346a601842"),
    bio: "High-press matchup analyst for Bundesliga sides.",
    specialties: ["Pressing", "Bundesliga"],
    competitions: ["comp-bundesliga"],
    methodology: "PPDA-style proxies from public match summaries.",
    modelType: null,
    modelVersion: null,
    skill: 0.55,
    hasBetting: false,
    joinOffsetDays: 120,
  },
  {
    slug: "yirga-baseline",
    displayName: "Yirga Baseline",
    handle: "@yirgabaseline",
    profileType: "ai",
    avatarUrl: aiAvatar("placeholder"),
    bio: "Low-sample caution model that often sits below eligibility early.",
    specialties: ["Small samples", "Education"],
    competitions: ["comp-ucl"],
    methodology: "Intentionally sparse history for insufficient-sample states.",
    modelType: "baseline",
    modelVersion: "0.1.0",
    skill: 0.48,
    hasBetting: false,
    joinOffsetDays: 40,
  },
  {
    slug: "meron-kebede",
    displayName: "Meron Kebede",
    handle: "@meronkebede",
    profileType: "human",
    avatarUrl: portrait("photo-1489424731084-a5d8b219a5bb"),
    bio: "Unit-staking tipster with full betting records.",
    specialties: ["Unit staking", "ROI tracking"],
    competitions: ["comp-epl", "comp-laliga", "comp-seriea"],
    methodology: "Flat 1u stakes on published selections.",
    modelType: null,
    modelVersion: null,
    skill: 0.59,
    hasBetting: true,
    joinOffsetDays: 110,
  },
  {
    slug: "habesha-blend",
    displayName: "Habesha Blend",
    handle: "@habeshablend",
    profileType: "ai",
    avatarUrl: aiAvatar("placeholder"),
    bio: "Multi-market harmonic mean blender across result and totals.",
    specialties: ["Multi-market", "Blending"],
    competitions: ["comp-epl", "comp-bundesliga", "comp-ucl"],
    methodology: "Blends independent market heads.",
    modelType: "blend",
    modelVersion: "1.8.0",
    skill: 0.61,
    hasBetting: true,
    joinOffsetDays: 100,
  },
  {
    slug: "abel-desta",
    displayName: "Abel Desta",
    handle: "@abeldesta",
    profileType: "human",
    avatarUrl: portrait("photo-1539701938214-0d9736e1c16b"),
    bio: "Process-first tipster emphasizing checklist writeups over headlines.",
    specialties: ["Process", "Match results"],
    competitions: ["comp-epl", "comp-seriea", "comp-laliga"],
    methodology: "Checklist-driven writeups before every published tip.",
    modelType: null,
    modelVersion: null,
    skill: 0.57,
    hasBetting: false,
    joinOffsetDays: 90,
  },
];

function mulberry32(seed: number) {
  return function next() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function daysAgo(days: number, now: Date): string {
  const d = new Date(now);
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString();
}

function hoursFromNow(hours: number, now: Date): string {
  const d = new Date(now);
  d.setUTCHours(d.getUTCHours() + hours);
  return d.toISOString();
}

export interface DemoWorld {
  competitions: Competition[];
  teams: Team[];
  profiles: PredictorProfile[];
  matches: FootballMatch[];
  predictions: Prediction[];
  bettingRecords: BettingRecord[];
  generatedAt: string;
}

/** Stable demo clock so recent tips always land in the visible history window. */
export const DEMO_AS_OF = new Date(
  process.env.DEMO_AS_OF ?? "2026-10-12T15:00:00.000Z",
);

const TIP_NOTES = [
  "Home side creating more from open play — backing the host.",
  "Both attacks in form; expecting goals both ways.",
  "Tight midfield matchup — leaning under the totals line.",
  "Away defence travel poorly lately; taking the home result.",
  "Set-piece edge looks decisive in this fixture.",
  "Low block vs possession side — double chance feels safer.",
  "xG trend supports an open game; over 2.5.",
  "Key striker returns — slight lean to the favourites.",
  "Derby volatility — fading the chalky away price.",
  "Model and public prices align on a draw-heavy script.",
];

let cached: DemoWorld | null = null;

export function getDemoWorld(now: Date = DEMO_AS_OF): DemoWorld {
  if (cached) return cached;

  const count = Math.min(Math.max(DEMO_PROFILE_COUNT, 1), PROFILE_DEFS.length);
  const defs = PROFILE_DEFS.slice(0, count);
  const rng = mulberry32(20261012);

  let aiSeq = 0;
  const profiles: PredictorProfile[] = defs.map((def) => {
    const joinDate = daysAgo(def.joinOffsetDays, now);
    const isAi = def.profileType === "ai";
    if (isAi) aiSeq += 1;
    const modelName = `model_${aiSeq}`;
    const slug = isAi ? `model-${aiSeq}` : def.slug;
    return {
      id: `prof-${slug}`,
      slug,
      displayName: isAi ? modelName : def.displayName,
      handle: isAi ? `@${modelName}` : def.handle,
      profileType: def.profileType,
      avatarUrl: isAi ? aiAvatar(modelName) : def.avatarUrl,
      bio: isAi ? `${modelName} — automated football prediction model.` : def.bio,
      specialties: def.specialties,
      competitions: def.competitions,
      joinDate: joinDate.slice(0, 10),
      visibility: "public",
      modelType: def.modelType,
      modelVersion: def.modelVersion,
      methodology: def.methodology,
      isDemo: true,
      createdAt: joinDate,
      updatedAt: joinDate,
    };
  });

  const matches: FootballMatch[] = [];
  const pairings: Array<[string, string, string, number, number]> = [
    ["comp-epl", "t-ars", "t-liv", 2, 1],
    ["comp-epl", "t-mci", "t-che", 3, 1],
    ["comp-epl", "t-tot", "t-new", 1, 1],
    ["comp-epl", "t-mun", "t-avl", 2, 0],
    ["comp-epl", "t-bri", "t-whu", 1, 1],
    ["comp-epl", "t-liv", "t-mci", 0, 2],
    ["comp-epl", "t-che", "t-ars", 1, 2],
    ["comp-epl", "t-new", "t-bri", 2, 0],
    ["comp-epl", "t-avl", "t-tot", 1, 3],
    ["comp-epl", "t-whu", "t-mun", 0, 2],
    ["comp-laliga", "t-rma", "t-bar", 2, 2],
    ["comp-laliga", "t-bar", "t-atm", 3, 0],
    ["comp-laliga", "t-atm", "t-sev", 1, 0],
    ["comp-laliga", "t-sev", "t-vil", 2, 1],
    ["comp-laliga", "t-vil", "t-rma", 0, 2],
    ["comp-seriea", "t-int", "t-mil", 2, 1],
    ["comp-seriea", "t-juv", "t-nap", 1, 1],
    ["comp-seriea", "t-rom", "t-laz", 2, 2],
    ["comp-seriea", "t-mil", "t-rom", 0, 1],
    ["comp-seriea", "t-nap", "t-int", 2, 1],
    ["comp-seriea", "t-laz", "t-juv", 1, 0],
    ["comp-bundesliga", "t-bay", "t-bvb", 3, 2],
    ["comp-bundesliga", "t-lev", "t-rbl", 2, 1],
    ["comp-bundesliga", "t-bvb", "t-lev", 1, 1],
    ["comp-bundesliga", "t-rbl", "t-bay", 0, 3],
    ["comp-ucl", "t-rma", "t-mci", 2, 1],
    ["comp-ucl", "t-bay", "t-psg", 1, 1],
    ["comp-ucl", "t-ars", "t-bar", 2, 0],
    ["comp-ucl", "t-int", "t-liv", 0, 0],
    ["comp-ucl", "t-aja", "t-por", 1, 2],
    ["comp-ucl", "t-ben", "t-mar", 2, 1],
    ["comp-ucl", "t-psg", "t-bay", 0, 1],
    ["comp-ucl", "t-por", "t-ben", 1, 1],
  ];

  // Dense recent finished slate (last ~48 days) so history/calendar feel alive.
  for (let i = 0; i < 48; i++) {
    const [compId, homeId, awayId, hs, as] = pairings[i % pairings.length];
    const scoreJitter = i % 5 === 0 ? 1 : 0;
    const kickoff = daysAgo(1 + i, now);
    matches.push({
      id: `match-hist-${i}`,
      providerMatchId: `demo-hist-${i}`,
      competitionId: compId,
      homeTeamId: homeId,
      awayTeamId: awayId,
      kickoffAt: kickoff,
      matchStatus: "finished",
      homeScore: Math.max(0, hs + (i % 3 === 0 ? scoreJitter : 0)),
      awayScore: Math.max(0, as - (i % 4 === 0 ? scoreJitter : 0)),
      dataSource: "demo",
      updatedAt: kickoff,
    });
  }

  // Featured landing fixtures (real crests; labeled demo schedule).
  const featuredUpcoming: Array<[string, string, string, string, number]> = [
    ["match-feat-liv-mun", "comp-epl", "t-liv", "t-mun", 18],
    ["match-feat-rma-bar", "comp-ucl", "t-rma", "t-bar", 42],
    ["match-feat-int-mil", "comp-seriea", "t-int", "t-mil", 66],
    ["match-feat-ars-che", "comp-epl", "t-ars", "t-che", 90],
  ];
  for (const [id, compId, homeId, awayId, hours] of featuredUpcoming) {
    const kickoff = hoursFromNow(hours, now);
    matches.push({
      id,
      providerMatchId: `demo-${id}`,
      competitionId: compId,
      homeTeamId: homeId,
      awayTeamId: awayId,
      kickoffAt: kickoff,
      matchStatus: "scheduled",
      homeScore: null,
      awayScore: null,
      dataSource: "demo",
      updatedAt: kickoff,
    });
  }

  for (let i = 0; i < 16; i++) {
    const [compId, homeId, awayId] = pairings[i % pairings.length];
    const kickoff = hoursFromNow(110 + i * 16, now);
    matches.push({
      id: `match-up-${i}`,
      providerMatchId: `demo-up-${i}`,
      competitionId: compId,
      homeTeamId: homeId === awayId ? "t-ars" : homeId,
      awayTeamId: awayId,
      kickoffAt: kickoff,
      matchStatus: "scheduled",
      homeScore: null,
      awayScore: null,
      dataSource: "demo",
      updatedAt: kickoff,
    });
  }

  matches.push({
    id: "match-post-0",
    providerMatchId: "demo-post-0",
    competitionId: "comp-epl",
    homeTeamId: "t-ars",
    awayTeamId: "t-tot",
    kickoffAt: daysAgo(1, now),
    matchStatus: "postponed",
    homeScore: null,
    awayScore: null,
    dataSource: "demo",
    updatedAt: daysAgo(1, now),
  });

  const markets: MarketType[] = [
    "match_result",
    "over_under_2_5",
    "both_teams_to_score",
    "double_chance",
  ];

  const predictions: Prediction[] = [];
  const bettingRecords: BettingRecord[] = [];

  for (let pIndex = 0; pIndex < defs.length; pIndex++) {
    const def = defs[pIndex];
    const profile = profiles[pIndex];
    const historyCount = def.slug === "split-sample" ? 5 : 28;
    const eligibleMatches = matches.filter(
      (m) =>
        m.matchStatus === "finished" &&
        def.competitions.includes(m.competitionId),
    );

    let forcedWins = 0;
    let forcedLosses = 0;

    for (let i = 0; i < historyCount && i < eligibleMatches.length; i++) {
      const match = eligibleMatches[i];
      const market = markets[(pIndex + i) % markets.length];
      const home = TEAMS.find((t) => t.id === match.homeTeamId)!;
      const away = TEAMS.find((t) => t.id === match.awayTeamId)!;

      // Ensure every profile shows both wins and losses in recent history.
      let wantWin: boolean;
      if (forcedWins < 4 && i % 3 === 0) {
        wantWin = true;
        forcedWins += 1;
      } else if (forcedLosses < 3 && i % 3 === 1) {
        wantWin = false;
        forcedLosses += 1;
      } else {
        wantWin = rng() < def.skill;
      }

      const selection = pickSelectionForOutcome(market, match, wantWin, rng);
      const outcome = settleSelection(market, match, selection);
      // If settlement disagrees with intent (edge markets), keep computed outcome.
      const finalOutcome: "win" | "loss" | "void" =
        rng() < 0.03 ? "void" : outcome;

      const publishedAt = new Date(match.kickoffAt);
      publishedAt.setUTCHours(publishedAt.getUTCHours() - (4 + (i % 5)));
      const lockedAt = match.kickoffAt;
      const settledAt = match.kickoffAt;
      const probability = Number((0.42 + rng() * 0.28).toFixed(3));
      const note = tipNoteFor(market, home.name, away.name, selection, pIndex + i);

      const predId = `pred-${profile.slug}-${i}`;
      predictions.push({
        id: predId,
        profileId: profile.id,
        matchId: match.id,
        marketType: market,
        selection,
        note,
        probability,
        publishedAt: publishedAt.toISOString(),
        lockedAt,
        modelVersion: def.modelVersion,
        status: finalOutcome === "void" ? "void" : "settled",
        settlementOutcome: finalOutcome,
        settledAt,
        sourceMetadata: "demo-seed",
        createdAt: publishedAt.toISOString(),
        updatedAt: settledAt,
      });

      if (def.hasBetting && finalOutcome !== "void") {
        const odds = Number((1.55 + rng() * 1.65).toFixed(2));
        const stake = 1;
        const net =
          finalOutcome === "win"
            ? Number((stake * (odds - 1)).toFixed(2))
            : -stake;
        bettingRecords.push({
          id: `bet-${predId}`,
          predictionId: predId,
          oddsAtPublication: odds,
          stakeUnits: stake,
          netReturnUnits: net,
          settledAt,
          settlementRule: "decimal_odds_unit_stake",
          createdAt: publishedAt.toISOString(),
          updatedAt: settledAt,
        });
      }
    }

    const openMatches = matches.filter(
      (m) =>
        m.matchStatus === "scheduled" &&
        def.competitions.includes(m.competitionId),
    );
    const openCount = def.slug === "split-sample" ? 1 : 2 + (pIndex % 3);
    for (let i = 0; i < openCount && i < openMatches.length; i++) {
      const match = openMatches[i];
      const market = markets[(pIndex + i + 1) % markets.length];
      const home = TEAMS.find((t) => t.id === match.homeTeamId)!;
      const away = TEAMS.find((t) => t.id === match.awayTeamId)!;
      const selection = pickSelection(market, rng);
      const publishedAt = new Date(match.kickoffAt);
      publishedAt.setUTCHours(publishedAt.getUTCHours() - 10);
      predictions.push({
        id: `pred-${profile.slug}-open-${i}`,
        profileId: profile.id,
        matchId: match.id,
        marketType: market,
        selection,
        note: tipNoteFor(market, home.name, away.name, selection, pIndex + i + 99),
        probability: Number((0.44 + rng() * 0.25).toFixed(3)),
        publishedAt: publishedAt.toISOString(),
        lockedAt: match.kickoffAt,
        modelVersion: def.modelVersion,
        status: "upcoming",
        settlementOutcome: null,
        settledAt: null,
        sourceMetadata: "demo-seed",
        createdAt: publishedAt.toISOString(),
        updatedAt: publishedAt.toISOString(),
      });
    }

    if (pIndex % 7 === 0) {
      const match = matches.find((m) => m.id === "match-post-0")!;
      const publishedAt = daysAgo(2, now);
      predictions.push({
        id: `pred-${profile.slug}-post`,
        profileId: profile.id,
        matchId: match.id,
        marketType: "match_result",
        selection: "home",
        note: "North London fixture postponed after publication — tip remains on record.",
        probability: 0.48,
        publishedAt,
        lockedAt: match.kickoffAt,
        modelVersion: def.modelVersion,
        status: "postponed",
        settlementOutcome: null,
        settledAt: null,
        sourceMetadata: "demo-seed",
        createdAt: publishedAt,
        updatedAt: publishedAt,
      });
    }
  }

  cached = {
    competitions: COMPETITIONS,
    teams: TEAMS,
    profiles,
    matches,
    predictions,
    bettingRecords,
    generatedAt: now.toISOString(),
  };
  return cached;
}

/** Reset cache — used in tests. */
export function resetDemoWorldCache() {
  cached = null;
}

function pickSelection(market: MarketType, rng: () => number): string {
  if (market === "match_result") {
    const options = ["home", "draw", "away"];
    return options[Math.floor(rng() * options.length)];
  }
  if (market === "over_under_2_5") {
    return rng() > 0.5 ? "over_2.5" : "under_2.5";
  }
  if (market === "both_teams_to_score") {
    return rng() > 0.5 ? "btts_yes" : "btts_no";
  }
  return rng() > 0.5 ? "home_or_draw" : "away_or_draw";
}

function actualMatchResult(match: FootballMatch): "home" | "draw" | "away" {
  const hs = match.homeScore ?? 0;
  const as = match.awayScore ?? 0;
  if (hs > as) return "home";
  if (hs < as) return "away";
  return "draw";
}

function settleSelection(
  market: MarketType,
  match: FootballMatch,
  selection: string,
): "win" | "loss" {
  if (market === "match_result") {
    return selection === actualMatchResult(match) ? "win" : "loss";
  }
  if (market === "over_under_2_5") {
    const total = (match.homeScore ?? 0) + (match.awayScore ?? 0);
    const over = total > 2.5;
    return (selection === "over_2.5") === over ? "win" : "loss";
  }
  if (market === "both_teams_to_score") {
    const yes = (match.homeScore ?? 0) > 0 && (match.awayScore ?? 0) > 0;
    return (selection === "btts_yes") === yes ? "win" : "loss";
  }
  const result = actualMatchResult(match);
  if (selection === "home_or_draw") {
    return result === "home" || result === "draw" ? "win" : "loss";
  }
  return result === "away" || result === "draw" ? "win" : "loss";
}

/** Pick a selection that settles to the desired win/loss when possible. */
function pickSelectionForOutcome(
  market: MarketType,
  match: FootballMatch,
  wantWin: boolean,
  rng: () => number,
): string {
  const candidates =
    market === "match_result"
      ? ["home", "draw", "away"]
      : market === "over_under_2_5"
        ? ["over_2.5", "under_2.5"]
        : market === "both_teams_to_score"
          ? ["btts_yes", "btts_no"]
          : ["home_or_draw", "away_or_draw"];

  const matching = candidates.filter(
    (sel) => (settleSelection(market, match, sel) === "win") === wantWin,
  );
  if (matching.length === 0) return candidates[Math.floor(rng() * candidates.length)];
  return matching[Math.floor(rng() * matching.length)];
}

function tipNoteFor(
  market: MarketType,
  home: string,
  away: string,
  selection: string,
  salt: number,
): string {
  const base = TIP_NOTES[salt % TIP_NOTES.length];
  if (market === "match_result" && selection === "home") {
    return `${base} Tip: ${home} win.`;
  }
  if (market === "match_result" && selection === "away") {
    return `${base} Tip: ${away} win.`;
  }
  if (market === "match_result" && selection === "draw") {
    return `${base} Tip: draw between ${home} and ${away}.`;
  }
  if (selection === "over_2.5") {
    return `${base} Tip: over 2.5 in ${home} vs ${away}.`;
  }
  if (selection === "under_2.5") {
    return `${base} Tip: under 2.5 in ${home} vs ${away}.`;
  }
  if (selection === "btts_yes") {
    return `${base} Tip: BTTS yes.`;
  }
  if (selection === "btts_no") {
    return `${base} Tip: BTTS no.`;
  }
  if (selection === "home_or_draw") {
    return `${base} Tip: ${home} double chance.`;
  }
  return `${base} Tip: ${away} double chance.`;
}

export function getCompetitions() {
  return COMPETITIONS;
}

export function getTeams() {
  return TEAMS;
}
