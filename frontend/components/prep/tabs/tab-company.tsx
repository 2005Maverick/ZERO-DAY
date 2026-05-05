'use client'

import type { CompanyDetail, BusinessSegment } from '@/lib/data/scenarios/cov-20/companies'

interface TabCompanyProps {
  company: CompanyDetail
  accent: string
}

/**
 * Company tab — rendered as a faux annual-report / corporate filing document.
 * Cream paper background, serif body, page chrome — looks like reading a real filing.
 */
export function TabCompany({ company, accent }: TabCompanyProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={H2_DARK}>Company Filing — {company.legalName}</h2>
        <span style={{
          fontFamily: 'var(--font-jetbrains), monospace',
          fontSize: '10px',
          color: '#5C5849',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
        }}>
          From the Annual Report · {company.itr.fiscalYear}
        </span>
      </div>

      {/* The "PDF" document */}
      <div style={{
        background: 'linear-gradient(180deg, #F2EAD2 0%, #E8DCB4 100%)',
        backgroundImage: `url("data:image/svg+xml;utf8,${encodeURIComponent(PAPER)}")`,
        color: '#1F1006',
        borderRadius: '8px',
        boxShadow: '0 24px 50px rgba(0,0,0,0.6), inset 0 0 60px rgba(120,80,30,0.18)',
        overflow: 'hidden',
        position: 'relative',
      }}>
        {/* Document header */}
        <div style={{
          padding: '32px 56px 22px',
          borderBottom: '2px solid #8B6418',
          background: 'linear-gradient(180deg, rgba(139,100,24,0.06), transparent)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{
                fontFamily: 'var(--font-fraunces), serif',
                fontWeight: 700,
                fontSize: '11px',
                letterSpacing: '0.32em',
                color: '#8B0000',
                textTransform: 'uppercase',
                marginBottom: '8px',
              }}>
                ✦ Form ITR-6 · Annual Return Excerpt ✦
              </div>
              <div style={{
                fontFamily: 'var(--font-fraunces), serif',
                fontWeight: 700,
                fontSize: '32px',
                letterSpacing: '0.01em',
                color: '#1F1006',
                lineHeight: 1.1,
              }}>
                {company.legalName}
              </div>
              <div style={{
                fontFamily: 'var(--font-fraunces), serif',
                fontStyle: 'italic',
                fontSize: '15px',
                color: '#5A3A1A',
                marginTop: '6px',
              }}>
                Annual Report · {company.itr.fiscalYear}
              </div>
            </div>
            <SealBadge />
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '14px',
            marginTop: '20px',
            paddingTop: '14px',
            borderTop: '1px dotted rgba(80,40,10,0.3)',
          }}>
            <Meta label="CIN"            value={company.itr.cin ?? '—'} mono />
            <Meta label="Incorporated"   value={company.incorporated} />
            <Meta label="Registered HQ"  value={company.headquarters} />
            <Meta label="Listed On"      value={company.exchange} mono />
          </div>
        </div>

        {/* Document body */}
        <div style={{ padding: '28px 56px 36px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <Section title="1. About the Company">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {company.about.map((p, i) => (
                <p key={i} style={BODY_PARA}>
                  {i === 0 && <span style={DROPCAP}>{p.charAt(0)}</span>}
                  {i === 0 ? p.slice(1) : p}
                </p>
              ))}
            </div>
          </Section>

          <Section title="2. Business Segments · Revenue Mix">
            <SegmentsBars segments={company.segments} />
          </Section>

          <Section title="3. Promoters & Founders">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              {company.promoters.map((p, i) => <PersonCard key={i} person={p} />)}
            </div>
          </Section>

          <Section title="4. Key Management Personnel">
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {company.management.map((p, i) => (
                <div key={i} style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 3fr 1fr',
                  alignItems: 'baseline',
                  padding: '8px 0',
                  borderBottom: '1px dotted rgba(80,40,10,0.3)',
                  gap: '12px',
                }}>
                  <span style={{ fontFamily: 'var(--font-fraunces), serif', fontWeight: 600, fontSize: '14px', color: '#1F1006' }}>{p.name}</span>
                  <span style={{ fontFamily: 'var(--font-fraunces), serif', fontStyle: 'italic', fontSize: '13px', color: '#5A3A1A' }}>{p.role}</span>
                  <span style={{ fontFamily: 'var(--font-jetbrains), monospace', fontSize: '11px', color: '#7A4A1A', textAlign: 'right' }}>{p.tenure ?? ''}</span>
                </div>
              ))}
            </div>
          </Section>

          <Section title="5. Workforce Composition">
            <div style={{
              padding: '14px 18px',
              background: 'rgba(139,100,24,0.07)',
              border: '1px solid rgba(139,100,24,0.25)',
              borderRadius: '6px',
            }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '12px' }}>
                <span style={{ fontFamily: 'var(--font-fraunces), serif', fontStyle: 'italic', fontSize: '14px', color: '#5A3A1A' }}>
                  Total employees:
                </span>
                <span style={{ fontFamily: 'var(--font-jetbrains), monospace', fontSize: '24px', fontWeight: 700, color: '#1F1006' }}>
                  {company.workforce.total.toLocaleString('en-IN')}
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                {company.workforce.subgroups.map((s, i) => (
                  <div key={i}>
                    <div style={{ fontFamily: 'var(--font-fraunces), serif', fontSize: '12px', color: '#5A3A1A', fontStyle: 'italic' }}>
                      {s.label}
                    </div>
                    <div style={{ fontFamily: 'var(--font-jetbrains), monospace', fontSize: '14px', fontWeight: 600, color: '#1F1006' }}>
                      {s.count}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Section>

          <Section title="6. Operational Scale">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 32px' }}>
              {company.operations.map((op, i) => (
                <div key={i} style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '8px',
                  padding: '8px 0',
                  borderBottom: '1px dotted rgba(80,40,10,0.3)',
                }}>
                  <span style={{ fontFamily: 'var(--font-fraunces), serif', fontStyle: 'italic', fontSize: '13px', color: '#5A3A1A' }}>{op.label}</span>
                  <span style={{ fontFamily: 'var(--font-jetbrains), monospace', fontSize: '12px', fontWeight: 600, color: '#1F1006', textAlign: 'right' }}>{op.value}</span>
                </div>
              ))}
            </div>
          </Section>

          <Section title="7. Statutory Filing — Income & Position (₹ Crores)">
            <div style={{
              border: '2px solid #8B6418',
              borderRadius: '4px',
              padding: '14px 18px',
              background: 'rgba(255,255,255,0.18)',
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                marginBottom: '10px',
                paddingBottom: '8px',
                borderBottom: '1px solid rgba(80,40,10,0.4)',
              }}>
                <span style={{ fontFamily: 'var(--font-fraunces), serif', fontWeight: 700, fontSize: '14px', color: '#1F1006', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  Filed: {company.itr.filedDate}
                </span>
                <span style={{ fontFamily: 'var(--font-jetbrains), monospace', fontSize: '11px', color: '#7A4A1A', letterSpacing: '0.06em' }}>
                  Source · MCA21 · ITR-6 · Audited
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 32px' }}>
                <FilingRow label="Total Revenue"              value={company.itr.totalRevenueCr} growth={company.itr.yoyRevenueGrowthPct} />
                <FilingRow label="Total Assets"               value={company.itr.totalAssetsCr} />
                <FilingRow label="EBITDA"                     value={company.itr.ebitdaCr} />
                <FilingRow label="Total Liabilities"          value={company.itr.totalLiabilitiesCr} />
                <FilingRow label="Net Profit"                 value={company.itr.netProfitCr} growth={company.itr.yoyProfitGrowthPct} />
                <FilingRow label="Cash & Equivalents"         value={company.itr.cashEquivalentsCr} />
                <FilingRow label="Tax Paid"                   value={company.itr.taxPaidCr} />
                <FilingRow label="Long-Term Debt"             value={company.itr.longTermDebtCr} />
                <FilingRow label="EPS"                        value={company.itr.epsRupees} suffix="₹/share" />
              </div>
            </div>
          </Section>
        </div>

        {/* Footer */}
        <div style={{
          padding: '14px 56px',
          borderTop: '2px solid #8B6418',
          background: 'linear-gradient(180deg, transparent, rgba(139,100,24,0.06))',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontFamily: 'var(--font-fraunces), serif',
          fontSize: '11px',
          fontStyle: 'italic',
          color: '#5A3A1A',
        }}>
          <span>Source: Annual Report · MCA21 · BSE/NSE filings</span>
          <span style={{ fontFamily: 'var(--font-jetbrains), monospace', letterSpacing: '0.12em', color: '#7A4A1A' }}>
            ZDM · DOSSIER · PAGE 1 OF 1
          </span>
        </div>
      </div>

      {/* Industry note (outside the document, dark theme) */}
      <div style={{
        padding: '14px 18px',
        background: 'rgba(255,255,255,0.02)',
        border: `1px solid ${accent}40`,
        borderLeft: `3px solid ${accent}`,
        borderRadius: '6px',
      }}>
        <div style={{
          fontFamily: 'var(--font-inter), sans-serif',
          fontSize: '10px',
          fontWeight: 700,
          color: accent,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          marginBottom: '6px',
        }}>
          ✦ Industry context
        </div>
        <div style={{
          fontFamily: 'var(--font-fraunces), serif',
          fontStyle: 'italic',
          fontSize: '14px',
          color: '#D9CFB8',
          lineHeight: 1.55,
        }}>
          {company.industryNote}
        </div>
      </div>
    </div>
  )
}

// ─── parts ─────────────────────────────────────────────────

const H2_DARK: React.CSSProperties = {
  fontFamily: 'var(--font-fraunces), serif',
  fontWeight: 600,
  fontSize: '20px',
  color: '#F4EDE0',
  margin: 0,
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{
        fontFamily: 'var(--font-fraunces), serif',
        fontWeight: 700,
        fontSize: '15px',
        color: '#1F1006',
        letterSpacing: '0.04em',
        marginBottom: '10px',
        paddingBottom: '6px',
        borderBottom: '1px solid rgba(80,40,10,0.3)',
      }}>
        {title}
      </div>
      {children}
    </div>
  )
}

function Meta({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div style={{
        fontFamily: 'var(--font-inter), sans-serif',
        fontSize: '9px',
        fontWeight: 700,
        color: '#7A4A1A',
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        marginBottom: '3px',
      }}>
        {label}
      </div>
      <div style={{
        fontFamily: mono ? 'var(--font-jetbrains), monospace' : 'var(--font-fraunces), serif',
        fontSize: '12px',
        color: '#1F1006',
        fontWeight: 600,
      }}>
        {value}
      </div>
    </div>
  )
}

const BODY_PARA: React.CSSProperties = {
  fontFamily: 'var(--font-fraunces), serif',
  fontSize: '14px',
  color: '#1F1006',
  lineHeight: 1.65,
  margin: 0,
  textAlign: 'justify',
}

const DROPCAP: React.CSSProperties = {
  fontFamily: 'var(--font-fraunces), serif',
  fontWeight: 700,
  fontSize: '38px',
  color: '#8B0000',
  float: 'left',
  lineHeight: 0.9,
  marginRight: '6px',
  marginTop: '4px',
}

function SegmentsBars({ segments }: { segments: BusinessSegment[] }) {
  const colors = ['#8B0000', '#5A3A1A', '#7A4A1A', '#A08040', '#C0995A']
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {/* total bar */}
      <div style={{
        display: 'flex',
        height: '24px',
        borderRadius: '4px',
        overflow: 'hidden',
        border: '1px solid rgba(80,40,10,0.3)',
      }}>
        {segments.map((s, i) => (
          <div key={i} style={{
            width: `${s.revenuePct}%`,
            background: colors[i % colors.length],
          }} />
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        {segments.map((s, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '14px 1fr 1fr 60px', gap: '8px', alignItems: 'baseline' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '2px', background: colors[i % colors.length] }} />
            <span style={{ fontFamily: 'var(--font-fraunces), serif', fontWeight: 600, fontSize: '13px', color: '#1F1006' }}>{s.name}</span>
            <span style={{ fontFamily: 'var(--font-fraunces), serif', fontStyle: 'italic', fontSize: '12px', color: '#5A3A1A' }}>
              {s.description ?? ''}
            </span>
            <span style={{ fontFamily: 'var(--font-jetbrains), monospace', fontSize: '13px', fontWeight: 700, color: '#8B0000', textAlign: 'right' }}>
              {s.revenuePct.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function PersonCard({ person }: { person: { name: string; role: string; tenure?: string } }) {
  const initials = person.name.split(/\s+/).slice(0, 2).map(n => n.charAt(0)).join('')
  return (
    <div style={{
      padding: '12px 14px',
      background: 'rgba(139,100,24,0.07)',
      border: '1px solid rgba(139,100,24,0.25)',
      borderRadius: '6px',
      display: 'flex',
      gap: '12px',
      alignItems: 'center',
    }}>
      <div style={{
        width: '40px', height: '40px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #8B6418, #5A3A1A)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#F2EAD2',
        fontFamily: 'var(--font-fraunces), serif',
        fontWeight: 700,
        fontSize: '14px',
        letterSpacing: '0.04em',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18)',
        flexShrink: 0,
      }}>
        {initials}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'var(--font-fraunces), serif', fontWeight: 700, fontSize: '14px', color: '#1F1006' }}>
          {person.name}
        </div>
        <div style={{ fontFamily: 'var(--font-fraunces), serif', fontStyle: 'italic', fontSize: '12px', color: '#5A3A1A', marginTop: '2px' }}>
          {person.role}
        </div>
        {person.tenure && (
          <div style={{ fontFamily: 'var(--font-jetbrains), monospace', fontSize: '10px', color: '#7A4A1A', marginTop: '3px', letterSpacing: '0.06em' }}>
            {person.tenure}
          </div>
        )}
      </div>
    </div>
  )
}

function FilingRow({ label, value, growth, suffix }: { label: string; value: number; growth?: number; suffix?: string }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr auto auto',
      gap: '8px',
      padding: '8px 0',
      borderBottom: '1px dotted rgba(80,40,10,0.3)',
      alignItems: 'baseline',
    }}>
      <span style={{ fontFamily: 'var(--font-fraunces), serif', fontStyle: 'italic', fontSize: '13px', color: '#5A3A1A' }}>
        {label}
      </span>
      <span style={{ fontFamily: 'var(--font-jetbrains), monospace', fontSize: '14px', fontWeight: 700, color: '#1F1006' }}>
        {suffix ? `₹${value.toFixed(2)}` : `₹${value.toLocaleString('en-IN')}`}
      </span>
      {growth !== undefined ? (
        <span style={{
          fontFamily: 'var(--font-jetbrains), monospace',
          fontSize: '11px',
          fontWeight: 700,
          color: growth >= 0 ? '#1F5E36' : '#8B0000',
          minWidth: '90px',
          textAlign: 'right',
        }}>
          {growth >= 0 ? '+' : ''}{growth.toFixed(1)}% YoY
        </span>
      ) : (
        <span style={{ minWidth: '90px', textAlign: 'right', fontFamily: 'var(--font-jetbrains), monospace', fontSize: '10px', color: '#7A4A1A' }}>
          {suffix ?? ''}
        </span>
      )}
    </div>
  )
}

function SealBadge() {
  return (
    <div style={{
      width: '76px', height: '76px',
      borderRadius: '50%',
      background: 'radial-gradient(circle at 30% 30%, #D2382F, #8B0000 60%, #4A0606)',
      border: '2px solid #C9A45F',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column',
      color: '#F2EAD2',
      fontFamily: 'var(--font-fraunces), serif',
      fontWeight: 700,
      transform: 'rotate(-8deg)',
      boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
      flexShrink: 0,
    }}>
      <span style={{ fontSize: '14px', letterSpacing: '0.18em' }}>Z·D·M</span>
      <span style={{ fontSize: '7px', letterSpacing: '0.16em', marginTop: '2px', opacity: 0.85 }}>VERIFIED</span>
    </div>
  )
}

const PAPER = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160">
  <filter id="g"><feTurbulence baseFrequency="0.7" numOctaves="2" seed="5"/><feColorMatrix values="0 0 0 0 0.4  0 0 0 0 0.3  0 0 0 0 0.15  0 0 0 0.10 0"/></filter>
  <rect width="100%" height="100%" filter="url(#g)"/>
</svg>`
