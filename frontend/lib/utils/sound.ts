'use client'

type SoundKey = 'opening-bell' | 'closing-bell' | 'breaking-news' | 'flash-crash' | 'tick-soft' | 'rule-unlock' | 'buy' | 'sell'

let audioCtx: AudioContext | null = null
let globalMuted = false

function getCtx(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext()
  return audioCtx
}

function synth(frequency: number, type: OscillatorType, duration: number, volume: number, delay = 0): void {
  if (globalMuted || typeof window === 'undefined') return
  try {
    const ctx = getCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = type
    osc.frequency.value = frequency
    gain.gain.setValueAtTime(0, ctx.currentTime + delay)
    gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + delay + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration)
    osc.start(ctx.currentTime + delay)
    osc.stop(ctx.currentTime + delay + duration + 0.05)
  } catch { /* audio not available */ }
}

const soundMap: Record<SoundKey, () => void> = {
  'opening-bell': () => {
    synth(880, 'triangle', 1.2, 0.4)
    synth(660, 'triangle', 1.2, 0.3, 0.05)
    synth(440, 'triangle', 0.8, 0.2, 0.1)
  },
  'closing-bell': () => {
    synth(440, 'triangle', 1.5, 0.4)
    synth(330, 'triangle', 1.5, 0.25, 0.05)
  },
  'breaking-news': () => {
    synth(1200, 'square', 0.05, 0.3)
    synth(1200, 'square', 0.05, 0.3, 0.12)
    synth(1200, 'square', 0.05, 0.3, 0.24)
  },
  'flash-crash': () => {
    synth(150, 'sawtooth', 2.0, 0.5)
    synth(80,  'sawtooth', 2.0, 0.3, 0.1)
  },
  'tick-soft': () => {
    synth(880, 'sine', 0.02, 0.04)
  },
  'rule-unlock': () => {
    synth(523, 'sine', 0.15, 0.3)        // C
    synth(659, 'sine', 0.15, 0.3, 0.15) // E
    synth(784, 'sine', 0.25, 0.4, 0.30) // G
  },
  'buy': () => {
    synth(660, 'sine', 0.1, 0.2)
    synth(880, 'sine', 0.1, 0.2, 0.1)
  },
  'sell': () => {
    synth(440, 'sine', 0.1, 0.2)
    synth(330, 'sine', 0.1, 0.2, 0.1)
  },
}

const lastPlayed: Partial<Record<SoundKey, number>> = {}
const THROTTLE_MS: Partial<Record<SoundKey, number>> = {
  'tick-soft': 4000,
}

export function playSound(key: SoundKey): void {
  if (globalMuted) return
  const throttle = THROTTLE_MS[key]
  if (throttle) {
    const last = lastPlayed[key] ?? 0
    if (Date.now() - last < throttle) return
    lastPlayed[key] = Date.now()
  }
  soundMap[key]?.()
}

export function setMuted(muted: boolean): void {
  globalMuted = muted
}

export function isMuted(): boolean {
  return globalMuted
}
