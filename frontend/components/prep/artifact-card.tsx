'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { HelpCircle } from 'lucide-react'
import type { ArtifactType } from '@/types/scenario'

interface ArtifactCardProps {
  artifact: ArtifactType
  title: string
  studied: boolean
  onTutorOpen: () => void
  onView: (durationMs: number) => void
  highlighted?: boolean
  children: ReactNode
  style?: React.CSSProperties
}

/**
 * Modern terminal-style card.
 * - Pure black bg (#0F0F12) · subtle white border
 * - Active/hovered: red border tint
 * - Top bar: title left, [?] tutor button right
 * - [?] button: red when unstudied, cyan when studied — corner pill
 */
export function ArtifactCard({
  title, studied, onTutorOpen, onView, highlighted, children, style,
}: ArtifactCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const inViewSinceRef = useRef<number | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
          inViewSinceRef.current = Date.now()
        } else if (inViewSinceRef.current) {
          const dwell = Date.now() - inViewSinceRef.current
          if (dwell > 500) onView(dwell)
          inViewSinceRef.current = null
        }
      }
    }, { threshold: [0, 0.5, 1] })
    obs.observe(el)
    return () => {
      if (inViewSinceRef.current) {
        const dwell = Date.now() - inViewSinceRef.current
        if (dwell > 500) onView(dwell)
      }
      obs.disconnect()
    }
  }, [onView])

  const accent = studied ? '#06B6D4' : '#EF4444'

  return (
    <div
      ref={ref}
      style={{
        position: 'relative',
        background: 'linear-gradient(180deg, rgba(20,20,28,0.85), rgba(10,10,14,0.92))',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        border: `1px solid ${highlighted ? `${accent}` : 'rgba(255,255,255,0.07)'}`,
        borderRadius: '10px',
        padding: '14px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: highlighted
          ? `0 0 28px ${accent}30, inset 0 1px 0 rgba(255,255,255,0.05)`
          : '0 4px 14px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.03)',
        transition: 'border 0.18s, box-shadow 0.18s',
        minHeight: '200px',
        ...style,
      }}
    >
      {/* Faint scanline gradient on top edge */}
      <span style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: '1px',
        background: `linear-gradient(90deg, transparent, ${highlighted ? accent : 'rgba(255,255,255,0.08)'}, transparent)`,
        pointerEvents: 'none',
      }} />
      {/* Corner brackets */}
      <span style={{ position: 'absolute', top: '6px', left: '6px', width: '8px', height: '8px',
        borderTop: `1.5px solid ${highlighted ? accent : 'rgba(255,255,255,0.16)'}`,
        borderLeft: `1.5px solid ${highlighted ? accent : 'rgba(255,255,255,0.16)'}`,
        pointerEvents: 'none',
      }} />
      <span style={{ position: 'absolute', bottom: '6px', right: '6px', width: '8px', height: '8px',
        borderBottom: `1.5px solid ${highlighted ? accent : 'rgba(255,255,255,0.16)'}`,
        borderRight: `1.5px solid ${highlighted ? accent : 'rgba(255,255,255,0.16)'}`,
        pointerEvents: 'none',
      }} />
      {/* Title bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '10px',
      }}>
        <div style={{
          fontFamily: 'var(--font-geist-sans), sans-serif',
          fontSize: '10px',
          fontWeight: 700,
          letterSpacing: '0.18em',
          color: 'rgba(255,255,255,0.55)',
          textTransform: 'uppercase',
        }}>
          {title}
        </div>
        <button
          onClick={onTutorOpen}
          aria-label={`Open tutor for ${title}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '22px', height: '22px',
            background: studied ? 'rgba(6,182,212,0.14)' : 'rgba(239,68,68,0.14)',
            border: `1px solid ${accent}`,
            borderRadius: '4px',
            color: accent,
            cursor: 'pointer',
            transition: 'all 0.12s',
            boxShadow: studied ? 'none' : `0 0 8px ${accent}50`,
          }}
          onMouseEnter={e => {
            const el = e.currentTarget
            el.style.background = `${accent}30`
          }}
          onMouseLeave={e => {
            const el = e.currentTarget
            el.style.background = studied ? 'rgba(6,182,212,0.14)' : 'rgba(239,68,68,0.14)'
          }}
        >
          <HelpCircle size={13} strokeWidth={2.4} />
        </button>
      </div>

      <div style={{ flex: 1, overflow: 'hidden' }}>
        {children}
      </div>
    </div>
  )
}
