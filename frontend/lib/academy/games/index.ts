import type { MiniGame } from '../game-types'
import { BIAS_SPOTTER } from './bias-spotter'
import { PATTERN_MATCH } from './pattern-match'
import { POSITION_SIZER } from './position-sizer'
import { HOLD_OR_FOLD } from './hold-or-fold'
import { CANDLE_CALLER } from './candle-caller'
import { TREND_READER } from './trend-reader'
import { VOLUME_DETECTIVE } from './volume-detective'
import { PLAN_BUILDER } from './plan-builder'
import { BREAKOUT_HUNTER } from './breakout-hunter'
import { STRATEGY_JUDGE } from './strategy-judge'

export const GAMES: Record<string, MiniGame> = {
  'market-psychology': BIAS_SPOTTER,
  'technical-analysis': PATTERN_MATCH,
  'risk-management': POSITION_SIZER,
  'swing-trading': HOLD_OR_FOLD,
  'candlestick-patterns': CANDLE_CALLER,
  'moving-averages': TREND_READER,
  'volume-structure': VOLUME_DETECTIVE,
  'trading-plan': PLAN_BUILDER,
  'momentum-volatility': BREAKOUT_HUNTER,
  'backtesting': STRATEGY_JUDGE,
}

export function getGame(slug: string): MiniGame | undefined {
  return GAMES[slug]
}
