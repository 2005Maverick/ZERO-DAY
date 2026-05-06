import type { MiniGame } from '../game-types'

function build(opens: number[]) {
  const out = []
  for (let i = 0; i < opens.length - 1; i++) {
    const o = opens[i], c = opens[i + 1]
    const range = Math.abs(c - o) + 1
    out.push({
      o, c,
      h: Math.max(o, c) + Math.random() * range * 0.5,
      l: Math.min(o, c) - Math.random() * range * 0.5,
    })
  }
  return out
}

export const HOLD_OR_FOLD: MiniGame = {
  slug: 'swing-trading',
  title: 'Hold or Fold',
  tagline: '7 open positions on your screen — decide hold, exit, or add.',
  accentColor: '10B981',
  passThreshold: 0.7,
  rounds: [
    {
      id: 'hf1', kind: 'scenario',
      context: 'Position · 1 of 7',
      prompt: 'You bought RELIANCE 3 days ago. It is up 4%. The chart shows a clean uptrend continuing. Stop is at break-even. What do you do?',
      chart: { candles: build([1400, 1410, 1418, 1425, 1430, 1435, 1442, 1448, 1452]), height: 200 },
      positionState: { symbol: 'RELIANCE', entry: 1400, current: 1452, qtyPct: 8 },
      options: [
        { label: 'Hold — let the winner run, trail stop higher', correct: true, feedback: 'Right. When trends are working and you have a stop in profit, the rule is "let it work."' },
        { label: 'Exit immediately — take the 4% profit', correct: false, feedback: 'Tempting but wrong. Exiting winners early is the disposition effect. Trends often last longer than you expect.' },
        { label: 'Double down at current price', correct: false, feedback: 'Adding to a winner can be fine, but doubling at this point inflates risk. Add small if at all, and only at logical retests.' },
        { label: 'Sell half', correct: false, feedback: 'Halfway-house exits are emotional compromises. With stop in profit, just hold.' },
      ],
      explanation: 'The hardest skill in swing trading is letting winners run. Your default should be "trail stop, do nothing" when a position is working as planned.',
    },
    {
      id: 'hf2', kind: 'scenario',
      context: 'Position · 2 of 7',
      prompt: 'You bought TCS 2 days ago. It dipped immediately and is now -5% from entry. Your stop loss was set at -3% but you "moved it down" to -7% to avoid getting stopped out. What is the right move?',
      chart: { candles: build([3800, 3780, 3750, 3720, 3700, 3690, 3680, 3670]), height: 200 },
      positionState: { symbol: 'TCS', entry: 3800, current: 3610, qtyPct: 12 },
      options: [
        { label: 'Exit now — moving the stop violated your plan', correct: true, feedback: 'Yes. Moving stops AGAINST you is the cardinal sin. Take the loss, regroup.' },
        { label: 'Hold, it might bounce', correct: false, feedback: 'Hope is not a strategy. Once you violate your own rules, the trade is no longer a planned trade.' },
        { label: 'Average down at lower price', correct: false, feedback: 'Adding to a loser to "reduce average" is how positions become disasters. The thesis was already wrong.' },
        { label: 'Move the stop down further', correct: false, feedback: 'Compounding the original mistake. Stops only ever move FORWARD (in your favor).' },
      ],
      explanation: 'Moving stops to avoid pain is the most expensive habit in trading. The stop loss exists precisely so you exit before pain becomes catastrophe. Honor it.',
    },
    {
      id: 'hf3', kind: 'scenario',
      context: 'Position · 3 of 7',
      prompt: 'You bought INDIGO at ₹1,200 with a stop at ₹1,170. It rallied to ₹1,260 (+5%), then pulled back to ₹1,230. Your stop is still at ₹1,170. What now?',
      chart: { candles: build([1200, 1215, 1230, 1245, 1260, 1255, 1240, 1235, 1230]), height: 200 },
      positionState: { symbol: 'INDIGO', entry: 1200, current: 1230, qtyPct: 6 },
      options: [
        { label: 'Move stop to break-even (₹1,200)', correct: true, feedback: 'Perfect. After a clear move in your favor, moving stop to break-even guarantees no loss on the trade.' },
        { label: 'Exit now and take the +2.5%', correct: false, feedback: 'Possible, but premature. The trade is still working — you just gave back some intra-day gains.' },
        { label: 'Hold without moving stop', correct: false, feedback: 'Acceptable but inferior. You are leaving free risk reduction on the table.' },
        { label: 'Add more shares at the dip', correct: false, feedback: 'Risky — pyramid only when there is fresh confirmation, not just a pullback.' },
      ],
      explanation: 'Moving stop to break-even after a meaningful favorable move is one of the highest-leverage habits in trading. It locks in the trade as risk-free without capping upside.',
    },
    {
      id: 'hf4', kind: 'scenario',
      context: 'Position · 4 of 7',
      prompt: 'You shorted SUNPHARMA expecting weakness. It is at break-even after 2 days. Earnings drop tomorrow morning. What do you do?',
      chart: { candles: build([420, 422, 419, 421, 420, 421, 420, 420]), height: 200 },
      positionState: { symbol: 'SUNPHARMA', entry: 420, current: 420, qtyPct: 5 },
      options: [
        { label: 'Close position before earnings', correct: true, feedback: 'Yes. Earnings = binary event. Holding through is gambling, not trading. Reset and trade the reaction.' },
        { label: 'Hold — earnings might confirm thesis', correct: false, feedback: 'Earnings outcomes are unknowable. Holding short into them is gambling against an uncertain catalyst.' },
        { label: 'Add to short before the drop', correct: false, feedback: 'Doubling exposure into a binary unknown is the wrong direction.' },
        { label: 'Swap to call options as hedge', correct: false, feedback: 'Adds complexity without changing the core mistake — you are exposed to a binary event with conviction below 50%.' },
      ],
      explanation: 'Pre-defined catalysts (earnings, Fed days, scheduled news) are not trading edges — they are coin flips. Either size DOWN dramatically or close before the event.',
    },
    {
      id: 'hf5', kind: 'scenario',
      context: 'Position · 5 of 7',
      prompt: 'You bought HDFC at ₹1,500. It is now ₹1,650 (+10%). The chart broke out of a 6-month base. Volume confirms. What is your action?',
      chart: { candles: build([1500, 1510, 1520, 1540, 1570, 1600, 1620, 1640, 1650]), height: 200 },
      positionState: { symbol: 'HDFC', entry: 1500, current: 1650, qtyPct: 7 },
      options: [
        { label: 'Hold and trail stop to ₹1,600', correct: true, feedback: 'Right. Strong breakout with volume — this is what you wait for. Trail to lock in significant gains while staying in the trend.' },
        { label: 'Exit — take the +10%', correct: false, feedback: 'Premature. A confirmed breakout from a 6-month base typically runs much further than 10%.' },
        { label: 'Add full size at current price', correct: false, feedback: 'You are adding at the breakout extension — chasing. If you add, do it on a controlled pullback to a support level, not at the high.' },
        { label: 'Sell half, let half run', correct: false, feedback: 'Capping upside on a confirmed breakout. This is "feels like the right move" emotional thinking.' },
      ],
      explanation: 'A confirmed breakout from a long base is one of the highest-probability swing setups. Trail stops aggressively but DO NOT exit prematurely. The big gains hide here.',
    },
    {
      id: 'hf6', kind: 'scenario',
      context: 'Position · 6 of 7',
      prompt: 'NIFTY just gapped down 3%. You hold 5 long positions, all approximately at break-even. What is the right response?',
      positionState: { symbol: 'PORTFOLIO', entry: 100000, current: 99500, qtyPct: 95 },
      options: [
        { label: 'Tighten all stops to manage risk', correct: true, feedback: 'Right. A market-wide gap means correlation risk is high. Tighten exits to cap any deepening losses.' },
        { label: 'Hold all positions — they are still at break-even', correct: false, feedback: 'Break-even today might be -5% by close. Market gaps signal regime shifts; act decisively.' },
        { label: 'Buy more — "stocks are on sale"', correct: false, feedback: 'Catching a falling knife into an unclear regime is rarely right. Wait for stabilization first.' },
        { label: 'Exit all positions immediately', correct: false, feedback: 'Aggressive but not necessarily wrong — could be a valid call. However, tightening stops is more measured and less emotional.' },
      ],
      explanation: 'When the broad market regime shifts suddenly, individual stock theses become correlated. Manage book-level risk, not just per-position risk.',
    },
    {
      id: 'hf7', kind: 'scenario',
      context: 'Position · 7 of 7',
      prompt: 'You held TITAN through a -8% drawdown believing in the thesis. It bounced back to break-even after a week. Most painful position you have managed. What now?',
      chart: { candles: build([1050, 1020, 990, 970, 980, 1000, 1020, 1040, 1050]), height: 200 },
      positionState: { symbol: 'TITAN', entry: 1050, current: 1050, qtyPct: 8 },
      options: [
        { label: 'Exit at break-even and take the lesson', correct: true, feedback: 'Yes. The market gave you an exit at zero P&L on a trade that violated risk rules. Take it. Plan better next time.' },
        { label: 'Hold — your thesis was right, just early', correct: false, feedback: 'Survivor narrative. The trade had no stop — that\'s the lesson, not the bounce.' },
        { label: 'Add at break-even — momentum confirmed', correct: false, feedback: 'You are emotionally biased toward this trade now. Adding compounds the wrong lesson.' },
        { label: 'Tighten stop to ₹1,030', correct: false, feedback: 'Reasonable but missing the bigger lesson — the original trade had no risk management.' },
      ],
      explanation: 'Trades that "should not have worked" but did are the most dangerous lessons. The market does not validate bad process just because you got lucky. Exit and recalibrate.',
    },
  ],
}
