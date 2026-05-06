// Academy — playlist catalog metadata.
// Each playlist links to a YouTube playlist + has its own mini-game config.

export interface Playlist {
  slug: string
  title: string
  shortTitle: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  description: string
  ytPlaylistId: string
  videoCount: number          // approximate, for display
  topics: string[]
  accentColor: string         // hex without #
  gameTitle: string
  gameTagline: string
}

export const PLAYLISTS: Playlist[] = [
  {
    slug: 'market-psychology',
    title: 'Market Psychology',
    shortTitle: 'Psychology',
    difficulty: 'Beginner',
    description: 'Comprehensive analysis of psychological factors affecting trader behavior and market movements.',
    ytPlaylistId: 'PLhbDDyiRMHWS3NFtJGYUKMHYbgAiqS4Db',
    videoCount: 24,
    topics: ['FOMO', 'Loss aversion', 'Anchoring', 'Herd mentality', 'Disposition effect'],
    accentColor: 'A855F7',
    gameTitle: 'Bias Spotter',
    gameTagline: 'Identify the cognitive bias behind 8 trading scenarios.',
  },
  {
    slug: 'technical-analysis',
    title: 'Technical Analysis Fundamentals',
    shortTitle: 'Tech Analysis',
    difficulty: 'Beginner',
    description: 'Core concepts of technical analysis including chart patterns, support/resistance levels, and price action.',
    ytPlaylistId: 'PLhbDDyiRMHWSqKcT5-ptrPGS6QPUFX3YP',
    videoCount: 32,
    topics: ['Support/Resistance', 'Trend lines', 'Chart patterns', 'Breakouts'],
    accentColor: '3B82F6',
    gameTitle: 'Pattern Match',
    gameTagline: 'Name the chart pattern from price action alone.',
  },
  {
    slug: 'risk-management',
    title: 'Risk Management Strategies',
    shortTitle: 'Risk',
    difficulty: 'Beginner',
    description: 'Essential risk management techniques including position sizing, stop losses, and portfolio protection methods.',
    ytPlaylistId: 'PLhbDDyiRMHWQW5913v-6BUuM_Or_MafQD',
    videoCount: 18,
    topics: ['Position sizing', 'Stop loss', 'Risk-reward', 'Portfolio heat'],
    accentColor: 'FF1F1F',
    gameTitle: 'Position Sizer',
    gameTagline: 'Compute the correct share count for 6 risk scenarios.',
  },
  {
    slug: 'swing-trading',
    title: 'Swing Trading Techniques',
    shortTitle: 'Swing',
    difficulty: 'Intermediate',
    description: 'Practical swing trading strategies for capturing medium-term market moves and managing multi-day positions.',
    ytPlaylistId: 'PLhbDDyiRMHWSm2cERzF5qPV6PYrkcASu5',
    videoCount: 22,
    topics: ['Setups', 'Multi-day holds', 'Earnings plays', 'Weekly bias'],
    accentColor: '10B981',
    gameTitle: 'Hold or Fold',
    gameTagline: '7 open positions on your screen — decide hold, exit, or add.',
  },
  {
    slug: 'candlestick-patterns',
    title: 'Candlestick Patterns & Price Action',
    shortTitle: 'Candles',
    difficulty: 'Intermediate',
    description: 'In-depth study of candlestick formations, reversal patterns, and pure price action trading methods.',
    ytPlaylistId: 'PLhbDDyiRMHWTSdKa8OekP9EUM1xsmdByG',
    videoCount: 28,
    topics: ['Doji', 'Hammer', 'Engulfing', 'Morning star', 'Evening star'],
    accentColor: 'D4A04D',
    gameTitle: 'Candle Caller',
    gameTagline: 'Name 8 candlestick formations as they flash on screen.',
  },
  {
    slug: 'moving-averages',
    title: 'Moving Averages & Trend Trading',
    shortTitle: 'MA & Trend',
    difficulty: 'Intermediate',
    description: 'Using moving averages for trend identification and developing systematic trend-following trading systems.',
    ytPlaylistId: 'PLCwIUJ315Zt8kXbSS47w6O3CgzAXuaxSc',
    videoCount: 20,
    topics: ['Golden cross', 'Death cross', 'Trend identification', 'MA stacks'],
    accentColor: '14B8A6',
    gameTitle: 'Trend Reader',
    gameTagline: '6 charts with MA overlays — call the regime.',
  },
  {
    slug: 'volume-structure',
    title: 'Volume & Market Structure',
    shortTitle: 'Volume',
    difficulty: 'Intermediate',
    description: 'Analyzing volume patterns and understanding market structure to identify institutional activity and breakouts.',
    ytPlaylistId: 'PLCwIUJ315Zt-5UdpGFBwdaVUUO3N2OMlh',
    videoCount: 16,
    topics: ['Volume confirmation', 'Volume divergence', 'Smart money', 'Liquidity zones'],
    accentColor: 'E11D48',
    gameTitle: 'Volume Detective',
    gameTagline: '6 breakouts — is the volume confirming or trapping?',
  },
  {
    slug: 'trading-plan',
    title: 'Trading Plan Development',
    shortTitle: 'Plan',
    difficulty: 'Beginner',
    description: 'Creating comprehensive trading plans with clear entry/exit rules, trade journaling, and performance tracking.',
    ytPlaylistId: 'PLCwIUJ315Zt_6HqAHTkQF6RWRgq22a5Fn',
    videoCount: 14,
    topics: ['Entry rules', 'Exit rules', 'Position sizing', 'Trade journal'],
    accentColor: '06B6D4',
    gameTitle: 'Plan Builder',
    gameTagline: 'Pick the rules that make a complete trading plan — across 6 strategies.',
  },
  {
    slug: 'momentum-volatility',
    title: 'Momentum & Volatility Trading',
    shortTitle: 'Momentum',
    difficulty: 'Advanced',
    description: 'Trading momentum indicators and volatility-based strategies for capturing rapid market moves.',
    ytPlaylistId: 'PLCwIUJ315Zt-VeBLzenEscwp81Tg6DqxT',
    videoCount: 18,
    topics: ['ATR', 'Bollinger bands', 'Breakouts', 'Volatility expansion'],
    accentColor: 'F97316',
    gameTitle: 'Breakout Hunter',
    gameTagline: '6 setups — real breakout or volatility trap?',
  },
  {
    slug: 'backtesting',
    title: 'Backtesting & Strategy Validation',
    shortTitle: 'Backtest',
    difficulty: 'Advanced',
    description: 'Methods for backtesting trading strategies, performance analysis, and statistical validation of trading systems.',
    ytPlaylistId: 'PLCwIUJ315Zt8aawnFJgOGHSd73MozWP13',
    videoCount: 12,
    topics: ['Sharpe ratio', 'Drawdown', 'Walk-forward', 'Statistical edge'],
    accentColor: '8B5CF6',
    gameTitle: 'Strategy Judge',
    gameTagline: '6 backtest reports — which strategy is real edge vs curve fit?',
  },
]

export function getPlaylist(slug: string): Playlist | undefined {
  return PLAYLISTS.find(p => p.slug === slug)
}
