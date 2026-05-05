import type { PortfolioStock } from '@/types/portfolio'
import { generateCandles } from '@/lib/utils/portfolio-price'
import { COVID_EVENTS, FLASH_CRASH } from './events'

const EVENT_IMPACTS = COVID_EVENTS.map(e =>
  e.causalImpacts.map(ci => ({
    symbol: ci.symbol,
    second: e.realSecond,
    impactPct: ci.impactPct,
    decaySeconds: ci.decaySeconds,
  }))
).flat()

function stockEvents(symbol: string) {
  return EVENT_IMPACTS.filter(e => e.symbol === symbol)
}

const STOCK_DEFS = [
  { symbol: 'INDIGO',    name: 'IndiGo Airlines',   sector: 'airlines' as const, sectorLabel: 'Airlines',  openPrice: 1247, closePrice: 1120, color: '#3b82f6', seed: 101 },
  { symbol: 'SUNPHARMA', name: 'Sun Pharma',         sector: 'pharma'   as const, sectorLabel: 'Pharma',    openPrice: 428,  closePrice: 451,  color: '#22c55e', seed: 102 },
  { symbol: 'RELIANCE',  name: 'Reliance Industries',sector: 'energy'   as const, sectorLabel: 'Energy',    openPrice: 1356, closePrice: 1247, color: '#f97316', seed: 103 },
  { symbol: 'HDFCBANK',  name: 'HDFC Bank',          sector: 'banking'  as const, sectorLabel: 'Banking',   openPrice: 1054, closePrice: 998,  color: '#a855f7', seed: 104 },
  { symbol: 'TITAN',     name: 'Titan Company',      sector: 'luxury'   as const, sectorLabel: 'Luxury',    openPrice: 1085, closePrice: 1052, color: '#eab308', seed: 105 },
  { symbol: 'TCS',       name: 'TCS',                sector: 'it'       as const, sectorLabel: 'IT',        openPrice: 2156, closePrice: 2112, color: '#06b6d4', seed: 106 },
]

export const PORTFOLIO_STOCKS: PortfolioStock[] = STOCK_DEFS.map(def => ({
  symbol:      def.symbol,
  name:        def.name,
  sector:      def.sector,
  sectorLabel: def.sectorLabel,
  openPrice:   def.openPrice,
  closePrice:  def.closePrice,
  color:       def.color,
  candles:     generateCandles(
    def.openPrice,
    def.closePrice,
    stockEvents(def.symbol),
    FLASH_CRASH,
    def.seed
  ),
}))
