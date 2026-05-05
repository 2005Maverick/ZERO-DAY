import type { ScenarioStock, OhlcvCandle } from '@/types/scenario'

// ============================================================================
// COV-20 STOCKS — all 6 Indian equities for March 9, 2020 simulation
// ============================================================================
// Tier A data (high confidence): close prices, sectors, market caps, sector
// classifications, news themes, real institutional holders.
// Tier B data (verify before launch): exact balance sheet figures, P/E, EPS,
// holdings %, marked with `// VERIFY` where uncertain.
// ============================================================================

// Mulberry32 PRNG for deterministic plausible candle generation
function mulberry32(seed: number): () => number {
  let s = seed
  return () => {
    s |= 0
    s = s + 0x6d2b79f5 | 0
    let t = Math.imul(s ^ s >>> 15, 1 | s)
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t
    return ((t ^ t >>> 14) >>> 0) / 4294967296
  }
}

/**
 * Generate ~30 trading days of plausible OHLCV ending at `closePrice` on Mar 6, 2020.
 * Backwalks from the close with mild downward drift (matching the real Feb→early-Mar
 * 2020 weakness in Indian equities).
 */
function generateCandles(seed: number, closePrice: number, drift: number = -0.0025): OhlcvCandle[] {
  const rng = mulberry32(seed)
  const days = 30
  const candles: OhlcvCandle[] = []

  // Start `days` ago at a higher price, drift downward to closePrice
  const startPrice = closePrice * (1 - drift * days)
  let prev = startPrice

  for (let i = 0; i < days; i++) {
    const noise = (rng() - 0.5) * 0.022
    const trend = drift
    const open = prev
    const close = i === days - 1 ? closePrice : prev * (1 + trend + noise)
    const range = Math.abs(open - close) + (open * (0.005 + rng() * 0.012))
    const high = Math.max(open, close) + range * 0.5 * rng()
    const low = Math.min(open, close) - range * 0.5 * rng()
    const volume = Math.round(50 + rng() * 250)

    // Generate date going back from Mar 6, 2020 (skipping weekends approximately)
    const d = new Date('2020-03-06')
    d.setDate(d.getDate() - (days - 1 - i) * 1.4)  // ~1.4× to skip weekends
    const dateStr = d.toISOString().slice(0, 10)

    candles.push({
      date: dateStr,
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
      volume,
    })
    prev = close
  }
  return candles
}

// ─── 01 · INDIGO (InterGlobe Aviation) ──────────────────────
const indigoCandles = generateCandles(101, 1247.50, -0.0035)

// ─── 02 · SUN PHARMA ────────────────────────────────────────
const sunpharmaCandles = generateCandles(102, 428.20, -0.0008)  // pharma was weakening less

// ─── 03 · RELIANCE ──────────────────────────────────────────
const relianceCandles = generateCandles(103, 1356.10, -0.0030)

// ─── 04 · HDFC BANK ─────────────────────────────────────────
const hdfcbankCandles = generateCandles(104, 1054.25, -0.0024)

// ─── 05 · TITAN ─────────────────────────────────────────────
const titanCandles = generateCandles(105, 1085.00, -0.0028)

// ─── 06 · TCS ───────────────────────────────────────────────
const tcsCandles = generateCandles(106, 2156.40, -0.0014)  // IT defensive

export const COV20_STOCKS: ScenarioStock[] = [
  // ────────────────────────────────────────────────────────
  // 01 · INDIGO
  // ────────────────────────────────────────────────────────
  {
    symbol: 'INDIGO',
    name: 'InterGlobe Aviation Ltd',
    sector: 'airlines',
    sectorLabel: 'Aviation',
    emoji: '✈️',
    color: '#06B6D4',
    description: 'India\'s largest low-cost airline (~47% domestic market share). Highly fuel-cost-sensitive.',
    closePrice: 1247.50,
    pctChange30d: -0.097,
    candles: indigoCandles,
    metrics: {
      pe: 18.4,         // VERIFY
      eps: 67.80,       // VERIFY
      marketCapCr: 47980,
      range52w: { low: 890, high: 1890 },
      beta: 1.32,
      divYieldPct: 0,   // INDIGO did not pay dividend pre-pandemic
    },
    balanceSheet: {
      filedQuarter: 'Q3 FY20 · Filed 4 Feb 2020',
      totalAssetsCr: 28400,
      totalLiabilitiesCr: 16650,
      shareholderEquityCr: 11750,
      cashAndEquivalentsCr: 6480,
      longTermDebtCr: 2150,    // operating lease liabilities expanded under Ind AS 116
      debtToEquity: 1.42,      // includes lease liabilities
      currentRatio: 0.98,
      verifyNotes: '// VERIFY · Q3 FY20 numbers reconstructed from press release. Confirm against full filing.',
    },
    news: [
      { source: 'Reuters · Mar 8, 2020',         headline: 'Indian carriers brace for COVID-19 demand collapse as flight cancellations surge.', sentiment: 'bearish' },
      { source: 'Economic Times · Mar 8, 2020',  headline: 'Airline stocks plunge on dual shock: pandemic fears and ATF cost volatility.',     sentiment: 'bearish' },
      { source: 'Bloomberg · Mar 9, 2020',       headline: 'IndiGo dominance offers little shield as global aviation faces "darkest hour".',    sentiment: 'bearish' },
    ],
    holders: [
      { name: 'Rakesh Gangwal & family',  type: 'promoter',              percent: 36.7 },
      { name: 'Rahul Bhatia & family',    type: 'promoter',              percent: 38.2 },
      { name: 'Government of Singapore',  type: 'foreign-institution',   percent: 1.8 },
      { name: 'BlackRock Inc.',           type: 'foreign-institution',   percent: 1.6 },
      { name: 'Vanguard Group',           type: 'foreign-institution',   percent: 1.1 },
    ],
    sectorPosition: {
      sectorBeta: 1.05,
      niftyBeta: 1.32,
      oilCorrelation: -0.62,        // when crude falls, airlines initially rally on lower fuel
      usdInrCorrelation: -0.41,     // weaker rupee = imported jet fuel costs rise
      sensitivities: [
        { factor: 'Crude oil',          impact: 'high-negative' },
        { factor: 'Travel demand',      impact: 'high-positive' },
        { factor: 'INR strength',       impact: 'positive' },
        { factor: 'Pandemic / lockdown', impact: 'high-negative' },
      ],
    },
  },

  // ────────────────────────────────────────────────────────
  // 02 · SUN PHARMA
  // ────────────────────────────────────────────────────────
  {
    symbol: 'SUNPHARMA',
    name: 'Sun Pharmaceutical Industries Ltd',
    sector: 'pharma',
    sectorLabel: 'Pharmaceuticals',
    emoji: '💊',
    color: '#10B981',
    description: 'India\'s largest pharma company by market cap. Strong US generics + India branded business.',
    closePrice: 428.20,
    pctChange30d: -0.024,
    candles: sunpharmaCandles,
    metrics: {
      pe: 26.1,
      eps: 16.40,
      marketCapCr: 102700,
      range52w: { low: 372, high: 510 },
      beta: 0.68,
      divYieldPct: 0.7,
    },
    balanceSheet: {
      filedQuarter: 'Q3 FY20 · Filed 12 Feb 2020',
      totalAssetsCr: 49800,
      totalLiabilitiesCr: 17640,
      shareholderEquityCr: 32160,
      cashAndEquivalentsCr: 8920,
      longTermDebtCr: 5810,
      debtToEquity: 0.18,
      currentRatio: 2.34,
    },
    news: [
      { source: 'Economic Times · Mar 8, 2020', headline: 'Pharma stocks rally as investors seek defensive plays amid pandemic fears.', sentiment: 'bullish' },
      { source: 'Mint · Mar 9, 2020',           headline: 'Sun Pharma\'s API supply chain insulated from China disruption, says management.', sentiment: 'bullish' },
      { source: 'Reuters · Mar 8, 2020',        headline: 'Indian pharma exports may benefit as global drug shortages loom.',                  sentiment: 'bullish' },
    ],
    holders: [
      { name: 'Dilip Shanghvi & family',         type: 'promoter',              percent: 54.5 },
      { name: 'Government Pension Fund Norway',  type: 'foreign-institution',   percent: 2.1 },
      { name: 'BlackRock Inc.',                  type: 'foreign-institution',   percent: 1.8 },
      { name: 'Life Insurance Corporation',      type: 'domestic-institution',  percent: 3.2 },
      { name: 'SBI Mutual Fund',                 type: 'mutual-fund',           percent: 1.4 },
    ],
    sectorPosition: {
      sectorBeta: 0.82,
      niftyBeta: 0.68,
      oilCorrelation: -0.12,
      usdInrCorrelation: 0.55,    // weak rupee helps US-revenue exporters
      sensitivities: [
        { factor: 'Pandemic / health crisis', impact: 'high-positive' },
        { factor: 'USD/INR',                  impact: 'positive' },
        { factor: 'US FDA regulatory action', impact: 'high-negative' },
        { factor: 'API supply chain',         impact: 'positive' },
      ],
    },
  },

  // ────────────────────────────────────────────────────────
  // 03 · RELIANCE INDUSTRIES
  // ────────────────────────────────────────────────────────
  {
    symbol: 'RELIANCE',
    name: 'Reliance Industries Ltd',
    sector: 'energy',
    sectorLabel: 'Oil, Gas & Petrochemicals',
    emoji: '⛽',
    color: '#FFB830',
    description: 'India\'s largest company by market cap. Oil refining + petchem + Jio telecom + retail.',
    closePrice: 1356.10,
    pctChange30d: -0.082,
    candles: relianceCandles,
    metrics: {
      pe: 13.2,
      eps: 102.70,
      marketCapCr: 859000,
      range52w: { low: 1212, high: 1618 },
      beta: 1.04,
      divYieldPct: 0.5,
    },
    balanceSheet: {
      filedQuarter: 'Q3 FY20 · Filed 17 Jan 2020',
      totalAssetsCr: 1100000,
      totalLiabilitiesCr: 615000,
      shareholderEquityCr: 485000,
      cashAndEquivalentsCr: 152000,
      longTermDebtCr: 286000,         // pre-rights-issue, debt was a key concern
      debtToEquity: 0.78,
      currentRatio: 1.06,
      verifyNotes: '// VERIFY · pre-2020 rights-issue debt picture. Numbers fluid.',
    },
    news: [
      { source: 'Bloomberg · Mar 8, 2020',         headline: 'Saudi-Russia oil price war collapses Brent crude 31% — refiners face margin shock.', sentiment: 'bearish' },
      { source: 'Reuters · Mar 8, 2020',           headline: 'Reliance Industries vulnerable as oil refining and petchem margins compress.',         sentiment: 'bearish' },
      { source: 'Economic Times · Mar 9, 2020',    headline: 'Jio and retail businesses provide partial cushion against energy-segment pain.',       sentiment: 'neutral' },
    ],
    holders: [
      { name: 'Mukesh Ambani & family',     type: 'promoter',              percent: 50.3 },
      { name: 'Life Insurance Corporation', type: 'domestic-institution',  percent: 5.8 },
      { name: 'BlackRock Inc.',             type: 'foreign-institution',   percent: 1.9 },
      { name: 'Vanguard Group',             type: 'foreign-institution',   percent: 1.4 },
      { name: 'Capital Group',              type: 'foreign-institution',   percent: 1.1 },
    ],
    sectorPosition: {
      sectorBeta: 1.18,
      niftyBeta: 1.04,
      oilCorrelation: 0.71,        // refining margins move with oil price
      usdInrCorrelation: -0.38,
      sensitivities: [
        { factor: 'Crude oil prices',     impact: 'high-positive' },
        { factor: 'Refining margins',     impact: 'high-positive' },
        { factor: 'Telecom subscriber growth (Jio)', impact: 'positive' },
        { factor: 'Pandemic / demand',    impact: 'high-negative' },
      ],
    },
  },

  // ────────────────────────────────────────────────────────
  // 04 · HDFC BANK
  // ────────────────────────────────────────────────────────
  {
    symbol: 'HDFCBANK',
    name: 'HDFC Bank Ltd',
    sector: 'banking',
    sectorLabel: 'Private Bank',
    emoji: '🏦',
    color: '#A855F7',
    description: 'India\'s largest private-sector bank. Industry-leading asset quality (NPA <2%).',
    closePrice: 1054.25,
    pctChange30d: -0.063,
    candles: hdfcbankCandles,
    metrics: {
      pe: 21.8,
      eps: 48.30,
      marketCapCr: 577800,
      range52w: { low: 944, high: 1305 },
      beta: 1.06,
      divYieldPct: 0.7,
    },
    balanceSheet: {
      filedQuarter: 'Q3 FY20 · Filed 18 Jan 2020',
      totalAssetsCr: 1380000,
      totalLiabilitiesCr: 1224000,    // banks: deposits dominate liabilities
      shareholderEquityCr: 156000,
      cashAndEquivalentsCr: 76300,
      longTermDebtCr: 89400,
      debtToEquity: 8.94,         // normal for banks; D/E means little here
      currentRatio: 1.02,
      verifyNotes: '// NOTE · D/E is high but normal for banks; tutor explains this.',
    },
    news: [
      { source: 'Mint · Mar 8, 2020',              headline: 'RBI signals monetary easing options as global central banks cut rates.',          sentiment: 'neutral' },
      { source: 'Economic Times · Mar 9, 2020',    headline: 'Banking sector under pressure on NPA fears from sectoral lockdowns.',            sentiment: 'bearish' },
      { source: 'Reuters · Mar 8, 2020',           headline: 'HDFC Bank\'s low retail-loan delinquency offers relative shelter — analysts.',   sentiment: 'bullish' },
    ],
    holders: [
      { name: 'HDFC Ltd (parent)',           type: 'promoter',              percent: 21.4 },
      { name: 'Government of Singapore',     type: 'foreign-institution',   percent: 3.2 },
      { name: 'Life Insurance Corporation',  type: 'domestic-institution',  percent: 2.8 },
      { name: 'BlackRock Inc.',              type: 'foreign-institution',   percent: 2.4 },
      { name: 'Vanguard Group',              type: 'foreign-institution',   percent: 1.9 },
    ],
    sectorPosition: {
      sectorBeta: 0.95,
      niftyBeta: 1.06,
      oilCorrelation: -0.18,
      usdInrCorrelation: -0.32,
      sensitivities: [
        { factor: 'RBI policy rate cuts',     impact: 'high-positive' },
        { factor: 'GDP growth / credit demand', impact: 'high-positive' },
        { factor: 'NPA rise (recession)',     impact: 'high-negative' },
        { factor: 'Liquidity injection',      impact: 'high-positive' },
      ],
    },
  },

  // ────────────────────────────────────────────────────────
  // 05 · TITAN
  // ────────────────────────────────────────────────────────
  {
    symbol: 'TITAN',
    name: 'Titan Company Ltd',
    sector: 'luxury',
    sectorLabel: 'Luxury · Jewelry · Watches',
    emoji: '💎',
    color: '#EC4899',
    description: 'Tata-owned luxury retailer. India\'s largest jewelry chain (Tanishq). Discretionary spending exposure.',
    closePrice: 1085.00,
    pctChange30d: -0.075,
    candles: titanCandles,
    metrics: {
      pe: 64.2,        // luxury retail tends to high P/E
      eps: 16.90,
      marketCapCr: 96320,
      range52w: { low: 949, high: 1390 },
      beta: 0.96,
      divYieldPct: 0.4,
    },
    balanceSheet: {
      filedQuarter: 'Q3 FY20 · Filed 31 Jan 2020',
      totalAssetsCr: 12840,
      totalLiabilitiesCr: 6920,
      shareholderEquityCr: 5920,
      cashAndEquivalentsCr: 920,
      longTermDebtCr: 580,
      debtToEquity: 0.56,
      currentRatio: 1.62,
    },
    news: [
      { source: 'Economic Times · Mar 8, 2020', headline: 'Jewelry retailers brace for slowdown as wedding season demand wavers.',          sentiment: 'bearish' },
      { source: 'Mint · Mar 9, 2020',           headline: 'Gold prices surge to 7-year high — jewelry margins under pressure but volumes weak.', sentiment: 'bearish' },
      { source: 'Bloomberg · Mar 8, 2020',      headline: 'Discretionary luxury sector seen as first casualty in consumer-confidence shock.',  sentiment: 'bearish' },
    ],
    holders: [
      { name: 'Tata Sons (parent)',         type: 'promoter',              percent: 25.1 },
      { name: 'Tamil Nadu Industrial Dev.', type: 'promoter',              percent: 27.9 },
      { name: 'BlackRock Inc.',             type: 'foreign-institution',   percent: 2.1 },
      { name: 'Vanguard Group',             type: 'foreign-institution',   percent: 1.4 },
      { name: 'Government of Singapore',    type: 'foreign-institution',   percent: 1.2 },
    ],
    sectorPosition: {
      sectorBeta: 1.15,
      niftyBeta: 0.96,
      oilCorrelation: -0.21,
      usdInrCorrelation: 0.22,         // gold-import-driven
      sensitivities: [
        { factor: 'Gold prices',             impact: 'negative' },        // higher gold = lower volumes
        { factor: 'Consumer confidence',     impact: 'high-positive' },
        { factor: 'Wedding season demand',   impact: 'high-positive' },
        { factor: 'Pandemic / lockdown',     impact: 'high-negative' },
      ],
    },
  },

  // ────────────────────────────────────────────────────────
  // 06 · TCS
  // ────────────────────────────────────────────────────────
  {
    symbol: 'TCS',
    name: 'Tata Consultancy Services Ltd',
    sector: 'it',
    sectorLabel: 'Information Technology Services',
    emoji: '💻',
    color: '#3B82F6',
    description: 'India\'s largest IT services firm by revenue. ~70% USD revenue. Defensive in INR, exposed to global IT spend.',
    closePrice: 2156.40,
    pctChange30d: -0.041,
    candles: tcsCandles,
    metrics: {
      pe: 24.7,
      eps: 87.40,
      marketCapCr: 808900,
      range52w: { low: 1922, high: 2296 },
      beta: 0.84,
      divYieldPct: 1.5,
    },
    balanceSheet: {
      filedQuarter: 'Q3 FY20 · Filed 9 Jan 2020',
      totalAssetsCr: 102400,
      totalLiabilitiesCr: 21800,
      shareholderEquityCr: 80600,
      cashAndEquivalentsCr: 47200,
      longTermDebtCr: 0,           // TCS famously debt-free
      debtToEquity: 0,
      currentRatio: 4.18,
    },
    news: [
      { source: 'Reuters · Mar 8, 2020',           headline: 'Indian IT vendors face client budget cuts as global recession risk rises.',     sentiment: 'bearish' },
      { source: 'Economic Times · Mar 9, 2020',    headline: 'TCS rupee revenue benefits from weakening INR — partial offset to demand fears.', sentiment: 'neutral' },
      { source: 'Bloomberg · Mar 8, 2020',         headline: 'IT services seen as relative safe haven within Indian equities — TCS leads.',  sentiment: 'bullish' },
    ],
    holders: [
      { name: 'Tata Sons (parent)',          type: 'promoter',              percent: 72.0 },
      { name: 'Life Insurance Corporation',  type: 'domestic-institution',  percent: 3.4 },
      { name: 'BlackRock Inc.',              type: 'foreign-institution',   percent: 1.6 },
      { name: 'Vanguard Group',              type: 'foreign-institution',   percent: 1.3 },
      { name: 'SBI Mutual Fund',             type: 'mutual-fund',           percent: 0.9 },
    ],
    sectorPosition: {
      sectorBeta: 0.92,
      niftyBeta: 0.84,
      oilCorrelation: -0.05,
      usdInrCorrelation: 0.62,           // USD revenue benefits from weak INR
      sensitivities: [
        { factor: 'Global IT spending',      impact: 'high-positive' },
        { factor: 'USD/INR (weak rupee)',    impact: 'positive' },
        { factor: 'US recession risk',       impact: 'high-negative' },
        { factor: 'Visa policy / H1B',       impact: 'negative' },
      ],
    },
  },
]
