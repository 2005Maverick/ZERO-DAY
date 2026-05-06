// LinUCB contextual bandit.

import type { Action, ArmWeights, BanditState } from './types'
import { actionId } from './types'
import { dot, eye, inverse, matVec, outerProductInto, vecZero } from './math'

const STORAGE_KEY = 'zdm-rl-bandit'
const DEFAULT_ALPHA = 1.2
const REGULARIZATION = 1.0

export function initArm(d: number, id: string): ArmWeights {
  return {
    actionId: id,
    A: eye(d, REGULARIZATION),
    b: vecZero(d),
    pulls: 0,
    totalReward: 0,
  }
}

export function initBandit(d: number, allActions: Action[], alpha = DEFAULT_ALPHA): BanditState {
  const arms: Record<string, ArmWeights> = {}
  for (const a of allActions) {
    const id = actionId(a)
    arms[id] = initArm(d, id)
  }
  return { d, alpha, arms, totalSteps: 0 }
}

export interface ArmPrediction {
  actionId: string
  expected: number
  uncertainty: number
  ucb: number
  pulls: number
  weights: number[]
}

export function predictArm(arm: ArmWeights, state: number[], alpha: number): ArmPrediction {
  const Ainv = inverse(arm.A)
  const theta = matVec(Ainv, arm.b)
  const mu = dot(theta, state)
  const variance = Math.max(0, dot(state, matVec(Ainv, state)))
  const sigma = Math.sqrt(variance)
  return {
    actionId: arm.actionId,
    expected: mu,
    uncertainty: sigma,
    ucb: mu + alpha * sigma,
    pulls: arm.pulls,
    weights: theta,
  }
}

export function predictAll(b: BanditState, state: number[]): ArmPrediction[] {
  return Object.values(b.arms).map(arm => predictArm(arm, state, b.alpha))
}

export function pick(b: BanditState, state: number[]): { actionId: string; prediction: ArmPrediction } {
  const preds = predictAll(b, state)
  preds.sort((p1, p2) => p2.ucb - p1.ucb)
  return { actionId: preds[0].actionId, prediction: preds[0] }
}

export function pickTop(b: BanditState, state: number[], n = 3): ArmPrediction[] {
  const preds = predictAll(b, state)
  preds.sort((p1, p2) => p2.ucb - p1.ucb)
  return preds.slice(0, n)
}

export function update(b: BanditState, actionId: string, state: number[], reward: number): BanditState {
  const arm = b.arms[actionId]
  if (!arm) return b
  outerProductInto(arm.A, state)
  for (let i = 0; i < arm.b.length; i++) arm.b[i] += reward * state[i]
  arm.pulls += 1
  arm.totalReward += reward
  return { ...b, totalSteps: b.totalSteps + 1 }
}

export function saveBandit(b: BanditState): void {
  if (typeof window === 'undefined') return
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(b)) } catch {}
}

export function loadBandit(): BanditState | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as BanditState
  } catch { return null }
}

export function resetBandit(): void {
  if (typeof window === 'undefined') return
  try { localStorage.removeItem(STORAGE_KEY) } catch {}
}
