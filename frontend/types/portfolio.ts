export type Sector = 'airlines' | 'pharma' | 'energy' | 'banking' | 'luxury' | 'it'
export type RevealPhase = 'sparkline' | 'volume' | 'orderbook' | 'heatmap'
export type GamePhase = 'intro' | 'allocating' | 'running' | 'rebalance' | 'flash_crash' | 'closed'

export interface PortfolioCandle {
  second: number
  price: number
  volume: number
}

export interface PortfolioStock {
  symbol: string
  name: string
  sector: Sector
  sectorLabel: string
  openPrice: number
  closePrice: number
  color: string
  candles: PortfolioCandle[]
}

export interface CausalImpact {
  symbol: string
  impactPct: number
  polarity: 'positive' | 'negative' | 'neutral'
  decaySeconds: number
  rationale: string
}

export interface PortfolioNewsEvent {
  id: string
  realSecond: number
  headline: string
  body: string
  rebalanceWindowSec: number
  causalImpacts: CausalImpact[]
  tierHint: {
    simple: string
    deeper: string
    expert: string
  }
  whyExplanations: Record<string, {
    simple: string
    deeper: string
    expert: string
  }>
}

export interface FlashCrashEvent {
  realSecond: number
  durationSeconds: number
  dropPct: number
}

export interface CausalRule {
  id: string
  name: string
  shortRule: string
  example: string
  triggerCondition: string
}

export interface PortfolioScenario {
  slug: string
  title: string
  subtitle: string
  date: string
  dateShort: string
  difficulty: 1 | 2 | 3 | 4
  description: string
  cinematicCopy: string
  stocks: PortfolioStock[]
  events: PortfolioNewsEvent[]
  flashCrash: FlashCrashEvent
  startingCapital: number
  causalRules: CausalRule[]
}

export interface Allocation {
  symbol: string
  shares: number
  avgCost: number
  currentValue: number
  pnlRupees: number
  pnlPct: number
}

export interface AllocationSnapshot {
  atSecond: number
  reason: 'initial' | 'event' | 'flash_crash'
  allocations: Record<string, Allocation>
  cash: number
  portfolioValue: number
}

export interface Mistake {
  atSecond: number
  label: string
  detail: string
  costRupees: number
}

export interface PulsePayload {
  id: string
  fromId: string
  toId: string
  polarity: 'positive' | 'negative' | 'neutral'
  delayMs: number
}

export interface PortfolioRunResult {
  startingCapital: number
  finalValue: number
  pnlRupees: number
  pnlPct: number
  snapshots: AllocationSnapshot[]
  mistakes: Mistake[]
  unlockedRuleIds: string[]
  diversificationScore: number
  didPanicSell: boolean
  pnlHistory: { second: number; value: number }[]
  doNothingHistory: { second: number; value: number }[]
  perfectPlayHistory: { second: number; value: number }[]
}
