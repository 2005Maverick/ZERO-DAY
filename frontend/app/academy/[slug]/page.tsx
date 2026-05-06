'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowUpRight, Play, Zap, BookOpen, Activity } from 'lucide-react'
import { getPlaylist } from '@/lib/academy/playlists'
import { getGame } from '@/lib/academy/games'
import { GrainOverlay, DitherOverlay, Vignette, AmbientGlow } from '@/components/academy/atmosphere'
import { MiniGameEngine } from '@/components/academy/mini-game-engine'
import { GlobalNav } from '@/components/layout/global-nav'
import { useTracer } from '@/lib/behavior/tracer'

export default function PlaylistDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const router = useRouter()
  const { track } = useTracer()
  const playlist = getPlaylist(slug)
  const game = getGame(slug)
  const [showGame, setShowGame] = useState(false)

  useEffect(() => {
    if (playlist) {
      track('academy_playlist_opened', 0, {
        slug, title: playlist.title, ytPlaylistId: playlist.ytPlaylistId, difficulty: playlist.difficulty,
      })
    }
  }, [slug, playlist, track])

  if (!playlist) {
    return <NotFound onBack={() => router.push('/academy')}/>
  }

  const accent = playlist.accentColor

  return (
    <div style={{
      minHeight: '100vh',
      background: '#000',
      color: '#E0E0E0',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <Vignette accent={rgb(accent)}/>
      <DitherOverlay opacity={0.05}/>
      <GrainOverlay opacity={0.06}/>

      <GlobalNav accent={accent}/>

      {/* Hero band */}
      <section style={{
        position: 'relative',
        padding: '44px 32px 36px',
        zIndex: 5,
        maxWidth: '1240px', margin: '0 auto',
      }}>
        <AmbientGlow x="20%" y="50%" color={`rgba(${rgb(accent)}, 0.18)`} size={520}/>

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          padding: '4px 10px',
          background: `rgba(${rgb(accent)}, 0.10)`,
          border: `1px solid rgba(${rgb(accent)}, 0.40)`,
          borderRadius: '4px',
          fontFamily: 'var(--font-inter), sans-serif',
          fontSize: '9px', fontWeight: 800, color: `#${accent}`,
          letterSpacing: '0.28em', textTransform: 'uppercase',
          marginBottom: '16px',
          position: 'relative',
        }}>
          <BookOpen size={10}/> {playlist.difficulty} · {playlist.videoCount} Videos
        </div>

        <h1 style={{
          fontFamily: 'var(--font-fraunces), serif',
          fontSize: 'clamp(40px, 6vw, 64px)',
          fontWeight: 700,
          color: '#F5F5F5',
          lineHeight: 1.0,
          letterSpacing: '-0.02em',
          margin: '0 0 14px',
          maxWidth: '880px',
          position: 'relative',
        }}>{playlist.title}</h1>

        <p style={{
          fontFamily: 'var(--font-fraunces), serif',
          fontStyle: 'italic',
          fontSize: '15px', color: '#909090',
          lineHeight: 1.6, margin: 0,
          maxWidth: '720px',
          position: 'relative',
        }}>{playlist.description}</p>

        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: '5px',
          marginTop: '18px', position: 'relative',
        }}>
          {playlist.topics.map(t => (
            <span key={t} style={{
              padding: '4px 9px',
              background: 'rgba(255,255,255,0.03)',
              border: `1px solid rgba(${rgb(accent)}, 0.20)`,
              borderRadius: '3px',
              fontFamily: 'var(--font-jetbrains), monospace',
              fontSize: '10px', color: '#909090',
            }}>{t}</span>
          ))}
        </div>
      </section>

      {/* Main split — player on left, game on right */}
      <section style={{
        position: 'relative', zIndex: 5,
        padding: '0 32px 80px',
        maxWidth: '1240px', margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)',
        gap: '24px',
      }}>
        {/* LEFT — Player */}
        <div>
          <SectionLabel icon={<Play size={11}/>} label="Watch the Playlist" accent={accent}/>
          <div style={{
            position: 'relative',
            paddingBottom: '56.25%',
            height: 0,
            background: '#000',
            border: `1px solid rgba(${rgb(accent)}, 0.30)`,
            borderRadius: '10px',
            overflow: 'hidden',
            boxShadow: `0 12px 40px rgba(0,0,0,0.6), 0 0 60px rgba(${rgb(accent)}, 0.10)`,
          }}>
            <iframe
              src={`https://www.youtube.com/embed/videoseries?list=${playlist.ytPlaylistId}&color=white`}
              title={`${playlist.title} playlist`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{
                position: 'absolute', top: 0, left: 0,
                width: '100%', height: '100%',
                border: 'none',
              }}
            />
          </div>
          <a
            href={`https://www.youtube.com/playlist?list=${playlist.ytPlaylistId}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '5px',
              marginTop: '10px',
              padding: '6px 10px',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.10)',
              borderRadius: '4px',
              color: '#808080',
              fontFamily: 'var(--font-inter), sans-serif',
              fontSize: '10px', fontWeight: 700,
              letterSpacing: '0.12em', textTransform: 'uppercase',
              textDecoration: 'none',
            }}
          >
            Open on YouTube <ArrowUpRight size={10}/>
          </a>
        </div>

        {/* RIGHT — Game launcher / live game */}
        <div>
          <SectionLabel icon={<Zap size={11}/>} label="Mini-Game" accent={accent}/>
          {!showGame && game && (
            <div style={{
              padding: '32px 28px',
              background: `linear-gradient(160deg, rgba(${rgb(accent)},0.08) 0%, rgba(0,0,0,0.85) 60%)`,
              border: `1px solid rgba(${rgb(accent)}, 0.40)`,
              borderRadius: '12px',
              textAlign: 'center',
              boxShadow: `0 12px 40px rgba(0,0,0,0.5), 0 0 60px rgba(${rgb(accent)}, 0.12)`,
            }}>
              <div style={{
                fontFamily: 'var(--font-anton), sans-serif',
                fontSize: '14px',
                color: `#${accent}`,
                letterSpacing: '0.36em', fontWeight: 700,
                marginBottom: '14px',
              }}>[ MINI-GAME ]</div>

              <div style={{
                fontFamily: 'var(--font-fraunces), serif',
                fontSize: '36px', fontWeight: 700,
                color: '#F0F0F0', lineHeight: 1.05,
                letterSpacing: '-0.02em',
                marginBottom: '12px',
              }}>{playlist.gameTitle}</div>

              <p style={{
                fontFamily: 'var(--font-fraunces), serif',
                fontStyle: 'italic',
                fontSize: '13px', color: '#A0A0A0',
                lineHeight: 1.6, margin: '0 0 20px',
              }}>{playlist.gameTagline}</p>

              <div style={{
                display: 'flex', justifyContent: 'center', gap: '14px',
                fontFamily: 'var(--font-inter), sans-serif',
                fontSize: '9px', fontWeight: 700, color: '#606060',
                letterSpacing: '0.18em', textTransform: 'uppercase',
                marginBottom: '24px',
              }}>
                <span>{game.rounds.length} Rounds</span>
                <span style={{ color: '#202020' }}>·</span>
                <span>Pass {(game.passThreshold * 100).toFixed(0)}%</span>
              </div>

              <button onClick={() => setShowGame(true)} style={{
                padding: '14px 30px',
                background: `linear-gradient(135deg, #${accent}, ${darken(accent)})`,
                border: 'none', borderRadius: '8px',
                color: '#000',
                fontFamily: 'var(--font-inter), sans-serif',
                fontSize: '12px', fontWeight: 800,
                letterSpacing: '0.20em', textTransform: 'uppercase',
                cursor: 'pointer',
                boxShadow: `0 8px 24px rgba(${rgb(accent)}, 0.50)`,
              }}>Play Now →</button>
            </div>
          )}

          {showGame && game && (
            <div>
              <MiniGameEngine game={game}/>
              <button onClick={() => setShowGame(false)} style={{
                marginTop: '14px',
                padding: '7px 12px',
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.10)',
                borderRadius: '5px',
                color: '#606060',
                fontFamily: 'var(--font-inter), sans-serif',
                fontSize: '10px', fontWeight: 700,
                letterSpacing: '0.16em', textTransform: 'uppercase',
                cursor: 'pointer',
              }}>← Back to Intro</button>
            </div>
          )}

          {!game && (
            <div style={{
              padding: '40px 24px',
              background: 'rgba(255,255,255,0.02)',
              border: '1px dashed rgba(255,255,255,0.12)',
              borderRadius: '8px',
              textAlign: 'center',
              fontFamily: 'var(--font-fraunces), serif',
              fontStyle: 'italic',
              fontSize: '13px', color: '#606060',
            }}>Mini-game for this playlist is coming soon.</div>
          )}
        </div>
      </section>

      {/* Cross-flow CTA: ready to trade */}
      <section style={{
        position: 'relative', zIndex: 5,
        padding: '20px 32px 80px',
        maxWidth: '1240px', margin: '0 auto',
      }}>
        <div style={{
          padding: '32px 36px',
          background: `linear-gradient(135deg, rgba(${rgb(accent)},0.06) 0%, rgba(0,0,0,0.85) 70%)`,
          border: `1px solid rgba(${rgb(accent)}, 0.30)`,
          borderRadius: '12px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: '24px',
          flexWrap: 'wrap',
        }}>
          <div>
            <div style={{
              fontFamily: 'var(--font-inter), sans-serif',
              fontSize: '9px', fontWeight: 800, color: `#${accent}`,
              letterSpacing: '0.28em', textTransform: 'uppercase',
              marginBottom: '6px',
            }}>Apply It · Live</div>
            <div style={{
              fontFamily: 'var(--font-fraunces), serif',
              fontSize: '24px', fontWeight: 700, color: '#F0F0F0',
              lineHeight: 1.2, marginBottom: '4px',
            }}>Felt good? Try the COV-20 simulation.</div>
            <p style={{
              fontFamily: 'var(--font-fraunces), serif',
              fontStyle: 'italic',
              fontSize: '13px', color: '#909090',
              margin: 0, maxWidth: '520px', lineHeight: 1.55,
            }}>The fastest way to consolidate is to apply this knowledge in a real-time
            simulated session. March 9, 2020 — Black Monday — is waiting.</p>
          </div>
          <button onClick={() => router.push('/sim/COV-20/live')} style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '14px 28px',
            background: `linear-gradient(135deg, #${accent}, ${darken(accent)})`,
            border: 'none', borderRadius: '8px', color: '#000',
            fontFamily: 'var(--font-inter), sans-serif',
            fontSize: '12px', fontWeight: 800,
            letterSpacing: '0.20em', textTransform: 'uppercase',
            cursor: 'pointer',
            boxShadow: `0 8px 24px rgba(${rgb(accent)}, 0.40)`,
            whiteSpace: 'nowrap',
          }}><Activity size={13}/> Trade Live →</button>
        </div>
      </section>

      <style>{`
        @media (max-width: 980px) {
          section[style*="grid-template-columns"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}

// ── Section label ─────────────────────────────────────────────

function SectionLabel({ icon, label, accent }: { icon: React.ReactNode; label: string; accent: string }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '8px',
      marginBottom: '12px',
    }}>
      <span style={{ color: `#${accent}` }}>{icon}</span>
      <span style={{
        fontFamily: 'var(--font-inter), sans-serif',
        fontSize: '10px', fontWeight: 800, color: `#${accent}`,
        letterSpacing: '0.26em', textTransform: 'uppercase',
      }}>{label}</span>
      <div style={{ flex: 1, height: '1px', background: `linear-gradient(90deg, rgba(${rgb(accent)}, 0.30), transparent)` }}/>
    </div>
  )
}

function NotFound({ onBack }: { onBack: () => void }) {
  return (
    <div style={{
      minHeight: '100vh', background: '#000',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={{ fontFamily: 'var(--font-fraunces), serif', fontSize: '24px', color: '#E0E0E0', marginBottom: '12px' }}>
        Playlist not found
      </div>
      <button onClick={onBack} style={{
        padding: '10px 20px',
        background: 'rgba(212,160,77,0.10)',
        border: '1px solid rgba(212,160,77,0.40)',
        borderRadius: '6px', color: '#D4A04D',
        fontFamily: 'var(--font-inter), sans-serif',
        fontSize: '11px', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase',
        cursor: 'pointer',
      }}>Back to Academy</button>
    </div>
  )
}

// Helpers
function rgb(hex: string): string {
  const r = parseInt(hex.slice(0, 2), 16)
  const g = parseInt(hex.slice(2, 4), 16)
  const b = parseInt(hex.slice(4, 6), 16)
  return `${r},${g},${b}`
}

function darken(hex: string): string {
  const r = Math.max(0, parseInt(hex.slice(0, 2), 16) - 60)
  const g = Math.max(0, parseInt(hex.slice(2, 4), 16) - 60)
  const b = Math.max(0, parseInt(hex.slice(4, 6), 16) - 60)
  return `rgb(${r},${g},${b})`
}
