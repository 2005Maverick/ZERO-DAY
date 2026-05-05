'use client'

import type { ArtifactType, ScenarioStock } from '@/types/scenario'
import { ArtifactCard } from './artifact-card'
import {
  PriceChartArtifact,
  KeyMetricsArtifact,
  BalanceSheetArtifact,
  NewsArtifact,
  HoldingsArtifact,
  SectorPositionArtifact,
} from './artifacts'

interface DossierWorkbenchProps {
  stock: ScenarioStock
  studied: Record<string, true>
  onTutorOpen: (artifact: ArtifactType) => void
  onArtifactView: (artifact: ArtifactType, durationMs: number) => void
}

const SECTOR_COLOR: Record<string, string> = {
  airlines: '#3B82F6',
  pharma:   '#10B981',
  energy:   '#E11D48',
  banking:  '#06B6D4',
  luxury:   '#A855F7',
  it:       '#14B8A6',
}

const ARTIFACT_LABEL: Record<ArtifactType, string> = {
  'price-chart':     'Price Action · 30D',
  'key-metrics':     'Key Metrics',
  'balance-sheet':   'Balance Sheet',
  'news-24h':        'News · 24h',
  'holdings':        'Top Institutional Holders',
  'sector-position': 'Sector Position',
}

/**
 * The "active stock" workbench — title bar + 3-col × 3-row artifact grid.
 *   Row 1: Price Chart (cols 1-2) | News 24h (col 3)
 *   Row 2: Key Metrics | Balance Sheet | Sector Position
 *   Row 3: Holdings (full width)
 */
export function DossierWorkbench({
  stock, studied, onTutorOpen, onArtifactView,
}: DossierWorkbenchProps) {
  const accent = SECTOR_COLOR[stock.sector] ?? stock.color
  const pctNum = stock.pctChange30d * 100
  const isDown = pctNum < 0
  const isStudied = (a: ArtifactType): boolean => !!studied[`${stock.symbol}:${a}`]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Title bar */}
      <div style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        padding: '14px 18px',
        background: `linear-gradient(180deg, rgba(212,160,77,0.05), #11161D), linear-gradient(90deg, ${accent}18, transparent 50%)`,
        border: '1px solid rgba(212,160,77,0.22)',
        borderRadius: '8px',
        boxShadow: '0 6px 16px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.04)',
      }}>
        {/* Sector accent stripe on left */}
        <span style={{
          position: 'absolute',
          left: 0, top: '12px', bottom: '12px',
          width: '3px',
          background: `linear-gradient(180deg, transparent, ${accent}, transparent)`,
          boxShadow: `0 0 12px ${accent}`,
        }} />

        <div style={{
          width: '38px', height: '38px',
          borderRadius: '8px',
          background: `${accent}1A`,
          border: `1px solid ${accent}80`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '20px',
          flexShrink: 0,
        }}>
          {stock.emoji}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
            <span style={{
              fontFamily: 'var(--font-cormorant-sc), serif',
              fontWeight: 700,
              fontSize: '22px',
              color: '#F4EDE0',
              letterSpacing: '0.06em',
            }}>
              {stock.symbol}
            </span>
            <span style={{
              fontFamily: 'var(--font-plex-mono), monospace',
              fontSize: '9px',
              color: accent,
              fontWeight: 600,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
            }}>
              {stock.sectorLabel} · NSE
            </span>
          </div>
          <div style={{
            fontFamily: 'var(--font-eb-garamond), serif',
            fontStyle: 'italic',
            fontSize: '12px',
            color: '#A89A7E',
            marginTop: '2px',
          }}>
            {stock.name} · {stock.description}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
          <div style={{
            fontFamily: 'var(--font-plex-mono), monospace',
            fontSize: '8px',
            color: '#5C5849',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
          }}>
            Last Close · Mar 6
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{
              fontFamily: 'var(--font-plex-mono), monospace',
              fontSize: '22px',
              fontWeight: 700,
              color: '#F4EDE0',
            }}>
              ₹{stock.closePrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span style={{
              fontFamily: 'var(--font-plex-mono), monospace',
              fontSize: '12px',
              fontWeight: 700,
              color: isDown ? '#E04A4A' : '#5AB088',
              display: 'flex', alignItems: 'center', gap: '3px',
            }}>
              <span style={{ fontSize: '8px' }}>{isDown ? '▼' : '▲'}</span>
              {pctNum > 0 ? '+' : ''}{pctNum.toFixed(1)}% · 30D
            </span>
          </div>
        </div>
      </div>

      {/* Artifact grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gridTemplateRows: 'minmax(260px, auto) minmax(220px, auto) minmax(150px, auto)',
        gap: '12px',
      }}>
        {/* Price Chart — spans cols 1-2, row 1 */}
        <div style={{ gridColumn: '1 / 3', gridRow: '1 / 2', display: 'flex' }}>
          <ArtifactCard
            artifact="price-chart"
            title={ARTIFACT_LABEL['price-chart']}
            studied={isStudied('price-chart')}
            onTutorOpen={() => onTutorOpen('price-chart')}
            onView={(d) => onArtifactView('price-chart', d)}
            style={{ flex: 1 }}
          >
            <PriceChartArtifact stock={stock} />
          </ArtifactCard>
        </div>

        {/* News 24h — col 3, row 1 */}
        <div style={{ gridColumn: '3 / 4', gridRow: '1 / 2', display: 'flex' }}>
          <ArtifactCard
            artifact="news-24h"
            title={ARTIFACT_LABEL['news-24h']}
            studied={isStudied('news-24h')}
            onTutorOpen={() => onTutorOpen('news-24h')}
            onView={(d) => onArtifactView('news-24h', d)}
            style={{ flex: 1 }}
          >
            <NewsArtifact stock={stock} />
          </ArtifactCard>
        </div>

        {/* Row 2 — Key Metrics, Balance Sheet, Sector Position */}
        <ArtifactCard
          artifact="key-metrics"
          title={ARTIFACT_LABEL['key-metrics']}
          studied={isStudied('key-metrics')}
          onTutorOpen={() => onTutorOpen('key-metrics')}
          onView={(d) => onArtifactView('key-metrics', d)}
        >
          <KeyMetricsArtifact stock={stock} />
        </ArtifactCard>

        <ArtifactCard
          artifact="balance-sheet"
          title={ARTIFACT_LABEL['balance-sheet']}
          studied={isStudied('balance-sheet')}
          onTutorOpen={() => onTutorOpen('balance-sheet')}
          onView={(d) => onArtifactView('balance-sheet', d)}
        >
          <BalanceSheetArtifact stock={stock} />
        </ArtifactCard>

        <ArtifactCard
          artifact="sector-position"
          title={ARTIFACT_LABEL['sector-position']}
          studied={isStudied('sector-position')}
          onTutorOpen={() => onTutorOpen('sector-position')}
          onView={(d) => onArtifactView('sector-position', d)}
        >
          <SectorPositionArtifact stock={stock} />
        </ArtifactCard>

        {/* Row 3 — Holdings full-width */}
        <div style={{ gridColumn: '1 / 4', gridRow: '3 / 4', display: 'flex' }}>
          <ArtifactCard
            artifact="holdings"
            title={ARTIFACT_LABEL['holdings']}
            studied={isStudied('holdings')}
            onTutorOpen={() => onTutorOpen('holdings')}
            onView={(d) => onArtifactView('holdings', d)}
            style={{ flex: 1 }}
          >
            <HoldingsArtifact stock={stock} />
          </ArtifactCard>
        </div>
      </div>
    </div>
  )
}
