// ============================================================================
// SCENARIO DATA TYPES
// ============================================================================
// Shared data shapes for any historical-day simulation scenario.
// First scenario: COV-20 (Covid Day Zero, March 9, 2020).
// ============================================================================

export type Sector =
  | 'airlines'
  | 'pharma'
  | 'energy'
  | 'banking'
  | 'luxury'
  | 'it'

export type ArtifactType =
  | 'price-chart'
  | 'key-metrics'
  | 'balance-sheet'
  | 'news-24h'
  | 'holdings'
  | 'sector-position'

// ─── Stock data ─────────────────────────────────────────────

export interface OhlcvCandle {
  date: string          // 'YYYY-MM-DD'
  open: number
  high: number
  low: number
  close: number
  volume: number        // in lakhs
}

export interface KeyMetrics {
  pe: number
  eps: number
  marketCapCr: number   // in crores
  range52w: { low: number; high: number }
  beta: number
  divYieldPct: number
}

export interface BalanceSheet {
  filedQuarter: string         // 'Q3 FY20 (Filed Feb 2020)'
  totalAssetsCr: number
  totalLiabilitiesCr: number
  shareholderEquityCr: number
  cashAndEquivalentsCr: number
  longTermDebtCr: number
  debtToEquity: number         // computed: totalDebt / equity
  currentRatio: number
  verifyNotes?: string         // for // VERIFY items
}

export interface NewsHeadline {
  source: string               // 'Reuters · Mar 8, 2020'
  headline: string
  sentiment: 'bullish' | 'bearish' | 'neutral'
}

export interface Holder {
  name: string                 // 'LIC India'
  type: 'domestic-institution' | 'foreign-institution' | 'mutual-fund' | 'insider' | 'promoter'
  percent: number              // e.g. 8.2
}

export interface SectorPosition {
  sectorBeta: number           // beta to its sector index
  niftyBeta: number            // beta to Nifty 50
  oilCorrelation: number       // -1 to +1
  usdInrCorrelation: number    // -1 to +1
  sensitivities: { factor: string; impact: 'high-positive' | 'positive' | 'neutral' | 'negative' | 'high-negative' }[]
}

export interface ScenarioStock {
  symbol: string               // 'INDIGO'
  name: string                 // 'InterGlobe Aviation Ltd'
  sector: Sector
  sectorLabel: string          // 'Aviation'
  emoji: string                // '✈️'
  color: string                // hex for sector tint
  description: string          // one-line
  closePrice: number           // last close before scenario starts (Mar 6, 2020)
  pctChange30d: number         // e.g. -0.087
  candles: OhlcvCandle[]       // ~30 trading days
  metrics: KeyMetrics
  balanceSheet: BalanceSheet
  news: NewsHeadline[]         // 3 items, last 24h
  holders: Holder[]            // top 5
  sectorPosition: SectorPosition
}

// ─── Macro intel ─────────────────────────────────────────────

export interface WorldHeadline {
  flag: string                 // emoji
  headline: string
  hoursAgo: number
  severity: 'low' | 'medium' | 'high' | 'critical'
}

export interface SectorPulse {
  sector: Sector
  emoji: string
  label: string
  pctChange: number            // sector index % change Mar 6 close
}

export interface MarketIndicator {
  label: string                // 'BRENT'
  value: string                // '$34.36'
  pctChange: number
}

export interface ScenarioMacro {
  worldNews: WorldHeadline[]
  sectorHeatmap: SectorPulse[]
  indicators: MarketIndicator[]
}

// ─── Full scenario ───────────────────────────────────────────

export interface Scenario {
  id: string                   // 'COV-20'
  title: string                // 'Covid Day Zero'
  date: string                 // '09 March 2020'
  preMarketTime: string        // '09:00 IST'
  startingWalletInr: number    // 100000
  stocks: ScenarioStock[]
  macro: ScenarioMacro
}

// ─── Telemetry types ─────────────────────────────────────────

export type TelemetryEvent =
  | { type: 'artifact-view'; stock: string; artifact: ArtifactType; durationMs: number }
  | { type: 'tutor-open'; stock: string; artifact: ArtifactType }
  | { type: 'tutor-marked-studied'; stock: string; artifact: ArtifactType }
  | { type: 'allocation-change'; stock: string; rupees: number; atSec: number }
  | { type: 'tab-blur'; durationMs: number }
  | { type: 'deploy-clicked'; allocations: Record<string, number>; timeToDeploySec: number; unstudiedCount: number }
  | { type: 'deploy-verdict-shown'; unstudiedStocks: string[] }
  | { type: 'deploy-verdict-acknowledged'; deployAnyway: boolean }
