'use client'

import { useEffect, useRef } from 'react'

// ── Grain / dither overlay (SVG turbulence, animation-free, GPU friendly) ──

export function GrainOverlay({ opacity = 0.06 }: { opacity?: number }) {
  return (
    <div
      aria-hidden
      style={{
        position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none',
        opacity,
        mixBlendMode: 'overlay',
        backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.55 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>")`,
      }}
    />
  )
}

// ── Dither / scanline overlay (pixel grid pattern, very subtle) ──

export function DitherOverlay({ opacity = 0.08 }: { opacity?: number }) {
  return (
    <div
      aria-hidden
      style={{
        position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none',
        opacity,
        backgroundImage:
          'repeating-linear-gradient(0deg, rgba(255,255,255,0.04) 0, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 3px)',
      }}
    />
  )
}

// ── Vignette ──

export function Vignette({ accent = '212,160,77' }: { accent?: string }) {
  return (
    <div
      aria-hidden
      style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        background:
          `radial-gradient(ellipse 90% 60% at 50% 0%, rgba(${accent}, 0.10), transparent 55%),` +
          `radial-gradient(ellipse 60% 80% at 100% 100%, rgba(${accent}, 0.04), transparent 60%),` +
          'radial-gradient(ellipse 100% 100% at 50% 50%, transparent 55%, rgba(0,0,0,0.6) 100%),' +
          '#000',
      }}
    />
  )
}

// ── Particle dust (canvas, slow-floating, low count for performance) ──

interface ParticlesProps {
  count?: number
  color?: string
  speed?: number          // base velocity in px/sec
}

export function Particles({ count = 36, color = 'rgba(212,160,77,0.32)', speed = 8 }: ParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let w = canvas.width = window.innerWidth
    let h = canvas.height = window.innerHeight
    let raf = 0
    let running = true

    interface P { x: number; y: number; vx: number; vy: number; r: number; phase: number }
    const parts: P[] = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * speed * 0.05,
      vy: -Math.random() * speed * 0.05 - 0.05,
      r: 0.5 + Math.random() * 1.4,
      phase: Math.random() * Math.PI * 2,
    }))

    const onResize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight }
    window.addEventListener('resize', onResize)

    let last = performance.now()
    const tick = (now: number) => {
      if (!running) return
      const dt = Math.min(40, now - last) / 16
      last = now
      ctx.clearRect(0, 0, w, h)
      for (const p of parts) {
        p.x += p.vx * dt + Math.sin(p.phase + now * 0.0006) * 0.06
        p.y += p.vy * dt
        p.phase += 0.005 * dt
        if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w }
        if (p.x < -10) p.x = w + 10
        if (p.x > w + 10) p.x = -10
        ctx.beginPath()
        ctx.fillStyle = color
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fill()
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      running = false
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
    }
  }, [count, color, speed])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{
        position: 'fixed', inset: 0, zIndex: 0,
        pointerEvents: 'none',
        width: '100vw', height: '100vh',
      }}
    />
  )
}

// ── Ambient corner glow (used in card hover or behind hero text) ──

export function AmbientGlow({ x = '50%', y = '50%', color = 'rgba(212,160,77,0.18)', size = 420 }: {
  x?: string; y?: string; color?: string; size?: number
}) {
  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        left: x, top: y,
        width: `${size}px`, height: `${size}px`,
        marginLeft: `-${size / 2}px`, marginTop: `-${size / 2}px`,
        background: `radial-gradient(circle, ${color}, transparent 70%)`,
        pointerEvents: 'none',
        filter: 'blur(20px)',
      }}
    />
  )
}
