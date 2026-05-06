// Mini-game round types — the engine renders any combination.

export interface ChartSpec {
  // Inline chart description for SVG renderer
  candles?: Array<{ o: number; h: number; l: number; c: number }>
  ma20?: number[]
  ma50?: number[]
  volume?: number[]
  highlight?: 'last' | 'breakout' | 'reversal' | 'none'
  width?: number
  height?: number
}

export interface MCQOption {
  label: string
  correct: boolean
  feedback: string
}

interface BaseRound {
  id: string
  prompt: string
  context?: string             // 1-line setup
  explanation: string          // shown after answer regardless of correctness
}

export interface MCQRound extends BaseRound {
  kind: 'mcq'
  options: MCQOption[]
}

export interface ChartMCQRound extends BaseRound {
  kind: 'chart_mcq'
  chart: ChartSpec
  options: MCQOption[]
}

export interface CalcRound extends BaseRound {
  kind: 'calc'
  unit: string                 // "shares", "₹", "%"
  acceptable: { min: number; max: number; ideal: number }
  hint?: string
}

export interface SelectRulesRound extends BaseRound {
  kind: 'select_rules'
  rules: { text: string; correct: boolean }[]
  minCorrect: number           // pass threshold
}

export interface ScenarioRound extends BaseRound {
  kind: 'scenario'
  chart?: ChartSpec
  positionState?: { symbol: string; entry: number; current: number; qtyPct: number }
  options: MCQOption[]
}

export type Round = MCQRound | ChartMCQRound | CalcRound | SelectRulesRound | ScenarioRound

export type CustomMode = 'candle-memory' | 'plan-dragdrop' | 'trend-continuous'

export interface MiniGame {
  slug: string
  title: string
  tagline: string
  accentColor: string
  passThreshold: number        // 0-1, e.g. 0.7
  rounds: Round[]
  // Game-shell config
  timerSec?: number            // default 25s per round
  lives?: number               // default 3
  customMode?: CustomMode      // if set, engine delegates to a custom renderer
}

// Outcome reported by custom-mode components back to the engine
export interface CustomModeResult {
  score: number                // raw points
  maxScore: number             // best possible
  passed: boolean
  detail?: string              // shown on results screen
}
