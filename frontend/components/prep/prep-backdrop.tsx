'use client'

/**
 * Backdrop — performance-first.
 * Just two layered fixed gradients + a tiny CSS-only noise. No canvas, no particles, no perspective.
 */
export function PrepBackdrop() {
  return (
    <>
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        background:
          'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(139,37,69,0.10), transparent 55%),' +
          'radial-gradient(ellipse 50% 40% at 100% 100%, rgba(212,160,77,0.06), transparent 60%),' +
          'radial-gradient(ellipse 50% 40% at 0% 100%, rgba(90,176,136,0.04), transparent 60%),' +
          'linear-gradient(180deg, #0E141B 0%, #0A0E14 100%)',
      }} />
      {/* Static dot grid for depth — no animation, no noise canvas */}
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        backgroundImage: 'radial-gradient(rgba(212,160,77,0.06) 1px, transparent 1px)',
        backgroundSize: '28px 28px',
        maskImage: 'radial-gradient(ellipse 70% 70% at 50% 40%, #000 30%, transparent 100%)',
        WebkitMaskImage: 'radial-gradient(ellipse 70% 70% at 50% 40%, #000 30%, transparent 100%)',
      }} />
      {/* Vignette */}
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1,
        pointerEvents: 'none',
        boxShadow: 'inset 0 0 220px rgba(0,0,0,0.7)',
      }} />
    </>
  )
}
