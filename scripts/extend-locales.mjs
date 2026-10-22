import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, "..", "src", "i18n");

const enExtra = {
  common: {
    human: "Human",
    ai: "AI",
    all: "All",
    win: "Win",
    loss: "Loss",
    void: "Void",
    pending: "Pending",
    previous: "Previous",
    next: "Next",
    apply: "Apply",
    applyFilters: "Apply filters",
    search: "Search",
    viewProfile: "View profile →",
    viewDetails: "View Details",
    settled: "settled",
    model: "model",
    locked: "Locked",
    rank: "Rank",
    profile: "Profile",
    record: "Record",
    accuracy: "Accuracy",
    roi: "ROI",
    form: "Form",
    na: "n/a",
    vs: "vs",
  },
  leaderboardPage: {
    title: "Football Leaderboard",
    subtitle:
      "Rankings are computed from settled predictions over the selected period. Profiles need at least 10 win/loss settlements to be eligible. Profitability ranking only appears when unit stakes and odds were recorded — accuracy alone never implies profit.",
    publicProfiles: "{count} public profiles",
    searchPlaceholder: "Name, handle, specialty…",
    creatorType: "Creator type",
    timeRange: "Time range",
    rankingMetric: "Ranking metric",
    competition: "Competition",
    allCompetitions: "All competitions",
    metricDefault: "Default (sample-adjusted accuracy)",
    metricAccuracy: "Accuracy",
    metricRecent: "Recent form window",
    metricProfit: "Profitability (betting records)",
    emptyTitle: "No profiles match",
    emptyHint: "Try clearing search or widening the creator-type filter.",
    noBetting: "No betting records",
    netProfitRef: "Net profit reference (when available):",
    bettingOnly: "shown only for profiles with betting records",
    noRecent: "No recent results",
    recentForm: "Recent form {form}",
    name: "Name",
    type: "Type",
    focus: "Focus",
    trend: "Trend",
    topAi: "Top AI models",
    topAiSubtitle: "Highest accuracy AI predictors right now",
    filterAi: "Filter AI →",
  },
  matchesPage: {
    title: "Upcoming matches",
    subtitle: "Upcoming fixtures from the current data source.",
    empty: "No upcoming matches available.",
    viewAll: "View all matches →",
  },
  aiModelsPage: {
    title: "AI Models",
    subtitle:
      "Statistical and machine-learning predictors ranked with the same settlement rules as human tipsters.",
    empty: "No AI profiles available.",
    model: "Model",
    version: "Version",
    settled: "Settled",
  },
  howPage: {
    title: "How rankings work",
    intro:
      "Documented rules for how tipsters and AI models are ranked on Yibelalet.",
    step1Title: "Predictions locked before kickoff",
    step1Body:
      "Every tip is timestamped. After kickoff, selections cannot be silently edited.",
    step2Title: "Identical rules for humans and AI",
    step2Body:
      "The same settlement and ranking formulas apply to every profile type.",
    step3Title: "Minimum sample size",
    step3Body:
      "Profiles need enough settled win/loss tips in the selected period to rank confidently.",
    step4Title: "Accuracy is not profit",
    step4Body:
      "Accuracy measures forecast correctness. Profit and ROI need recorded odds and stakes.",
    step5Title: "Transparent history",
    step5Body:
      "Open and settled tips stay visible so anyone can inspect the full record.",
  },
  profile: {
    share: "Share profile",
    linkCopied: "Profile link copied",
    copyFailed: "Unable to copy link",
    rankHash: "Rank #{rank}",
    joined: "Joined {date}",
    modelLabel: "Model:",
    paymentVerified: "Payment verified — betting tips are unlocked.",
    paymentIssue: "Subscription payment issue:",
    netProfit: "Net profit",
    netProfitTip:
      "Requires recorded stakes, odds, and settlement. Subscribe to unlock betting details.",
    subscribeUnlock: "Subscribe to unlock",
    noBetting: "No betting records",
    roiTip: "Net return divided by total stake units on settled betting records.",
    winLossVoid: "Win–loss–void",
    winLossVoidTip:
      "Settled outcomes. Draws are wins when the published three-way selection was draw.",
    settledPredictions: "Settled predictions",
    settledTip: "Count of settled or void predictions in the ranking period.",
    accuracyTip: "Wins ÷ (wins + losses). Voids and pushes excluded.",
    avgProbBrier: "Avg. probability / Brier",
    avgProbTip:
      "Average published selection probability and Brier score (lower is better) when probabilities exist.",
    insufficientSample:
      "Insufficient sample for confident ranking (needs at least {min} settled win/loss predictions in the selected period).",
    aboutMethod: "About & methodology",
    noMethod: "No methodology description available.",
    openPredictions: "Open predictions",
    lockedAtKickoff:
      "Locked at kickoff — selections cannot be silently replaced after cutoff.",
    noOpen: "No upcoming predictions for this profile.",
    kickoff: "Kickoff",
    market: "Market",
    selection: "Selection",
    probability: "Probability",
    oddsStake: "Odds / stake",
    historical: "Historical predictions",
    tips: "Tips",
    calendar: "Calendar",
    table: "Table",
    from: "From",
    to: "To",
    competition: "Competition",
    result: "Result",
    filterHistory: "Filter history",
    noSettledFilters: "No settled tips for these filters.",
    prob: "Prob",
    tipsPage: "{count} tips · page {page}",
    calendarHint: "Click a day to see the tips they posted that date.",
    tipSingular: "{count} tip",
    tipPlural: "{count} tips",
    selectDay: "Select a highlighted day to see tips posted that date.",
    tipsPostedOn: "Tips posted on {date}",
    noTipsDay: "No tips were posted on this date.",
    posted: "Posted {time}",
    match: "Match",
    odds: "Odds",
    score: "Score",
    outcome: "Outcome",
    pl: "P/L",
    noHistoryFilters: "No prediction history for these filters.",
    recordsPage: "{count} records · page {page}",
    profitTrend: "Profit trend",
    accuracyTrend: "Accuracy trend",
    profitTrendDesc: "Cumulative net profit in stake units from settled betting records.",
    accuracyTrendDesc: "Rolling accuracy from settled win/loss tips in the selected range.",
    week: "Week",
    month: "Month",
    year: "Year",
    allTime: "All time",
    notEnoughData: "Not enough settled data for this range.",
    settledInRange: "Settled predictions in range: {count}",
    byCompetition: "By competition",
    byMarket: "By market",
    noBreakdown: "No settled breakdown yet.",
    smallSample: " · small sample",
    related: "Related profiles",
    relatedHint:
      "Based on shared competitions or creator type — not a claim of superior skill.",
    bettingLocked: "Betting locked · subscribe",
    oddsLabel: "Odds {odds}",
    predictionOnly: "Prediction record only",
    backLeaderboard: "Back to leaderboard",
    couldNotLoad: "Could not load profile",
    mon: "Mon",
    tue: "Tue",
    wed: "Wed",
    thu: "Thu",
    fri: "Fri",
    sat: "Sat",
    sun: "Sun",
  },
  heroExtra: {
    homeWin: "Home win",
    draw: "Draw",
    awayWin: "Away win",
    previousMatch: "Previous match",
    nextMatch: "Next match",
    showMatch: "Show match {n}",
    publishedProb: "Published probability",
    sampleTip: "Sample from demo open tip · not a live bookmaker market.",
  },
  legal: {
    privacyTitle: "Privacy",
    privacyBody:
      "Yibelalet stores account and usage data needed to operate football prediction analytics, including phone authentication and subscription status. We do not sell personal data.",
    termsTitle: "Terms",
    termsBody1:
      "Yibelalet provides prediction analytics for informational purposes. Rankings and tip histories are not betting advice.",
    termsBody2:
      "Accuracy metrics describe historical forecast performance and do not guarantee future results or betting profit.",
    contactTitle: "Contact",
    contactBody:
      "For product questions about Yibelalet football prediction analytics, email",
  },
  errors: {
    notFoundTitle: "Profile not found",
    notFoundBody: "That predictor slug does not exist or is not public.",
    backLeaderboard: "Back to leaderboard",
  },
};

// Keep reviewed Amharic translations in the dictionary instead of duplicating them here.
const amExtra = JSON.parse(fs.readFileSync(path.join(dir, "am.json"), "utf8"));

function merge(base, extra) {
  const out = { ...base };
  for (const [k, v] of Object.entries(extra)) {
    out[k] = { ...v, ...(base[k] || {}) };
  }
  return out;
}

const en = merge(JSON.parse(fs.readFileSync(path.join(dir, "en.json"), "utf8")), enExtra);
const am = merge(JSON.parse(fs.readFileSync(path.join(dir, "am.json"), "utf8")), amExtra);

fs.writeFileSync(path.join(dir, "en.json"), JSON.stringify(en, null, 2) + "\n", "utf8");
fs.writeFileSync(path.join(dir, "am.json"), JSON.stringify(am, null, 2) + "\n", "utf8");
console.log("extended locales", Object.keys(enExtra).join(", "));
