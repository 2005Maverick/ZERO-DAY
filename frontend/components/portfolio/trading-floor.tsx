'use client'

import { useState, useMemo } from 'react'
import type { PortfolioScenario } from '@/types/portfolio'
import type { PortfolioGameState, PortfolioGameActions } from '@/lib/hooks/use-portfolio-game'
import { useNavigation } from '@/lib/contexts/navigation-context'
import { PortfolioHeader } from './portfolio-header'
import { StockCard } from './stock-card'
import { NewsBanner } from './news-banner'
import { RebalanceModal } from './rebalance-modal'
import { FlashCrashOverlay } from './flash-crash-overlay'
import { CausalPulseOverlay } from './causal-pulse-overlay'
import { CoachWhisper, useCoachWhisper } from './coach-whisper'
import { WhyPopover } from './why-popover'
import { OrderBookPanel } from './order-book-panel'
import { SectorHeatmap } from './sector-heatmap'

interface Props {
  scenario: PortfolioScenario
  game: PortfolioGameState & PortfolioGameActions
}

export function TradingFloor({ scenario, game }: Props) {
  const [whySymbol, setWhySymbol] = useState<string | null>(null)
  const { navigateTo } = useNavigation()

  const activeEvent = useMemo(
    () => scenario.events.find(e => e.id === game.activeEventId) ?? null,
    [scenario.events, game.activeEventId]
  )

  const coachTriggers = useMemo(() => {
    const heldFalling = activeEvent
      ? activeEvent.causalImpacts.some(
          c => c.polarity === 'negative' && (game.allocations[c.symbol]?.shares ?? 0) > 0
        )
      : false

    const totalValue = game.portfolioValue
    const overConcentrated = totalValue > 0 &&
      Object.values(game.allocations).some(a => a.currentValue / totalValue > 0.5)

    const missedSurge = activeEvent
      ? (activeEvent.causalImpacts.find(
          c => c.polarity === 'positive' && (game.allocations[c.symbol]?.shares ?? 0) === 0
        )?.symbol ?? null)
      : null

    return { heldFalling, overConcentrated, missedSurge }
  }, [activeEvent, game.allocations, game.portfolioValue])

  const coachMessage = useCoachWhisper(game.isMuted, coachTriggers)

  const showOrderBook = game.revealPhase === 'orderbook' || game.revealPhase === 'heatmap'
  const showHeatmap = game.revealPhase === 'heatmap'

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base, #090c0f)', paddingBottom: '40px' }}>
      <PortfolioHeader
        elapsedSeconds={game.elapsedSeconds}
        portfolioValue={game.portfolioValue}
        pnlRupees={game.pnlRupees}
        pnlPct={game.pnlPct}
        cashRemaining={game.cashRemaining}
        isMuted={game.isMuted}
        onMuteToggle={() => game.setMuted(!game.isMuted)}
        onBack={() => navigateTo('/scenarios')}
      />

      {/* News Banner slides in from top when event fires */}
      <NewsBanner event={activeEvent} />

      {/* Stock Grid */}
      <div style={{
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '80px 16px 16px',
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '12px',
      }}>
        {scenario.stocks.map(stock => (
          <StockCard
            key={stock.symbol}
            stock={stock}
            currentPrice={game.currentPrices[stock.symbol] ?? stock.openPrice}
            allocation={game.allocations[stock.symbol] ?? null}
            revealPhase={game.revealPhase}
            elapsedSeconds={game.elapsedSeconds}
            lastFiredEvent={activeEvent}
            onWhyClick={(symbol) => setWhySymbol(s => s === symbol ? null : symbol)}
          />
        ))}
      </div>

      {/* Progressive reveals */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 16px' }}>
        {showOrderBook && (
          <OrderBookPanel
            stocks={scenario.stocks}
            currentPrices={game.currentPrices}
            allocations={game.allocations}
            eventActive={!!activeEvent}
          />
        )}
        {showHeatmap && (
          <SectorHeatmap
            stocks={scenario.stocks}
            allocations={game.allocations}
            currentPrices={game.currentPrices}
          />
        )}
      </div>

      {/* Rebalance modal */}
      {game.phase === 'rebalance' && activeEvent && (
        <RebalanceModal
          event={activeEvent}
          stocks={scenario.stocks}
          currentAllocations={Object.fromEntries(
            scenario.stocks.map(s => [s.symbol, game.rebalanceAllocations[s.symbol] ?? 0])
          )}
          totalValue={game.portfolioValue + game.cashRemaining}
          secondsLeft={game.rebalanceSecondsLeft}
          onApply={game.applyRebalance}
          onHold={game.holdPosition}
        />
      )}

      {/* Flash crash overlay */}
      {game.flashCrashActive && (
        <FlashCrashOverlay
          secondsLeft={game.flashCrashSecondsLeft}
          onPanicSell={game.panicSell}
          onHold={game.holdThroughCrash}
        />
      )}

      {/* Causal pulse SVG overlay */}
      <CausalPulseOverlay pulses={game.pendingPulses} onDone={game.clearPulses} />

      {/* Why popover for stock explanation */}
      {whySymbol && activeEvent && activeEvent.whyExplanations[whySymbol] && (
        <WhyPopover
          symbol={whySymbol}
          event={activeEvent}
          onClose={() => setWhySymbol(null)}
        />
      )}

      {/* AI coach whisper toast */}
      <CoachWhisper message={coachMessage} />
    </div>
  )
}
