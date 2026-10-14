import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "..", "src", "i18n");

const en = {
  nav: {
    rankings: "Rankings",
    matches: "Matches",
    methodology: "Methodology",
    about: "About",
    faq: "FAQ",
    leaderboard: "Leaderboard",
    aiModels: "AI Models",
    howItWorks: "How it works",
    signIn: "Sign in",
    register: "Register",
    mobile: "Mobile",
    footer: "Footer",
    legal: "Legal",
  },
  hero: {
    eyebrow: "Football prediction analytics",
    titleBefore: "Know who gets it",
    titleAccent: "right",
    subtitle:
      "Rank tipsters and AI models by recorded football predictions \u2014 locked before kickoff, settled after the final whistle.",
    exploreRankings: "Explore rankings",
    howRankingsWork: "How rankings work",
  },
  stats: {
    publicProfiles: "Public profiles",
    publicProfilesDetail: "Tipsters and models with tracked prediction histories.",
    predictorTypes: "Predictor types",
    predictorTypesDetail: "Humans and AI ranked with identical settlement rules.",
    lockedTips: "Locked tips",
    lockedTipsDetail: "No edits after kickoff. No silent backdating.",
    sportFocus: "Sport focus",
    sportFocusDetail: "Built only for football match prediction analytics.",
  },
  leaderboard: {
    title: "The leaderboard",
    subtitle: "Compare tipsters and AI models. View profile requires sign-in.",
    viewAll: "View all {count} profiles \u2192",
    searchPlaceholder: "Search name or handle\u2026",
    all: "All",
    human: "Human",
    ai: "AI",
    range7d: "7 days",
    range30d: "30 days",
    range90d: "90 days",
    rangeAll: "All time",
    accuracy: "Accuracy",
    default: "Default",
    recentForm: "Recent form",
    profitability: "Profitability",
    apply: "Apply",
    empty: "No profiles match these filters.",
    timeRange: "Time range",
    rankingMetric: "Ranking metric",
    creatorType: "Creator type",
    search: "Search",
  },
  matches: {
    title: "Upcoming matches",
    previous: "Previous matches",
    next: "Next matches",
  },
  activity: {
    title: "Recent settlements",
    subtitle: "Latest win/loss tips across the board",
    wins: "{count} wins",
    win: "{count} win",
    losses: "{count} losses",
    loss: "{count} loss",
    predictor: "Predictor",
    match: "Match",
    selection: "Selection",
    result: "Result",
    when: "When",
  },
  how: {
    title: "Methodology",
    subtitle: "Documented rules behind the leaderboard.",
    fullDocs: "Full docs \u2192",
    step1Eyebrow: "Step 01",
    step1Title: "Predictions before kickoff",
    step1Body:
      "Each tip is timestamped and locked at kickoff \u2014 no silent edits after the cutoff.",
    step2Eyebrow: "Step 02",
    step2Title: "Same scoring for everyone",
    step2Body:
      "Human tipsters and AI models use identical settlement rules and ranking formulas.",
    step3Eyebrow: "Step 03",
    step3Title: "Sample size matters",
    step3Body:
      "At least {min} settled win/loss tips in the selected period to rank. Smaller samples stay visible but marked insufficient.",
    step4Eyebrow: "Step 04",
    step4Title: "Accuracy vs profit",
    step4Body:
      "Accuracy is always shown from settled tips. Profit and ROI appear only when betting records exist.",
  },
  about: {
    title: "About",
    subtitle:
      "Why our rankings are trustworthy \u2014 recorded performance, not highlight reels.",
    item1Title: "Verified records",
    item1Body:
      "Every prediction is timestamped before kickoff and locked \u2014 no silent edits after the cutoff.",
    item2Title: "Fair comparison",
    item2Body:
      "The same scoring rules and minimum sample size apply to every human tipster and AI model.",
    item3Title: "Full transparency",
    item3Body:
      "Explore accuracy, calibration, sample size, and performance over time after you sign in.",
  },
  faq: {
    eyebrow: "FAQ",
    title: "Get all your questions answered here",
    subtitle:
      "Straight answers about demonstration data, sign-in access, and how rankings are scored.",
    cta: "Sign in to explore \u2192",
    q1: "Is this real tipster performance?",
    a1: "The public build ships with labeled demonstration data so you can explore rankings and profiles. When live feeds are connected, demo rows stay clearly marked.",
    q2: "Why do I need to sign in to view a profile?",
    a2: "The leaderboard is public. Full prediction history, charts, and match analysis require an account so usage stays attributable and abuse stays low.",
    q3: "How are rankings calculated?",
    a3: "Settled tips only. Accuracy is wins \u00f7 (wins + losses), with a minimum sample size in the selected period. Human and AI predictors use the same rules.",
    q4: "Does accuracy mean betting profit?",
    a4: "No. Accuracy is forecast correctness. Profit and ROI appear only when betting records with odds and stakes exist for that tip.",
  },
  cta: {
    title: "Find the predictors worth following.",
    subtitle:
      "Explore recorded football forecasts, compare performance, and make your own assessment.",
    explore: "Explore rankings \u2192",
    signIn: "Sign in",
  },
  footer: {
    privacy: "Privacy",
    terms: "Terms",
    contact: "Contact",
    rights: "\u00a9 2026 Yibelalet. All rights reserved.",
    disclaimer: "Accuracy is not betting profit.",
  },
  auth: {
    signIn: "Sign in",
    register: "Register",
    createAccount: "Create account",
    signInHint: "Use the phone number and password from registration.",
    registerHint: "Enter your number, choose a password, then confirm the SMS code.",
    phoneNumber: "Phone number",
    password: "Password",
    confirmPassword: "Confirm password",
    signingIn: "Signing in\u2026",
    sendingCode: "Sending code\u2026",
    continue: "Continue",
    codeSentTo: "Code sent to",
    mockCode: "Mock code:",
    sixDigitCode: "6-digit code",
    verifying: "Verifying\u2026",
    verifyFinish: "Verify and finish",
    editNumber: "Edit number",
    backToLanding: "\u2190 Back to landing",
    mockOtpBanner:
      "Local mock OTP is on. No Twilio needed. Use code {code} after register.",
    pageIntro:
      "Sign in or register with your Ethiopian phone number to open tipster profiles.",
    landingPage: "Landing page",
    loading: "Loading\u2026",
  },
  social: {
    followers: "Followers",
    bettingAccess: "Betting access",
    on: "On",
    off: "Off",
    follow: "Follow",
    following: "Following",
    subscribed: "Subscribed \u00b7 betting unlocked",
    subscribe: "Subscribe \u00b7 {price} ETB",
    subscribedHint: "You can see {name}'s odds, stakes, and betting results.",
    followHint:
      "Follow for free. Subscribe via Chapa to unlock betting tips for {name}.",
    chapaCheckout: "Chapa checkout",
    unlockTips: "Unlock betting tips",
    payFor:
      "Pay {price} ETB for {days} days of odds, stakes, and P/L from {name}.",
    step1: "1. Continue opens the official Chapa payment page.",
    step2: "2. Pay with Telebirr, CBE Birr, card, or other Chapa methods.",
    step3: "3. You return here and betting access unlocks after verification.",
    openingChapa: "Opening Chapa\u2026",
    continueChapa: "Continue to Chapa",
    cancel: "Cancel",
    subscribeUnlock: "Subscribe to unlock",
  },
  lang: {
    switchTo: "Language",
    en: "English",
    am: "Amharic",
  },
};

const am = {
  nav: {
    rankings: "\u12f0\u1228\u1303\u12ce\u127d",
    matches: "\u130d\u1325\u121a\u12eb\u12ce\u127d",
    methodology: "\u12d8\u12f4",
    about: "\u1235\u1208 \u12a5\u129b",
    faq: "\u1323\u12eb\u1244\u12ce\u127d",
    leaderboard: "\u1230\u1295\u1320\u1228\u12dd",
    aiModels: "AI \u121e\u12f4\u120e\u127d",
    howItWorks: "\u12a5\u1295\u12f4\u1275 \u12a5\u1295\u12f0\u121a\u1230\u122b",
    signIn: "\u130d\u1263",
    register: "\u1270\u1218\u12dd\u1308\u1265",
    mobile: "\u121e\u1263\u12ed\u120d",
    footer: "\u130d\u122d\u130c",
    legal: "\u1205\u130b\u12ca",
  },
  hero: {
    eyebrow: "\u12e8\u12a5\u130d\u122d \u12cb\u1235 \u1275\u1295\u1260\u12eb \u1275\u1295\u1270\u1293",
    titleBefore: "\u121b\u1295 \u1275\u12ad\u12ad\u120d",
    titleAccent: "\u12a5\u1295\u12f0\u1206\u1290 \u12ed\u12c8\u1241",
    subtitle:
      "\u1263\u1208\u1219\u12eb\u12ce\u127d\u1295 \u12a5\u1293 AI \u121e\u12f4\u120e\u127d\u1295 \u1260\u1270\u1218\u12d8\u1308\u1261 \u12e8\u12a5\u130d\u122d \u12cb\u1235 \u1275\u1295\u1260\u12eb\u12ce\u127d \u12f0\u122d\u1301 \u2014 \u12a8\u1308\u12cb\u1273 \u1260\u134a\u1275 \u12ed\u1246\u1208\u134b\u1209\u1363 \u12a8\u1218\u1308\u1228\u123b\u12cd \u1349\u12a8\u122b \u1260\u12a9\u120b \u12ed\u1230\u134d\u122b\u1209\u1362",
    exploreRankings: "\u12f0\u1228\u1303\u12ce\u127d\u1295 \u12ed\u1218\u120d\u12a8\u1271",
    howRankingsWork: "\u12f0\u1228\u1303\u12ce\u127d \u12a5\u1295\u12f4\u1275 \u12a5\u1295\u12f0\u121a\u1230\u1229",
  },
  stats: {
    publicProfiles: "\u12e8\u1205\u12dd\u1265 \u1218\u1308\u1208\u132b\u12ce\u127d",
    publicProfilesDetail:
      "\u12e8\u1270\u12a8\u1273\u1270\u1209 \u1275\u1295\u1260\u12eb \u1273\u122a\u12ad \u12eb\u120b\u1278\u12cd \u1263\u1208\u1219\u12eb\u12ce\u127d \u12a5\u1293 \u121e\u12f4\u120e\u127d\u1362",
    predictorTypes: "\u12e8\u1275\u1295\u1260\u12eb \u12d3\u12ed\u1290\u1276\u127d",
    predictorTypesDetail:
      "\u1230\u12ce\u127d \u12a5\u1293 AI \u1260\u1270\u1218\u1233\u1233\u12ed \u12e8\u1230\u1348\u122b \u1205\u130e\u127d \u12ed\u12f0\u1228\u1303\u1209\u1362",
    lockedTips: "\u12e8\u1270\u1246\u1208\u1349 \u1275\u1295\u1260\u12eb\u12ce\u127d",
    lockedTipsDetail:
      "\u12a8\u1308\u12cb\u1273 \u1260\u12a9\u120b \u121b\u1235\u1270\u12ab\u12a8\u12eb \u12e8\u1208\u121d\u1362 \u121d\u1295\u121d \u12e8\u1270\u12f0\u1260\u1240 \u1240\u1295 \u1218\u1240\u12e8\u122d \u12e8\u1208\u121d\u1362",
    sportFocus: "\u12e8\u1235\u1356\u122d\u1275 \u1275\u12a9\u1228\u1275",
    sportFocusDetail:
      "\u1208\u12a5\u130d\u122d \u12cb\u1235 \u1275\u1295\u1260\u12eb \u1275\u1295\u1270\u1293 \u1265\u127b \u12e8\u1270\u1230\u122b\u1362",
  },
  leaderboard: {
    title: "\u12e8\u12f0\u1228\u1303 \u1230\u1295\u1320\u1228\u12dd",
    subtitle:
      "\u1263\u1208\u1219\u12eb\u12ce\u127d\u1295 \u12a5\u1293 AI \u121e\u12f4\u120e\u127d\u1295 \u12eb\u1290\u133b\u133d\u1229\u1362 \u1218\u1308\u1208\u132b \u1208\u121b\u12e8\u1275 \u1218\u130d\u1263\u1275 \u12eb\u1235\u1348\u120d\u130b\u120d\u1362",
    viewAll: "\u1201\u1209\u1295\u121d {count} \u1218\u1308\u1208\u132b\u12ce\u127d \u12ed\u1218\u120d\u12a8\u1271 \u2192",
    searchPlaceholder: "\u1235\u121d \u12c8\u12ed\u121d \u1203\u1295\u12f5\u120d \u1348\u120d\u130d\u2026",
    all: "\u1201\u1209\u121d",
    human: "\u1230\u12cd",
    ai: "AI",
    range7d: "7 \u1240\u1295",
    range30d: "30 \u1240\u1295",
    range90d: "90 \u1240\u1295",
    rangeAll: "\u1201\u1209\u121d \u130a\u12dc",
    accuracy: "\u1275\u12ad\u12ad\u1208\u129b\u1290\u1275",
    default: "\u1290\u1263\u122a",
    recentForm: "\u12e8\u1245\u122d\u1265 \u1245\u122d\u133d",
    profitability: "\u1275\u122d\u134b\u121b\u1290\u1275",
    apply: "\u1270\u130d\u1265\u122d",
    empty:
      "\u12a8\u12a5\u1290\u12da\u1205 \u121b\u1323\u122a\u12eb\u12ce\u127d \u130b\u122d \u12e8\u121a\u12db\u1218\u12f5 \u1218\u1308\u1208\u132b \u12e8\u1208\u121d\u1362",
    timeRange: "\u12e8\u130a\u12dc \u12ad\u120d\u120d",
    rankingMetric: "\u12e8\u12f0\u1228\u1303 \u1218\u1208\u12ab\u12eb",
    creatorType: "\u12e8\u1348\u1323\u122a \u12d3\u12ed\u1290\u1275",
    search: "\u1348\u120d\u130d",
  },
  matches: {
    title: "\u1218\u132a \u130d\u1325\u121a\u12eb\u12ce\u127d",
    previous: "\u1240\u12f3\u121a \u130d\u1325\u121a\u12eb\u12ce\u127d",
    next: "\u1240\u1323\u12ed \u130d\u1325\u121a\u12eb\u12ce\u127d",
  },
  activity: {
    title: "\u12e8\u1245\u122d\u1265 \u1230\u1348\u122b\u12ce\u127d",
    subtitle:
      "\u1260\u1230\u1295\u1320\u1228\u12d9 \u120b\u12ed \u12e8\u1245\u122d\u1265 \u12a0\u1238\u1293\u134a/\u1270\u1238\u1293\u134a \u1275\u1295\u1260\u12eb\u12ce\u127d",
    wins: "{count} \u12a0\u1238\u1293\u134a\u12ce\u127d",
    win: "{count} \u12a0\u1238\u1293\u134a",
    losses: "{count} \u12aa\u1233\u122b\u12ce\u127d",
    loss: "{count} \u12aa\u1233\u122b",
    predictor: "\u1275\u1295\u1260\u12eb \u1263\u1208\u1219\u12eb",
    match: "\u130d\u1325\u121a\u12eb",
    selection: "\u121d\u122d\u132b",
    result: "\u12cd\u1324\u1275",
    when: "\u1218\u127b",
  },
  how: {
    title: "\u12d8\u12f4",
    subtitle:
      "\u12a8\u1230\u1295\u1320\u1228\u12d9 \u1260\u1235\u1270\u1300\u122d\u1263 \u12eb\u1209 \u12e8\u1270\u1218\u12d8\u1308\u1261 \u1205\u130e\u127d\u1362",
    fullDocs: "\u1219\u1209 \u1230\u1290\u12f6\u127d \u2192",
    step1Eyebrow: "\u12f0\u1228\u1303 01",
    step1Title: "\u12a8\u1308\u12cb\u1273 \u1260\u134a\u1275 \u1275\u1295\u1260\u12eb\u12ce\u127d",
    step1Body:
      "\u12a5\u12eb\u1295\u12f3\u1295\u12f1 \u1275\u1295\u1260\u12eb \u1260\u130a\u12dc \u12ed\u1218\u12d8\u1308\u1263\u120d \u12a5\u1293 \u1260\u1308\u12cb\u1273 \u1218\u1300\u1218\u122a\u12eb \u12ed\u1246\u1208\u134b\u120d \u2014 \u12a8\u130a\u12dc \u1260\u12a9\u120b \u12e8\u1270\u12f0\u1260\u1240 \u121b\u1235\u1270\u12ab\u12a8\u12eb \u12e8\u1208\u121d\u1362",
    step2Eyebrow: "\u12f0\u1228\u1303 02",
    step2Title: "\u1208\u1201\u1209\u121d \u1270\u1218\u1233\u1233\u12ed \u1290\u1325\u1265",
    step2Body:
      "\u12e8\u1230\u12cd \u1263\u1208\u1219\u12eb\u12ce\u127d \u12a5\u1293 AI \u121e\u12f4\u120e\u127d \u1270\u1218\u1233\u1233\u12ed \u12e8\u1230\u1348\u122b \u1205\u130e\u127d \u12a5\u1293 \u12e8\u12f0\u1228\u1303 \u1240\u1218\u122e\u127d \u12ed\u1320\u1240\u121b\u1209\u1362",
    step3Eyebrow: "\u12f0\u1228\u1303 03",
    step3Title: "\u12e8\u1293\u1219\u1293 \u1218\u1320\u1295 \u12a0\u1235\u1348\u120b\u130a \u1290\u12cd",
    step3Body:
      "\u1208\u12f0\u1228\u1303 \u1262\u12eb\u1295\u1235 {min} \u12e8\u1270\u1230\u1348\u1229 \u12a0\u1238\u1293\u134a/\u1270\u1238\u1293\u134a \u1275\u1295\u1260\u12eb\u12ce\u127d \u12eb\u1235\u1348\u120d\u130b\u1209\u1362 \u1275\u1295\u1295\u123d \u1293\u1219\u1293\u12ce\u127d \u12ed\u1273\u12eb\u1209 \u130d\u1295 \u1260\u1242 \u12a0\u12ed\u12f0\u1209\u121d \u1270\u1265\u1208\u12cd \u12ed\u1218\u12d8\u1308\u1263\u1209\u1362",
    step4Eyebrow: "\u12f0\u1228\u1303 04",
    step4Title: "\u1275\u12ad\u12ad\u1208\u129b\u1290\u1275 vs \u1275\u122d\u134d",
    step4Body:
      "\u1275\u12ad\u12ad\u1208\u129b\u1290\u1275 \u1201\u120d\u130a\u12dc \u12a8\u1270\u1230\u1348\u1229 \u1275\u1295\u1260\u12eb\u12ce\u127d \u12ed\u1273\u12eb\u120d\u1362 \u1275\u122d\u134d \u12a5\u1293 ROI \u12e8\u12cd\u122d\u122d\u12f5 \u1218\u12dd\u1308\u1266\u127d \u1232\u1296\u1229 \u1265\u127b \u12ed\u1273\u12eb\u1209\u1362",
  },
  about: {
    title: "\u1235\u1208 \u12a5\u129b",
    subtitle:
      "\u12f0\u1228\u1303\u12ce\u127b\u127d\u1295 \u12e8\u1273\u1218\u1291 \u12e8\u121a\u1206\u1291 \u1260\u1275 \u121d\u12ad\u1295\u12eb\u1275 \u2014 \u12e8\u1270\u1218\u12d8\u1308\u1260 \u12a0\u1348\u133b\u1338\u121d\u1363 \u12e8\u1270\u1218\u1228\u1321 \u1273\u122a\u12ae\u127d \u12a0\u12ed\u12f0\u1208\u121d\u1362",
    item1Title: "\u12e8\u1270\u1228\u130b\u1308\u1321 \u1218\u12dd\u1308\u1266\u127d",
    item1Body:
      "\u12a5\u12eb\u1295\u12f3\u1295\u12f1 \u1275\u1295\u1260\u12eb \u12a8\u1308\u12cb\u1273 \u1260\u134a\u1275 \u1260\u130a\u12dc \u12ed\u1218\u12d8\u1308\u1263\u120d \u12a5\u1293 \u12ed\u1246\u1208\u134b\u120d \u2014 \u12a8\u130a\u12dc \u1260\u12a9\u120b \u12e8\u1270\u12f0\u1260\u1240 \u121b\u1235\u1270\u12ab\u12a8\u12eb \u12e8\u1208\u121d\u1362",
    item2Title: "\u134d\u1275\u1203\u12ca \u1295\u133d\u133d\u122d",
    item2Body:
      "\u1270\u1218\u1233\u1233\u12ed \u12e8\u1290\u1325\u1265 \u1205\u130e\u127d \u12a5\u1293 \u12dd\u1245\u1270\u129b \u12e8\u1293\u1219\u1293 \u1218\u1320\u1295 \u1208\u12a5\u12eb\u1295\u12f3\u1295\u12f1 \u12e8\u1230\u12cd \u1263\u1208\u1219\u12eb \u12a5\u1293 AI \u121e\u12f4\u120d \u12ed\u1230\u122b\u1209\u1362",
    item3Title: "\u1219\u1209 \u130d\u120d\u133d\u1290\u1275",
    item3Body:
      "\u12a8\u1308\u1261 \u1260\u12a9\u120b \u1275\u12ad\u12ad\u1208\u129b\u1290\u1275\u1363 \u121b\u1235\u1270\u12ab\u12a8\u12eb\u1363 \u12e8\u1293\u1219\u1293 \u1218\u1320\u1295 \u12a5\u1293 \u1260\u130a\u12dc \u120b\u12ed \u12eb\u1208 \u12a0\u1348\u133b\u1338\u121d \u12ed\u1218\u120d\u12a8\u1271\u1362",
  },
  faq: {
    eyebrow: "\u1323\u12eb\u1244\u12ce\u127d",
    title: "\u1201\u1209\u1295\u121d \u1323\u12eb\u1244\u12ce\u127d\u12ce\u1295 \u12a5\u12da\u1205 \u12ed\u1218\u120d\u1231",
    subtitle:
      "\u1235\u1208 \u121b\u1233\u12eb \u12cd\u1202\u1265\u1363 \u12e8\u1218\u130d\u1262\u12eb \u1218\u12f3\u1228\u123b \u12a5\u1293 \u12f0\u1228\u1303\u12ce\u127d \u12a5\u1295\u12f4\u1275 \u12a5\u1295\u12f0\u121a\u1230\u1209 \u1240\u1325\u1270\u129b \u1218\u120d\u1236\u127d\u1362",
    cta: "\u1208\u1218\u1218\u120d\u12a8\u1275 \u12ed\u130d\u1261 \u2192",
    q1: "\u12ed\u1205 \u12a5\u12cd\u1290\u1270\u129b \u12e8\u1263\u1208\u1219\u12eb \u12a0\u1348\u133b\u1338\u121d \u1290\u12cd?",
    a1: "\u12e8\u1205\u12dd\u1265 \u1235\u122a\u1271 \u12f0\u1228\u1303\u12ce\u127d\u1295 \u12a5\u1293 \u1218\u1308\u1208\u132b\u12ce\u127d\u1295 \u1208\u1218\u1218\u120d\u12a8\u1275 \u1260\u1270\u1218\u12d8\u1308\u1260 \u121b\u1233\u12eb \u12cd\u1202\u1265 \u12ed\u1218\u1323\u120d\u1362 \u1240\u1325\u1270\u129b \u121d\u1295\u132e\u127d \u1232\u1308\u1293\u12a9 \u12e8\u121b\u1233\u12eb \u1228\u12f5\u134e\u127d \u1260\u130d\u120d\u133d \u12ed\u1273\u12c8\u1243\u1209\u1362",
    q2: "\u1218\u1308\u1208\u132b \u1208\u121b\u12e8\u1275 \u1208\u121d\u1295 \u1218\u130d\u1263\u1275 \u12a0\u1208\u1265\u12ad?",
    a2: "\u1230\u1295\u1320\u1228\u12d9 \u1208\u1205\u12dd\u1265 \u12ad\u134d\u1275 \u1290\u12cd\u1362 \u1219\u1209 \u12e8\u1275\u1295\u1260\u12eb \u1273\u122a\u12ad\u1363 \u1308\u1260\u1273\u12ce\u127d \u12a5\u1293 \u12e8\u130d\u1325\u121a\u12eb \u1275\u1295\u1270\u1293 \u12a0\u12ab\u12cd\u1295\u1275 \u12ed\u1348\u120d\u130b\u1209\u1362",
    q3: "\u12f0\u1228\u1303\u12ce\u127d \u12a5\u1295\u12f4\u1275 \u12ed\u1230\u120b\u1209?",
    a3: "\u12e8\u1270\u1230\u1348\u1229 \u1275\u1295\u1260\u12eb\u12ce\u127d \u1265\u127b\u1362 \u1275\u12ad\u12ad\u1208\u129b\u1290\u1275 = \u12a0\u1238\u1293\u134a\u12ce\u127d \u00f7 (\u12a0\u1238\u1293\u134a\u12ce\u127d + \u12aa\u1233\u122b\u12ce\u127d)\u1363 \u1260\u1270\u1218\u1228\u1320\u12cd \u130a\u12dc \u12dd\u1245\u1270\u129b \u1293\u1219\u1293 \u130b\u122d\u1362 \u1230\u12cd \u12a5\u1293 AI \u1270\u1218\u1233\u1233\u12ed \u1205\u130e\u127d \u12ed\u1320\u1240\u121b\u1209\u1362",
    q4: "\u1275\u12ad\u12ad\u1208\u129b\u1290\u1275 \u121b\u1208\u1275 \u12e8\u12cd\u122d\u122d\u12f5 \u1275\u122d\u134d \u1290\u12cd?",
    a4: "\u12a0\u12ed\u12f0\u1208\u121d\u1362 \u1275\u12ad\u12ad\u1208\u129b\u1290\u1275 \u1275\u1295\u1260\u12eb \u1275\u12ad\u12ad\u120d \u1218\u1206\u1295 \u1290\u12cd\u1362 \u1275\u122d\u134d \u12a5\u1293 ROI \u12e8\u12cd\u122d\u122d\u12f5 \u1218\u12dd\u1308\u1266\u127d \u1232\u1296\u1229 \u1265\u127b \u12ed\u1273\u12eb\u1209\u1362",
  },
  cta: {
    title: "\u1218\u12a8\u1270\u120d \u12e8\u121a\u1308\u1263\u1278\u12cd\u1295 \u1275\u1295\u1260\u12eb \u1263\u1208\u1219\u12eb\u12ce\u127d \u12eb\u130d\u1299\u1362",
    subtitle:
      "\u12e8\u1270\u1218\u12d8\u1308\u1261 \u12e8\u12a5\u130d\u122d \u12cb\u1235 \u1275\u1295\u1260\u12eb\u12ce\u127d\u1295 \u12ed\u1218\u120d\u12a8\u1271\u1363 \u12a0\u1348\u133b\u1338\u121d\u1295 \u12eb\u1290\u133b\u133d\u1229\u1363 \u12e8\u122b\u1235\u12ce\u1295 \u130d\u121d\u1308\u121b \u12eb\u12f5\u122d\u1309\u1362",
    explore: "\u12f0\u1228\u1303\u12ce\u127d\u1295 \u12ed\u1218\u120d\u12a8\u1271 \u2192",
    signIn: "\u130d\u1263",
  },
  footer: {
    privacy: "\u130d\u120b\u12ca\u1290\u1275",
    terms: "\u12cd\u120e\u127d",
    contact: "\u12eb\u130d\u1299\u1295",
    rights:
      "\u00a9 2026 Yibelalet\u1362 \u1218\u1265\u1271 \u1260\u1205\u130d \u12e8\u1270\u1320\u1260\u1240 \u1290\u12cd\u1362",
    disclaimer: "\u1275\u12ad\u12ad\u1208\u129b\u1290\u1275 \u12e8\u12cd\u122d\u122d\u12f5 \u1275\u122d\u134d \u12a0\u12ed\u12f0\u1208\u121d\u1362",
  },
  auth: {
    signIn: "\u130d\u1263",
    register: "\u1270\u1218\u12dd\u1308\u1265",
    createAccount: "\u12a0\u12ab\u12cd\u1295\u1275 \u12ed\u134d\u1320\u1229",
    signInHint:
      "\u1260\u121d\u12dd\u1308\u1263 \u130a\u12dc \u12e8\u1270\u1320\u1240\u1219\u1275\u1295 \u1235\u120d\u12ad \u1241\u1325\u122d \u12a5\u1293 \u12e8\u12ed\u1208\u134d \u1243\u120d \u12ed\u1320\u1240\u1219\u1362",
    registerHint:
      "\u1241\u1325\u122d\u12ce\u1295 \u12eb\u1235\u1308\u1261\u1363 \u12e8\u12ed\u1208\u134d \u1243\u120d \u12ed\u121d\u1228\u1321\u1363 \u12a8\u12da\u12eb \u12e8\u12a4\u1235\u12a4\u121d\u12a4\u1235 \u12ae\u12f5 \u12eb\u1228\u130b\u130d\u1321\u1362",
    phoneNumber: "\u1235\u120d\u12ad \u1241\u1325\u122d",
    password: "\u12e8\u12ed\u1208\u134d \u1243\u120d",
    confirmPassword: "\u12e8\u12ed\u1208\u134d \u1243\u120d \u12eb\u1228\u130b\u130d\u1321",
    signingIn: "\u1260\u1218\u130d\u1263\u1275 \u120b\u12ed\u2026",
    sendingCode: "\u12ae\u12f5 \u1260\u1218\u120b\u12ad \u120b\u12ed\u2026",
    continue: "\u1240\u1325\u120d",
    codeSentTo: "\u12ae\u12f5 \u1270\u120d\u12ae\u12cb\u120d \u12c8\u12f0",
    mockCode: "\u12e8\u121e\u12ad \u12ae\u12f5:",
    sixDigitCode: "6-\u12a0\u1203\u12dd \u12ae\u12f5",
    verifying: "\u1260\u121b\u1228\u130b\u1308\u1325 \u120b\u12ed\u2026",
    verifyFinish: "\u12a0\u1228\u130b\u130d\u1325 \u12a5\u1293 \u1308\u122d\u1235",
    editNumber: "\u1241\u1325\u122d \u12a0\u122d\u1275\u12d5",
    backToLanding: "\u2190 \u12c8\u12f0 \u1218\u1290\u123b \u1270\u1218\u1208\u1235",
    mockOtpBanner:
      "\u12e8\u12a0\u12ab\u1263\u1262 \u121e\u12ad OTP \u1295\u1241 \u1290\u12cd\u1362 Twilio \u12a0\u12eb\u1235\u1348\u120d\u130d\u121d\u1362 \u12a8\u121d\u12dd\u1308\u1263 \u1260\u12a9\u120b \u12ae\u12f5 {code} \u12ed\u1320\u1240\u1219\u1362",
    pageIntro:
      "\u1260\u12a4\u1272\u12ee\u1335\u12eb \u1235\u120d\u12ad \u1241\u1325\u122d \u12ed\u130d\u1261 \u12c8\u12ed\u121d \u12ed\u1218\u12dd\u1308\u1261 \u12a5\u1293 \u12e8\u1263\u1208\u1219\u12eb \u1218\u1308\u1208\u132b\u12ce\u127d\u1295 \u12ed\u12ad\u1348\u1271\u1362",
    landingPage: "\u1218\u1290\u123b \u1308\u133d",
    loading: "\u1260\u1218\u130d\u1240\u121d \u120b\u12ed\u2026",
  },
  social: {
    followers: "\u1270\u12a8\u1273\u12ee\u127d",
    bettingAccess: "\u12e8\u12cd\u122d\u122d\u12f5 \u1218\u12f3\u1228\u123b",
    on: "\u1260\u122d\u1271\u12cb\u120d",
    off: "\u1320\u134d\u1271\u12cb\u120d",
    follow: "\u1270\u12a8\u1270\u120d",
    following: "\u1260\u1218\u12a8\u1270\u120d \u120b\u12ed",
    subscribed: "\u1270\u1218\u12dd\u130d\u1267\u120d \u00b7 \u12cd\u122d\u122d\u12f5 \u1270\u12a8\u134d\u1271\u12cb\u120d",
    subscribe: "\u1270\u1218\u12dd\u1308\u1265 \u00b7 {price} \u1265\u122d",
    subscribedHint:
      "\u12e8{name} \u12a5\u12f5\u120e\u127d\u1363 \u12cd\u122d\u122d\u12f6\u127d \u12a5\u1293 \u12cd\u1324\u1276\u127d \u121b\u12e8\u1275 \u12ed\u127d\u120b\u1209\u1362",
    followHint:
      "\u1260\u1290\u133b \u12ed\u12a8\u1270\u1209\u1362 \u12e8{name} \u12e8\u12cd\u122d\u122d\u12f5 \u121d\u12ad\u122e\u127d\u1295 \u1208\u1218\u12ad\u1348\u1275 \u1260\u127b\u1353 \u12ed\u1218\u12dd\u1308\u1261\u1362",
    chapaCheckout: "\u12e8\u127b\u1353 \u12ad\u134d\u12eb",
    unlockTips: "\u12e8\u12cd\u122d\u122d\u12f5 \u121d\u12ad\u122e\u127d\u1295 \u12ed\u12ad\u1348\u1271",
    payFor:
      "\u12a8{name} \u12a5\u12f5\u120e\u127d\u1363 \u12cd\u122d\u122d\u12f6\u127d \u12a5\u1293 \u1275\u122d\u134d/\u12aa\u1233\u122b \u1208{days} \u1240\u1293\u1275 {price} \u1265\u122d \u12ed\u12ad\u1348\u1209\u1362",
    step1: "1. \u1240\u1325\u120d \u12e8\u127b\u1353 \u12ad\u134d\u12eb \u1308\u133d \u12ed\u12a8\u134d\u1273\u120d\u1362",
    step2:
      "2. \u1260\u1274\u120c\u1265\u122d\u1363 \u1232\u1262\u12a2 \u1265\u122d\u1363 \u12ab\u122d\u12f5 \u12c8\u12ed\u121d \u120c\u120e\u127d \u12e8\u127b\u1353 \u12d8\u12f4\u12ce\u127d \u12ed\u12ad\u1348\u1209\u1362",
    step3:
      "3. \u12c8\u12f0\u12da\u1205 \u12ed\u1218\u1208\u1233\u1209 \u12a5\u1293 \u12a8\u121b\u1228\u130b\u1308\u132b \u1260\u12a9\u120b \u12e8\u12cd\u122d\u122d\u12f5 \u1218\u12f3\u1228\u123b \u12ed\u12a8\u1348\u1273\u120d\u1362",
    openingChapa: "\u127b\u1353 \u1260\u1218\u12ad\u1348\u1275 \u120b\u12ed\u2026",
    continueChapa: "\u12c8\u12f0 \u127b\u1353 \u1240\u1325\u120d",
    cancel: "\u1230\u122d\u12dd",
    subscribeUnlock: "\u1208\u1218\u12ad\u1348\u1275 \u12ed\u1218\u12dd\u1308\u1261",
  },
  lang: {
    switchTo: "\u124b\u1295\u124b",
    en: "English",
    am: "\u12a0\u121b\u122d\u129b",
  },
};

function assertSameShape(a, b, prefix = "") {
  const aKeys = Object.keys(a).sort();
  const bKeys = Object.keys(b).sort();
  if (aKeys.join(",") !== bKeys.join(",")) {
    throw new Error(`Key mismatch at ${prefix || "root"}: ${aKeys} vs ${bKeys}`);
  }
  for (const key of aKeys) {
    const next = prefix ? `${prefix}.${key}` : key;
    if (typeof a[key] === "object" && a[key] !== null) {
      assertSameShape(a[key], b[key], next);
    } else if (typeof a[key] !== "string" || typeof b[key] !== "string") {
      throw new Error(`Non-string at ${next}`);
    }
  }
}

assertSameShape(en, am);

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "en.json"), JSON.stringify(en, null, 2) + "\n", "utf8");
fs.writeFileSync(path.join(outDir, "am.json"), JSON.stringify(am, null, 2) + "\n", "utf8");
fs.writeFileSync(
  path.join(outDir, "dictionaries.ts"),
  `import enJson from "./en.json";
import amJson from "./am.json";

export type Dictionary = typeof enJson;

export const en = enJson;
export const am = amJson as Dictionary;

export const dictionaries: Record<"en" | "am", Dictionary> = {
  en,
  am,
};
`,
  "utf8",
);

console.log("Wrote en.json, am.json, dictionaries.ts");
console.log("Sample AM:", am.nav.rankings, am.hero.titleAccent, am.lang.am);
