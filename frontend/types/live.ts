// ============================================================================
// LIVE TRADING — types
// ============================================================================

export type OrderSide = 'BUY' | 'SELL'
export type OrderType = 'MARKET' | 'LIMIT' | 'SL' | 'SL-M'
export type OrderStatus = 'PENDING' | 'FILLED' | 'CANCELLED' | 'REJECTED'
export type OrderValidity = 'DAY' | 'IOC'

export interface Order {
  id: string
  symbol: string
  side: OrderSide
  type: OrderType
  validity: OrderValidity
  quantity: number
  price?: number          // limit price (for LIMIT, SL, SL-M)
  triggerPrice?: number   // trigger (for SL, SL-M)
  status: OrderStatus
  placedAtMin: number     // simulated minute the order was placed (0..375 from 9:15)
  filledAtMin?: number
  filledPrice?: number
  reason?: string         // user-provided thesis for the trade journal
}

export interface Position {
  symbol: string
  qty: number              // positive = long; negative = short
  avgPrice: number
  realisedPnL: number      // realised P&L from previous trades on this symbol
  /** stop loss price, if any */
  stopPrice?: number
  /** target / take profit price */
  targetPrice?: number
}

export interface IntradayBar {
  /** offset in minutes from market open (9:15 IST) */
  minute: number
  open: number
  high: number
  low: number
  close: number
  volume: number          // raw shares traded
}

export interface StockTimeline {
  symbol: string
  prevClose: number
  bars: IntradayBar[]      // 75 bars at 5-minute intervals
}

// ─── Events ─────────────────────────────────────────────────

export type EventSeverity = 'low' | 'medium' | 'high' | 'critical'

export interface NewsEvent {
  id: string
  /** simulated minute when event fires (0..375) */
  fireAt: number
  flag: string             // emoji
  headline: string
  body?: string            // longer description
  severity: EventSeverity
  /** SIGNAL = action-relevant, NOISE = priced-in / opinion */
  classification: 'signal' | 'noise'
  /** stocks affected, with their immediate % impact (e.g. -0.012 = -1.2%) */
  impacts?: { symbol: string; pctImpact: number }[]
  source?: string
}

export interface CircuitBreakerEvent {
  fireAt: number              // simulated minute
  level: 5 | 10 | 20          // % drop level
  haltMinutes: number          // 15 / 45 / 999 (last = halt for day)
}

export interface OrusWhisper {
  fireAt: number
  text: string
  severity?: EventSeverity
  /** optional symbol context */
  contextSymbol?: string
}

// ─── Portfolio snapshot ─────────────────────────────────────

export interface PortfolioSnapshot {
  cash: number
  marginUsed: number
  positionsValue: number
  totalEquity: number
  dayPnL: number              // realised + unrealised vs starting cash
  dayPnLPct: number
}

export interface EquityPoint {
  minute: number
  equity: number
}

// ─── Session state ──────────────────────────────────────────

export type SessionStatus =
  | 'PRE_OPEN'      // before 9:15
  | 'LIVE'          // active trading
  | 'PAUSED'        // user paused
  | 'HALTED'        // circuit breaker
  | 'CLOSED'        // bell rang at 15:30

export interface LiveSessionState {
  scenarioId: string
  status: SessionStatus
  /** current simulated minute since 9:15 IST (0..375; bell at 9:15 → minute 0; close at 15:30 → minute 375) */
  currentMinute: number
  /** real-time speed multiplier */
  speed: 1 | 5 | 10
  /** currently focused stock in the chart */
  activeSymbol: string

  cash: number
  positions: Record<string, Position>
  orders: Order[]
  realisedPnL: number

  /** events that have fired so far */
  firedNewsIds: string[]
  /** circuit halt that's currently active */
  currentHalt: { startedAtMin: number; endsAtMin: number; level: 5 | 10 | 20 } | null

  /** equity curve points captured each minute */
  equityCurve: EquityPoint[]

  /** has the session ever started? */
  started: boolean

  /** coach state */
  coachShown: { orderType: boolean; stopLoss: boolean; sizing: boolean }
}
