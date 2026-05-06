import type { MiniGame } from '../game-types'

export const STRATEGY_JUDGE: MiniGame = {
  slug: 'backtesting',
  title: 'Strategy Judge',
  tagline: '6 backtest reports — which strategy is real edge vs curve fit?',
  accentColor: '8B5CF6',
  passThreshold: 0.66,
  rounds: [
    {
      id: 'sj1', kind: 'mcq',
      context: 'Backtest · 1 of 6',
      prompt: 'Strategy A: 1,200 trades, 52% win rate, 1.8 R:R, Sharpe 1.4, max drawdown 18%. Strategy B: 28 trades, 75% win rate, 3.2 R:R, Sharpe 0.9, max drawdown 8%. Which is more likely to be REAL edge vs curve fit?',
      options: [
        { label: 'Strategy A (more trades, lower DD-adjusted Sharpe)', correct: true, feedback: 'Right. Sample size matters. 28 trades is way too few to claim edge — likely overfitted.' },
        { label: 'Strategy B (higher win rate and R:R)', correct: false, feedback: 'Tempting numbers, but 28 trades is statistically meaningless. You can fit any narrative to that few data points.' },
        { label: 'Both are equally valid', correct: false, feedback: 'They are not. Sample size separates real strategies from lucky narratives.' },
        { label: 'Cannot tell without more data', correct: false, feedback: 'You CAN tell — sample size below ~100 is a red flag regardless of other stats.' },
      ],
      explanation: 'Sample size > everything else. 28 trades = noise. 1,200 trades + Sharpe 1.4 = real edge. Headline win rates and R:R can be cherry-picked. Statistically significant edge requires hundreds of trades.',
    },
    {
      id: 'sj2', kind: 'mcq',
      context: 'Backtest · 2 of 6',
      prompt: 'Strategy backtest: 200 trades, +180% total return over 3 years. Underlying market returned +25% same period. Sharpe is 2.1. The strategy uses ONE indicator with a parameter optimized at value 23. What is the RED FLAG?',
      options: [
        { label: 'Single optimized parameter — likely curve fit', correct: true, feedback: 'Right. Optimizing one parameter on the same data you backtest = the strategy was tuned to past noise.' },
        { label: 'The total return is too high', correct: false, feedback: 'High return is not itself a red flag — outperformance happens.' },
        { label: '200 trades is too few', correct: false, feedback: 'Borderline but acceptable for many strategies.' },
        { label: 'Sharpe of 2.1 is unrealistic', correct: false, feedback: 'High Sharpe is achievable — Sharpe alone is not the issue here.' },
      ],
      explanation: 'Curve fitting: optimizing parameters on the SAME data you test on guarantees great backtest results, terrible live results. Always use walk-forward analysis or out-of-sample testing.',
    },
    {
      id: 'sj3', kind: 'mcq',
      context: 'Backtest · 3 of 6',
      prompt: 'A backtest shows +400% return but the equity curve is choppy with multiple 35%+ drawdowns. Net Sharpe: 0.5. Would you trade this?',
      options: [
        { label: 'No — drawdowns will force you to abandon it before recovery', correct: true, feedback: 'Right. The math may work but psychologically you will quit during the 35% draw.' },
        { label: 'Yes — high return justifies the path', correct: false, feedback: 'You won\'t hold through 35% drawdowns. Most traders quit at 15%. Backtest math ignores human psychology.' },
        { label: 'Yes — Sharpe 0.5 is fine', correct: false, feedback: 'Sharpe 0.5 with 35% drawdowns is a red flag. The pain-to-reward ratio is poor.' },
        { label: 'Only if I can use 2× leverage', correct: false, feedback: 'Adding leverage to a high-DD strategy is a recipe for ruin.' },
      ],
      explanation: 'Path matters more than total return. A 35% drawdown wipes out psychological capital — you will exit the strategy at the worst possible time. Prefer smoother equity curves with 10-15% max DD.',
    },
    {
      id: 'sj4', kind: 'mcq',
      context: 'Backtest · 4 of 6',
      prompt: 'The strategy was backtested 2018-2023. It returned +60% per year. The market was in a strong bull regime that entire period (low vol, mostly up). What should you check before trusting it?',
      options: [
        { label: 'Test it on bear-market data (2008, 2020 March)', correct: true, feedback: 'Right. A long-only strategy in a bull market is just beta. You need to see how it survives drawdowns.' },
        { label: 'Trust it — 60% per year is great', correct: false, feedback: 'Bull market alpha can be just bull market beta in disguise.' },
        { label: 'Increase the position size', correct: false, feedback: 'Sizing up an untested-in-bear strategy is dangerous.' },
        { label: 'Only trade it during bull markets', correct: false, feedback: 'Predicting regimes is hard. The point is to test the strategy in bears before committing capital.' },
      ],
      explanation: 'Survivorship of regime: a strategy that only works in one market regime is fragile. Always test across at least one full bear market. 2008 and 2020 March are the classic stress tests for Indian equities.',
    },
    {
      id: 'sj5', kind: 'mcq',
      context: 'Backtest · 5 of 6',
      prompt: 'Backtest assumes 0% slippage, 0% transaction costs, and perfect fills at desired prices. Real-world results: -8% even though backtest showed +22%. What was missed?',
      options: [
        { label: 'Real-world friction (slippage, fees, market impact)', correct: true, feedback: 'Right. Fees + bid-ask spread + slippage = 1-3% per round trip easily, especially on small caps.' },
        { label: 'Bad luck', correct: false, feedback: 'Consistent gap between backtest and live = systematic, not luck.' },
        { label: 'The market changed regime', correct: false, feedback: 'Possible but not the most likely explanation when the gap is this large.' },
        { label: 'The strategy was wrong', correct: false, feedback: 'The strategy might be fine — the backtest was unrealistic.' },
      ],
      explanation: 'Always model real-world friction. Indian retail: 0.1% brokerage + STT + GST + slippage = 0.3-0.5% per round trip. On a 100-trade strategy, that\'s 30-50% of returns vanished. Backtest with realistic costs.',
    },
    {
      id: 'sj6', kind: 'mcq',
      context: 'Backtest · 6 of 6',
      prompt: 'Strategy A: Sharpe 1.5, 12% max DD, 350 trades, tested 2010-2022 + walk-forward. Strategy B: Sharpe 3.5, 6% max DD, 80 trades, optimized over the same 2010-2022 window. Which would you actually deploy?',
      options: [
        { label: 'Strategy A — robust process despite lower flashy stats', correct: true, feedback: 'Right. Walk-forward + sample size + reasonable DD = real edge. B looks too clean.' },
        { label: 'Strategy B — better Sharpe, lower DD', correct: false, feedback: 'B looks better on paper precisely because it was tuned on the data. Live results will disappoint.' },
        { label: 'Either, your call', correct: false, feedback: 'No — there is a clear right answer based on backtest methodology.' },
        { label: 'Run them both, see which works', correct: false, feedback: 'Capital allocation should not be guesswork. The methodology of A is robust; B is suspect.' },
      ],
      explanation: 'When two backtests look very different, prefer the one with sound methodology over flashy stats. Walk-forward, large sample, realistic costs — these are the markers of real edge. "Too good to be true" usually is.',
    },
  ],
}
