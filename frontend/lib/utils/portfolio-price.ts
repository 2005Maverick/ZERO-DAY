import type { PortfolioCandle } from '@/types/portfolio'

// Mulberry32 seeded PRNG — deterministic and reproducible across runs
export function mulberry32(seed: number): () => number {
  let s = seed
  return () => {
    s |= 0
    s = s + 0x6d2b79f5 | 0
    let t = Math.imul(s ^ s >>> 15, 1 | s)
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t
    return ((t ^ t >>> 14) >>> 0) / 4294967296
  }
}

// Box-Muller transform: uniform → gaussian noise
export function gaussianNoise(rng: () => number, sigma: number): number {
  const u1 = Math.max(1e-10, rng())
  const u2 = rng()
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
  return z * sigma
}

interface EventImpact {
  second: number
  impactPct: number
  decaySeconds: number
}

interface FlashCrashConfig {
  realSecond: number
  dropPct: number
  durationSeconds: number
}

export function generateCandles(
  openPrice: number,
  closePrice: number,
  events: EventImpact[],
  flashCrash: FlashCrashConfig,
  seed: number
): PortfolioCandle[] {
  const rng = mulberry32(seed)
  const totalSeconds = 480
  const candles: PortfolioCandle[] = []

  // Track cumulative price modifier from events
  const activeImpacts: Array<{
    startSecond: number
    targetDelta: number  // absolute price delta to apply
    decaySeconds: number
  }> = []

  let basePrice = openPrice
  const drift = (closePrice - openPrice) / totalSeconds

  for (let s = 0; s < totalSeconds; s++) {
    // Apply baseline drift + noise
    basePrice += drift + gaussianNoise(rng, openPrice * 0.003)

    // Check if an event fires at this second
    const firingEvent = events.find(e => e.second === s)
    if (firingEvent) {
      const targetDelta = basePrice * firingEvent.impactPct
      activeImpacts.push({
        startSecond: s,
        targetDelta,
        decaySeconds: firingEvent.decaySeconds,
      })
    }

    // Check flash crash
    let flashMod = 0
    if (s >= flashCrash.realSecond && s < flashCrash.realSecond + flashCrash.durationSeconds) {
      const progress = (s - flashCrash.realSecond) / flashCrash.durationSeconds
      // Sharp drop then linear recovery
      if (progress < 0.05) {
        flashMod = -openPrice * flashCrash.dropPct * (progress / 0.05)
      } else {
        flashMod = -openPrice * flashCrash.dropPct * (1 - (progress - 0.05) / 0.95)
      }
    }

    // Sum all active event impacts (decaying)
    let eventMod = 0
    for (const impact of activeImpacts) {
      const age = s - impact.startSecond
      if (age <= impact.decaySeconds) {
        // Ease-in: full impact immediately, decays to 0
        const factor = 1 - age / impact.decaySeconds
        eventMod += impact.targetDelta * factor
      }
    }

    const price = Math.max(1, basePrice + eventMod + flashMod)
    const volume = Math.floor(
      openPrice * 50 * (0.8 + rng() * 0.4) *
      (firingEvent ? 3.5 : 1) *
      (s >= flashCrash.realSecond && s < flashCrash.realSecond + 10 ? 5 : 1)
    )

    candles.push({ second: s, price: Math.round(price * 100) / 100, volume })
  }

  return candles
}
