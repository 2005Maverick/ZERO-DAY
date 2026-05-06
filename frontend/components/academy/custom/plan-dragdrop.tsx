'use client'

import { useState } from 'react'
import { Check, X, FileText, Plus, Trash2 } from 'lucide-react'
import type { CustomModeResult } from '@/lib/academy/game-types'
import { useTracer } from '@/lib/behavior/tracer'

interface RuleCard {
  id: string
  text: string
  category: 'entry' | 'exit' | 'risk' | 'journal'
  correct: boolean   // is it a "real" rule or a trap?
}

const ALL_RULES: RuleCard[] = [
  // Entry (good)
  { id: 'e1', text: 'Enter only on confirmed breakout above resistance', category: 'entry', correct: true },
  { id: 'e2', text: 'Wait for volume to confirm direction', category: 'entry', correct: true },
  { id: 'e3', text: 'Check broad market regime before entering', category: 'entry', correct: true },
  // Entry (trap)
  { id: 'e4', text: 'Enter when you "feel bullish"', category: 'entry', correct: false },
  { id: 'e5', text: 'Enter on tips from social media', category: 'entry', correct: false },

  // Exit (good)
  { id: 'x1', text: 'Exit when stop loss is triggered', category: 'exit', correct: true },
  { id: 'x2', text: 'Exit when target price is reached', category: 'exit', correct: true },
  { id: 'x3', text: 'Exit when thesis is invalidated', category: 'exit', correct: true },
  // Exit (trap)
  { id: 'x4', text: 'Move stop loss DOWN if losing', category: 'exit', correct: false },
  { id: 'x5', text: 'Average down on losers indefinitely', category: 'exit', correct: false },

  // Risk (good)
  { id: 'r1', text: 'Risk max 2% of account per trade', category: 'risk', correct: true },
  { id: 'r2', text: 'Cap total portfolio heat at 6%', category: 'risk', correct: true },
  { id: 'r3', text: 'Stop trading after 2 consecutive losses', category: 'risk', correct: true },
  // Risk (trap)
  { id: 'r4', text: 'Increase size after a winning streak', category: 'risk', correct: false },
  { id: 'r5', text: 'Skip stop loss when "high conviction"', category: 'risk', correct: false },

  // Journal (good)
  { id: 'j1', text: 'Log entry, exit, thesis, and emotion', category: 'journal', correct: true },
  { id: 'j2', text: 'Review every trade weekly', category: 'journal', correct: true },
  // Journal (trap)
  { id: 'j3', text: 'Track "could have" profits if you held longer', category: 'journal', correct: false },
]

const SLOT_REQUIREMENTS = [
  { category: 'entry' as const, label: 'Entry Rule', need: 2 },
  { category: 'exit' as const, label: 'Exit Rule', need: 2 },
  { category: 'risk' as const, label: 'Risk Rule', need: 2 },
  { category: 'journal' as const, label: 'Journal Rule', need: 1 },
]

const TOTAL_SLOTS = SLOT_REQUIREMENTS.reduce((s, r) => s + r.need, 0)
const POINTS_PER_CORRECT = 100
const PENALTY_PER_TRAP = -120
const PERFECT_BONUS = 200

interface Props {
  onComplete: (result: CustomModeResult) => void
}

export function PlanDragDropGame({ onComplete }: Props) {
  const { track } = useTracer()
  // Random shuffle of cards on mount
  const [pool] = useState(() => [...ALL_RULES].sort(() => Math.random() - 0.5))
  const [slots, setSlots] = useState<Record<string, RuleCard[]>>({
    entry: [], exit: [], risk: [], journal: [],
  })
  const [submitted, setSubmitted] = useState(false)

  const placedIds = new Set<string>(Object.values(slots).flat().map(c => c.id))
  const availablePool = pool.filter(c => !placedIds.has(c.id))

  const totalPlaced = Object.values(slots).flat().length

  function placeCard(card: RuleCard, intoCategory: 'entry' | 'exit' | 'risk' | 'journal') {
    if (submitted) return
    const slotReq = SLOT_REQUIREMENTS.find(r => r.category === intoCategory)
    if (!slotReq) return
    if (slots[intoCategory].length >= slotReq.need) return
    setSlots(s => ({ ...s, [intoCategory]: [...s[intoCategory], card] }))
  }

  function removeCard(card: RuleCard, fromCategory: keyof typeof slots) {
    if (submitted) return
    setSlots(s => ({ ...s, [fromCategory]: s[fromCategory].filter(c => c.id !== card.id) }))
  }

  function submit() {
    setSubmitted(true)
    let correctCount = 0, trapCount = 0, miscategorized = 0
    for (const cat of Object.keys(slots) as Array<keyof typeof slots>) {
      for (const card of slots[cat]) {
        if (card.correct && card.category === cat) correctCount++
        else if (!card.correct) trapCount++
        else miscategorized++
      }
    }
    let score = correctCount * POINTS_PER_CORRECT + trapCount * PENALTY_PER_TRAP
    const allCorrectAndFull = correctCount === TOTAL_SLOTS && trapCount === 0 && miscategorized === 0
    if (allCorrectAndFull) score += PERFECT_BONUS
    score = Math.max(0, score)
    const max = TOTAL_SLOTS * POINTS_PER_CORRECT + PERFECT_BONUS
    track('plan_dragdrop_submitted', 0, {
      correctCount, trapCount, miscategorized, score, perfect: allCorrectAndFull,
    })
    setTimeout(() => {
      onComplete({
        score, maxScore: max,
        passed: correctCount >= TOTAL_SLOTS - 1 && trapCount === 0,
        detail: `Placed ${correctCount} valid rules, ${trapCount} traps. ${allCorrectAndFull ? 'Perfect plan — bonus applied.' : 'Drop traps and missed rules cost points.'}`,
      })
    }, 1800)
  }

  return (
    <div>
      {/* Top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '14px',
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          padding: '4px 10px',
          background: 'rgba(6,182,212,0.10)',
          border: '1px solid rgba(6,182,212,0.40)',
          borderRadius: '4px',
          fontFamily: 'var(--font-inter), sans-serif',
          fontSize: '9px', fontWeight: 800, color: '#06B6D4',
          letterSpacing: '0.22em', textTransform: 'uppercase',
        }}><FileText size={10}/> Build Your Edge</div>
        <div style={{
          fontFamily: 'var(--font-jetbrains), monospace',
          fontSize: '11px', color: '#909090',
        }}>{totalPlaced} / {TOTAL_SLOTS} slots filled</div>
      </div>

      <p style={{
        fontFamily: 'var(--font-fraunces), serif',
        fontStyle: 'italic',
        fontSize: '13px', color: '#909090',
        margin: '0 0 18px', lineHeight: 1.55,
      }}>Click rule cards from the pool to place them in matching slots. Some are traps — wrong rules that look right. Build a complete plan with no traps to win the perfect bonus.</p>

      {/* Plan Sheet — slots */}
      <div style={{
        padding: '14px 16px',
        background: 'rgba(6,182,212,0.04)',
        border: '1px solid rgba(6,182,212,0.30)',
        borderRadius: '8px',
        marginBottom: '20px',
      }}>
        <div style={{
          fontFamily: 'var(--font-inter), sans-serif',
          fontSize: '9px', fontWeight: 800, color: '#06B6D4',
          letterSpacing: '0.26em', textTransform: 'uppercase',
          marginBottom: '12px',
        }}>Your Plan Sheet</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {SLOT_REQUIREMENTS.map(req => (
            <SlotGroup key={req.category}
              label={req.label} need={req.need}
              filled={slots[req.category]}
              category={req.category}
              submitted={submitted}
              onRemove={card => removeCard(card, req.category)}
            />
          ))}
        </div>
      </div>

      {/* Pool */}
      {!submitted && (
        <div>
          <div style={{
            fontFamily: 'var(--font-inter), sans-serif',
            fontSize: '9px', fontWeight: 800, color: '#909090',
            letterSpacing: '0.22em', textTransform: 'uppercase',
            marginBottom: '8px',
          }}>Rule Cards · {availablePool.length} remaining</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {availablePool.map(card => (
              <button
                key={card.id}
                onClick={() => placeCard(card, card.category)}
                disabled={slots[card.category].length >= (SLOT_REQUIREMENTS.find(r => r.category === card.category)?.need ?? 0)}
                style={{
                  padding: '8px 12px',
                  background: 'rgba(0,0,0,0.5)',
                  border: '1px solid rgba(255,255,255,0.10)',
                  borderRadius: '5px',
                  color: '#D0D0D0',
                  fontFamily: 'var(--font-inter), sans-serif',
                  fontSize: '11.5px', textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '6px',
                  maxWidth: '100%',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#06B6D4' }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.10)' }}
              >
                <Plus size={11} color="#06B6D4"/>
                <span>{card.text}</span>
                <span style={{
                  marginLeft: 'auto',
                  fontSize: '8px', fontWeight: 800,
                  color: '#606060', letterSpacing: '0.18em', textTransform: 'uppercase',
                }}>{card.category}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Submit */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
        <button
          onClick={submit}
          disabled={submitted || totalPlaced < TOTAL_SLOTS}
          style={{
            padding: '12px 22px',
            background: totalPlaced < TOTAL_SLOTS ? 'rgba(255,255,255,0.06)' : 'linear-gradient(135deg, #06B6D4, #0891B2)',
            border: 'none', borderRadius: '6px',
            color: totalPlaced < TOTAL_SLOTS ? '#606060' : '#000',
            fontFamily: 'var(--font-inter), sans-serif',
            fontSize: '12px', fontWeight: 800,
            letterSpacing: '0.18em', textTransform: 'uppercase',
            cursor: totalPlaced < TOTAL_SLOTS ? 'not-allowed' : 'pointer',
            boxShadow: totalPlaced < TOTAL_SLOTS ? 'none' : '0 6px 18px rgba(6,182,212,0.45)',
          }}
        >Submit Plan</button>
      </div>
    </div>
  )
}

function SlotGroup({
  label, need, filled, category, submitted, onRemove,
}: {
  label: string; need: number; filled: RuleCard[]; category: string; submitted: boolean; onRemove: (card: RuleCard) => void
}) {
  return (
    <div>
      <div style={{
        fontFamily: 'var(--font-inter), sans-serif',
        fontSize: '8.5px', fontWeight: 800, color: '#909090',
        letterSpacing: '0.20em', textTransform: 'uppercase',
        marginBottom: '5px',
      }}>{label} · {filled.length}/{need}</div>
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {Array.from({ length: need }).map((_, i) => {
          const card = filled[i]
          const correct = submitted && card?.correct && card?.category === category
          const wrong = submitted && card && (!card.correct || card.category !== category)
          return (
            <div key={i} style={{
              flex: '1 1 220px',
              minHeight: '38px',
              padding: '8px 10px',
              background: correct ? 'rgba(16,185,129,0.10)' : wrong ? 'rgba(255,31,31,0.10)' : card ? 'rgba(6,182,212,0.10)' : 'rgba(0,0,0,0.4)',
              border: `1px ${card ? 'solid' : 'dashed'} ${correct ? '#10B981' : wrong ? '#FF1F1F' : card ? '#06B6D4' : 'rgba(255,255,255,0.12)'}`,
              borderRadius: '4px',
              display: 'flex', alignItems: 'center', gap: '8px',
              fontFamily: 'var(--font-inter), sans-serif',
              fontSize: '11.5px',
              color: correct ? '#10B981' : wrong ? '#FF1F1F' : card ? '#E0E0E0' : '#606060',
              fontStyle: card ? 'normal' : 'italic',
            }}>
              {card ? (
                <>
                  {submitted && (correct ? <Check size={12}/> : wrong ? <X size={12}/> : null)}
                  <span style={{ flex: 1 }}>{card.text}</span>
                  {!submitted && (
                    <button onClick={() => onRemove(card)} style={{
                      background: 'transparent', border: 'none', cursor: 'pointer',
                      color: '#606060', padding: 0,
                    }}><Trash2 size={11}/></button>
                  )}
                </>
              ) : (
                <span>empty slot</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
