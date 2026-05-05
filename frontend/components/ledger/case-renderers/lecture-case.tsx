'use client'

import type { LectureCase } from '@/types/ledger'
import { WaxSealButton } from '../wax-seal-button'

interface Props {
  ledgerCase: LectureCase
  onComplete?: () => void
}

export function LectureCaseRenderer({ ledgerCase, onComplete }: Props) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '1fr 1fr',
      width: '100%', height: '100%',
    }}>
      {/* LEFT — video + study notes */}
      <div style={{
        position: 'relative',
        padding: '36px 32px 28px',
        borderRight: '1px solid rgba(60, 30, 15, 0.18)',
      }}>
        <div style={{
          fontFamily: '"Big Caslon", Caslon, Garamond, serif',
          fontStyle: 'italic',
          fontSize: '22px',
          color: '#1a1a1a',
          marginBottom: '18px',
        }}>
          LESSON № {ledgerCase.number.toString().padStart(3, '0')}
        </div>

        {/* Video placeholder */}
        <div style={{
          aspectRatio: '16 / 9',
          background: '#1a1a1a',
          border: '1px solid rgba(60, 30, 15, 0.4)',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#E8DFC8',
          fontFamily: 'var(--font-geist-sans), sans-serif',
          fontSize: '11px',
          letterSpacing: '0.22em',
          fontWeight: 600,
          textTransform: 'uppercase',
          position: 'relative',
        }}>
          {ledgerCase.videoId ? (
            <iframe
              src={`https://www.youtube.com/embed/${ledgerCase.videoId}`}
              style={{ width: '100%', height: '100%', border: 'none' }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <span style={{ color: '#A89880' }}>▶  Video forthcoming</span>
          )}
        </div>

        <div style={{
          fontFamily: 'Garamond, serif',
          fontStyle: 'italic',
          fontSize: '12px',
          color: '#3a2818',
          lineHeight: 1.5,
          letterSpacing: '0.01em',
        }}>
          Study notes will appear here once the lecture content is published. Watch the video, then mark this lesson complete to unlock the next chapter.
        </div>
      </div>

      {/* RIGHT — summary + CTA */}
      <div style={{ padding: '36px 32px 28px' }}>
        <div style={{
          fontFamily: 'var(--font-geist-sans), sans-serif',
          fontSize: '10px',
          letterSpacing: '0.28em',
          color: '#8B0000',
          fontWeight: 700,
          textTransform: 'uppercase',
          marginBottom: '12px',
        }}>
          What You Will Learn
        </div>

        <h2 style={{
          fontFamily: 'var(--font-anton), sans-serif',
          fontSize: 'clamp(28px, 3vw, 40px)',
          color: '#1a1a1a',
          letterSpacing: '0.02em',
          lineHeight: 1,
          margin: '0 0 18px',
          textTransform: 'uppercase',
        }}>
          {ledgerCase.title}
        </h2>

        <div style={{ marginBottom: '24px' }}>
          {ledgerCase.takeaways.map((t, i) => (
            <div key={i} style={{
              display: 'flex', gap: '10px', marginBottom: '10px',
              fontFamily: 'Garamond, serif',
              fontSize: '13px',
              color: '#3a2818',
              lineHeight: 1.5,
            }}>
              <span style={{ color: '#8B0000', fontWeight: 700 }}>{i + 1}.</span>
              <span>{t}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
          <WaxSealButton label="Mark Complete →" onClick={onComplete} />
        </div>
      </div>
    </div>
  )
}
