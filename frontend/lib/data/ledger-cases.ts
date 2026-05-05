import type { Case, Volume } from '@/types/ledger'

// ============================================================================
// THE LEDGER — Master Content Array
// ============================================================================
// Every case the user can open lives here. v1 ships with case 035 (LEH-08)
// fully populated to match the reference image; everything else is stubbed
// with real metadata but `coming-soon` / `locked` status.
// ============================================================================

export const VOLUMES: Volume[] = [
  { id: 'I',   name: 'Foundations', tagline: 'Learn the language before you speak it.',         firstCase: 1,   lastCase: 24,  defaultEntry: 1   },
  { id: 'II',  name: 'Drills',      tagline: 'Ten exercises. One skill each. Master them.',     firstCase: 25,  lastCase: 34,  defaultEntry: 25  },
  { id: 'III', name: 'Crises',      tagline: 'Every crash is a textbook. Trade them.',          firstCase: 35,  lastCase: 54,  defaultEntry: 35  },
  { id: 'IV',  name: 'Patterns',    tagline: 'Charts repeat. Learn to read them.',              firstCase: 55,  lastCase: 74,  defaultEntry: 55  },
  { id: 'V',   name: 'Profiles',    tagline: 'The minds that bent the market.',                 firstCase: 75,  lastCase: 94,  defaultEntry: 75  },
  { id: 'VI',  name: 'Mastery',     tagline: 'Earned, not given.',                              firstCase: 95,  lastCase: 110, defaultEntry: 95  },
]

// ─── Volume I — 24 Lecture Cases ─────────────────────────────
const VOL_I_TITLES = [
  'What Is a Stock?',                      // 1
  'How Stocks Are Priced',                 // 2
  'Reading Candlestick Charts',            // 3
  'Bid, Ask, and the Spread',              // 4
  'Understanding Volume',                  // 5
  'What Moves Markets',                    // 6
  'The Order Book',                        // 7
  'Reading the Tape',                      // 8
  'Sectors and Why They Matter',           // 9
  'How News Moves Prices',                 // 10
  'Bull and Bear Markets',                 // 11
  'Time Horizons',                         // 12
  'Risk vs. Reward',                       // 13
  'Position Sizing',                       // 14
  'Stop Losses Explained',                 // 15
  'Diversification',                       // 16
  'The Three Trader Mindsets',             // 17
  'Common Cognitive Biases',               // 18
  'Reading a Balance Sheet',               // 19
  'P/E Ratio in Plain English',            // 20
  'Earnings Reports & Surprises',          // 21
  'Macro Forces — Rates, Oil, Currency',   // 22
  'How Crises Unfold',                     // 23
  'Putting It Together',                   // 24
]

const volILectures: Case[] = VOL_I_TITLES.map((title, i) => ({
  id: `V${(i + 1).toString().padStart(3, '0')}`,
  number: i + 1,
  volume: 'I',
  type: 'lecture',
  title,
  status: 'coming-soon',
  videoId: null,
  durationMin: 5 + Math.floor(Math.random() * 5),
  takeaways: [
    'The core idea you should walk away with.',
    'Why this matters in a real trading session.',
    'One concrete example to remember.',
  ],
}))

// ─── Volume II — 10 Drill Cases ──────────────────────────────
const VOL_II_DRILLS = [
  { title: 'Tape Reader',          concept: 'Order flow & momentum',     mechanic: 'Predict the next 10 ticks up or down.' },
  { title: 'Candle Decoder',       concept: 'Candlestick patterns',      mechanic: 'Match each candle to its pattern name.' },
  { title: 'News Reflex',          concept: 'Headline interpretation',   mechanic: 'A headline drops. You have 3 seconds to choose BUY/SELL/HOLD.' },
  { title: 'Sector Web',           concept: 'Macro causation',           mechanic: 'A macro event fires. Pick which sectors win and lose.' },
  { title: 'Balance Sheet Triage', concept: 'Fundamentals',              mechanic: 'A 1-page financial. Healthy or sick? You decide.' },
  { title: 'Indicator Lab',        concept: 'Technical analysis',        mechanic: 'Drag RSI, MACD, BB onto a chart. Spot divergence.' },
  { title: 'Risk Slider',          concept: 'Position sizing',           mechanic: 'Adjust position sizes. See your drawdown.' },
  { title: 'Diamond Hand Test',    concept: 'Emotional discipline',      mechanic: 'A flash crash hits. Hold, or panic-sell?' },
  { title: 'Spread the Bet',       concept: 'Diversification',           mechanic: 'Allocate ₹10,000 across 6 stocks. Run a Monte Carlo.' },
  { title: 'The Earnings Whisper', concept: 'Expectations',              mechanic: 'Pre-earnings. Predict beat / miss / inline + reaction.' },
]

const volIIDrills: Case[] = VOL_II_DRILLS.map((d, i) => ({
  id: `D${(i + 1).toString().padStart(3, '0')}`,
  number: 25 + i,
  volume: 'II',
  type: 'drill',
  title: d.title,
  status: 'coming-soon',
  concept: d.concept,
  mechanic: d.mechanic,
}))

// ─── Volume III — Simulation Cases (COV-20 is THE HERO — first build target) ──
const volIIISimulations: Case[] = [
  // ★ Case 035 — fully populated, unlocked. The first simulation we ship.
  {
    id: 'COV-20',
    number: 35,
    volume: 'III',
    type: 'simulation',
    title: 'Covid Day Zero',
    status: 'unread',
    date: '09 MARCH 2020',
    difficulty: 3,
    durationMin: 8,
    reward: { xp: 380, rules: 3 },
    hookLine: 'Italy is in lockdown. Oil collapsed overnight on the Saudi-Russia price war. The WHO is hours from declaring a pandemic.',
    body: 'You have ₹1,00,000 and 60 seconds to allocate it across 6 Indian stocks. Then the bell rings. Three news events will fire. One flash crash will test your nerve. By 3:30 PM the world will have changed forever — and so will your wallet.',
    clippingHeadline: 'WHO SIGNALS GLOBAL PANDEMIC IMMINENT. OIL CRASHES 25% OVERNIGHT.',
    operativeTags: ['PANDEMIC', 'OIL SHOCK', 'FLASH CRASH', '★★★ DIFFICULTY'],
    tags: ['pandemic', '2020'],
  },
  {
    id: 'LEH-08',
    number: 36,
    volume: 'III',
    type: 'simulation',
    title: 'The Lehman Collapse',
    status: 'coming-soon',
    date: '15 SEPTEMBER 2008',
    difficulty: 4,
    durationMin: 8,
    reward: { xp: 450, rules: 3 },
    hookLine: 'September 15, 2008. The largest bankruptcy in U.S. history is hours away.',
    body: 'Treasury has declined to backstop the bid. By tomorrow morning the world\'s largest investment bank will file. The market doesn\'t know yet. You do.',
    clippingHeadline: 'BANK FILES FOR CHAPTER 11. LARGEST BANKRUPTCY IN U.S. HISTORY.',
    operativeTags: ['FINANCIAL CRISIS', 'CONTAGION', 'LIQUIDITY EVENT', '★★★★ DIFFICULTY'],
    tags: ['banking', 'crisis', '2008'],
  },
  {
    id: 'GME-21',
    number: 37,
    volume: 'III',
    type: 'simulation',
    title: 'The Squeeze',
    status: 'coming-soon',
    date: '27 JANUARY 2021',
    difficulty: 4,
    durationMin: 8,
    reward: { xp: 420, rules: 2 },
    hookLine: 'Wall Street shorted 140% of the float. Reddit noticed.',
    clippingHeadline: 'BROKERS HALT BUYING AS RETAIL SQUEEZES HEDGE FUNDS.',
    operativeTags: ['SHORT SQUEEZE', 'LIQUIDITY HALT', 'RETAIL FRENZY', '★★★★ DIFFICULTY'],
    tags: ['frenzy', '2021'],
  },
  {
    id: 'BRX-16',
    number: 38,
    volume: 'III',
    type: 'simulation',
    title: 'Brexit Night',
    status: 'coming-soon',
    date: '23 JUNE 2016',
    difficulty: 3,
    durationMin: 8,
    reward: { xp: 380, rules: 2 },
    hookLine: 'The poll said Remain. The vote said Leave. The pound disagreed.',
    clippingHeadline: 'STERLING COLLAPSES 11% OVERNIGHT ON LEAVE VOTE.',
    operativeTags: ['CURRENCY', 'POLITICAL SHOCK', 'OVERNIGHT', '★★★ DIFFICULTY'],
    tags: ['geopol', '2016'],
  },
  {
    id: 'SVB-23',
    number: 39,
    volume: 'III',
    type: 'simulation',
    title: 'SVB Bank Run',
    status: 'coming-soon',
    date: '10 MARCH 2023',
    difficulty: 3,
    durationMin: 8,
    reward: { xp: 380, rules: 2 },
    hookLine: 'A Twitter-speed bank run. 48 hours from solvent to seized.',
    clippingHeadline: 'SILICON VALLEY BANK SEIZED BY FDIC.',
    operativeTags: ['BANK RUN', 'TECH CONTAGION', 'REGIONALS', '★★★ DIFFICULTY'],
    tags: ['banking', '2023'],
  },
  {
    id: 'FLC-10',
    number: 40,
    volume: 'III',
    type: 'simulation',
    title: 'Flash Crash',
    status: 'locked',
    date: '06 MAY 2010',
    difficulty: 5,
    durationMin: 8,
    reward: { xp: 600, rules: 3 },
    hookLine: 'A single algorithm. A 9% drop in 36 minutes. Then recovery.',
    clippingHeadline: 'DOW DROPS 1,000 POINTS IN MINUTES. ALGORITHMS BLAMED.',
    operativeTags: ['ALGO CASCADE', 'LIQUIDITY VOID', 'CIRCUIT BREAKER', '★★★★★ DIFFICULTY'],
    tags: ['algo', '2010'],
  },
  {
    id: 'BSC-08',
    number: 41,
    volume: 'III',
    type: 'simulation',
    title: 'Bear Stearns Run',
    status: 'locked',
    date: '16 MARCH 2008',
    difficulty: 4,
    durationMin: 8,
    reward: { xp: 450, rules: 2 },
    hookLine: 'JPMorgan offers $2 a share. The first domino falls.',
    clippingHeadline: 'BEAR STEARNS COLLAPSES IN WEEKEND DEAL.',
    operativeTags: ['BANK RUN', 'CRISIS PRELUDE', 'CONTAGION', '★★★★ DIFFICULTY'],
    tags: ['banking', '2008'],
  },
  {
    id: 'BLK-87',
    number: 42,
    volume: 'III',
    type: 'simulation',
    title: 'Black Monday',
    status: 'locked',
    date: '19 OCTOBER 1987',
    difficulty: 5,
    durationMin: 8,
    reward: { xp: 700, rules: 3 },
    hookLine: 'The largest single-day drop in market history. 22.6%.',
    clippingHeadline: 'DOW JONES PLUNGES 508 POINTS — WORST DAY EVER.',
    operativeTags: ['HISTORIC CRASH', 'PORTFOLIO INSURANCE', 'PANIC', '★★★★★ DIFFICULTY'],
    tags: ['crash', '1987'],
  },
  // Stub fillers for remaining Vol III slots
  ...Array.from({ length: 12 }, (_, i): Case => ({
    id: `SIM-${43 + i}`,
    number: 43 + i,
    volume: 'III',
    type: 'simulation',
    title: 'Future Case',
    status: 'locked',
    date: 'TBD',
    difficulty: 3,
    durationMin: 8,
    reward: { xp: 300, rules: 2 },
    hookLine: 'A historical day. Coming soon.',
    clippingHeadline: 'THE ARCHIVE CONTINUES TO GROW.',
    operativeTags: ['LOCKED', '★★★ DIFFICULTY'],
  })),
]

// ─── Volume IV — Pattern Analysis (5 stubs) ─────────────────
const VOL_IV_PATTERNS = [
  'Head and Shoulders',
  'Double Top / Double Bottom',
  'Bull Flag',
  'Cup and Handle',
  'Wedges and Triangles',
]
const volIVAnalysis: Case[] = VOL_IV_PATTERNS.map((pattern, i) => ({
  id: `PAT-${(i + 1).toString().padStart(3, '0')}`,
  number: 55 + i,
  volume: 'IV',
  type: 'analysis',
  title: pattern,
  status: 'locked',
  pattern,
  bodyMd: 'Pattern analysis content forthcoming.',
}))

// ─── Volume V — Trader Profiles (5 stubs) ───────────────────
const VOL_V_TRADERS = [
  { trader: 'Jesse Livermore',     lifespan: '1877–1940', pullQuote: 'There is nothing new in Wall Street.' },
  { trader: 'Warren Buffett',      lifespan: '1930–',     pullQuote: 'Risk comes from not knowing what you\'re doing.' },
  { trader: 'George Soros',        lifespan: '1930–',     pullQuote: 'Markets are constantly in a state of uncertainty and flux.' },
  { trader: 'Ray Dalio',           lifespan: '1949–',     pullQuote: 'Pain + Reflection = Progress.' },
  { trader: 'Stanley Druckenmiller', lifespan: '1953–',   pullQuote: 'The way to build long-term returns is preservation and home runs.' },
]
const volVProfiles: Case[] = VOL_V_TRADERS.map((t, i) => ({
  id: `PRF-${(i + 1).toString().padStart(3, '0')}`,
  number: 75 + i,
  volume: 'V',
  type: 'profile',
  title: t.trader,
  status: 'unread',
  trader: t.trader,
  lifespan: t.lifespan,
  pullQuote: t.pullQuote,
  bodyMd: 'Biography content forthcoming.',
}))

// ─── Volume VI — Mastery achievements (3 stubs) ─────────────
const volVIAchievements: Case[] = [
  { id: 'ACH-001', number: 95, volume: 'VI', type: 'achievement', title: 'First Blood',     status: 'locked', description: 'Complete your first simulation.' },
  { id: 'ACH-002', number: 96, volume: 'VI', type: 'achievement', title: 'Diamond Hands',  status: 'locked', description: 'Hold through a flash crash.' },
  { id: 'ACH-003', number: 97, volume: 'VI', type: 'achievement', title: 'Pattern Hunter', status: 'locked', description: 'Identify 5 chart patterns correctly.' },
]

// ─── Master export — sorted by case number ──────────────────
export const LEDGER_CASES: Case[] = [
  ...volILectures,
  ...volIIDrills,
  ...volIIISimulations,
  ...volIVAnalysis,
  ...volVProfiles,
  ...volVIAchievements,
].sort((a, b) => a.number - b.number)

// Helpers
export function getCase(num: number): Case | undefined {
  return LEDGER_CASES.find(c => c.number === num)
}

export function getCaseById(id: string): Case | undefined {
  return LEDGER_CASES.find(c => c.id === id)
}

export function getVolumeForCase(caseNumber: number): Volume | undefined {
  return VOLUMES.find(v => caseNumber >= v.firstCase && caseNumber <= v.lastCase)
}
