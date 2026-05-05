'use client'

import { TutorialShell } from './fundamentals-tutorial'

interface Props { open: boolean; onClose: () => void }

const STEPS = [
  {
    id: 1, eyebrow: 'Foundation · 01 of 09',
    title: 'Why Sector Context Matters',
    targetId: null, dialogPos: 'center' as const,
    body: 'Half of every stock\'s daily move comes from its SECTOR — not from anything specific to the company. If banks rally 3%, almost every bank rallies. Reading sector context is how you separate stock-specific moves from sector noise.',
    bullets: [
      'A great stock in a falling sector usually still falls (correlation = 1 in panic)',
      'A weak stock in a rallying sector often rallies anyway',
      'Sector rotation drives 40-60% of equity returns each year',
      'Sector-relative performance ≠ absolute performance',
    ],
    pairsWith: 'Always check sector context BEFORE making a stock-specific judgement.',
  },
  {
    id: 2, eyebrow: 'Industry · 02 of 09',
    title: 'Industry Snapshot — The Big Picture',
    targetId: 'industry', dialogPos: 'below' as const,
    body: 'A 2-3 sentence summary of where the sector stands right now — what\'s driving it, what\'s threatening it, where it sits in its cycle.',
    bullets: [
      'Read this FIRST — it frames everything else',
      'Look for: catalyst, threat, competitive structure, growth phase',
      'Mature industries (utilities, telecom)  →  rerate slowly',
      'Cyclical industries (auto, oil, real estate)  →  swing violently',
    ],
  },
  {
    id: 3, eyebrow: 'Peers · 03 of 09',
    title: 'Peer Comparison — Where Does It Rank?',
    targetId: 'peers', dialogPos: 'right' as const,
    body: 'A side-by-side of the company\'s closest competitors on the same metrics — market cap, P/E, year-to-date return. Tells you whether the stock is leading or lagging the pack.',
    bullets: [
      'Lowest P/E in the group  →  cheapest valuation (or worst quality?)',
      'Highest YTD return  →  market loves it (or already priced in?)',
      'Largest M-Cap  →  liquid, institutional-grade',
      'Compare ABSOLUTE valuations, not just % change',
    ],
    pairsWith: 'A bullish industry note + cheapest peer P/E = the highest-conviction setup in the sector.',
  },
  {
    id: 4, eyebrow: 'Sensitivity · 04 of 09',
    title: 'Factor Sensitivities — What Hurts, What Helps',
    targetId: 'sens', dialogPos: 'right' as const,
    body: 'A list of macro factors (oil, currency, rates, commodities, regulation) and how the stock typically reacts. The +++ / --- chips tell you the direction and magnitude.',
    bullets: [
      '+++ HIGH POSITIVE  →  this factor is a huge tailwind',
      '++ POSITIVE        →  noticeable benefit',
      '~  NEUTRAL         →  little effect',
      '-- NEGATIVE        →  noticeable headwind',
      '--- HIGH NEGATIVE  →  serious damage when this factor moves wrong',
    ],
    pairsWith: 'Read sensitivities + macro intel side-by-side. If the macro tape says "oil down" and your sensitivity is "+++ to oil," that\'s a problem.',
  },
  {
    id: 5, eyebrow: 'Correlation · 05 of 09',
    title: 'Correlations — Statistical Co-Movement',
    targetId: 'corr', dialogPos: 'left' as const,
    body: 'A correlation coefficient (ρ) between -1 and +1 measuring how reliably two assets move together over time. β (beta) is similar but measures magnitude relative to a benchmark.',
    bullets: [
      'ρ = +1.0  →  perfect lockstep with the reference asset',
      'ρ = 0    →  no relationship',
      'ρ = -1.0 →  perfect inverse',
      'β = 1.5 vs Nifty  →  moves 50% MORE than the index, both ways',
      'β = 0.6  →  moves 40% LESS than the index (defensive)',
    ],
    pairsWith: 'For hedging: pair a long position with something that has ρ near -0.5 to -1.0 against it.',
  },
  {
    id: 6, eyebrow: 'Breadth · 06 of 09',
    title: 'Sector Breadth — Healthy or Narrow?',
    targetId: 'breadth', dialogPos: 'left' as const,
    body: '"Breadth" measures how many stocks in the sector are participating in the move. A rally driven by 1-2 names is fragile; a rally with 80% of names rising is durable.',
    bullets: [
      'Breadth > 70%  →  strong, broad participation',
      'Breadth 30-70% →  rotational, look at WHICH names',
      'Breadth < 30%  →  narrow, fragile, often precedes pullback',
      'Falling breadth + rising index  →  classic bull-trap setup',
    ],
    pairsWith: 'Breadth is the truest "is this rally real?" test — even more reliable than volume.',
  },
  {
    id: 7, eyebrow: 'Flows · 07 of 09',
    title: 'Capital Flows — Money In, Money Out',
    targetId: 'flows', dialogPos: 'right' as const,
    body: 'FII (Foreign Institutional Investor) and DII (Domestic Institutional Investor) flows — the net amount of money entering or leaving the sector this week / month.',
    bullets: [
      'FII outflows + DII inflows  →  domestic money supporting the dip',
      'FII outflows + DII outflows  →  no buyer of last resort, danger',
      'FII inflows + DII inflows  →  best possible setup, broad accumulation',
      'Persistent FII selling >5 days  →  global risk-off in progress',
    ],
    pairsWith: 'Cross-check with the Macro Intel rail — if VIX spiking + FIIs selling = "risk-off" mode, defensive sectors win.',
  },
  {
    id: 8, eyebrow: 'Valuation · 08 of 09',
    title: 'Sector Valuation — Premium or Discount?',
    targetId: 'valuation', dialogPos: 'above' as const,
    body: 'Sector P/E vs its 5-year average + vs Nifty 50 P/E. Tells you whether the WHOLE sector is expensive or cheap relative to history.',
    bullets: [
      'Sector P/E > 5y avg  →  paying up for growth, watch for derating',
      'Sector P/E < 5y avg  →  cheap, mean-reversion candidate',
      'Sector P/E ≫ Nifty P/E  →  premium sector (IT, FMCG)',
      'Sector P/E ≪ Nifty P/E  →  discount sector (PSU, metals, real estate)',
    ],
  },
  {
    id: 9, eyebrow: 'Verdict · 09 of 09',
    title: 'Putting It Together — Sector Verdict',
    targetId: 'verdict', dialogPos: 'above' as const,
    body: 'Combine industry snapshot + peer rank + sensitivities + correlations + breadth + flows + valuation. The "sector verdict" tells you whether the stock has a tailwind, headwind, or neutral environment.',
    bullets: [
      'Tailwind: bullish industry, strong breadth, FII inflows, valuation reasonable',
      'Headwind: bearish industry, narrow breadth, FII outflows, valuation rich',
      'Mixed: conflicting signals — trade only the strongest stock-specific setups',
      'Even a perfect company struggles in a headwind sector',
    ],
    pairsWith: 'A "Tailwind" sector verdict + "Strong" fundamentals + "Bull confluence" technicals = the rare alignment you actually want to size up.',
  },
]

export function SectorTutorial({ open, onClose }: Props) {
  return <TutorialShell open={open} onClose={onClose} steps={STEPS} accent="#D4A04D"/>
}
