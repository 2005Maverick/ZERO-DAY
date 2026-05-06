import type { MiniGame } from '../game-types'

// Helper: build a simple candlestick array around a base price
function build(opens: number[], variance = 1.2): { o: number; h: number; l: number; c: number }[] {
  const out = []
  for (let i = 0; i < opens.length - 1; i++) {
    const o = opens[i]
    const c = opens[i + 1]
    const range = Math.abs(c - o) + variance
    const h = Math.max(o, c) + Math.random() * range * 0.4
    const l = Math.min(o, c) - Math.random() * range * 0.4
    out.push({ o, h, l, c })
  }
  return out
}

// Pre-baked patterns
const HEAD_SHOULDERS = build([100, 103, 100, 105, 108, 105, 102, 105, 107, 104, 100, 96, 92])
const DOUBLE_TOP     = build([100, 104, 107, 105, 108, 106, 102, 105, 108, 106, 100, 95, 90])
const ASCENDING_TRIANGLE = build([100, 102, 104, 100, 104, 101, 104, 102, 104, 103, 104, 106, 109])
const FALLING_WEDGE  = build([110, 105, 108, 102, 105, 100, 102, 99, 101, 100, 105, 110, 115])
const BULL_FLAG      = build([100, 105, 110, 115, 113, 111, 113, 111, 113, 116, 120, 124, 128])
const CUP_HANDLE     = build([100, 95, 92, 90, 92, 95, 99, 102, 100, 98, 100, 105, 110])
const DESCENDING_TRIANGLE = build([110, 108, 100, 105, 100, 103, 100, 102, 100, 100, 100, 96, 92])
const ROUNDING_BOTTOM = build([110, 105, 100, 96, 94, 93, 94, 96, 99, 103, 107, 110, 113])

export const PATTERN_MATCH: MiniGame = {
  slug: 'technical-analysis',
  title: 'Pattern Match',
  tagline: 'Name the chart pattern from price action alone — 8 charts, 4 names each.',
  accentColor: '3B82F6',
  passThreshold: 0.7,
  rounds: [
    {
      id: 'pm1', kind: 'chart_mcq',
      context: 'Pattern · 1 of 8',
      prompt: 'What pattern is forming on this chart?',
      chart: { candles: HEAD_SHOULDERS, height: 240 },
      options: [
        { label: 'Head and Shoulders', correct: true, feedback: 'Yes. Three peaks with a higher middle peak — classic reversal pattern.' },
        { label: 'Double Top', correct: false, feedback: 'Close — but a Double Top has only two peaks of equal height.' },
        { label: 'Cup and Handle', correct: false, feedback: 'Cup and Handle is a continuation pattern with a U shape.' },
        { label: 'Ascending Triangle', correct: false, feedback: 'Ascending Triangle has a flat top with a rising bottom.' },
      ],
      explanation: 'Head and Shoulders signals a trend reversal. The neckline (drawn through the lows between peaks) is the trigger — break it and the measured target is the head height projected down.',
    },
    {
      id: 'pm2', kind: 'chart_mcq',
      context: 'Pattern · 2 of 8',
      prompt: 'Name the pattern.',
      chart: { candles: DOUBLE_TOP, height: 240 },
      options: [
        { label: 'Double Top', correct: true, feedback: 'Right. Two peaks at roughly equal height with a valley between them — bearish reversal.' },
        { label: 'Head and Shoulders', correct: false, feedback: 'Head and Shoulders has THREE peaks with the middle being highest.' },
        { label: 'Bull Flag', correct: false, feedback: 'Bull Flag is a continuation pattern after a strong move.' },
        { label: 'Triple Top', correct: false, feedback: 'Triple Top has three peaks — only two here.' },
      ],
      explanation: 'Double Top fails the second time at resistance. The valley low becomes the neckline; break it and a measured move down typically follows. Always confirm with volume on the breakdown.',
    },
    {
      id: 'pm3', kind: 'chart_mcq',
      context: 'Pattern · 3 of 8',
      prompt: 'Identify this pattern.',
      chart: { candles: ASCENDING_TRIANGLE, height: 240 },
      options: [
        { label: 'Ascending Triangle', correct: true, feedback: 'Correct. Higher lows pressing into a flat resistance — bullish breakout pattern.' },
        { label: 'Symmetrical Triangle', correct: false, feedback: 'Symmetrical has both lines converging at similar angles.' },
        { label: 'Bull Flag', correct: false, feedback: 'Flag is shorter, comes after a sharp move.' },
        { label: 'Wedge', correct: false, feedback: 'Wedges have both sides sloping in the same direction.' },
      ],
      explanation: 'Ascending Triangle: buyers consistently step up, sellers defend a fixed price. Once buyers exhaust the sellers, breakout. Bias: bullish.',
    },
    {
      id: 'pm4', kind: 'chart_mcq',
      context: 'Pattern · 4 of 8',
      prompt: 'What pattern is this?',
      chart: { candles: FALLING_WEDGE, height: 240 },
      options: [
        { label: 'Falling Wedge', correct: true, feedback: 'Yes. Both lines slope down but the lower converges faster — bullish reversal pattern.' },
        { label: 'Descending Triangle', correct: false, feedback: 'Descending Triangle has a flat bottom — this one has a falling bottom.' },
        { label: 'Bear Flag', correct: false, feedback: 'Bear Flag is shorter, follows a sharp drop.' },
        { label: 'Double Bottom', correct: false, feedback: 'Double Bottom has two clear lows — wedges have steady descent.' },
      ],
      explanation: 'Falling Wedge: range narrows as price drifts lower, signaling sellers losing strength. Break above the upper trendline = entry.',
    },
    {
      id: 'pm5', kind: 'chart_mcq',
      context: 'Pattern · 5 of 8',
      prompt: 'Name this continuation pattern.',
      chart: { candles: BULL_FLAG, height: 240 },
      options: [
        { label: 'Bull Flag', correct: true, feedback: 'Right. Sharp uptrend (the pole), then a tight pullback (the flag) — continuation upward.' },
        { label: 'Pennant', correct: false, feedback: 'Pennants are similar but converging into a point. Flags are parallel channels.' },
        { label: 'Cup and Handle', correct: false, feedback: 'Cup and Handle has a long rounded U.' },
        { label: 'Ascending Triangle', correct: false, feedback: 'Ascending Triangle has a flat top.' },
      ],
      explanation: 'Bull Flag is one of the most reliable continuation patterns. Pole gives you the height; the breakout from the flag projects that distance.',
    },
    {
      id: 'pm6', kind: 'chart_mcq',
      context: 'Pattern · 6 of 8',
      prompt: 'Which pattern?',
      chart: { candles: CUP_HANDLE, height: 240 },
      options: [
        { label: 'Cup and Handle', correct: true, feedback: 'Correct. Long rounded U (the cup), short pullback (the handle), breakout above resistance.' },
        { label: 'Double Bottom', correct: false, feedback: 'Double Bottom has two clear lows; this is a smooth U.' },
        { label: 'Rounded Bottom', correct: false, feedback: 'Close, but the handle is the distinguishing feature.' },
        { label: 'Wedge', correct: false, feedback: 'Wedges have converging trendlines.' },
      ],
      explanation: 'Cup and Handle: William O\'Neil\'s classic. Cup of 3-12 weeks, handle 1-2 weeks. Breakout above the rim = entry. Heavy volume confirms.',
    },
    {
      id: 'pm7', kind: 'chart_mcq',
      context: 'Pattern · 7 of 8',
      prompt: 'Identify this bearish pattern.',
      chart: { candles: DESCENDING_TRIANGLE, height: 240 },
      options: [
        { label: 'Descending Triangle', correct: true, feedback: 'Right. Flat support with lower highs — sellers control. Break below = continuation down.' },
        { label: 'Falling Wedge', correct: false, feedback: 'Falling Wedge has both sides falling.' },
        { label: 'Bear Flag', correct: false, feedback: 'Bear Flag follows a sharp drop with a smaller channel.' },
        { label: 'Symmetrical Triangle', correct: false, feedback: 'Symmetrical has both sides converging at similar angles.' },
      ],
      explanation: 'Descending Triangle: buyers progressively step back, sellers hold a fixed price. Eventually support breaks. Bias: bearish, target = triangle height projected down.',
    },
    {
      id: 'pm8', kind: 'chart_mcq',
      context: 'Pattern · 8 of 8',
      prompt: 'What pattern?',
      chart: { candles: ROUNDING_BOTTOM, height: 240 },
      options: [
        { label: 'Rounding Bottom', correct: true, feedback: 'Yes. Slow saucer-shaped reversal — long accumulation phase before breakout.' },
        { label: 'Cup and Handle', correct: false, feedback: 'Cup and Handle has a defined handle pullback after the cup.' },
        { label: 'V-Bottom', correct: false, feedback: 'V-Bottom is sharp and fast, not gradual.' },
        { label: 'Double Bottom', correct: false, feedback: 'Double Bottom shows two clear retest lows.' },
      ],
      explanation: 'Rounding Bottom takes weeks to months. The slow shape signals patient accumulation. Breakout above the prior resistance line on rising volume = entry.',
    },
  ],
}
