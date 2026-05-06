import type { Archetype, ArchetypeCard, BehaviorProfile, Mistake } from './types'

const ARCHETYPE_DEF: Record<Archetype, { oneLiner: string; traits: string[] }> = {
  Methodical: {
    oneLiner: 'Defines risk before reward, sizes small, reads the room.',
    traits: [
      'Set stop losses on most or all trades',
      'Position sizes stayed within sensible bounds',
      'Engaged with news context before acting',
    ],
  },
  Cowboy: {
    oneLiner: 'Big sizes, no stops, fast clicks. Lottery-ticket style.',
    traits: [
      'Position sizes far exceeded recommended limits',
      'Few or no stop losses defined',
      'Trades placed quickly after entries with little setup',
    ],
  },
  Frozen: {
    oneLiner: 'Watched more than acted. Decision paralysis.',
    traits: [
      'Few or no trades placed during the session',
      'Significant time spent paused',
      'Signals were available but not acted on',
    ],
  },
  Reactive: {
    oneLiner: 'Trades fast on news, slow on analysis. Signal-blind.',
    traits: [
      'Multiple trades placed within seconds of news drops',
      'Theses were short or missing',
      'Behavior driven by headlines, not setups',
    ],
  },
  RevengeTrader: {
    oneLiner: 'Doubles down after losses. Emotion over plan.',
    traits: [
      'Trade size grew significantly after a realized loss',
      'Fast follow-up trades with weak rationale',
      'Risk management overridden by chasing the loss',
    ],
  },
  Paperhanded: {
    oneLiner: 'Cuts winners early, hopes on losers. Disposition effect.',
    traits: [
      'Average winner was held far shorter than average loser',
      'Profits taken at small gains, losses left to grow',
      'Hope rather than rules drove exits',
    ],
  },
}

export function classifyArchetype(profile: BehaviorProfile, mistakes: Mistake[]): ArchetypeCard {
  const has = (id: Mistake['id']) => mistakes.some(m => m.id === id)

  let archetype: Archetype = 'Methodical'
  let confidence = 0.6

  if (profile.tradeCount === 0) {
    archetype = 'Frozen'
    confidence = 0.95
  } else if (profile.tradeCount <= 1 && profile.pauseMinutes > 5) {
    archetype = 'Frozen'
    confidence = 0.85
  } else if (has('REVENGE_TRADE')) {
    archetype = 'RevengeTrader'
    confidence = 0.90
  } else if (has('OVERSIZED_POSITION') && has('NO_STOP_LOSS')) {
    archetype = 'Cowboy'
    confidence = 0.88
  } else if (profile.newsReflexCount >= 2 && profile.thesisRate < 0.4) {
    archetype = 'Reactive'
    confidence = 0.80
  } else if (has('DISPOSITION_EFFECT')) {
    archetype = 'Paperhanded'
    confidence = 0.82
  } else if (profile.slUsageRate >= 0.7 && profile.avgPositionSizePct <= 0.15 && profile.thesisRate >= 0.6) {
    archetype = 'Methodical'
    confidence = 0.85
  } else {
    // Default to weakest match — not strongly any archetype
    archetype = 'Methodical'
    confidence = 0.45
  }

  const def = ARCHETYPE_DEF[archetype]
  return {
    archetype,
    confidence,
    oneLiner: def.oneLiner,
    traits: def.traits,
  }
}
