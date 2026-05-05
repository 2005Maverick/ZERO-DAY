// ============================================================================
// COV-20 INTRADAY TIMELINE — March 9, 2020
// ============================================================================
// 75 bars at 5-minute intervals from 09:15 IST (minute 0) to 15:30 IST (minute 375).
// Each stock has a realistic intraday path encoding the historical day:
//   - Sharp gap-down at open
//   - Capitulation low ~12:00 IST
//   - Modest recovery into close
//
// Generated deterministically from per-stock open/low/close % targets so charts
// are stable across reloads. Minor noise via mulberry32 PRNG.
// ============================================================================

import type { StockTimeline, IntradayBar } from '@/types/live'

// Path shape (% of session): controls path of close prices through the day.
// Values are from 0 (start of day) to 1 (close of day).
// COV-20 shape: gap down, deepen for first 75min, halt, recover slightly, drift to lows by 13:00, modest bounce into close
const PATH_SHAPE: { t: number; pct: number }[] = [
  { t: 0.00, pct: 0.00 },     // open (gap-down baseline)
  { t: 0.04, pct: 0.20 },     // 09:30 — opening sell-off
  { t: 0.10, pct: 0.45 },     // 09:45
  { t: 0.20, pct: 0.85 },     // 10:32 — circuit breaker low
  { t: 0.24, pct: 0.85 },     // halt (flat)
  { t: 0.28, pct: 0.95 },     // 10:50 — resumption deeper
  { t: 0.36, pct: 1.00 },     // 11:30 — capitulation low
  { t: 0.45, pct: 0.85 },     // 12:00 — first bounce
  { t: 0.55, pct: 0.92 },     // 13:00 — fade
  { t: 0.65, pct: 0.78 },     // 13:50 — recovery
  { t: 0.75, pct: 0.70 },     // 14:30 — drift
  { t: 0.85, pct: 0.55 },     // 15:00 — closing-bid recovery
  { t: 1.00, pct: 0.62 },     // 15:30 — close
]

interface PathTarget {
  symbol: string
  prevClose: number
  openPct: number       // gap %  (e.g. -0.05 = open 5% below prev close)
  lowPct: number        // intraday low %  (most negative point)
  closePct: number      // close %
  baseVol: number       // average bar volume
  volSpike: number      // how concentrated volume is in opening half (1.0 = even)
}

const TARGETS: PathTarget[] = [
  { symbol: 'INDIGO',     prevClose: 1247.50, openPct: -0.052, lowPct: -0.092, closePct: -0.075, baseVol:  78000, volSpike: 1.6 },
  { symbol: 'SUNPHARMA',  prevClose:  428.20, openPct: +0.005, lowPct: -0.018, closePct: +0.014, baseVol:  92000, volSpike: 1.3 },
  { symbol: 'RELIANCE',   prevClose: 1356.10, openPct: -0.068, lowPct: -0.108, closePct: -0.082, baseVol: 145000, volSpike: 1.7 },
  { symbol: 'HDFCBANK',   prevClose: 1054.25, openPct: -0.038, lowPct: -0.062, closePct: -0.045, baseVol: 124000, volSpike: 1.4 },
  { symbol: 'TITAN',      prevClose: 1085.00, openPct: -0.048, lowPct: -0.085, closePct: -0.075, baseVol:  64000, volSpike: 1.5 },
  { symbol: 'TCS',        prevClose: 2156.40, openPct: -0.025, lowPct: -0.046, closePct: -0.028, baseVol:  86000, volSpike: 1.2 },
]

// Lightweight deterministic PRNG
function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function stringSeed(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

// Linear interp on the PATH_SHAPE keyframes
function pathPct(t: number): number {
  for (let i = 0; i < PATH_SHAPE.length - 1; i++) {
    const a = PATH_SHAPE[i]
    const b = PATH_SHAPE[i + 1]
    if (t >= a.t && t <= b.t) {
      const k = (t - a.t) / (b.t - a.t || 1)
      return a.pct + (b.pct - a.pct) * k
    }
  }
  return PATH_SHAPE[PATH_SHAPE.length - 1].pct
}

function makeTimeline(target: PathTarget, totalBars = 75): StockTimeline {
  const rand = mulberry32(stringSeed(target.symbol + 'cov20'))
  const open = target.prevClose * (1 + target.openPct)
  const low = target.prevClose * (1 + target.lowPct)
  const close = target.prevClose * (1 + target.closePct)
  // Range over the day; we interpolate close prices along PATH_SHAPE between open/low/close
  const bars: IntradayBar[] = []

  let prev = open

  for (let i = 0; i < totalBars; i++) {
    const t = i / (totalBars - 1)
    const pct = pathPct(t)

    // Map pct (0..1) to a price interpolating open → low → close.
    // pct 0 → open, pct 1 → low, then back from low → close in second half (handled in pct shape)
    let target_close: number
    if (pct <= 0.5) {
      target_close = open + (low - open) * (pct / 0.5)
    } else {
      target_close = low + (close - low) * ((pct - 0.5) / 0.5)
    }

    // Add small noise — but keep determinism
    const noiseScale = (target.prevClose * 0.003) * (rand() * 2 - 1)
    const closeP = Math.max(low * 0.985, target_close + noiseScale)
    const openP = i === 0 ? open : prev
    const high = Math.max(openP, closeP) + Math.abs(rand()) * (target.prevClose * 0.0025)
    const lowP = Math.min(openP, closeP) - Math.abs(rand()) * (target.prevClose * 0.0025)

    // Volume profile — heavier in opening 25% of day, light midday, moderate close
    const phase = i / totalBars
    const volMul = phase < 0.25
      ? target.volSpike * (1 + (0.25 - phase) * 2)
      : phase > 0.85
      ? 1.2
      : 0.85 + (rand() * 0.3)
    const vol = Math.max(1000, Math.round(target.baseVol * volMul * (0.7 + rand() * 0.6)))

    bars.push({
      minute: i * 5,
      open: round2(openP),
      high: round2(high),
      low:  round2(lowP),
      close: round2(closeP),
      volume: vol,
    })

    prev = closeP
  }

  return {
    symbol: target.symbol,
    prevClose: target.prevClose,
    bars,
  }
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

export const COV20_TIMELINE: Record<string, StockTimeline> = TARGETS.reduce(
  (acc, t) => {
    acc[t.symbol] = makeTimeline(t)
    return acc
  },
  {} as Record<string, StockTimeline>,
)

// ─── Index timeline (Nifty / Sensex / etc.) ─────────────────

export interface IndexTick {
  minute: number
  value: number
  pctChange: number      // vs previous day close
}

const INDEX_PREV: Record<string, number> = {
  NIFTY:   10989.45,
  SENSEX:  37576.62,
  BANKNIFTY: 27530.50,
  USDINR:  73.78,
  BRENT:   45.27,
  GOLD:   46500,        // ₹/10g
  VIX:     31.06,
}

const INDEX_CLOSE_PCT: Record<string, number> = {
  NIFTY:   -0.054,    // -5.4%
  SENSEX:  -0.052,
  BANKNIFTY: -0.069,
  USDINR:  +0.006,    // INR weakens
  BRENT:   -0.252,    // Brent crash
  GOLD:    +0.012,    // safe haven
  VIX:     +0.350,    // vol spike
}

function makeIndexTimeline(symbol: string): IndexTick[] {
  const prev = INDEX_PREV[symbol]
  const closePct = INDEX_CLOSE_PCT[symbol]
  const isVol = symbol === 'VIX'
  const isCommodity = symbol === 'BRENT' || symbol === 'GOLD'
  const isCurrency = symbol === 'USDINR'
  const rand = mulberry32(stringSeed(symbol))
  const out: IndexTick[] = []
  for (let i = 0; i < 75; i++) {
    const t = i / 74
    const pct = pathPct(t)
    let pctMove: number
    if (isVol || isCommodity || isCurrency) {
      // smoother monotonic-ish path for these
      pctMove = closePct * t + (rand() - 0.5) * Math.abs(closePct) * 0.06
    } else {
      // equity-style path with capitulation
      pctMove = pct <= 0.5 ? closePct * 1.5 * (pct / 0.5) : closePct * 1.5 + (closePct - closePct * 1.5) * ((pct - 0.5) / 0.5)
      pctMove += (rand() - 0.5) * Math.abs(closePct) * 0.04
    }
    out.push({
      minute: i * 5,
      value: Math.round(prev * (1 + pctMove) * 100) / 100,
      pctChange: pctMove,
    })
  }
  return out
}

export const COV20_INDICES: Record<string, IndexTick[]> = Object.keys(INDEX_PREV).reduce(
  (acc, k) => { acc[k] = makeIndexTimeline(k); return acc },
  {} as Record<string, IndexTick[]>,
)

export const INDEX_PREV_CLOSE = INDEX_PREV
