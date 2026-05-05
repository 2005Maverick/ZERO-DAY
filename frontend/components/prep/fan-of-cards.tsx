'use client'

import type { ScenarioStock, ArtifactType } from '@/types/scenario'
import { DossierCard } from './dossier-card'

interface FanOfCardsProps {
  stocks: ScenarioStock[]
  activeSymbol: string
  studiedCounts: Record<string, number>
  onSelect: (symbol: string) => void
  onTutor: (symbol: string, artifact: ArtifactType) => void
}

/**
 * 3 × 2 grid of stock dossier cards.
 */
export function FanOfCards({ stocks, activeSymbol, studiedCounts, onSelect, onTutor }: FanOfCardsProps) {
  return (
    <div style={{
      width: '100%',
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gridAutoRows: '1fr',
      gap: '14px',
    }}>
      {stocks.slice(0, 6).map(stock => (
        <DossierCard
          key={stock.symbol}
          stock={stock}
          active={stock.symbol === activeSymbol}
          studied={studiedCounts[stock.symbol] ?? 0}
          onClick={() => onSelect(stock.symbol)}
          onTutor={() => onTutor(stock.symbol, 'price-chart')}
        />
      ))}
    </div>
  )
}
