// Technical indicators for agents (2.4, 6.3: the text-first chart path).
//
// Pure functions over plain arrays, no React. Unlike the prep-room UI's versions
// (components/prep/tabs/tab-technicals.tsx), these never invent a value: with too
// little data they return null, so an agent can't quote a fabricated "neutral" RSI.
// Written by Claude at Bhavya's request (2026-10-02).

/** Simple moving average of the last `n` values, or null if there are fewer than n. */
export function sma(values: readonly number[], n: number): number | null {
  if (n <= 0 || values.length < n) return null
  let sum = 0
  for (let i = values.length - n; i < values.length; i++) sum += values[i]
  return sum / n
}

/**
 * RSI with Wilder's smoothing (Wilder 1978), the standard definition:
 *   1. changes d_i = close_i − close_{i−1}; gains = max(d, 0), losses = max(−d, 0)
 *   2. seed: simple averages of the first `period` gains and losses
 *   3. then avg = (prev_avg × (period − 1) + current) / period for each later change
 *   4. RSI = 100 − 100 / (1 + avgGain / avgLoss)
 * Needs period + 1 closes. Returns null with fewer. All-gains → 100; no movement → 50 (genuinely flat, not a fallback).
 */
export function rsi(closes: readonly number[], period = 14): number | null {
  if (period <= 0 || closes.length < period + 1) return null
  let avgGain = 0
  let avgLoss = 0
  for (let i = 1; i <= period; i++) {
    const d = closes[i] - closes[i - 1]
    if (d > 0) avgGain += d
    else avgLoss -= d
  }
  avgGain /= period
  avgLoss /= period
  for (let i = period + 1; i < closes.length; i++) {
    const d = closes[i] - closes[i - 1]
    avgGain = (avgGain * (period - 1) + Math.max(d, 0)) / period
    avgLoss = (avgLoss * (period - 1) + Math.max(-d, 0)) / period
  }
  if (avgGain === 0 && avgLoss === 0) return 50
  if (avgLoss === 0) return 100
  return 100 - 100 / (1 + avgGain / avgLoss)
}

export interface OhlcvBar { high: number; low: number; close: number; volume: number }

/** Session VWAP: Σ(typical price × volume) / Σ volume, typical price = (H + L + C) / 3. Null without volume. */
export function vwap(bars: readonly OhlcvBar[]): number | null {
  let pv = 0
  let v = 0
  for (const b of bars) {
    pv += ((b.high + b.low + b.close) / 3) * b.volume
    v += b.volume
  }
  return v > 0 ? pv / v : null
}
