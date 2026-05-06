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

const REAL_BO = [100, 100, 99, 101, 100, 100, 101, 100, 105, 110, 115, 119, 122]
const FAKE_BO = [100, 100, 99, 101, 100, 100, 101, 100, 105, 102, 99, 96, 95]
const VOLATILITY_EXP = [100, 99, 100, 99, 100, 99, 100, 100, 105, 92, 108, 88, 110]
const SQUEEZE_OK = [100, 100.5, 99.5, 100.2, 99.8, 100, 100.3, 99.9, 100.5, 105, 110, 115, 119]
const TRAP = [100, 102, 104, 102, 105, 103, 106, 104, 107, 110, 105, 100, 95]
const QUIET = [100, 100, 99, 101, 100, 100, 100, 99, 100, 100, 99, 100, 100]

export const BREAKOUT_HUNTER: MiniGame = {
  slug: 'momentum-volatility',
  title: 'Breakout Hunter',
  tagline: '6 setups — real breakout or volatility trap?',
  accentColor: 'F97316',
  passThreshold: 0.66,
  rounds: [
    {
      id: 'bh1', kind: 'chart_mcq',
      context: 'Setup · 1 of 6',
      prompt: 'Stock has been ranging tightly for 8 sessions. Today it breaks out with an expanding-range candle and rising volume. Read this:',
      chart: { candles: build(REAL_BO), volume: [10, 11, 9, 11, 10, 9, 11, 10, 25, 32, 38, 42, 40], height: 240 },
      options: [
        { label: 'Real breakout — buy with stop below the range', correct: true, feedback: 'Right. Tight base + expanding-range candle + volume = high-probability momentum entry.' },
        { label: 'Volatility trap — fade it', correct: false, feedback: 'No trap signs — clean range, decisive break, volume confirms.' },
        { label: 'Wait for a deep pullback', correct: false, feedback: 'Some traders wait for a retest, but on tight-base breakouts the retest often does not come — momentum continues.' },
        { label: 'Sell short — overextended', correct: false, feedback: 'Shorting fresh confirmed breakouts is a money-loser.' },
      ],
      explanation: 'Tight base + expanding candle + volume = "TBE" = textbook momentum entry. The compressed range gives you a tight stop; the breakout direction gives you an asymmetric R:R.',
    },
    {
      id: 'bh2', kind: 'chart_mcq',
      context: 'Setup · 2 of 6',
      prompt: 'Stock pokes above resistance, then immediately reverses lower the same day, closing back below the breakout level. What is this?',
      chart: { candles: build(FAKE_BO), volume: [10, 11, 9, 11, 10, 9, 11, 10, 18, 14, 16, 18, 22], height: 240 },
      options: [
        { label: 'Failed breakout / bull trap — short opportunity', correct: true, feedback: 'Right. Failed breakouts often lead to sharp reversals as trapped longs exit.' },
        { label: 'Healthy retest', correct: false, feedback: 'A healthy retest holds above the breakout level. Closing below = failure.' },
        { label: 'Continuation', correct: false, feedback: 'Continuation requires the breakout to hold, not reverse.' },
        { label: 'Range-bound noise', correct: false, feedback: 'A failed breakout is meaningful information, not noise.' },
      ],
      explanation: 'Failed breakouts are often more profitable than successful ones. Trapped buyers must liquidate, providing fuel for the reverse move. Trade rule: if a breakout fails to hold, the next move is typically opposite and fast.',
    },
    {
      id: 'bh3', kind: 'chart_mcq',
      context: 'Setup · 3 of 6',
      prompt: 'After weeks of low volatility, the stock starts producing huge daily range candles in BOTH directions. ATR triples. What is happening?',
      chart: { candles: build(VOLATILITY_EXP), height: 240 },
      options: [
        { label: 'Volatility expansion — reduce size, widen stops', correct: true, feedback: 'Right. Expanded range means each day moves more — your stop must be wider, so your size must be smaller.' },
        { label: 'Strong directional trend', correct: false, feedback: 'Trends have direction. Whipsaw both ways = volatility, not trend.' },
        { label: 'Time to size up — more volatility = more profit', correct: false, feedback: 'Wrong. Higher volatility = wider stops = SMALLER position size for the same risk.' },
        { label: 'Stocks always settle back to lower volatility quickly', correct: false, feedback: 'Volatility regimes can persist for weeks. Don\'t bet on quick mean reversion.' },
      ],
      explanation: 'Volatility expansion changes the math. Same R:R requires a wider stop, which requires a smaller position. New traders size by ₹ — pros size by ATR. Adapt or get chopped.',
    },
    {
      id: 'bh4', kind: 'chart_mcq',
      context: 'Setup · 4 of 6',
      prompt: 'A stock has been in an extremely tight 1% range for 2 weeks (a "squeeze"). Today it breaks out 5% on heavy volume. Read this:',
      chart: { candles: build(SQUEEZE_OK), volume: [12, 11, 10, 11, 11, 10, 12, 11, 12, 30, 42, 48, 44], height: 240 },
      options: [
        { label: 'Squeeze release — high-probability momentum entry', correct: true, feedback: 'Right. Tight squeeze + decisive break = explosive moves, often 2-3× the squeeze height.' },
        { label: 'Just noise — let it settle', correct: false, feedback: 'Tight ranges followed by 5% breaks on volume are not noise — they are the most reliable momentum setups.' },
        { label: 'Trap — fade it', correct: false, feedback: 'No trap signs — volume confirms the move.' },
        { label: 'Wait for 50% retracement', correct: false, feedback: 'On squeeze releases, retracements are often shallow. Wait too long = miss the move.' },
      ],
      explanation: 'Bollinger Band squeezes (price compressing into a tight range) often resolve with explosive directional moves. The longer the squeeze, the bigger the resolution. Volume on the breakout candle is the confirmation.',
    },
    {
      id: 'bh5', kind: 'chart_mcq',
      context: 'Setup · 5 of 6',
      prompt: 'Stock makes 5 consecutive higher highs over 5 days. The 5th day spikes hard but closes mid-range. Volume is climaxing. Read this:',
      chart: { candles: build(TRAP), volume: [12, 14, 16, 18, 22, 26, 32, 38, 48, 38, 28, 22, 18], height: 240 },
      options: [
        { label: 'Likely top — exhaustion / blow-off pattern', correct: true, feedback: 'Right. 5+ consecutive up-days with climax volume + intra-day reversal = late-stage move.' },
        { label: 'Continuation buy', correct: false, feedback: 'Late-stage moves with climax volume rarely continue without a deep correction first.' },
        { label: 'Just a pullback', correct: false, feedback: 'Pullbacks come AFTER the move. This is the move ending, not a pullback.' },
        { label: 'Buy aggressively for new highs', correct: false, feedback: 'Buying after 5 up-days at climax volume is buying the top.' },
      ],
      explanation: 'Climax patterns: extended trend + parabolic acceleration + climax volume = the late stage. By the time everyone is bullish, the move is nearly over. Take profits, do not add.',
    },
    {
      id: 'bh6', kind: 'chart_mcq',
      context: 'Setup · 6 of 6',
      prompt: 'A stock has been completely flat for 3 weeks. Volatility (ATR) is at multi-month lows. No catalyst on the horizon. Volume is dying. What is the play?',
      chart: { candles: build(QUIET), volume: [12, 10, 11, 9, 11, 8, 9, 8, 10, 7, 8, 9, 6], height: 240 },
      options: [
        { label: 'No trade — wait for a catalyst or volatility expansion', correct: true, feedback: 'Right. Quiet markets with declining volume and no catalyst offer no edge. Patience.' },
        { label: 'Buy now — coiled spring will explode', correct: false, feedback: 'A "coiled spring" is just a hopeful narrative. Without a catalyst, low-vol markets often stay low-vol for weeks.' },
        { label: 'Sell short — declining volume is bearish', correct: false, feedback: 'Declining volume in a flat range is just disinterest. Not directional.' },
        { label: 'Day trade the small ranges', correct: false, feedback: 'Range too tight to extract edge after costs.' },
      ],
      explanation: 'The hardest skill in trading is doing nothing when there is nothing to do. Quiet markets with no edge are signals to step away. You\'re not paid for activity — you\'re paid for the trades you DO take being good ones.',
    },
  ],
}
