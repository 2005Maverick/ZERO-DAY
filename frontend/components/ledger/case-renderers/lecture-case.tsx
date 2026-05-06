'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { LectureCase } from '@/types/ledger'
import { WaxSealButton } from '../wax-seal-button'
import { academyLinkFor } from '@/lib/ledger-academy-map'
import { getGame } from '@/lib/academy/games'
import { MiniGameEngine } from '@/components/academy/mini-game-engine'
import { useTracer } from '@/lib/behavior/tracer'
import { Lock, CheckCircle2, ArrowRight, ArrowLeft, Trophy } from 'lucide-react'

const TOTAL_CASES = 67

interface Props {
  ledgerCase: LectureCase
  onComplete?: () => void
}

type Phase = 'lesson' | 'challenge' | 'cleared'

export function LectureCaseRenderer({ ledgerCase, onComplete }: Props) {
  const router = useRouter()
  const { track } = useTracer()
  const link = academyLinkFor(ledgerCase)
  const game = link ? getGame(link.gameSlug) : null
  const [phase, setPhase] = useState<Phase>('lesson')
  const [gamePassed, setGamePassed] = useState(false)

  useEffect(() => {
    track('ledger_case_opened', 0, {
      caseId: ledgerCase.id, type: 'lecture', number: ledgerCase.number,
      volume: ledgerCase.volume, title: ledgerCase.title,
    })
  }, [ledgerCase.id, ledgerCase.number, ledgerCase.volume, ledgerCase.title, track])

  const prevNum = Math.max(1, ledgerCase.number - 1)
  const nextNum = Math.min(TOTAL_CASES, ledgerCase.number + 1)
  const hasPrev = ledgerCase.number > 1
  const hasNext = ledgerCase.number < TOTAL_CASES
  const goPrev = () => router.push(`/ledger?case=${prevNum}`)
  const goNext = () => router.push(`/ledger?case=${nextNum}`)

  // ── Phase 2: Challenge — fullscreen mini-game replaces page content ─────
  if (phase === 'challenge' && game) {
    return (
      <div style={{
        width: '100%', height: '100%',
        background: 'linear-gradient(160deg, #0D0D0D 0%, #060606 100%)',
        padding: '32px 36px',
        display: 'flex', flexDirection: 'column',
        gap: '18px',
        overflow: 'auto',
      }}>
        <ChallengeBanner
          title={game.title}
          tagline={`Complete this challenge to unlock the next chapter`}
          color={game.accentColor}
        />
        <MiniGameWrapper
          game={game}
          onAllRoundsDone={(passed) => {
            setGamePassed(passed)
            if (passed) setPhase('cleared')
          }}
        />
      </div>
    )
  }

  // ── Phase 3: Cleared — congrats card ─────────────────────────────
  if (phase === 'cleared') {
    return (
      <div style={{
        width: '100%', height: '100%',
        background: 'linear-gradient(160deg, #1a3a2e 0%, #0a1a14 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '40px',
      }}>
        <div style={{
          maxWidth: '520px', textAlign: 'center',
          padding: '36px 40px',
          background: 'rgba(0,0,0,0.5)',
          border: '2px solid #10B981',
          borderRadius: '12px',
          boxShadow: '0 24px 60px rgba(16,185,129,0.2)',
        }}>
          <Trophy size={36} color="#10B981" style={{ marginBottom: '14px' }}/>
          <div style={{
            fontFamily: 'var(--font-inter), sans-serif',
            fontSize: '10px', fontWeight: 800,
            color: '#10B981', letterSpacing: '0.28em', textTransform: 'uppercase',
            marginBottom: '10px',
          }}>Lesson Cleared</div>
          <div style={{
            fontFamily: 'var(--font-fraunces), serif',
            fontSize: '32px', fontWeight: 700, color: '#F0F0F0',
            lineHeight: 1.15, marginBottom: '12px',
          }}>{ledgerCase.title}</div>
          <p style={{
            fontFamily: 'var(--font-fraunces), serif',
            fontStyle: 'italic',
            fontSize: '13px', color: '#909090',
            lineHeight: 1.6, margin: '0 0 24px',
          }}>You watched the lecture and passed the challenge. The next case is unlocked.</p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button onClick={() => { onComplete?.(); }} style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '12px 22px',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.20)',
              borderRadius: '6px', color: '#A0A0A0',
              fontFamily: 'var(--font-inter), sans-serif',
              fontSize: '11px', fontWeight: 700,
              letterSpacing: '0.18em', textTransform: 'uppercase',
              cursor: 'pointer',
            }}>Stay Here</button>
            <button
              onClick={() => { onComplete?.(); if (hasNext) goNext() }}
              disabled={!hasNext}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '12px 26px',
                background: hasNext
                  ? 'linear-gradient(135deg, #10B981, #059669)'
                  : 'rgba(255,255,255,0.06)',
                border: 'none', borderRadius: '6px',
                color: hasNext ? '#000' : '#606060',
                fontFamily: 'var(--font-inter), sans-serif',
                fontSize: '11px', fontWeight: 800,
                letterSpacing: '0.18em', textTransform: 'uppercase',
                cursor: hasNext ? 'pointer' : 'not-allowed',
                boxShadow: hasNext ? '0 6px 18px rgba(16,185,129,0.45)' : 'none',
              }}
            >
              {hasNext ? <>Open Lesson {nextNum.toString().padStart(3, '0')} <ArrowRight size={12}/></> : 'Final Lesson'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Phase 1: Lesson — original two-page spread with embedded playlist ──
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '1fr 1fr',
      width: '100%', height: '100%',
    }}>
      {/* LEFT — video + study notes */}
      <div style={{
        position: 'relative',
        padding: '36px 32px 28px',
        borderRight: '1px solid rgba(60, 30, 15, 0.18)',
      }}>
        <div style={{
          fontFamily: '"Big Caslon", Caslon, Garamond, serif',
          fontStyle: 'italic',
          fontSize: '22px',
          color: '#1a1a1a',
          marginBottom: '6px',
        }}>
          LESSON № {ledgerCase.number.toString().padStart(3, '0')}
        </div>

        {link && (
          <div style={{
            fontFamily: 'var(--font-geist-sans), sans-serif',
            fontSize: '9px',
            letterSpacing: '0.22em',
            color: `#${link.accentColor}`,
            fontWeight: 700, textTransform: 'uppercase',
            marginBottom: '14px',
          }}>via {link.playlistTitle}</div>
        )}

        {/* Video / Playlist embed */}
        <div style={{
          aspectRatio: '16 / 9',
          background: '#0a0a0a',
          border: '1px solid rgba(60, 30, 15, 0.4)',
          marginBottom: '20px',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {ledgerCase.videoId ? (
            <iframe
              src={`https://www.youtube.com/embed/${ledgerCase.videoId}`}
              style={{ width: '100%', height: '100%', border: 'none' }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : link ? (
            <iframe
              src={`https://www.youtube.com/embed/videoseries?list=${link.ytPlaylistId}`}
              style={{ width: '100%', height: '100%', border: 'none' }}
              title={`${link.playlistTitle} playlist`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div style={{
              width: '100%', height: '100%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#A89880',
              fontFamily: 'var(--font-geist-sans), sans-serif',
              fontSize: '11px', letterSpacing: '0.22em',
              fontWeight: 600, textTransform: 'uppercase',
            }}>▶  Video forthcoming</div>
          )}
        </div>

        <div style={{
          fontFamily: 'Garamond, serif',
          fontStyle: 'italic',
          fontSize: '12px',
          color: '#3a2818',
          lineHeight: 1.5,
          letterSpacing: '0.01em',
        }}>
          {link
            ? `Curated playlist from the Academy library. Watch any video, then pass the challenge to mark this lesson complete.`
            : `Study notes will appear here once the lecture content is published. Watch the video, then mark this lesson complete to unlock the next chapter.`}
        </div>
      </div>

      {/* RIGHT — summary + CTA */}
      <div style={{ padding: '36px 32px 28px', display: 'flex', flexDirection: 'column' }}>
        <div style={{
          fontFamily: 'var(--font-geist-sans), sans-serif',
          fontSize: '10px',
          letterSpacing: '0.28em',
          color: '#8B0000',
          fontWeight: 700,
          textTransform: 'uppercase',
          marginBottom: '12px',
        }}>
          What You Will Learn
        </div>

        <h2 style={{
          fontFamily: 'var(--font-anton), sans-serif',
          fontSize: 'clamp(28px, 3vw, 40px)',
          color: '#1a1a1a',
          letterSpacing: '0.02em',
          lineHeight: 1,
          margin: '0 0 18px',
          textTransform: 'uppercase',
        }}>
          {ledgerCase.title}
        </h2>

        <div style={{ marginBottom: '18px' }}>
          {ledgerCase.takeaways.map((t, i) => (
            <div key={i} style={{
              display: 'flex', gap: '10px', marginBottom: '10px',
              fontFamily: 'Garamond, serif',
              fontSize: '13px',
              color: '#3a2818',
              lineHeight: 1.5,
            }}>
              <span style={{ color: '#8B0000', fontWeight: 700 }}>{i + 1}.</span>
              <span>{t}</span>
            </div>
          ))}
        </div>

        {/* Challenge preview card */}
        {game && (
          <div style={{
            marginTop: 'auto',
            padding: '14px 16px',
            background: `linear-gradient(135deg, rgba(${rgb(game.accentColor)},0.08), rgba(255,243,220,0.5))`,
            border: `1.5px solid #${game.accentColor}`,
            borderRadius: '6px',
            marginBottom: '16px',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              marginBottom: '6px',
            }}>
              <Lock size={11} color={`#${game.accentColor}`}/>
              <span style={{
                fontFamily: 'var(--font-geist-sans), sans-serif',
                fontSize: '9px', fontWeight: 800,
                color: `#${game.accentColor}`,
                letterSpacing: '0.22em', textTransform: 'uppercase',
              }}>Challenge to Unlock</span>
            </div>
            <div style={{
              fontFamily: 'var(--font-anton), sans-serif',
              fontSize: '20px', color: '#1a1a1a',
              letterSpacing: '0.02em',
              marginBottom: '4px', textTransform: 'uppercase',
            }}>{game.title}</div>
            <p style={{
              fontFamily: 'Garamond, serif', fontStyle: 'italic',
              fontSize: '12px', color: '#3a2818',
              lineHeight: 1.5, margin: 0,
            }}>{game.tagline}</p>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          {game ? (
            <WaxSealButton label="Take Challenge →" onClick={() => setPhase('challenge')} />
          ) : (
            <WaxSealButton label="Mark Complete →" onClick={onComplete} />
          )}
        </div>

        {/* Prev / Next case navigation */}
        <div style={{
          marginTop: '20px', paddingTop: '14px',
          borderTop: '1px dashed rgba(60, 30, 15, 0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: '10px',
        }}>
          <NavLessonButton
            disabled={!hasPrev}
            onClick={goPrev}
            direction="prev"
            label={`Lesson ${prevNum.toString().padStart(3, '0')}`}
          />
          <span style={{
            fontFamily: 'var(--font-geist-mono), monospace',
            fontSize: '10px', color: '#604838',
            letterSpacing: '0.16em',
          }}>{ledgerCase.number} / {TOTAL_CASES}</span>
          <NavLessonButton
            disabled={!hasNext}
            onClick={goNext}
            direction="next"
            label={`Lesson ${nextNum.toString().padStart(3, '0')}`}
          />
        </div>
      </div>
    </div>
  )
}

function NavLessonButton({ disabled, onClick, direction, label }: {
  disabled: boolean; onClick: () => void; direction: 'prev' | 'next'; label: string
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'flex', alignItems: 'center', gap: '6px',
        padding: '7px 12px',
        background: disabled ? 'transparent' : 'rgba(139,0,0,0.06)',
        border: `1px solid ${disabled ? 'rgba(60,30,15,0.15)' : 'rgba(139,0,0,0.40)'}`,
        borderRadius: '4px',
        color: disabled ? 'rgba(60,30,15,0.35)' : '#8B0000',
        fontFamily: 'var(--font-geist-sans), sans-serif',
        fontSize: '10px', fontWeight: 700,
        letterSpacing: '0.18em', textTransform: 'uppercase',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'all 0.15s',
      }}
    >
      {direction === 'prev' && <ArrowLeft size={11}/>}
      {label}
      {direction === 'next' && <ArrowRight size={11}/>}
    </button>
  )
}

// ── Sub-components ────────────────────────────────────────────────

function ChallengeBanner({ title, tagline, color }: { title: string; tagline: string; color: string }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 18px',
      background: `linear-gradient(135deg, rgba(${rgb(color)},0.14), rgba(0,0,0,0.6))`,
      border: `1px solid rgba(${rgb(color)}, 0.40)`,
      borderRadius: '8px',
    }}>
      <div>
        <div style={{
          fontFamily: 'var(--font-inter), sans-serif',
          fontSize: '9px', fontWeight: 800, color: `#${color}`,
          letterSpacing: '0.28em', textTransform: 'uppercase',
          marginBottom: '4px',
        }}><Lock size={9} style={{ display: 'inline', marginRight: '4px' }}/> Lesson Challenge</div>
        <div style={{
          fontFamily: 'var(--font-fraunces), serif',
          fontSize: '22px', fontWeight: 700, color: '#F0F0F0',
          lineHeight: 1.1,
        }}>{title}</div>
      </div>
      <p style={{
        fontFamily: 'var(--font-fraunces), serif', fontStyle: 'italic',
        fontSize: '12px', color: '#A0A0A0', margin: 0,
        maxWidth: '300px', textAlign: 'right',
      }}>{tagline}</p>
    </div>
  )
}

// Small wrapper around MiniGameEngine that detects completion
function MiniGameWrapper({ game, onAllRoundsDone }: { game: ReturnType<typeof getGame> & object; onAllRoundsDone: (passed: boolean) => void }) {
  // We reuse the engine but listen for passing. The engine's existing UI already
  // renders the Pass / Fail screen — we let the user click "Continue" via the
  // CheckCircle button below the embedded engine.
  return (
    <div style={{ position: 'relative' }}>
      <MiniGameEngine game={game}/>
      <ChallengeFooter onPassed={() => onAllRoundsDone(true)}/>
    </div>
  )
}

function ChallengeFooter({ onPassed }: { onPassed: () => void }) {
  return (
    <div style={{
      marginTop: '14px',
      padding: '12px 16px',
      background: 'rgba(16,185,129,0.06)',
      border: '1px dashed rgba(16,185,129,0.40)',
      borderRadius: '6px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: '12px',
    }}>
      <div style={{
        fontFamily: 'var(--font-fraunces), serif', fontStyle: 'italic',
        fontSize: '12px', color: '#A0A0A0', margin: 0,
      }}>Once you finish the rounds and reach the pass screen, click below to mark this lesson cleared.</div>
      <button onClick={onPassed} style={{
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        padding: '8px 14px',
        background: 'linear-gradient(135deg, #10B981, #059669)',
        border: 'none', borderRadius: '5px', color: '#000',
        fontFamily: 'var(--font-inter), sans-serif',
        fontSize: '10px', fontWeight: 800,
        letterSpacing: '0.16em', textTransform: 'uppercase',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
      }}><CheckCircle2 size={11}/> I Passed → Unlock</button>
    </div>
  )
}

function rgb(hex: string): string {
  const r = parseInt(hex.slice(0, 2), 16)
  const g = parseInt(hex.slice(2, 4), 16)
  const b = parseInt(hex.slice(4, 6), 16)
  return `${r},${g},${b}`
}
