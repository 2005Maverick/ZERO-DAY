import type { MiniGame } from '../game-types'

function build(opens: number[]) {
  const out = []
  for (let i = 0; i < opens.length - 1; i++) {
    const o = opens[i], c = opens[i + 1]
    const range = Math.abs(c - o) + 1
    out.push({
      o, c,
      h: Math.max(o, c) + Math.random() * range * 0.4,
      l: Math.min(o, c) - Math.random() * range * 0.4,
    })
  }
  return out
}

function ma(data: number[], n: number): number[] {
  return data.map((_, i) => {
    if (i < n - 1) return data[i]
    return data.slice(i - n + 1, i + 1).reduce((a, b) => a + b, 0) / n
  })
}

const UP = [80, 82, 85, 88, 92, 96, 100, 104, 109, 114, 118, 121, 124, 127, 130, 132, 135]
const DOWN = [130, 128, 124, 119, 115, 112, 108, 104, 99, 95, 92, 88, 85, 82, 80, 78, 76]
const RANGE = [100, 102, 99, 103, 98, 101, 100, 103, 99, 102, 100, 99, 102, 100, 101, 99, 100]
const GOLDEN = [80, 82, 80, 78, 80, 82, 84, 87, 90, 94, 99, 105, 110, 115, 120, 125, 130]
const DEATH = [130, 128, 130, 132, 130, 127, 124, 120, 116, 112, 107, 102, 97, 93, 89, 85, 82]
const CHOPPY = [100, 105, 102, 108, 104, 110, 105, 112, 107, 113, 108, 110, 105, 109, 104, 108, 102]

export const TREND_READER: MiniGame = {
  slug: 'moving-averages',
  title: 'Trend Reader',
  tagline: '6 charts with MA20 (white) and MA50 (purple) — call the regime.',
  accentColor: '14B8A6',
  passThreshold: 0.66,
  customMode: 'trend-continuous',
  rounds: [
    {
      id: 'tr1', kind: 'chart_mcq',
      context: 'Chart · 1 of 6',
      prompt: 'Read this chart. What regime is the stock in?',
      chart: { candles: build(UP), ma20: ma(UP, 5).slice(1), ma50: ma(UP, 9).slice(1), height: 220 },
      options: [
        { label: 'Strong Uptrend', correct: true, feedback: 'Yes. Price > MA20 > MA50, all sloping up — textbook uptrend.' },
        { label: 'Range / Sideways', correct: false, feedback: 'Range would have horizontal MAs and price oscillating around them.' },
        { label: 'Downtrend', correct: false, feedback: 'In a downtrend, price would be below both MAs and they would slope down.' },
        { label: 'Reversal forming', correct: false, feedback: 'No reversal signal yet — momentum is still strongly up.' },
      ],
      explanation: 'Stack: Price > MA20 > MA50, all rising = strong uptrend. The cleanest "stay long" regime. Pullbacks to MA20 are buying opportunities.',
    },
    {
      id: 'tr2', kind: 'chart_mcq',
      context: 'Chart · 2 of 6',
      prompt: 'What regime?',
      chart: { candles: build(DOWN), ma20: ma(DOWN, 5).slice(1), ma50: ma(DOWN, 9).slice(1), height: 220 },
      options: [
        { label: 'Strong Downtrend', correct: true, feedback: 'Right. Price < MA20 < MA50, all sloping down. Anti-stack.' },
        { label: 'Bottom forming', correct: false, feedback: 'No reversal signs — momentum is still down.' },
        { label: 'Range', correct: false, feedback: 'Ranges have flat MAs.' },
        { label: 'Pullback in uptrend', correct: false, feedback: 'A pullback in an uptrend would still have MAs sloping up.' },
      ],
      explanation: 'Reverse-stack: Price < MA20 < MA50, all falling = strong downtrend. Don\'t catch falling knives. Wait for a clear regime change before going long.',
    },
    {
      id: 'tr3', kind: 'chart_mcq',
      context: 'Chart · 3 of 6',
      prompt: 'What regime?',
      chart: { candles: build(RANGE), ma20: ma(RANGE, 5).slice(1), ma50: ma(RANGE, 9).slice(1), height: 220 },
      options: [
        { label: 'Sideways / Range', correct: true, feedback: 'Yes. Price oscillates around flat MAs. No directional edge.' },
        { label: 'Uptrend', correct: false, feedback: 'No upward slope on the MAs.' },
        { label: 'Breakout setup', correct: false, feedback: 'Possible eventually, but right now the stock is just chopping.' },
        { label: 'Reversal', correct: false, feedback: 'You can\'t reverse from a flat range — there\'s no trend to reverse.' },
      ],
      explanation: 'Range-bound: trend-following systems lose money here. Mean-reversion or fade-the-extremes works better. The right move is often "do nothing" until a breakout.',
    },
    {
      id: 'tr4', kind: 'chart_mcq',
      context: 'Chart · 4 of 6',
      prompt: 'MA20 just crossed above MA50 after a long downtrend. What pattern?',
      chart: { candles: build(GOLDEN), ma20: ma(GOLDEN, 5).slice(1), ma50: ma(GOLDEN, 9).slice(1), height: 220 },
      options: [
        { label: 'Golden Cross', correct: true, feedback: 'Yes. Bullish reversal signal — short-term MA crossing above long-term MA.' },
        { label: 'Death Cross', correct: false, feedback: 'Death Cross is the opposite — short MA below long MA.' },
        { label: 'Continuation', correct: false, feedback: 'A continuation would not have a recent cross.' },
        { label: 'Range', correct: false, feedback: 'Crosses don\'t happen in stable ranges.' },
      ],
      explanation: 'Golden Cross: classic trend-change signal. Best confirmed when MA50 also starts sloping up. Lagging signal — by definition occurs after a move has begun.',
    },
    {
      id: 'tr5', kind: 'chart_mcq',
      context: 'Chart · 5 of 6',
      prompt: 'MA20 just crossed below MA50 after a long uptrend. Pattern?',
      chart: { candles: build(DEATH), ma20: ma(DEATH, 5).slice(1), ma50: ma(DEATH, 9).slice(1), height: 220 },
      options: [
        { label: 'Death Cross', correct: true, feedback: 'Right. Bearish trend-change signal — short MA falling below long MA.' },
        { label: 'Golden Cross', correct: false, feedback: 'Opposite direction.' },
        { label: 'Pullback', correct: false, feedback: 'A simple pullback in an uptrend doesn\'t cause MAs to cross.' },
        { label: 'Range', correct: false, feedback: 'Stable ranges don\'t produce decisive crosses.' },
      ],
      explanation: 'Death Cross: trend reversal warning. Like Golden Cross, it lags — by the time it triggers, the move is well underway. But it confirms the regime change and many systems use it as a "exit longs / consider shorts" signal.',
    },
    {
      id: 'tr6', kind: 'chart_mcq',
      context: 'Chart · 6 of 6',
      prompt: 'Price keeps hitting MA20 then bouncing, but MA50 is flat. Multiple times. What is this?',
      chart: { candles: build(CHOPPY), ma20: ma(CHOPPY, 5).slice(1), ma50: ma(CHOPPY, 9).slice(1), height: 220 },
      options: [
        { label: 'Choppy / mean-reverting market', correct: true, feedback: 'Yes. Price is bouncing without making progress. Trend-following signals will fail here.' },
        { label: 'Strong Uptrend', correct: false, feedback: 'Uptrend has price ABOVE MA20, not bouncing on it.' },
        { label: 'Downtrend', correct: false, feedback: 'Downtrend has price below both MAs.' },
        { label: 'Breakout setup', correct: false, feedback: 'Breakouts don\'t look like repeated bounces back to mean.' },
      ],
      explanation: 'Choppy markets are where trend-followers bleed. Repeated whipsaw kills you. Either reduce size, switch to a different strategy, or stop trading until trend resumes.',
    },
  ],
}
