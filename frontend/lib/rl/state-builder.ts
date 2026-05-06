import type { TraceEvent } from '@/lib/behavior/types'
import { computeProfile } from '@/lib/behavior/profile'
import type { Topic, Trait, UserState } from './types'
import { TOPICS, TRAITS } from './types'

const D = 24

export const FEATURE_DIM = D

export function vectorize(s: UserState): number[] {
  const v: number[] = []
  for (const t of TOPICS) v.push(clamp(s.skill[t]))
  for (const tr of TRAITS) v.push(clamp(s.traits[tr]))
  v.push(clamp((s.recentMistakes['NO_STOP_LOSS'] ?? 0) / 5))
  v.push(clamp((s.recentMistakes['OVERSIZED_POSITION'] ?? 0) / 5))
  v.push(clamp((s.recentMistakes['REVENGE_TRADE'] ?? 0) / 3))
  v.push(clamp((s.recentMistakes['PANIC_SELL'] ?? 0) / 3))
  v.push(clamp((s.recentMistakes['DISPOSITION_EFFECT'] ?? 0) / 2))
  v.push(clamp((s.recentMistakes['NO_THESIS'] ?? 0) / 5))
  v.push(clamp(s.engagement.completionRate))
  v.push(clamp(s.engagement.avgSessionMinutes / 60))
  v.push(clamp(s.engagement.streak / 7))
  v.push(1)
  return v
}

function clamp(x: number, lo = 0, hi = 1): number {
  if (!Number.isFinite(x)) return 0
  return Math.max(lo, Math.min(hi, x))
}

const GAME_TO_TOPIC: Record<string, Topic> = {
  'market-psychology':    'psychology',
  'technical-analysis':   'technicals',
  'risk-management':      'risk',
  'swing-trading':        'swing',
  'candlestick-patterns': 'candles',
  'moving-averages':      'trends',
  'volume-structure':     'volume',
  'trading-plan':         'plan',
  'momentum-volatility':  'momentum',
  'backtesting':          'backtest',
}

export function buildState(events: TraceEvent[]): UserState {
  const skill: Record<Topic, number> = {
    psychology: 0.3, technicals: 0.3, risk: 0.3, swing: 0.3, candles: 0.3,
    trends: 0.3, volume: 0.3, plan: 0.3, momentum: 0.3, backtest: 0.3,
  }
  const traits: Record<Trait, number> = {
    discipline: 0.5, composure: 0.5, patience: 0.5, informedness: 0.5,
  }
  const recentMistakes: Record<string, number> = {}

  for (const ev of events) {
    if (ev.kind === 'game_completed' && ev.data) {
      const slug = String(ev.data.gameSlug ?? '')
      const topic = GAME_TO_TOPIC[slug]
      if (!topic) continue
      const passed = !!ev.data.passed
      const grade = String(ev.data.grade ?? '')
      const evidence = passed ? (grade === 'S' ? 1.0 : grade === 'A' ? 0.85 : grade === 'B' ? 0.70 : 0.55) : 0.40
      skill[topic] = skill[topic] * 0.6 + evidence * 0.4
    }
    if (ev.kind === 'tutorial_quiz_answered' && ev.data) {
      const correct = !!ev.data.correct
      const bump = correct ? 0.02 : -0.005
      skill.plan = clamp(skill.plan + bump)
      skill.risk = clamp(skill.risk + bump)
      skill.psychology = clamp(skill.psychology + bump)
    }
  }

  const profile = computeProfile(events)
  if (profile.tradeCount > 0) {
    traits.discipline = clamp(0.3 * profile.slUsageRate + 0.4 * profile.thesisRate + 0.3 * (1 - profile.oversizedTradeCount / Math.max(1, profile.tradeCount)))
    traits.composure  = clamp(1 - 0.4 * (profile.panicSellCount + profile.revengeTradeCount) / Math.max(1, profile.tradeCount))
    traits.patience   = clamp(0.5 + 0.5 * (1 / Math.max(1, profile.dispositionRatio)) - 0.3 * (profile.fomoBuyCount > 0 ? 1 : 0))
    traits.informedness = clamp(profile.newsViewedRate)
  }

  if (profile.slUsageRate < 0.5) recentMistakes['NO_STOP_LOSS'] = Math.round((1 - profile.slUsageRate) * 5)
  if (profile.oversizedTradeCount > 0) recentMistakes['OVERSIZED_POSITION'] = profile.oversizedTradeCount
  if (profile.revengeTradeCount > 0) recentMistakes['REVENGE_TRADE'] = profile.revengeTradeCount
  if (profile.panicSellCount > 0) recentMistakes['PANIC_SELL'] = profile.panicSellCount
  if (profile.dispositionRatio > 2) recentMistakes['DISPOSITION_EFFECT'] = Math.round(profile.dispositionRatio - 2)
  if (profile.thesisRate < 0.5) recentMistakes['NO_THESIS'] = Math.round((1 - profile.thesisRate) * 5)

  const sessions = events.filter(e => e.kind === 'session_start').length
  const completedGames = events.filter(e => e.kind === 'game_completed').length
  const startedGames = events.filter(e => e.kind === 'game_started').length
  const completionRate = startedGames > 0 ? completedGames / startedGames : 0.5
  const totalMs = events.length > 0 ? (events[events.length - 1].t - events[0].t) : 0
  const avgSessionMinutes = sessions > 0 ? (totalMs / sessions) / 60_000 : 5

  return {
    skill, traits, recentMistakes,
    engagement: {
      completionRate,
      avgSessionMinutes,
      streak: Math.min(7, sessions),
    },
  }
}
