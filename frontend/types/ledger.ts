// ============================================================================
// THE LEDGER — Type System
// ============================================================================
// Every piece of content in the app — videos, simulations, mini-games,
// trader profiles, achievements — is a "case" in the leather-bound ledger.
// Each case is one two-page spread.
// ============================================================================

export type CaseType =
  | 'lecture'           // Vol I — YouTube curriculum
  | 'simulation'        // Vol III — historical day simulations
  | 'drill'             // Vol II — mini-games (10 of them)
  | 'analysis'          // Vol IV — pattern recognition deep-dives
  | 'profile'           // Vol V — famous trader biographies
  | 'achievement'       // Vol VI — badges / milestones
  | 'chapter-divider'   // Volume intro pages

export type CaseStatus =
  | 'unread'         // never opened
  | 'in-progress'    // started but not finished
  | 'completed'      // done
  | 'locked'         // requires progression
  | 'coming-soon'    // content not yet built

export type VolumeId = 'I' | 'II' | 'III' | 'IV' | 'V' | 'VI'

interface BaseCase {
  id: string                  // e.g. 'LEH-08', 'V001', 'D003'
  number: number              // 1..N — page number stamped on the spread
  volume: VolumeId
  type: CaseType
  title: string
  status: CaseStatus
  date?: string               // historical date for sims (ISO or display)
  tags?: string[]
}

// ─── Per-type case shapes ───────────────────────────────────

export interface LectureCase extends BaseCase {
  type: 'lecture'
  videoId: string | null      // YouTube video ID; null = placeholder
  durationMin: number
  takeaways: string[]
  glossary?: { term: string; def: string }[]
}

export interface SimulationCase extends BaseCase {
  type: 'simulation'
  difficulty: 1 | 2 | 3 | 4 | 5
  durationMin: number
  reward: { xp: number; rules: number }
  hookLine: string             // the italic subtitle on the right page
  body?: string                // optional longer description
  clippingHeadline: string     // the pasted-newspaper-headline on the left page
  operativeTags: string[]      // tags shown as cream string-tied labels
}

export interface DrillCase extends BaseCase {
  type: 'drill'
  concept: string
  mechanic: string
  bestScore?: number
  timesPlayed?: number
}

export interface AnalysisCase extends BaseCase {
  type: 'analysis'
  pattern: string
  bodyMd: string
}

export interface ProfileCase extends BaseCase {
  type: 'profile'
  trader: string
  lifespan: string             // e.g. "1877–1940"
  pullQuote: string
  bodyMd: string
  threeLessons?: string[]
}

export interface AchievementCase extends BaseCase {
  type: 'achievement'
  description: string
  unlockedAt?: string
}

export interface ChapterDivider extends BaseCase {
  type: 'chapter-divider'
  volumeRoman: VolumeId
  volumeName: string
  volumeTagline: string
}

export type Case =
  | LectureCase
  | SimulationCase
  | DrillCase
  | AnalysisCase
  | ProfileCase
  | AchievementCase
  | ChapterDivider

// ─── Volume metadata ────────────────────────────────────────

export interface Volume {
  id: VolumeId
  name: string
  tagline: string
  firstCase: number
  lastCase: number
  defaultEntry: number   // case number to land on when entering this volume
}
