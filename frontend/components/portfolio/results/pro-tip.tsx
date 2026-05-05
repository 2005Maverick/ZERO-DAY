'use client'

import { useEffect, useState } from 'react'
import type { PortfolioRunResult } from '@/types/portfolio'

interface Props {
  runResult: PortfolioRunResult
  scenarioSlug: string
}

interface FeedbackPayload {
  headline: string
  winMoment: string
  costMoment: string
  bias: string
  proTip: string
}

export function ProTip({ runResult, scenarioSlug }: Props) {
  const [feedback, setFeedback] = useState<FeedbackPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function fetchFeedback() {
      try {
        const res = await fetch('/api/portfolio-feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ runResult, scenarioSlug }),
        })
        if (!res.ok) throw new Error('API error')
        const data = await res.json() as FeedbackPayload
        if (!cancelled) setFeedback(data)
      } catch {
        if (!cancelled) setError(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchFeedback()
    return () => { cancelled = true }
  }, [runResult, scenarioSlug])

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(255,184,48,0.06), rgba(255,184,48,0.02))',
      border: '1px solid rgba(255,184,48,0.2)',
      borderLeft: '4px solid #FFB830',
      borderRadius: '12px',
      padding: '20px 24px',
    }}>
      <div style={{
        fontFamily: 'var(--font-inter)',
        fontSize: '11px',
        fontWeight: 700,
        color: '#FFB830',
        letterSpacing: '0.08em',
        marginBottom: '12px',
      }}>
        AI TRADING COACH
      </div>

      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[80, 60, 90, 50].map((w, i) => (
            <div
              key={i}
              style={{
                height: '12px',
                width: `${w}%`,
                background: 'rgba(255,184,48,0.08)',
                borderRadius: '4px',
                animation: 'pulse 1.5s ease-in-out infinite',
              }}
            />
          ))}
          <style>{`@keyframes pulse { 0%,100%{opacity:0.4} 50%{opacity:0.8} }`}</style>
        </div>
      )}

      {error && (
        <div style={{ fontFamily: 'var(--font-inter)', fontSize: '13px', color: '#475569' }}>
          Could not load AI feedback. Review your allocation snapshots above to identify patterns.
        </div>
      )}

      {feedback && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{
            fontFamily: 'Anton, sans-serif',
            fontSize: '20px',
            color: '#f1f5f9',
            letterSpacing: '0.02em',
          }}>
            {feedback.headline}
          </div>

          {feedback.winMoment && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <span style={{ color: '#22c55e', flexShrink: 0 }}>✓</span>
              <span style={{ fontFamily: 'var(--font-inter)', fontSize: '13px', color: '#94a3b8', lineHeight: 1.5 }}>
                <strong style={{ color: '#f1f5f9' }}>Best move:</strong> {feedback.winMoment}
              </span>
            </div>
          )}

          {feedback.costMoment && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <span style={{ color: '#ef4444', flexShrink: 0 }}>✗</span>
              <span style={{ fontFamily: 'var(--font-inter)', fontSize: '13px', color: '#94a3b8', lineHeight: 1.5 }}>
                <strong style={{ color: '#f1f5f9' }}>Costliest decision:</strong> {feedback.costMoment}
              </span>
            </div>
          )}

          {feedback.bias && (
            <div style={{
              background: 'rgba(255,184,48,0.06)',
              borderRadius: '8px',
              padding: '10px 12px',
              fontFamily: 'var(--font-inter)',
              fontSize: '12px',
              color: '#94a3b8',
              lineHeight: 1.5,
            }}>
              <strong style={{ color: '#FFB830' }}>Cognitive bias detected:</strong> {feedback.bias}
            </div>
          )}

          {feedback.proTip && (
            <div style={{
              fontFamily: 'var(--font-inter)',
              fontSize: '13px',
              color: '#94a3b8',
              lineHeight: 1.6,
              fontStyle: 'italic',
            }}>
              &quot;{feedback.proTip}&quot;
            </div>
          )}
        </div>
      )}
    </div>
  )
}
