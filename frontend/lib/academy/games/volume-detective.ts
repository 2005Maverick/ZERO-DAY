import type { MiniGame } from '../game-types'

function build(opens: number[]) {
  const out = []
  for (let i = 0; i < opens.length - 1; i++) {
    const o = opens[i], c = opens[i + 1]
    const range = Math.abs(c - o) + 1
    out.push({
      o, c,
      h: Math.max(o, c) + Math.random() * range * 0.3,
      l: Math.min(o, c) - Math.random() * range * 0.3,
    })
  }
  return out
}

const BREAKOUT_CONFIRMED = [100, 100, 100, 101, 100, 102, 105, 109, 113]
const VOL_CONFIRM = [10, 12, 11, 10, 11, 13, 35, 42, 38]    // big vol on breakout

const BREAKOUT_TRAP = [100, 100, 99, 101, 102, 103, 105, 102, 99]
const VOL_TRAP = [12, 13, 14, 12, 11, 10, 14, 12, 11]        // weak vol on breakout

const DROP_CONFIRMED = [100, 99, 98, 95, 92, 88, 85, 82, 80]
const VOL_DROP_C = [10, 12, 14, 28, 34, 38, 32, 28, 24]      // big vol on drop

const DROP_NOISE = [100, 99, 100, 97, 99, 98, 100, 102, 104]
const VOL_DROP_N = [11, 13, 12, 10, 12, 11, 13, 12, 14]      // no conviction

const ABSORPTION = [100, 105, 102, 106, 103, 107, 104, 108, 105]
const VOL_ABSORB = [10, 38, 14, 35, 16, 32, 18, 30, 20]      // huge vol but no progress

const CLIMAX = [100, 102, 104, 108, 113, 119, 124, 122, 118]
const VOL_CLIMAX = [12, 14, 17, 22, 30, 48, 65, 28, 24]      // climax volume at top

export const VOLUME_DETECTIVE: MiniGame = {
  slug: 'volume-structure',
  title: 'Volume Detective',
  tagline: '6 breakouts and reversals — does volume confirm or trap?',
  accentColor: 'E11D48',
  passThreshold: 0.66,
  rounds: [
    {
      id: 'vd1', kind: 'chart_mcq',
      context: 'Setup · 1 of 6',
      prompt: 'A stock just broke above resistance. Volume on the breakout candle is 3× average. What does this tell you?',
      chart: { candles: build(BREAKOUT_CONFIRMED), volume: VOL_CONFIRM, height: 240 },
      options: [
        { label: 'Confirmed breakout — institutional buying', correct: true, feedback: 'Right. Heavy volume = real money behind the move. High-probability follow-through.' },
        { label: 'Trap — fade the breakout', correct: false, feedback: 'Volume is the opposite of a trap — heavy volume means commitment.' },
        { label: 'Distribution — sellers stepping in', correct: false, feedback: 'Distribution typically shows volume with no upside progress; this candle has both.' },
        { label: 'Climax — exhaustion', correct: false, feedback: 'Climax is at the END of a long move, not at a fresh breakout.' },
      ],
      explanation: 'Volume is the truth-teller. A breakout on heavy volume means real demand absorbing supply — institutions buying. Volume below average on a breakout = retail-driven, often fails.',
    },
    {
      id: 'vd2', kind: 'chart_mcq',
      context: 'Setup · 2 of 6',
      prompt: 'Stock pokes above resistance but volume on the breakout is at average levels — no spike. What does this suggest?',
      chart: { candles: build(BREAKOUT_TRAP), volume: VOL_TRAP, height: 240 },
      options: [
        { label: 'Likely false breakout / trap', correct: true, feedback: 'Right. No volume = no real buying interest. Stock will likely fall back into range.' },
        { label: 'Strong breakout — buy aggressively', correct: false, feedback: 'Without volume confirmation, "breakouts" often fail. Skip this one.' },
        { label: 'Continuation guaranteed', correct: false, feedback: 'Nothing is guaranteed in markets, especially without volume confirmation.' },
        { label: 'Reversal forming', correct: false, feedback: 'Reversal would need different price structure — this is just a low-conviction pop.' },
      ],
      explanation: 'A breakout without volume is just a tentative price move. Smart money does not show up = move does not last. Wait for retest with volume before committing.',
    },
    {
      id: 'vd3', kind: 'chart_mcq',
      context: 'Setup · 3 of 6',
      prompt: 'Stock is dropping hard. Volume increases progressively each candle. Read this:',
      chart: { candles: build(DROP_CONFIRMED), volume: VOL_DROP_C, height: 240 },
      options: [
        { label: 'Real distribution — institutions selling', correct: true, feedback: 'Yes. Rising volume on a drop = active selling, not just lack of buyers.' },
        { label: 'Just noise — wait it out', correct: false, feedback: 'Heavy volume means real money is selling. This is signal, not noise.' },
        { label: 'Bullish accumulation', correct: false, feedback: 'Accumulation looks like steady volume on sideways or rising price.' },
        { label: 'Climax bottom forming', correct: false, feedback: 'Climax is a sharp single-day spike, not progressively rising volume.' },
      ],
      explanation: 'Distribution: heavy selling pressure as institutions exit. The pattern of rising volume on declining price means the down-move has commitment behind it. Don\'t catch this knife.',
    },
    {
      id: 'vd4', kind: 'chart_mcq',
      context: 'Setup · 4 of 6',
      prompt: 'Stock is dropping but volume is below average. The drop is small in magnitude. Read this:',
      chart: { candles: build(DROP_NOISE), volume: VOL_DROP_N, height: 240 },
      options: [
        { label: 'Healthy pullback / noise — likely to recover', correct: true, feedback: 'Right. No volume = no conviction selling. Bigger players are not exiting.' },
        { label: 'Major distribution', correct: false, feedback: 'Distribution requires heavy volume.' },
        { label: 'Trend reversal', correct: false, feedback: 'Without volume, you cannot call a reversal.' },
        { label: 'Stop everything and exit', correct: false, feedback: 'Overreacting to low-volume moves is how you get whipsawed.' },
      ],
      explanation: 'Low-volume pullbacks are healthy in uptrends. Smart money is not selling — supply is just temporarily exceeding demand on a tiny scale. These often reverse without further damage.',
    },
    {
      id: 'vd5', kind: 'chart_mcq',
      context: 'Setup · 5 of 6',
      prompt: 'Price keeps trying to push up but each rally hits a wall. Volume is heavy on every up-attempt but the price barely advances. What is happening?',
      chart: { candles: build(ABSORPTION), volume: VOL_ABSORB, height: 240 },
      options: [
        { label: 'Absorption / supply zone — sellers absorbing buys', correct: true, feedback: 'Yes. Heavy volume but no progress means a large seller is matching every buyer. Bearish.' },
        { label: 'Strong accumulation', correct: false, feedback: 'Accumulation would show price advancing on heavy volume. This is the opposite.' },
        { label: 'Breakout building', correct: false, feedback: 'Breakouts go up, not stall at resistance.' },
        { label: 'Random noise', correct: false, feedback: 'Heavy volume is never noise — it is information.' },
      ],
      explanation: 'When volume is high but price refuses to advance, a large seller is "absorbing" the demand. Until that seller is exhausted, the stock won\'t break through. Watch for the day volume drops and price finally breaks — that is the entry.',
    },
    {
      id: 'vd6', kind: 'chart_mcq',
      context: 'Setup · 6 of 6',
      prompt: 'After a long uptrend, the stock spikes 6% on enormous volume — the highest in months — then closes below the open. Read this:',
      chart: { candles: build(CLIMAX), volume: VOL_CLIMAX, height: 240 },
      options: [
        { label: 'Climax / blow-off top — bearish reversal', correct: true, feedback: 'Right. Massive volume + intra-day reversal at extended highs = exhaustion. Distribution day.' },
        { label: 'Strong continuation up', correct: false, feedback: 'A continuation closes near the high. This closed below the open.' },
        { label: 'Breakout extension', correct: false, feedback: 'Climax is at the END of a move, characterized by failed continuation despite massive volume.' },
        { label: 'Healthy pullback', correct: false, feedback: 'Healthy pullbacks have low volume, not record highs.' },
      ],
      explanation: 'Climax volume after extended trend = late-stage capitulation buying. Everyone who wanted in is now in. The buyer pool exhausts, sellers take over. Classic distribution day pattern.',
    },
  ],
}
