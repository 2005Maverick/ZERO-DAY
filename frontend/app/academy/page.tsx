'use client'

import Link from 'next/link'
import { ArrowRight, BookOpen, Zap, Play } from 'lucide-react'
import { PLAYLISTS } from '@/lib/academy/playlists'
import { GrainOverlay, DitherOverlay, Vignette, Particles, AmbientGlow } from '@/components/academy/atmosphere'
import { GlobalNav } from '@/components/layout/global-nav'

export default function AcademyIndexPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#000',
      color: '#E0E0E0',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Atmosphere */}
      <Vignette accent="212,160,77"/>
      <Particles count={42} color="rgba(212,160,77,0.30)" speed={6}/>
      <DitherOverlay opacity={0.05}/>
      <GrainOverlay opacity={0.07}/>

      <GlobalNav accent="D4A04D"/>

      {/* Hero */}
      <section style={{
        position: 'relative',
        padding: '80px 32px 60px',
        textAlign: 'center',
        zIndex: 5,
      }}>
        <AmbientGlow x="50%" y="30%" color="rgba(212,160,77,0.22)" size={680}/>

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          padding: '5px 14px',
          background: 'rgba(212,160,77,0.10)',
          border: '1px solid rgba(212,160,77,0.40)',
          borderRadius: '4px',
          fontFamily: 'var(--font-inter), sans-serif',
          fontSize: '9px', fontWeight: 800, color: '#D4A04D',
          letterSpacing: '0.32em', textTransform: 'uppercase',
          marginBottom: '24px',
          position: 'relative',
        }}>
          <BookOpen size={10}/> 10 Curated Playlists · Mini-Game Each
        </div>

        <h1 style={{
          fontFamily: 'var(--font-fraunces), serif',
          fontSize: 'clamp(48px, 7vw, 84px)',
          fontWeight: 700,
          color: '#F5F5F5',
          lineHeight: 0.95,
          letterSpacing: '-0.03em',
          margin: '0 auto 18px',
          maxWidth: '900px',
          position: 'relative',
        }}>
          Learn the moves<br/>
          <span style={{
            fontStyle: 'italic',
            background: 'linear-gradient(135deg, #D4A04D 0%, #FF1F1F 80%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>before you make them.</span>
        </h1>

        <p style={{
          fontFamily: 'var(--font-fraunces), serif',
          fontStyle: 'italic',
          fontSize: '17px',
          color: '#909090',
          lineHeight: 1.65,
          maxWidth: '620px',
          margin: '0 auto',
          position: 'relative',
        }}>
          Watch curated YouTube playlists on every dimension of trading — and play
          a hand-built mini-game for each one. Read, then prove you got it.
        </p>
      </section>

      {/* Playlist grid */}
      <section style={{
        position: 'relative',
        padding: '20px 32px 80px',
        maxWidth: '1240px',
        margin: '0 auto',
        zIndex: 5,
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
          gap: '20px',
        }}>
          {PLAYLISTS.map((p, i) => (
            <PlaylistCard key={p.slug} index={i + 1} playlist={p}/>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        position: 'relative', zIndex: 5,
        padding: '40px 32px 60px',
        textAlign: 'center',
        borderTop: '1px solid rgba(212,160,77,0.12)',
      }}>
        <div style={{
          fontFamily: 'var(--font-fraunces), serif',
          fontStyle: 'italic',
          fontSize: '13px', color: '#404040', lineHeight: 1.6,
        }}>
          The market is the lesson. The journal is the homework.
        </div>
      </footer>
    </div>
  )
}

// ── Playlist card ─────────────────────────────────────────────

function PlaylistCard({ playlist, index }: { playlist: typeof PLAYLISTS[number]; index: number }) {
  const accent = playlist.accentColor
  return (
    <Link href={`/academy/${playlist.slug}`} style={{ textDecoration: 'none' }}>
      <div
        className="academy-card"
        style={{
          position: 'relative',
          padding: '22px 24px 20px',
          background: 'linear-gradient(160deg, rgba(13,13,13,0.85) 0%, rgba(6,6,6,0.92) 100%)',
          border: `1px solid rgba(${rgb(accent)}, 0.20)`,
          borderRadius: '12px',
          overflow: 'hidden',
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          cursor: 'pointer',
          minHeight: '260px',
          display: 'flex', flexDirection: 'column',
        }}
      >
        {/* Index marker */}
        <div style={{
          position: 'absolute', top: '20px', right: '24px',
          fontFamily: 'var(--font-jetbrains), monospace',
          fontSize: '11px', color: `#${accent}66`,
          letterSpacing: '0.1em', fontWeight: 700,
        }}>{String(index).padStart(2, '0')} / 10</div>

        {/* Difficulty pill */}
        <div style={{
          display: 'inline-block',
          padding: '3px 8px',
          background: `rgba(${rgb(accent)}, 0.10)`,
          border: `1px solid rgba(${rgb(accent)}, 0.30)`,
          borderRadius: '3px',
          fontFamily: 'var(--font-inter), sans-serif',
          fontSize: '8.5px', fontWeight: 800, color: `#${accent}`,
          letterSpacing: '0.24em', textTransform: 'uppercase',
          alignSelf: 'flex-start',
          marginBottom: '14px',
        }}>{playlist.difficulty}</div>

        {/* Title */}
        <div style={{
          fontFamily: 'var(--font-fraunces), serif',
          fontSize: '24px', fontWeight: 700,
          color: '#F0F0F0', lineHeight: 1.15,
          letterSpacing: '-0.01em',
          marginBottom: '8px',
        }}>{playlist.title}</div>

        {/* Description */}
        <p style={{
          fontFamily: 'var(--font-fraunces), serif',
          fontStyle: 'italic',
          fontSize: '12.5px', color: '#808080', lineHeight: 1.5,
          margin: '0 0 14px',
          flex: 1,
        }}>{playlist.description}</p>

        {/* Topics */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '14px' }}>
          {playlist.topics.slice(0, 4).map(t => (
            <span key={t} style={{
              padding: '3px 7px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '3px',
              fontFamily: 'var(--font-jetbrains), monospace',
              fontSize: '9px', color: '#707070',
            }}>{t}</span>
          ))}
        </div>

        {/* Footer row */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          paddingTop: '12px',
          borderTop: `1px solid rgba(${rgb(accent)}, 0.15)`,
        }}>
          <div>
            <div style={{
              fontFamily: 'var(--font-inter), sans-serif',
              fontSize: '8.5px', fontWeight: 800, color: '#606060',
              letterSpacing: '0.22em', textTransform: 'uppercase',
              marginBottom: '2px',
            }}><Play size={9} style={{ display: 'inline', marginRight: '4px' }}/>{playlist.videoCount} Videos</div>
            <div style={{
              fontFamily: 'var(--font-inter), sans-serif',
              fontSize: '11px', fontWeight: 700, color: `#${accent}`,
              letterSpacing: '0.04em',
            }}><Zap size={10} style={{ display: 'inline', marginRight: '4px' }}/>{playlist.gameTitle}</div>
          </div>

          <div style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            color: `#${accent}`,
            fontFamily: 'var(--font-inter), sans-serif',
            fontSize: '10px', fontWeight: 700,
            letterSpacing: '0.16em', textTransform: 'uppercase',
          }}>Open <ArrowRight size={11}/></div>
        </div>

        {/* Hover effect — corner glow */}
        <style>{`
          .academy-card:hover {
            border-color: #${accent}88 !important;
            box-shadow: 0 16px 50px rgba(0,0,0,0.6), 0 0 60px rgba(${rgb(accent)}, 0.18) !important;
            transform: translateY(-3px);
          }
        `}</style>
      </div>
    </Link>
  )
}

// Helpers
function rgb(hex: string): string {
  const r = parseInt(hex.slice(0, 2), 16)
  const g = parseInt(hex.slice(2, 4), 16)
  const b = parseInt(hex.slice(4, 6), 16)
  return `${r},${g},${b}`
}
