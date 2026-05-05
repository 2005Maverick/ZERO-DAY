'use client'

import { useMemo } from 'react'
import type { PortfolioStock, Allocation } from '@/types/portfolio'

interface Props {
  stocks: PortfolioStock[]
  currentPrices: Record<string, number>
  allocations: Record<string, Allocation>
  eventActive: boolean
}

function hashPrice(price: number, salt: number): number {
  const x = Math.sin(price * 127.1 + salt * 311.7) * 43758.5453123
  return Math.abs(x - Math.floor(x))
}

export function OrderBookPanel({ stocks, currentPrices, allocations, eventActive }: Props) {
  const spreadMultiplier = eventActive ? 0.009 : 0.003

  const heldStocks = useMemo(
    () => stocks.filter(s => (allocations[s.symbol]?.shares ?? 0) > 0),
    [stocks, allocations]
  )

  return (
    <div style={{
      background: '#0c1118',
      border: '1px solid #1e2a35',
      borderRadius: '12px',
      padding: '16px',
      marginTop: '16px',
    }}>
      <div style={{
        fontFamily: 'var(--font-inter)',
        fontSize: '11px',
        fontWeight: 700,
        color: '#475569',
        letterSpacing: '0.08em',
        marginBottom: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}>
        ORDER BOOK — L2 DATA
        {eventActive && (
          <span style={{ color: '#ef4444', fontWeight: 600 }}>⚡ SPREAD WIDENING</span>
        )}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${Math.min(heldStocks.length || 3, 3)}, 1fr)`,
        gap: '8px',
      }}>
        {(heldStocks.length > 0 ? heldStocks : stocks.slice(0, 3)).map(stock => {
          const price = currentPrices[stock.symbol] ?? stock.openPrice
          const spread = price * spreadMultiplier

          const asks = [1, 2, 3].map(i => ({
            price: price + spread * i,
            qty: Math.round(40 + hashPrice(price, i * 7) * 80),
          }))
          const bids = [1, 2, 3].map(i => ({
            price: price - spread * i,
            qty: Math.round(35 + hashPrice(price, i * 13) * 90),
          }))

          return (
            <div key={stock.symbol} style={{
              background: '#131920',
              borderRadius: '8px',
              padding: '10px',
              border: `1px solid ${eventActive ? 'rgba(239,68,68,0.15)' : '#1e2a35'}`,
            }}>
              <div style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '11px',
                fontWeight: 700,
                color: stock.color,
                marginBottom: '8px',
              }}>
                {stock.symbol}
              </div>

              {/* Asks (sell side) — reversed so lowest ask is nearest spread */}
              {asks.slice().reverse().map((a, i) => (
                <div key={`ask-${i}`} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '10px',
                  fontFamily: 'JetBrains Mono, monospace',
                  color: '#ef4444',
                  lineHeight: 1.7,
                }}>
                  <span>₹{a.price.toFixed(1)}</span>
                  <span style={{ color: '#475569' }}>{a.qty}</span>
                </div>
              ))}

              <div style={{ height: '1px', background: '#1e2a35', margin: '4px 0' }} />

              {/* Bids (buy side) */}
              {bids.map((b, i) => (
                <div key={`bid-${i}`} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '10px',
                  fontFamily: 'JetBrains Mono, monospace',
                  color: '#22c55e',
                  lineHeight: 1.7,
                }}>
                  <span>₹{b.price.toFixed(1)}</span>
                  <span style={{ color: '#475569' }}>{b.qty}</span>
                </div>
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}
