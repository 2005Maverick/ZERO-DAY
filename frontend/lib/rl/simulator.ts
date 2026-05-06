// Synthetic-user simulator (kept for future re-introduction of the demo UI).

import type { Action, BanditState, Outcome, UserState } from './types'
import { TOPICS, actionId } from './types'
import { initBandit, pick, update } from './bandit'
import { vectorize, FEATURE_DIM } from './state-builder'
import { ACTION_CATALOGUE } from './recommender'
import { computeReward } from './reward'

interface SyntheticUser {
  id: string
  trueSkill: Record<string, number>
  weakTopic: string
  archetype: 'methodical' | 'cowboy' | 'frozen' | 'reactive'
}

export function generateUser(id: number): SyntheticUser {
  const archetypes = ['methodical', 'cowboy', 'frozen', 'reactive'] as const
  const archetype = archetypes[Math.floor(Math.random() * archetypes.length)]
  const trueSkill: Record<string, number> = {}
  for (const t of TOPICS) trueSkill[t] = 0.2 + Math.random() * 0.4
  const weakTopic = TOPICS[Math.floor(Math.random() * TOPICS.length)]
  trueSkill[weakTopic] = Math.min(trueSkill[weakTopic], 0.25)
  return { id: `u${id}`, trueSkill, weakTopic, archetype }
}

export function userToState(u: SyntheticUser): number[] {
  const s: UserState = {
    skill: {
      psychology: u.trueSkill.psychology, technicals: u.trueSkill.technicals,
      risk: u.trueSkill.risk, swing: u.trueSkill.swing, candles: u.trueSkill.candles,
      trends: u.trueSkill.trends, volume: u.trueSkill.volume, plan: u.trueSkill.plan,
      momentum: u.trueSkill.momentum, backtest: u.trueSkill.backtest,
    },
    traits: {
      discipline: u.archetype === 'methodical' ? 0.85 : u.archetype === 'cowboy' ? 0.2 : 0.5,
      composure:  u.archetype === 'methodical' ? 0.85 : u.archetype === 'reactive' ? 0.3 : 0.55,
      patience:   u.archetype === 'frozen' ? 0.4 : u.archetype === 'reactive' ? 0.3 : 0.6,
      informedness: 0.5,
    },
    recentMistakes: {},
    engagement: { completionRate: 0.7, avgSessionMinutes: 8, streak: 2 },
  }
  return vectorize(s)
}

export function syntheticOutcome(u: SyntheticUser, action: Action): Outcome {
  let topicMatch = 0
  if (action.kind === 'PLAYLIST' || action.kind === 'GAME' || action.kind === 'CUSTOM_DRILL') {
    const slug = action.kind === 'CUSTOM_DRILL' ? action.weakness : action.slug
    if (slug === u.weakTopic) topicMatch = 1
    else if (u.trueSkill[slug] < 0.4) topicMatch = 0.5
  }
  let archetypeFit = 0.5
  if (action.kind === 'GAME' && action.difficulty === 'med') archetypeFit = 0.7
  if (action.kind === 'GAME' && u.archetype === 'frozen' && action.difficulty === 'easy') archetypeFit = 0.85
  if (action.kind === 'PLAYLIST' && u.archetype === 'methodical') archetypeFit = 0.85
  const passed = Math.random() < 0.4 + 0.4 * topicMatch + 0.1 * archetypeFit
  const completed = Math.random() < 0.7 + 0.2 * archetypeFit
  return {
    completed,
    passed,
    replayed: passed && Math.random() < 0.3,
    abandoned: !completed && Math.random() < 0.4,
    skillDelta: topicMatch * (passed ? 0.15 : 0.05),
    mistakeReduction: topicMatch * archetypeFit * (passed ? 1 : 0),
    timeOverBudget: !passed && Math.random() < 0.2,
  }
}

export interface SimulationStep {
  step: number
  userId: string
  actionId: string
  reward: number
  cumulativeReward: number
}

export function runCohortSimulation(numUsers: number, sessionsPerUser: number): {
  bandit: BanditState
  steps: SimulationStep[]
  averageRewardCurve: number[]
} {
  let bandit = initBandit(FEATURE_DIM, ACTION_CATALOGUE)
  const users = Array.from({ length: numUsers }, (_, i) => generateUser(i))
  const steps: SimulationStep[] = []
  const rewardWindow: number[][] = []
  let cumulativeReward = 0

  for (let s = 0; s < sessionsPerUser; s++) {
    let stepRewards = 0
    for (const u of users) {
      const x = userToState(u)
      const { actionId: id } = pick(bandit, x)
      const action = ACTION_CATALOGUE.find(a => actionId(a) === id) ?? ACTION_CATALOGUE[0]
      const outcome = syntheticOutcome(u, action)
      const reward = computeReward(outcome)
      bandit = update(bandit, id, x, reward)
      cumulativeReward += reward
      stepRewards += reward
      steps.push({ step: s, userId: u.id, actionId: id, reward, cumulativeReward })
    }
    rewardWindow.push([stepRewards / numUsers])
  }
  const averageRewardCurve = rewardWindow.map(w => w[0])
  return { bandit, steps, averageRewardCurve }
}
