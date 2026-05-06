'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, RotateCcw, Trophy, Zap, Heart, Flame, Skull, Activity, Clock } from 'lucide-react'
import type { MiniGame, CustomModeResult } from '@/lib/academy/game-types'
import { RoundRenderer } from './round-renderers'
import { CandleMemoryGame } from './custom/candle-memory'
import { PlanDragDropGame } from './custom/plan-dragdrop'
import { TrendContinuousGame } from './custom/trend-continuous'
import { useTracer } from '@/lib/behavior/tracer'
import { useRecommender } from '@/lib/rl/recommender'

type Phase = 'intro' | 'play' | 'gameover' | 'results' | 'custom'

const DEFAULT_TIMER = 25
const DEFAULT_LIVES = 3
const COMBO_THRESHOLDS = [3, 6, 9]
const COMBO_MULTIPLIERS = [1.5, 2, 3]
const BASE_POINTS = 100
const TIME_BONUS = 50

interface Props {
  game: MiniGame
}

export function MiniGameEngine({ game }: Props) {
  const { track } = useTracer()
  const { observe } = useRecommender()
  const [phase, setPhase] = useState<Phase>('intro')

  // Round-based state
  const [idx, setIdx] = useState(0)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [lives, setLives] = useState(game.lives ?? DEFAULT_LIVES)
  const [timeLeft, setTimeLeft] = useState(game.timerSec ?? DEFAULT_TIMER)
  const [answered, setAnswered] = useState(false)
  const [flash, setFlash] = useState<'correct' | 'wrong' | null>(null)
  const [comboPop, setComboPop] = useState(false)
  const hasStartedRef = useRef(false)

  // Custom-mode state
  const [customResult, setCustomResult] = useState<CustomModeResult | null>(null)

  const total = game.rounds.length
  const passThresholdScore = total * BASE_POINTS * (game.passThreshold ?? 0.7)
  const passed = score >= passThresholdScore && customResult === null
    ? true
    : customResult?.passed ?? false

  const round = game.rounds[idx]
  const timerSec = game.timerSec ?? DEFAULT_TIMER

  // Tick the timer down
  useEffect(() => {
    if (phase !== 'play' || answered) return
    if (timeLeft <= 0) {
      handleAnswered(false)
      return
    }
    const t = setTimeout(() => setTimeLeft(s => s - 1), 1000)
    return () => clearTimeout(t)
  }, [phase, answered, timeLeft])

  // Reset timer on new round
  useEffect(() => {
    if (phase === 'play') {
      setTimeLeft(timerSec)
      setAnswered(false)
      setFlash(null)
    }
  }, [idx, phase, timerSec])

  function multiplierFor(s: number): number {
    if (s >= COMBO_THRESHOLDS[2]) return COMBO_MULTIPLIERS[2]
    if (s >= COMBO_THRESHOLDS[1]) return COMBO_MULTIPLIERS[1]
    if (s >= COMBO_THRESHOLDS[0]) return COMBO_MULTIPLIERS[0]
    return 1
  }

  function handleAnswered(correct: boolean) {
    if (answered) return
    setAnswered(true)
    setFlash(correct ? 'correct' : 'wrong')
    if (correct) {
      const newStreak = streak + 1
      const mult = multiplierFor(newStreak)
      const timeBonus = Math.round((timeLeft / timerSec) * TIME_BONUS)
      const delta = Math.round((BASE_POINTS + timeBonus) * mult)
      setScore(s => s + delta)
      setStreak(newStreak)
      // Pop combo callout when crossing thresholds
      if (COMBO_THRESHOLDS.includes(newStreak)) {
        setComboPop(true)
        setTimeout(() => setComboPop(false), 1400)
        track('game_streak_milestone', 0, { gameSlug: game.slug, streak: newStreak, multiplier: mult })
      }
      track('game_round_answered', 0, {
        gameSlug: game.slug, roundId: round?.id, correct: true,
        timeLeft, scoreDelta: delta, streak: newStreak,
      })
    } else {
      setStreak(0)
      const newLives = Math.max(0, lives - 1)
      setLives(newLives)
      track('game_round_answered', 0, {
        gameSlug: game.slug, roundId: round?.id, correct: false,
        timeLeft, livesRemaining: newLives,
      })
      track('game_life_lost', 0, { gameSlug: game.slug, livesRemaining: newLives })
    }
  }

  function next() {
    if (lives <= 0) {
      track('game_over', 0, { gameSlug: game.slug, finalScore: score, atRound: idx + 1, total })
      setPhase('gameover')
      return
    }
    if (idx >= total - 1) {
      const passed = score >= passThresholdScore
      const grade = computeGrade(score, total * (BASE_POINTS + TIME_BONUS))
      track('game_completed', 0, { gameSlug: game.slug, finalScore: score, passed, grade })
      // Silently feed the RL recommender (no UI yet, but bandit accumulates history)
      observe(
        { kind: 'GAME', slug: game.slug as never, difficulty: 'med' },
        {
          completed: true, passed, replayed: false, abandoned: false,
          skillDelta: passed ? 0.12 : 0.04,
          mistakeReduction: passed ? 1 : 0,
          timeOverBudget: false,
        },
      )
      setPhase('results')
      return
    }
    setIdx(i => i + 1)
  }

  function start() {
    setIdx(0); setScore(0); setStreak(0); setLives(game.lives ?? DEFAULT_LIVES)
    setTimeLeft(timerSec); setAnswered(false); setFlash(null); setComboPop(false)
    setCustomResult(null)
    if (hasStartedRef.current) {
      track('game_replayed', 0, { gameSlug: game.slug })
    } else {
      track('game_started', 0, { gameSlug: game.slug, customMode: game.customMode ?? null })
      hasStartedRef.current = true
    }
    setPhase(game.customMode ? 'custom' : 'play')
  }

  function handleCustomDone(result: CustomModeResult) {
    setCustomResult(result)
    setScore(result.score)
    track('game_completed', 0, {
      gameSlug: game.slug, finalScore: result.score, maxScore: result.maxScore,
      passed: result.passed, customMode: game.customMode,
    })
    observe(
      { kind: 'GAME', slug: game.slug as never, difficulty: 'med' },
      {
        completed: true, passed: result.passed, replayed: false, abandoned: false,
        skillDelta: result.passed ? 0.15 : 0.05,
        mistakeReduction: result.passed ? 1 : 0,
        timeOverBudget: false,
      },
    )
    setPhase('results')
  }

  // ── Render ──────────────────────────────────────────────────

  if (phase === 'intro')    return <Intro game={game} onStart={start}/>
  if (phase === 'gameover') return <GameOver game={game} score={score} onRestart={start}/>
  if (phase === 'results')  return <Results game={game} score={score} customResult={customResult} passed={passed} onRestart={start}/>

  // Custom mode dispatch
  if (phase === 'custom') {
    if (game.customMode === 'candle-memory') return <CustomShell game={game}><CandleMemoryGame onComplete={handleCustomDone}/></CustomShell>
    if (game.customMode === 'plan-dragdrop') return <CustomShell game={game}><PlanDragDropGame onComplete={handleCustomDone}/></CustomShell>
    if (game.customMode === 'trend-continuous') return <CustomShell game={game}><TrendContinuousGame onComplete={handleCustomDone}/></CustomShell>
  }

  // Standard round-based play
  const accent = game.accentColor
  const mult = multiplierFor(streak)

  return (
    <div style={{
      position: 'relative',
      padding: '20px 24px 22px',
      background: 'linear-gradient(180deg, rgba(13,13,13,0.92) 0%, rgba(6,6,6,0.92) 100%)',
      backdropFilter: 'blur(8px)',
      border: `1px solid rgba(${rgb(accent)}, 0.30)`,
      borderRadius: '12px',
      boxShadow: `0 24px 60px rgba(0,0,0,0.6), 0 0 80px rgba(${rgb(accent)}, 0.06)`,
      overflow: 'hidden',
    }}>
      {/* Flash overlay */}
      {flash && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 5,
          background: flash === 'correct' ? 'radial-gradient(circle at center, rgba(16,185,129,0.30), transparent 70%)' : 'radial-gradient(circle at center, rgba(255,31,31,0.32), transparent 70%)',
          pointerEvents: 'none',
          animation: 'flash-pulse 0.5s ease-out',
        }}/>
      )}
      {/* Combo pop */}
      {comboPop && (
        <div style={{
          position: 'absolute', top: '40%', left: '50%', zIndex: 6,
          transform: 'translate(-50%, -50%)',
          fontFamily: 'var(--font-anton), sans-serif',
          fontSize: '64px', fontWeight: 700,
          color: `#${accent}`, letterSpacing: '0.08em',
          textShadow: `0 0 30px #${accent}, 0 0 60px #${accent}`,
          pointerEvents: 'none',
          animation: 'combo-pop 1.4s ease-out forwards',
        }}>×{mult} COMBO</div>
      )}

      <HUDBar game={game} idx={idx} total={total} score={score} streak={streak} mult={mult} lives={lives} timeLeft={timeLeft} timerSec={timerSec}/>

      <div key={idx} style={{ animation: 'rd-in 0.3s ease-out' }}>
        <RoundRenderer round={round} accent={accent} onAnswered={handleAnswered}/>
      </div>

      {answered && (
        <div style={{ marginTop: '14px', display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={next} style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 18px',
            background: `linear-gradient(135deg, #${accent}, ${darken(accent)})`,
            border: 'none', borderRadius: '6px', color: '#000',
            fontFamily: 'var(--font-inter), sans-serif',
            fontSize: '12px', fontWeight: 800,
            letterSpacing: '0.16em', textTransform: 'uppercase',
            cursor: 'pointer',
            boxShadow: `0 6px 18px rgba(${rgb(accent)}, 0.45)`,
          }}>
            {idx >= total - 1 ? 'See Final' : 'Next'} <ArrowRight size={13}/>
          </button>
        </div>
      )}

      <style>{`
        @keyframes rd-in { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
        @keyframes flash-pulse { from { opacity:1 } to { opacity:0 } }
        @keyframes combo-pop {
          0%   { opacity: 0; transform: translate(-50%, -50%) scale(0.7); }
          25%  { opacity: 1; transform: translate(-50%, -50%) scale(1.15); }
          75%  { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          100% { opacity: 0; transform: translate(-50%, -120%) scale(0.95); }
        }
        @keyframes shake {
          0%,100% { transform: translateX(0) }
          25% { transform: translateX(-6px) }
          75% { transform: translateX(6px) }
        }
      `}</style>
    </div>
  )
}

// ── HUD bar ──────────────────────────────────────────────────────

function HUDBar({
  game, idx, total, score, streak, mult, lives, timeLeft, timerSec,
}: {
  game: MiniGame; idx: number; total: number; score: number; streak: number; mult: number; lives: number; timeLeft: number; timerSec: number
}) {
  const accent = game.accentColor
  const timePct = Math.max(0, timeLeft / timerSec)
  const danger = timeLeft <= 5

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: '14px',
      marginBottom: '16px', paddingBottom: '12px',
      borderBottom: `1px solid rgba(${rgb(accent)}, 0.18)`,
      position: 'relative', zIndex: 4,
    }}>
      {/* Left — game title + round */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div>
          <div style={{
            fontFamily: 'var(--font-inter), sans-serif',
            fontSize: '9px', fontWeight: 800, color: `#${accent}`,
            letterSpacing: '0.26em', textTransform: 'uppercase',
          }}>{game.title}</div>
          <div style={{
            fontFamily: 'var(--font-jetbrains), monospace',
            fontSize: '10px', color: '#606060',
          }}>R{idx + 1}/{total}</div>
        </div>
        {/* Lives */}
        <div style={{ display: 'flex', gap: '3px' }}>
          {Array.from({ length: game.lives ?? DEFAULT_LIVES }).map((_, i) => (
            <Heart
              key={i}
              size={11}
              fill={i < lives ? '#FF1F1F' : 'transparent'}
              color={i < lives ? '#FF1F1F' : '#404040'}
              style={i < lives ? {} : { animation: 'shake 0.3s' }}
            />
          ))}
        </div>
      </div>

      {/* Center — timer bar */}
      <div style={{ flex: 1, maxWidth: '180px', position: 'relative' }}>
        <div style={{
          height: '6px',
          background: 'rgba(255,255,255,0.06)',
          borderRadius: '3px',
          overflow: 'hidden',
        }}>
          <div style={{
            width: `${timePct * 100}%`, height: '100%',
            background: danger
              ? 'linear-gradient(90deg, #FF1F1F, #DC2626)'
              : `linear-gradient(90deg, #${accent}, ${darken(accent)})`,
            transition: 'width 0.95s linear',
            boxShadow: danger ? '0 0 10px #FF1F1F88' : 'none',
          }}/>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '4px',
          marginTop: '4px',
          fontFamily: 'var(--font-jetbrains), monospace',
          fontSize: '10px',
          color: danger ? '#FF1F1F' : '#909090',
          fontWeight: 700, letterSpacing: '0.12em',
        }}>
          <Clock size={9}/> {timeLeft}s
        </div>
      </div>

      {/* Right — score + streak */}
      <div style={{ textAlign: 'right' }}>
        <div style={{
          display: 'flex', alignItems: 'baseline', gap: '6px', justifyContent: 'flex-end',
        }}>
          <span style={{
            fontFamily: 'var(--font-jetbrains), monospace',
            fontSize: '20px', fontWeight: 800, color: '#F0F0F0',
            lineHeight: 1,
          }}>{score.toLocaleString()}</span>
          <span style={{
            fontFamily: 'var(--font-inter), sans-serif',
            fontSize: '8px', fontWeight: 700, color: '#606060',
            letterSpacing: '0.18em', textTransform: 'uppercase',
          }}>pts</span>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '4px',
          justifyContent: 'flex-end', marginTop: '4px',
          fontFamily: 'var(--font-inter), sans-serif',
          fontSize: '10px', fontWeight: 800,
          color: streak >= 3 ? `#${accent}` : '#606060',
          letterSpacing: '0.14em', textTransform: 'uppercase',
        }}>
          {streak >= 3 && <Flame size={11} color={`#${accent}`}/>}
          {streak} streak {mult > 1 && <span style={{ color: `#${accent}` }}>· ×{mult}</span>}
        </div>
      </div>
    </div>
  )
}

// ── Intro ────────────────────────────────────────────────────────

function Intro({ game, onStart }: { game: MiniGame; onStart: () => void }) {
  const accent = game.accentColor
  const lives = game.lives ?? DEFAULT_LIVES
  const timerSec = game.timerSec ?? DEFAULT_TIMER
  return (
    <div style={{
      padding: '50px 36px',
      background: `linear-gradient(135deg, rgba(${rgb(accent)},0.08) 0%, rgba(0,0,0,0.85) 60%)`,
      border: `1px solid rgba(${rgb(accent)}, 0.30)`,
      borderRadius: '12px',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: `0 24px 60px rgba(0,0,0,0.6), 0 0 100px rgba(${rgb(accent)}, 0.10)`,
    }}>
      <div aria-hidden style={{
        position: 'absolute', top: '50%', left: '50%',
        width: '420px', height: '420px',
        marginLeft: '-210px', marginTop: '-210px',
        border: `1px solid rgba(${rgb(accent)}, 0.10)`,
        borderRadius: '50%',
      }}/>

      <div style={{ position: 'relative' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          padding: '5px 12px',
          background: `rgba(${rgb(accent)}, 0.14)`,
          border: `1px solid #${accent}`,
          borderRadius: '4px',
          fontFamily: 'var(--font-inter), sans-serif',
          fontSize: '9px', fontWeight: 800, color: `#${accent}`,
          letterSpacing: '0.28em', textTransform: 'uppercase',
          marginBottom: '20px',
        }}><Zap size={10}/> Mini-Game</div>

        <div style={{
          fontFamily: 'var(--font-fraunces), serif',
          fontSize: '52px', fontWeight: 700, color: '#F0F0F0',
          lineHeight: 1.05, marginBottom: '10px',
          letterSpacing: '-0.02em',
        }}>{game.title}</div>

        <p style={{
          fontFamily: 'var(--font-fraunces), serif',
          fontStyle: 'italic',
          fontSize: '15px', color: '#A0A0A0', lineHeight: 1.6,
          maxWidth: '460px', margin: '0 auto 24px',
        }}>{game.tagline}</p>

        {/* Rules pills */}
        <div style={{
          display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '8px',
          marginBottom: '32px',
        }}>
          <RulePill icon={<Heart size={11}/>} label={`${lives} Lives`}/>
          {!game.customMode && <RulePill icon={<Clock size={11}/>} label={`${timerSec}s per Round`}/>}
          <RulePill icon={<Flame size={11}/>} label="3+ Streak = Combo"/>
          <RulePill icon={<Trophy size={11}/>} label={`Pass ${(game.passThreshold * 100).toFixed(0)}%`}/>
        </div>

        <button onClick={onStart} style={{
          padding: '14px 38px',
          background: `linear-gradient(135deg, #${accent}, ${darken(accent)})`,
          border: 'none', borderRadius: '8px',
          color: '#000',
          fontFamily: 'var(--font-inter), sans-serif',
          fontSize: '12px', fontWeight: 800,
          letterSpacing: '0.22em', textTransform: 'uppercase',
          cursor: 'pointer',
          boxShadow: `0 8px 24px rgba(${rgb(accent)}, 0.50)`,
        }}>Begin →</button>
      </div>
    </div>
  )
}

function RulePill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      padding: '5px 10px',
      background: 'rgba(0,0,0,0.4)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '4px',
      color: '#A0A0A0',
      fontFamily: 'var(--font-inter), sans-serif',
      fontSize: '10px', fontWeight: 700, letterSpacing: '0.14em',
      textTransform: 'uppercase',
    }}>
      {icon}{label}
    </div>
  )
}

// ── Game Over (lives ran out) ─────────────────────────────────────

function GameOver({ game, score, onRestart }: { game: MiniGame; score: number; onRestart: () => void }) {
  const accent = game.accentColor
  return (
    <div style={{
      padding: '50px 36px',
      background: 'linear-gradient(135deg, rgba(255,31,31,0.10) 0%, rgba(0,0,0,0.92) 60%)',
      border: '1px solid rgba(255,31,31,0.40)',
      borderRadius: '12px',
      textAlign: 'center',
      boxShadow: '0 24px 60px rgba(0,0,0,0.6), 0 0 80px rgba(255,31,31,0.15)',
    }}>
      <Skull size={42} color="#FF1F1F" style={{ marginBottom: '14px' }}/>
      <div style={{
        fontFamily: 'var(--font-inter), sans-serif',
        fontSize: '11px', fontWeight: 800, color: '#FF1F1F',
        letterSpacing: '0.32em', textTransform: 'uppercase',
        marginBottom: '12px',
      }}>Game Over</div>
      <div style={{
        fontFamily: 'var(--font-fraunces), serif',
        fontSize: '36px', fontWeight: 700, color: '#F0F0F0',
        lineHeight: 1.1, marginBottom: '10px',
      }}>You ran out of lives.</div>
      <div style={{
        fontFamily: 'var(--font-jetbrains), monospace',
        fontSize: '14px', color: '#808080',
        marginBottom: '28px',
      }}>Final score · {score.toLocaleString()} pts</div>
      <button onClick={onRestart} style={{
        display: 'inline-flex', alignItems: 'center', gap: '8px',
        padding: '12px 26px',
        background: `linear-gradient(135deg, #${accent}, ${darken(accent)})`,
        border: 'none', borderRadius: '6px', color: '#000',
        fontFamily: 'var(--font-inter), sans-serif',
        fontSize: '11px', fontWeight: 800,
        letterSpacing: '0.18em', textTransform: 'uppercase',
        cursor: 'pointer',
        boxShadow: `0 6px 18px rgba(${rgb(accent)}, 0.45)`,
      }}><RotateCcw size={12}/> Try Again</button>
    </div>
  )
}

// ── Results with grade ────────────────────────────────────────────

function Results({
  game, score, customResult, passed, onRestart,
}: {
  game: MiniGame; score: number; customResult: CustomModeResult | null; passed: boolean; onRestart: () => void
}) {
  const router = useRouter()
  const accent = game.accentColor

  const maxScore = customResult?.maxScore ?? game.rounds.length * BASE_POINTS * COMBO_MULTIPLIERS[2] // theoretical max with full combo
  const effectiveMax = customResult?.maxScore ?? game.rounds.length * (BASE_POINTS + TIME_BONUS)
  const pct = Math.min(1, score / effectiveMax)
  const grade = pct >= 0.9 ? 'S' : pct >= 0.75 ? 'A' : pct >= 0.6 ? 'B' : pct >= 0.45 ? 'C' : 'F'
  const gradeColor = grade === 'S' ? '#D4A04D' : grade === 'A' ? '#10B981' : grade === 'B' ? '#3B82F6' : grade === 'C' ? '#F97316' : '#FF1F1F'

  return (
    <div style={{
      padding: '50px 36px',
      background: passed
        ? `linear-gradient(135deg, rgba(${rgb(accent)},0.10) 0%, rgba(0,0,0,0.85) 60%)`
        : 'linear-gradient(135deg, rgba(255,31,31,0.06) 0%, rgba(0,0,0,0.85) 60%)',
      border: `1px solid rgba(${rgb(passed ? accent : 'FF1F1F')}, 0.30)`,
      borderRadius: '12px',
      textAlign: 'center',
      boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
    }}>
      {/* Grade badge */}
      <div style={{
        width: '120px', height: '120px',
        margin: '0 auto 18px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: `radial-gradient(circle, ${gradeColor}22, ${gradeColor}05 70%, transparent)`,
        border: `3px solid ${gradeColor}`,
        borderRadius: '50%',
        boxShadow: `0 0 60px ${gradeColor}55, inset 0 0 30px ${gradeColor}22`,
      }}>
        <span style={{
          fontFamily: 'var(--font-anton), sans-serif',
          fontSize: '64px', fontWeight: 700, color: gradeColor,
          lineHeight: 1, letterSpacing: '0.04em',
          textShadow: `0 0 20px ${gradeColor}`,
        }}>{grade}</span>
      </div>

      <div style={{
        fontFamily: 'var(--font-inter), sans-serif',
        fontSize: '10px', fontWeight: 800,
        color: passed ? `#${accent}` : '#606060',
        letterSpacing: '0.28em', textTransform: 'uppercase',
        marginBottom: '12px',
      }}>{passed ? 'Cleared' : 'Below Threshold'}</div>

      <div style={{
        fontFamily: 'var(--font-fraunces), serif',
        fontSize: '52px', fontWeight: 700, color: '#F0F0F0',
        lineHeight: 1, marginBottom: '6px',
        letterSpacing: '-0.02em',
      }}>{score.toLocaleString()}<span style={{ color: '#404040', fontSize: '32px' }}> pts</span></div>

      <div style={{
        fontFamily: 'var(--font-jetbrains), monospace',
        fontSize: '12px', color: '#808080',
        marginBottom: '20px',
      }}>{(pct * 100).toFixed(0)}% of max</div>

      <p style={{
        fontFamily: 'var(--font-fraunces), serif',
        fontStyle: 'italic',
        fontSize: '14px', color: '#A0A0A0', lineHeight: 1.6,
        maxWidth: '420px', margin: '0 auto 24px',
      }}>{customResult?.detail ?? (passed
        ? 'Solid run. Now apply this in a live session — that is where the lesson sticks.'
        : 'Watch a few more videos in the playlist above and run it again. Concepts compound.')}</p>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
        <button onClick={onRestart} style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          padding: '12px 22px',
          background: 'transparent',
          border: `1px solid #${accent}`,
          borderRadius: '6px', color: `#${accent}`,
          fontFamily: 'var(--font-inter), sans-serif',
          fontSize: '11px', fontWeight: 800,
          letterSpacing: '0.18em', textTransform: 'uppercase',
          cursor: 'pointer',
        }}><RotateCcw size={12}/> Play Again</button>
        {passed && (
          <button onClick={() => router.push('/sim/COV-20/live')} style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '12px 22px',
            background: `linear-gradient(135deg, #${accent}, ${darken(accent)})`,
            border: 'none', borderRadius: '6px', color: '#000',
            fontFamily: 'var(--font-inter), sans-serif',
            fontSize: '11px', fontWeight: 800,
            letterSpacing: '0.18em', textTransform: 'uppercase',
            cursor: 'pointer',
            boxShadow: `0 6px 18px rgba(${rgb(accent)}, 0.40)`,
          }}><Activity size={12}/> Trade Live →</button>
        )}
      </div>
    </div>
  )
}

// ── Custom-mode shell ──────────────────────────────────────────────

function CustomShell({ game, children }: { game: MiniGame; children: React.ReactNode }) {
  const accent = game.accentColor
  return (
    <div style={{
      padding: '20px',
      background: 'linear-gradient(180deg, rgba(13,13,13,0.92), rgba(6,6,6,0.92))',
      border: `1px solid rgba(${rgb(accent)}, 0.30)`,
      borderRadius: '12px',
      boxShadow: `0 24px 60px rgba(0,0,0,0.6), 0 0 80px rgba(${rgb(accent)}, 0.06)`,
    }}>
      <div style={{
        fontFamily: 'var(--font-inter), sans-serif',
        fontSize: '9px', fontWeight: 800, color: `#${accent}`,
        letterSpacing: '0.26em', textTransform: 'uppercase',
        marginBottom: '12px',
      }}>{game.title}</div>
      {children}
    </div>
  )
}

// ── Helpers ────────────────────────────────────────────────────────

function rgb(hex: string): string {
  const r = parseInt(hex.slice(0, 2), 16)
  const g = parseInt(hex.slice(2, 4), 16)
  const b = parseInt(hex.slice(4, 6), 16)
  return `${r},${g},${b}`
}

function darken(hex: string): string {
  const r = Math.max(0, parseInt(hex.slice(0, 2), 16) - 60)
  const g = Math.max(0, parseInt(hex.slice(2, 4), 16) - 60)
  const b = Math.max(0, parseInt(hex.slice(4, 6), 16) - 60)
  return `rgb(${r},${g},${b})`
}

function computeGrade(score: number, max: number): string {
  const pct = Math.min(1, score / max)
  if (pct >= 0.9) return 'S'
  if (pct >= 0.75) return 'A'
  if (pct >= 0.6) return 'B'
  if (pct >= 0.45) return 'C'
  return 'F'
}
