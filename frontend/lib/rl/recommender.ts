'use client'

import { useCallback, useEffect, useState } from 'react'
import { useTracer } from '@/lib/behavior/tracer'
import type { Action, BanditState, Outcome } from './types'
import { TOPICS, actionId } from './types'
import { initBandit, loadBandit, pick, pickTop, predictAll, saveBandit, update, type ArmPrediction } from './bandit'
import { buildState, vectorize, FEATURE_DIM } from './state-builder'
import { computeReward } from './reward'

export const ACTION_CATALOGUE: Action[] = [
  ...TOPICS.map(t => ({ kind: 'PLAYLIST' as const, slug: t })),
  ...TOPICS.map(t => ({ kind: 'GAME' as const, slug: t, difficulty: 'med' as const })),
  ...TOPICS.flatMap(t => ([
    { kind: 'GAME' as const, slug: t, difficulty: 'easy' as const },
    { kind: 'GAME' as const, slug: t, difficulty: 'hard' as const },
  ])),
  { kind: 'LIVE_SESSION', scenario: 'COV-20' },
  { kind: 'REPLAY_DEBRIEF' },
  ...TOPICS.map(t => ({ kind: 'CUSTOM_DRILL' as const, weakness: t })),
]

export function useRecommender() {
  const { events } = useTracer()
  const [bandit, setBandit] = useState<BanditState>(() =>
    loadBandit() ?? initBandit(FEATURE_DIM, ACTION_CATALOGUE)
  )

  const stateVec = vectorize(buildState(events))
  const userState = buildState(events)

  const recommend = useCallback((n = 3): ArmPrediction[] => {
    return pickTop(bandit, stateVec, n)
  }, [bandit, stateVec])

  const allPredictions = useCallback((): ArmPrediction[] => {
    return predictAll(bandit, stateVec)
  }, [bandit, stateVec])

  const observe = useCallback((action: Action, outcome: Outcome) => {
    const id = actionId(action)
    const reward = computeReward(outcome)
    const updated = update(bandit, id, stateVec, reward)
    setBandit({ ...updated })
    saveBandit(updated)
    return { actionId: id, reward }
  }, [bandit, stateVec])

  useEffect(() => { saveBandit(bandit) }, [bandit])

  return {
    bandit, setBandit,
    userState, stateVec,
    recommend, allPredictions, observe,
    pickArm: () => pick(bandit, stateVec),
  }
}
