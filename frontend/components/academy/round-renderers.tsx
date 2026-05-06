'use client'

import { useState, useEffect } from 'react'
import { Check, X } from 'lucide-react'
import type {
  Round, MCQRound, ChartMCQRound, CalcRound, SelectRulesRound, ScenarioRound,
} from '@/lib/academy/game-types'
import { InlineChart } from './inline-chart'

interface CommonProps {
  round: Round
  accent: string
  onAnswered: (correct: boolean) => void
}

export function RoundRenderer(props: CommonProps) {
  const { round } = props
  switch (round.kind) {
    case 'mcq':           return <MCQ {...props} round={round}/>
    case 'chart_mcq':     return <ChartMCQ {...props} round={round}/>
    case 'calc':          return <Calc {...props} round={round}/>
    case 'select_rules':  return <SelectRules {...props} round={round}/>
    case 'scenario':      return <Scenario {...props} round={round}/>
  }
}

// ── MCQ ────────────────────────────────────────────────────

function MCQ({ round, accent, onAnswered }: CommonProps & { round: MCQRound }) {
  const [picked, setPicked] = useState<number | null>(null)
  const reveal = picked !== null
  const chosen = picked !== null ? round.options[picked] : null

  function pick(i: number) {
    if (reveal) return
    setPicked(i)
    onAnswered(round.options[i].correct)
  }

  return (
    <div>
      {round.context && <ContextLine text={round.context} accent={accent}/>}
      <Prompt text={round.prompt}/>
      <OptionsGrid>
        {round.options.map((o, i) => (
          <OptionButton key={i}
            label={o.label}
            picked={picked === i}
            reveal={reveal}
            correct={o.correct}
            accent={accent}
            onClick={() => pick(i)}
          />
        ))}
      </OptionsGrid>
      {reveal && chosen && <Feedback chosen={chosen.correct} feedback={chosen.feedback} explanation={round.explanation}/>}
    </div>
  )
}

// ── ChartMCQ ──────────────────────────────────────────────

function ChartMCQ({ round, accent, onAnswered }: CommonProps & { round: ChartMCQRound }) {
  const [picked, setPicked] = useState<number | null>(null)
  const reveal = picked !== null
  const chosen = picked !== null ? round.options[picked] : null

  function pick(i: number) {
    if (reveal) return
    setPicked(i)
    onAnswered(round.options[i].correct)
  }

  return (
    <div>
      {round.context && <ContextLine text={round.context} accent={accent}/>}
      <Prompt text={round.prompt}/>
      <div style={{ marginBottom: '14px' }}>
        <InlineChart chart={round.chart} accent={accent}/>
      </div>
      <OptionsGrid>
        {round.options.map((o, i) => (
          <OptionButton key={i}
            label={o.label}
            picked={picked === i}
            reveal={reveal}
            correct={o.correct}
            accent={accent}
            onClick={() => pick(i)}
          />
        ))}
      </OptionsGrid>
      {reveal && chosen && <Feedback chosen={chosen.correct} feedback={chosen.feedback} explanation={round.explanation}/>}
    </div>
  )
}

// ── Calc ──────────────────────────────────────────────────

function Calc({ round, accent, onAnswered }: CommonProps & { round: CalcRound }) {
  const [value, setValue] = useState<string>('')
  const [submitted, setSubmitted] = useState(false)
  const num = Number(value)
  const isWithin = !isNaN(num) && num >= round.acceptable.min && num <= round.acceptable.max
  const isExact = !isNaN(num) && Math.abs(num - round.acceptable.ideal) < (round.acceptable.ideal * 0.01)

  function submit() {
    if (submitted || value.trim() === '' || isNaN(num)) return
    setSubmitted(true)
    onAnswered(isWithin)
  }

  return (
    <div>
      {round.context && <ContextLine text={round.context} accent={accent}/>}
      <Prompt text={round.prompt}/>
      {round.hint && (
        <div style={{
          padding: '10px 12px',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderLeft: `3px solid #${accent}`,
          borderRadius: '4px',
          fontFamily: 'var(--font-fraunces), serif',
          fontStyle: 'italic',
          fontSize: '12px', color: '#A0A0A0', lineHeight: 1.55,
          marginBottom: '14px',
        }}>{round.hint}</div>
      )}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'stretch', marginBottom: '14px' }}>
        <input
          type="number"
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') submit() }}
          disabled={submitted}
          placeholder="0"
          autoFocus
          style={{
            flex: 1,
            padding: '14px 18px',
            background: '#000',
            border: `1px solid ${submitted ? (isWithin ? '#10B981' : '#FF1F1F') : `rgba(${rgbFromHex(accent)},0.4)`}`,
            borderRadius: '6px',
            color: '#F0F0F0',
            fontFamily: 'var(--font-jetbrains), monospace',
            fontSize: '20px', fontWeight: 700,
            outline: 'none',
          }}
        />
        <div style={{
          padding: '14px 18px',
          background: 'rgba(0,0,0,0.4)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '6px',
          fontFamily: 'var(--font-inter), sans-serif',
          fontSize: '11px', fontWeight: 700, color: '#808080',
          letterSpacing: '0.18em', textTransform: 'uppercase',
          display: 'flex', alignItems: 'center',
        }}>{round.unit}</div>
        <button onClick={submit} disabled={submitted || value.trim() === ''} style={{
          padding: '14px 22px',
          background: submitted ? 'rgba(255,255,255,0.04)' : `linear-gradient(135deg, #${accent}, ${darken(accent)})`,
          border: 'none', borderRadius: '6px',
          color: submitted ? '#404040' : '#000',
          fontFamily: 'var(--font-inter), sans-serif',
          fontSize: '12px', fontWeight: 800,
          letterSpacing: '0.16em', textTransform: 'uppercase',
          cursor: submitted ? 'not-allowed' : 'pointer',
          opacity: value.trim() === '' && !submitted ? 0.4 : 1,
        }}>Submit</button>
      </div>
      {submitted && (
        <Feedback
          chosen={isWithin}
          feedback={isExact ? 'Spot on.' : isWithin ? `Close enough — ideal is ${round.acceptable.ideal}.` : `Off — correct answer is ${round.acceptable.ideal} ${round.unit}.`}
          explanation={round.explanation}
        />
      )}
    </div>
  )
}

// ── SelectRules ────────────────────────────────────────────

function SelectRules({ round, accent, onAnswered }: CommonProps & { round: SelectRulesRound }) {
  const [picked, setPicked] = useState<Set<number>>(new Set())
  const [submitted, setSubmitted] = useState(false)

  const correctCount = round.rules.filter((r, i) => r.correct && picked.has(i)).length
  const wrongCount = round.rules.filter((r, i) => !r.correct && picked.has(i)).length
  const passed = correctCount >= round.minCorrect && wrongCount === 0

  function toggle(i: number) {
    if (submitted) return
    const next = new Set(picked)
    if (next.has(i)) next.delete(i); else next.add(i)
    setPicked(next)
  }

  function submit() {
    if (submitted) return
    setSubmitted(true)
    onAnswered(passed)
  }

  return (
    <div>
      {round.context && <ContextLine text={round.context} accent={accent}/>}
      <Prompt text={round.prompt}/>
      <div style={{
        fontFamily: 'var(--font-inter), sans-serif',
        fontSize: '10px', fontWeight: 700, color: '#606060',
        letterSpacing: '0.2em', textTransform: 'uppercase',
        marginBottom: '8px',
      }}>Select all that apply · Need {round.minCorrect}+ correct</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
        {round.rules.map((rule, i) => {
          const isPick = picked.has(i)
          const showCorrect = submitted && rule.correct
          const showWrongPick = submitted && isPick && !rule.correct
          const showMissed = submitted && rule.correct && !isPick
          const borderColor =
            showCorrect ? '#10B981' :
            showWrongPick ? '#FF1F1F' :
            isPick ? `#${accent}` : 'rgba(255,255,255,0.10)'
          const bg =
            showCorrect ? 'rgba(16,185,129,0.08)' :
            showWrongPick ? 'rgba(255,31,31,0.08)' :
            isPick ? `rgba(${rgbFromHex(accent)},0.08)` : 'rgba(0,0,0,0.4)'
          return (
            <button key={i} onClick={() => toggle(i)} disabled={submitted} style={{
              display: 'flex', alignItems: 'flex-start', gap: '10px',
              padding: '11px 14px',
              background: bg,
              border: `1px solid ${borderColor}`,
              borderRadius: '5px',
              cursor: submitted ? 'default' : 'pointer',
              textAlign: 'left',
              transition: 'all 0.15s',
            }}>
              <span style={{
                flexShrink: 0,
                width: '18px', height: '18px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: isPick ? `#${accent}` : 'rgba(255,255,255,0.06)',
                border: `1px solid ${borderColor}`,
                borderRadius: '3px',
              }}>
                {showCorrect ? <Check size={11} color="#000"/> : showWrongPick ? <X size={11} color="#000"/> : isPick ? <Check size={11} color="#000"/> : null}
              </span>
              <span style={{
                fontFamily: 'var(--font-inter), sans-serif',
                fontSize: '12.5px',
                color: showCorrect ? '#10B981' : showWrongPick ? '#FF1F1F' : showMissed ? '#D4A04D' : '#C0C0C0',
                fontWeight: showCorrect || showWrongPick ? 600 : 400,
                lineHeight: 1.55,
              }}>{rule.text}{showMissed && ' · (missed)'}</span>
            </button>
          )
        })}
      </div>
      {!submitted && (
        <button onClick={submit} disabled={picked.size === 0} style={{
          padding: '12px 22px',
          background: `linear-gradient(135deg, #${accent}, ${darken(accent)})`,
          border: 'none', borderRadius: '6px', color: '#000',
          fontFamily: 'var(--font-inter), sans-serif',
          fontSize: '12px', fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase',
          cursor: picked.size === 0 ? 'not-allowed' : 'pointer',
          opacity: picked.size === 0 ? 0.4 : 1,
        }}>Submit</button>
      )}
      {submitted && (
        <Feedback
          chosen={passed}
          feedback={passed ? `Got ${correctCount} correct, no wrong picks. Strong.` : `${correctCount} correct, ${wrongCount} wrong — needed ${round.minCorrect} correct with zero wrong.`}
          explanation={round.explanation}
        />
      )}
    </div>
  )
}

// ── Scenario ───────────────────────────────────────────────

function Scenario({ round, accent, onAnswered }: CommonProps & { round: ScenarioRound }) {
  const [picked, setPicked] = useState<number | null>(null)
  const reveal = picked !== null
  const chosen = picked !== null ? round.options[picked] : null

  function pick(i: number) {
    if (reveal) return
    setPicked(i)
    onAnswered(round.options[i].correct)
  }

  const pos = round.positionState
  return (
    <div>
      {round.context && <ContextLine text={round.context} accent={accent}/>}
      <Prompt text={round.prompt}/>
      {round.chart && (
        <div style={{ marginBottom: '14px' }}>
          <InlineChart chart={round.chart} accent={accent}/>
        </div>
      )}
      {pos && (
        <div style={{
          padding: '12px 14px',
          background: 'linear-gradient(135deg, rgba(0,0,0,0.6), rgba(0,0,0,0.4))',
          border: `1px solid rgba(${rgbFromHex(accent)},0.4)`,
          borderLeft: `3px solid #${accent}`,
          borderRadius: '5px',
          marginBottom: '14px',
          display: 'flex', alignItems: 'center', gap: '14px',
        }}>
          <div style={{
            fontFamily: 'var(--font-inter), sans-serif',
            fontSize: '12px', fontWeight: 800, color: '#E0E0E0',
            letterSpacing: '0.08em',
          }}>{pos.symbol}</div>
          <Stat label="Entry" value={`₹${pos.entry}`}/>
          <Stat label="Now" value={`₹${pos.current}`} color={pos.current >= pos.entry ? '#10B981' : '#FF1F1F'}/>
          <Stat label="P&L" value={`${pos.current >= pos.entry ? '+' : ''}${(((pos.current - pos.entry) / pos.entry) * 100).toFixed(2)}%`} color={pos.current >= pos.entry ? '#10B981' : '#FF1F1F'}/>
          <Stat label="Size" value={`${pos.qtyPct}% wallet`}/>
        </div>
      )}
      <OptionsGrid>
        {round.options.map((o, i) => (
          <OptionButton key={i}
            label={o.label}
            picked={picked === i}
            reveal={reveal}
            correct={o.correct}
            accent={accent}
            onClick={() => pick(i)}
          />
        ))}
      </OptionsGrid>
      {reveal && chosen && <Feedback chosen={chosen.correct} feedback={chosen.feedback} explanation={round.explanation}/>}
    </div>
  )
}

// ── Shared chrome ──────────────────────────────────────────

function ContextLine({ text, accent }: { text: string; accent: string }) {
  return (
    <div style={{
      display: 'inline-block',
      padding: '4px 10px',
      background: `rgba(${rgbFromHex(accent)},0.10)`,
      border: `1px solid rgba(${rgbFromHex(accent)},0.30)`,
      borderRadius: '4px',
      fontFamily: 'var(--font-inter), sans-serif',
      fontSize: '9px', fontWeight: 700, color: `#${accent}`,
      letterSpacing: '0.22em', textTransform: 'uppercase',
      marginBottom: '12px',
    }}>{text}</div>
  )
}

function Prompt({ text }: { text: string }) {
  return (
    <div style={{
      fontFamily: 'var(--font-fraunces), serif',
      fontSize: '20px', fontWeight: 600, color: '#F0F0F0',
      lineHeight: 1.35, marginBottom: '16px',
      letterSpacing: '-0.01em',
    }}>{text}</div>
  )
}

function OptionsGrid({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>{children}</div>
}

function OptionButton({
  label, picked, reveal, correct, accent, onClick,
}: {
  label: string; picked: boolean; reveal: boolean; correct: boolean; accent: string; onClick: () => void
}) {
  const showCorrect = reveal && correct
  const showWrongPick = reveal && picked && !correct
  const borderColor =
    showCorrect ? '#10B981' :
    showWrongPick ? '#FF1F1F' :
    picked ? `#${accent}` : 'rgba(255,255,255,0.10)'
  const bg =
    showCorrect ? 'rgba(16,185,129,0.08)' :
    showWrongPick ? 'rgba(255,31,31,0.08)' :
    picked ? `rgba(${rgbFromHex(accent)},0.08)` : 'rgba(0,0,0,0.4)'

  return (
    <button onClick={onClick} disabled={reveal} style={{
      display: 'flex', alignItems: 'flex-start', gap: '10px',
      padding: '12px 16px',
      background: bg,
      border: `1px solid ${borderColor}`,
      borderRadius: '6px',
      cursor: reveal ? 'default' : 'pointer',
      textAlign: 'left',
      transition: 'all 0.15s',
    }}>
      <span style={{
        flexShrink: 0,
        width: '20px', height: '20px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: showCorrect ? '#10B981' : showWrongPick ? '#FF1F1F' : 'rgba(255,255,255,0.06)',
        border: `1px solid ${borderColor}`,
        borderRadius: '4px',
        fontFamily: 'var(--font-jetbrains), monospace',
        fontSize: '10px', fontWeight: 800,
        color: showCorrect || showWrongPick ? '#000' : '#A0A0A0',
      }}>
        {showCorrect ? <Check size={11}/> : showWrongPick ? <X size={11}/> : ''}
      </span>
      <span style={{
        fontFamily: 'var(--font-inter), sans-serif',
        fontSize: '13px',
        color: showCorrect ? '#10B981' : showWrongPick ? '#FF1F1F' : '#D0D0D0',
        fontWeight: showCorrect || showWrongPick ? 600 : 400,
        lineHeight: 1.5,
      }}>{label}</span>
    </button>
  )
}

function Feedback({ chosen, feedback, explanation }: { chosen: boolean; feedback: string; explanation: string }) {
  return (
    <div style={{
      marginTop: '14px',
      padding: '12px 14px',
      background: chosen ? 'rgba(16,185,129,0.06)' : 'rgba(255,31,31,0.06)',
      border: `1px solid ${chosen ? '#10B98144' : '#FF1F1F44'}`,
      borderLeft: `3px solid ${chosen ? '#10B981' : '#FF1F1F'}`,
      borderRadius: '5px',
      animation: 'fb-in 0.3s ease-out',
    }}>
      <div style={{
        fontFamily: 'var(--font-inter), sans-serif',
        fontSize: '9px', fontWeight: 800,
        color: chosen ? '#10B981' : '#FF1F1F',
        letterSpacing: '0.22em', textTransform: 'uppercase',
        marginBottom: '6px',
      }}>{chosen ? 'Correct' : 'Not quite'}</div>
      <p style={{
        fontFamily: 'var(--font-inter), sans-serif',
        fontSize: '13px', color: '#E0E0E0', lineHeight: 1.55,
        margin: '0 0 8px', fontWeight: 600,
      }}>{feedback}</p>
      <p style={{
        fontFamily: 'var(--font-fraunces), serif',
        fontSize: '12.5px', color: '#A0A0A0', lineHeight: 1.6,
        margin: 0, fontStyle: 'italic',
      }}>{explanation}</p>
      <style>{`@keyframes fb-in { from { opacity:0; transform:translateY(4px) } to { opacity:1; transform:translateY(0) } }`}</style>
    </div>
  )
}

function Stat({ label, value, color = '#E0E0E0' }: { label: string; value: string; color?: string }) {
  return (
    <div>
      <div style={{
        fontFamily: 'var(--font-inter), sans-serif',
        fontSize: '8px', fontWeight: 700, color: '#606060',
        letterSpacing: '0.18em', textTransform: 'uppercase',
        marginBottom: '2px',
      }}>{label}</div>
      <div style={{
        fontFamily: 'var(--font-jetbrains), monospace',
        fontSize: '13px', fontWeight: 700, color,
      }}>{value}</div>
    </div>
  )
}

// ── Helpers ────────────────────────────────────────────────

function rgbFromHex(hex: string): string {
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
