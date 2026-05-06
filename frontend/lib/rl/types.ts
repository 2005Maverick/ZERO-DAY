// RL types — contextual bandit (LinUCB / LinTS family)

export const TOPICS = [
  'psychology', 'technicals', 'risk', 'swing', 'candles',
  'trends', 'volume', 'plan', 'momentum', 'backtest',
] as const
export type Topic = typeof TOPICS[number]

export const TRAITS = ['discipline', 'composure', 'patience', 'informedness'] as const
export type Trait = typeof TRAITS[number]

export interface UserState {
  skill: Record<Topic, number>
  traits: Record<Trait, number>
  recentMistakes: Record<string, number>
  engagement: {
    completionRate: number
    avgSessionMinutes: number
    streak: number
  }
}

export type Action =
  | { kind: 'PLAYLIST'; slug: Topic }
  | { kind: 'GAME'; slug: Topic; difficulty: 'easy' | 'med' | 'hard' }
  | { kind: 'LIVE_SESSION'; scenario: 'COV-20' }
  | { kind: 'REPLAY_DEBRIEF' }
  | { kind: 'CUSTOM_DRILL'; weakness: Topic }

export function actionId(a: Action): string {
  switch (a.kind) {
    case 'PLAYLIST':       return `pl:${a.slug}`
    case 'GAME':           return `gm:${a.slug}:${a.difficulty}`
    case 'LIVE_SESSION':   return `live:${a.scenario}`
    case 'REPLAY_DEBRIEF': return 'replay'
    case 'CUSTOM_DRILL':   return `drill:${a.weakness}`
  }
}

export function actionLabel(a: Action): string {
  switch (a.kind) {
    case 'PLAYLIST':       return `Playlist · ${cap(a.slug)}`
    case 'GAME':           return `Game · ${cap(a.slug)} · ${a.difficulty}`
    case 'LIVE_SESSION':   return `Live · ${a.scenario}`
    case 'REPLAY_DEBRIEF': return 'Re-read Debrief'
    case 'CUSTOM_DRILL':   return `Drill · ${cap(a.weakness)}`
  }
}

function cap(s: string): string { return s.charAt(0).toUpperCase() + s.slice(1) }

export interface Outcome {
  completed: boolean
  passed: boolean
  replayed: boolean
  abandoned: boolean
  skillDelta: number
  mistakeReduction: number
  timeOverBudget: boolean
}

export interface ArmWeights {
  actionId: string
  A: number[][]
  b: number[]
  pulls: number
  totalReward: number
}

export interface BanditState {
  d: number
  alpha: number
  arms: Record<string, ArmWeights>
  totalSteps: number
}
