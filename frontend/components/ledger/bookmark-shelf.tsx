'use client'

import type { Case } from '@/types/ledger'
import { LEDGER_CASES } from '@/lib/data/ledger-cases'

const LEDGER_CASES_LENGTH = LEDGER_CASES.length

interface BookmarkShelfProps {
  /** All cases the user has interacted with — recent at top */
  shelfCases: Case[]
  currentCaseNumber: number
  onSelectCase: (caseNumber: number) => void
  /** Click handler for "Browse all cases" footer link */
  onBrowseAll?: () => void
}

const STATUS_RIBBONS: Record<string, { color: string; label: string }> = {
  'in-progress':  { color: '#DC2626', label: 'CURRENTLY OPEN' },
  'completed':    { color: '#10B981', label: 'COMPLETED' },
  'unread':       { color: '#A89880', label: 'UNREAD' },
  'locked':       { color: '#525252', label: 'LOCKED' },
  'coming-soon':  { color: '#525252', label: 'COMING SOON' },
}

// Mock landed P&L per case for v1 visual fidelity
const MOCK_PNL: Record<string, string> = {
  'COV-20': '+₹12,400',
  'BRX-16': '+₹8,150',
  'GME-21': '+₹19,820',
  'SVB-23': '−₹3,200',
}

export function BookmarkShelf({ shelfCases, currentCaseNumber, onSelectCase, onBrowseAll }: BookmarkShelfProps) {
  return (
    <aside style={{
      width: '240px',
      flexShrink: 0,
      padding: '32px 0 32px 28px',
      display: 'flex',
      flexDirection: 'column',
      gap: '14px',
    }}>
      {/* Header */}
      <div style={{
        fontFamily: 'Garamond, "EB Garamond", "Times New Roman", serif',
        fontSize: '20px',
        color: '#E8DFC8',
        fontStyle: 'italic',
        marginBottom: '4px',
        letterSpacing: '0.01em',
      }}>
        Bookmark Shelf
      </div>
      <div style={{
        fontFamily: 'var(--font-geist-sans), sans-serif',
        fontSize: '9px',
        letterSpacing: '0.2em',
        color: 'rgba(168,152,128,0.55)',
        fontWeight: 600,
        textTransform: 'uppercase',
        marginBottom: '4px',
      }}>
        Left Sidebar
      </div>

      {/* Case rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {shelfCases.map(c => {
          const isActive = c.number === currentCaseNumber
          const ribbon = STATUS_RIBBONS[isActive ? 'in-progress' : c.status] ?? STATUS_RIBBONS.unread
          const pnl = MOCK_PNL[c.id]
          const subline = isActive
            ? 'CURRENTLY OPEN'
            : pnl
              ? `LANDED  ${pnl}`
              : ribbon.label

          return (
            <button
              key={c.id}
              onClick={() => onSelectCase(c.number)}
              style={{
                position: 'relative',
                textAlign: 'left',
                padding: '12px 14px 12px 12px',
                background: '#1C140A',
                border: isActive ? '1.5px solid #DC2626' : '1px solid rgba(168,152,128,0.12)',
                borderRadius: '4px',
                cursor: 'pointer',
                color: 'inherit',
                fontFamily: 'inherit',
                boxShadow: isActive ? '0 0 18px rgba(220,38,38,0.25)' : '0 2px 6px rgba(0,0,0,0.4)',
                transition: 'all 0.2s',
                overflow: 'hidden',
              }}
              onMouseEnter={e => {
                if (!isActive) (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(220,38,38,0.3)'
              }}
              onMouseLeave={e => {
                if (!isActive) (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(168,152,128,0.12)'
              }}
            >
              {/* Right ribbon edge */}
              <span style={{
                position: 'absolute',
                top: 0, right: 0, bottom: 0, width: '5px',
                background: ribbon.color,
                boxShadow: isActive ? `0 0 8px ${ribbon.color}` : 'none',
              }} />

              {/* Case code */}
              <div style={{
                fontFamily: 'var(--font-geist-mono), monospace',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.16em',
                color: '#DC2626',
                marginBottom: '4px',
              }}>
                {c.id}
              </div>

              {/* Case title */}
              <div style={{
                fontFamily: 'Garamond, "EB Garamond", "Times New Roman", serif',
                fontStyle: 'italic',
                fontSize: '13px',
                color: '#E8DFC8',
                lineHeight: 1.3,
                marginBottom: '6px',
              }}>
                {c.title}
              </div>

              {/* Status / P&L line */}
              <div style={{
                fontFamily: 'var(--font-geist-sans), sans-serif',
                fontSize: '9px',
                letterSpacing: '0.16em',
                color: ribbon.color,
                fontWeight: 600,
                textTransform: 'uppercase',
              }}>
                {subline}
              </div>
            </button>
          )
        })}
      </div>

      {/* Footer link */}
      <div style={{
        marginTop: '8px',
        paddingTop: '12px',
        borderTop: '1px solid rgba(168,152,128,0.12)',
      }}>
        <button
          onClick={onBrowseAll}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: onBrowseAll ? 'pointer' : 'default',
            fontFamily: 'Garamond, "EB Garamond", "Times New Roman", serif',
            fontStyle: 'italic',
            fontSize: '11px',
            color: '#DC2626',
            letterSpacing: '0.02em',
          }}
        >
          Browse all cases · {LEDGER_CASES_LENGTH} volumes →
        </button>
      </div>
    </aside>
  )
}
