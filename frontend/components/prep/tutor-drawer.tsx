'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles, BookOpenCheck, Loader2 } from 'lucide-react'
import type { ArtifactType, ScenarioStock } from '@/types/scenario'
import { TUTOR_CONCEPTS } from '@/lib/data/tutor-concepts'

interface TutorDrawerProps {
  open: boolean
  onClose: () => void
  artifact: ArtifactType | null
  stock: ScenarioStock | null
  scenarioId: string
  studied: boolean
  onMarkStudied: () => void
}

/**
 * Right-side drawer ("ORUS Briefing") — pure black, modern fintech style.
 *   Layer 1: Universal concept (paragraphs + collapsible glossary chips)
 *   Layer 2: Applied analysis (AI-generated via /api/tutor)
 */
export function TutorDrawer({
  open, onClose, artifact, stock, scenarioId, studied, onMarkStudied,
}: TutorDrawerProps) {
  const concept = artifact ? TUTOR_CONCEPTS[artifact] : null
  const [appliedText, setAppliedText] = useState<string>('')
  const [appliedLoading, setAppliedLoading] = useState(false)
  const [appliedError, setAppliedError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setAppliedText('')
      setAppliedError(null)
      setAppliedLoading(false)
    }
  }, [open, artifact, stock?.symbol])

  async function fetchApplied(): Promise<void> {
    if (!artifact || !stock) return
    setAppliedLoading(true)
    setAppliedError(null)
    try {
      const contextData = buildContextData(artifact, stock)
      const res = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stock: stock.symbol,
          artifact,
          scenarioId,
          contextData,
        }),
      })
      if (!res.ok) throw new Error(`Status ${res.status}`)
      const data = await res.json() as { text: string; error?: string }
      if (data.error) throw new Error(data.error)
      setAppliedText(data.text || 'Tutor unavailable. Read the numbers yourself, operative.')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unknown error'
      setAppliedError(msg)
    } finally {
      setAppliedLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {open && concept && stock && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(2px)',
              zIndex: 80,
            }}
          />

          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 280 }}
            style={{
              position: 'fixed',
              top: 0, right: 0, bottom: 0,
              width: 'min(540px, 92vw)',
              background: '#0A0A0C',
              borderLeft: '1px solid rgba(168,85,247,0.4)',
              boxShadow: '-12px 0 50px rgba(0,0,0,0.7), 0 0 60px rgba(168,85,247,0.08)',
              zIndex: 81,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '18px 20px',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              background: 'linear-gradient(180deg, rgba(168,85,247,0.08), transparent)',
            }}>
              <div style={{
                width: '38px', height: '38px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #7C3AED, #A855F7)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 18px rgba(168,85,247,0.5)',
                flexShrink: 0,
              }}>
                <BookOpenCheck size={18} color="#FFFFFF" strokeWidth={2.2} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontFamily: 'var(--font-geist-mono), monospace',
                  fontSize: '9px',
                  color: '#A855F7',
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  marginBottom: '4px',
                  fontWeight: 700,
                }}>
                  ORUS Tutor · {stock.symbol}
                </div>
                <div style={{
                  fontFamily: 'var(--font-anton), var(--font-geist-sans), sans-serif',
                  fontSize: '20px',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  letterSpacing: '0.04em',
                  lineHeight: 1.15,
                }}>
                  {concept.title}
                </div>
              </div>
              <button
                onClick={onClose}
                aria-label="Close tutor"
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: 'rgba(255,255,255,0.6)',
                  borderRadius: '6px',
                  padding: '6px',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <X size={14} />
              </button>
            </div>

            {/* Body */}
            <div style={{
              flex: 1,
              overflow: 'auto',
              padding: '18px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px',
            }}>
              <div>
                <SectionLabel>The Universal Concept</SectionLabel>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '11px', marginTop: '10px' }}>
                  {concept.paragraphs.map((p, i) => (
                    <p key={i} style={{
                      fontFamily: 'var(--font-geist-sans), sans-serif',
                      fontSize: '13.5px',
                      lineHeight: 1.55,
                      color: 'rgba(255,255,255,0.85)',
                      margin: 0,
                    }}>
                      {p}
                    </p>
                  ))}
                </div>
              </div>

              {concept.glossary.length > 0 && (
                <div>
                  <SectionLabel>Glossary</SectionLabel>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
                    {concept.glossary.map(g => (
                      <details key={g.term} style={{
                        background: 'rgba(250,204,21,0.06)',
                        border: '1px solid rgba(250,204,21,0.3)',
                        borderRadius: '4px',
                        padding: '4px 9px',
                        cursor: 'pointer',
                      }}>
                        <summary style={{
                          fontFamily: 'var(--font-geist-mono), monospace',
                          fontSize: '10px',
                          color: '#FACC15',
                          letterSpacing: '0.06em',
                          listStyle: 'none',
                          fontWeight: 600,
                        }}>
                          {g.term}
                        </summary>
                        <div style={{
                          fontFamily: 'var(--font-geist-sans), sans-serif',
                          fontSize: '12px',
                          color: 'rgba(255,255,255,0.75)',
                          marginTop: '6px',
                          lineHeight: 1.45,
                          maxWidth: '300px',
                        }}>
                          {g.def}
                        </div>
                      </details>
                    ))}
                  </div>
                </div>
              )}

              {/* Layer 2 — Applied */}
              <div style={{
                background: 'rgba(6,182,212,0.05)',
                border: '1px solid rgba(6,182,212,0.3)',
                borderRadius: '6px',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={14} color="#06B6D4" />
                  <div style={{
                    fontFamily: 'var(--font-geist-sans), sans-serif',
                    fontSize: '10px',
                    fontWeight: 700,
                    letterSpacing: '0.18em',
                    color: '#06B6D4',
                    textTransform: 'uppercase',
                  }}>
                    Apply to {stock.symbol}
                  </div>
                </div>

                {!appliedText && !appliedLoading && !appliedError && (
                  <button
                    onClick={fetchApplied}
                    style={{
                      padding: '10px 14px',
                      background: 'linear-gradient(180deg, #06B6D4, #0891B2)',
                      border: '1px solid #06B6D4',
                      borderRadius: '5px',
                      color: '#0A0A0C',
                      fontFamily: 'var(--font-geist-sans), sans-serif',
                      fontSize: '11px',
                      fontWeight: 700,
                      letterSpacing: '0.16em',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      boxShadow: '0 0 14px rgba(6,182,212,0.35), inset 0 1px 0 rgba(255,255,255,0.3)',
                    }}
                  >
                    Why does this matter HERE? →
                  </button>
                )}
                {appliedLoading && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    fontFamily: 'var(--font-geist-mono), monospace',
                    fontSize: '11px',
                    color: '#06B6D4',
                  }}>
                    <Loader2 size={14} className="animate-spin" />
                    ORUS analysing the data on screen…
                  </div>
                )}
                {appliedError && (
                  <div style={{
                    fontFamily: 'var(--font-geist-mono), monospace',
                    fontSize: '11px',
                    color: '#EF4444',
                  }}>
                    Tutor offline. {appliedError}
                  </div>
                )}
                {appliedText && (
                  <p style={{
                    fontFamily: 'var(--font-geist-sans), sans-serif',
                    fontSize: '13.5px',
                    lineHeight: 1.55,
                    color: 'rgba(255,255,255,0.95)',
                    margin: 0,
                  }}>
                    {appliedText}
                  </p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div style={{
              padding: '14px 20px',
              borderTop: '1px solid rgba(255,255,255,0.06)',
              display: 'flex',
              gap: '10px',
            }}>
              <button
                onClick={onMarkStudied}
                disabled={studied}
                style={{
                  flex: 1,
                  padding: '11px 14px',
                  background: studied ? 'rgba(6,182,212,0.16)' : 'rgba(239,68,68,0.14)',
                  border: `1px solid ${studied ? '#06B6D4' : '#EF4444'}`,
                  borderRadius: '5px',
                  color: studied ? '#06B6D4' : '#EF4444',
                  fontFamily: 'var(--font-geist-sans), sans-serif',
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  cursor: studied ? 'default' : 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {studied ? '✓ Marked as Studied' : 'Mark as Studied'}
              </button>
              <button
                onClick={onClose}
                style={{
                  padding: '11px 14px',
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.14)',
                  borderRadius: '5px',
                  color: 'rgba(255,255,255,0.7)',
                  fontFamily: 'var(--font-geist-sans), sans-serif',
                  fontSize: '11px',
                  fontWeight: 600,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontFamily: 'var(--font-geist-sans), sans-serif',
      fontSize: '9px',
      fontWeight: 700,
      letterSpacing: '0.2em',
      color: 'rgba(255,255,255,0.45)',
      textTransform: 'uppercase',
    }}>
      {children}
    </div>
  )
}

function buildContextData(artifact: ArtifactType, stock: ScenarioStock): Record<string, unknown> {
  switch (artifact) {
    case 'price-chart': {
      const last = stock.candles[stock.candles.length - 1]
      const first = stock.candles[0]
      return {
        symbol: stock.symbol,
        sector: stock.sectorLabel,
        last30dStart: first?.close,
        last30dEnd: last?.close,
        pctChange30d: stock.pctChange30d,
        currentClose: stock.closePrice,
        recentCandle: last,
      }
    }
    case 'key-metrics':
      return { symbol: stock.symbol, ...stock.metrics, sector: stock.sectorLabel }
    case 'balance-sheet':
      return { symbol: stock.symbol, ...stock.balanceSheet, sector: stock.sectorLabel }
    case 'news-24h':
      return { symbol: stock.symbol, sector: stock.sectorLabel, headlines: stock.news }
    case 'holdings':
      return { symbol: stock.symbol, top5: stock.holders }
    case 'sector-position':
      return { symbol: stock.symbol, sector: stock.sectorLabel, ...stock.sectorPosition }
  }
}
