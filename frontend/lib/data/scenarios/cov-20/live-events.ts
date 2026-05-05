// ============================================================================
// COV-20 — scheduled events for the live session
// ============================================================================
// Time-stamped news drops, circuit breakers, ORUS coaching whispers.
// Each event\'s `fireAt` is the simulated minute since 9:15 IST (0..375).
// Helpers below convert IST clock-time to minute offsets.
// ============================================================================

import type { NewsEvent, CircuitBreakerEvent, OrusWhisper } from '@/types/live'

/** Convert a clock time like "10:32" to minutes since 9:15 IST. */
export function ist(hh: number, mm: number): number {
  return Math.max(0, (hh - 9) * 60 + (mm - 15))
}

// ─── News events (signal vs noise) ──────────────────────────

export const COV20_NEWS_EVENTS: NewsEvent[] = [
  // Pre-market echo (fires immediately at minute 0)
  { id: 'n1',  fireAt: ist(9, 17),  flag: '🌍', headline: 'Asian markets open sharply lower; Nikkei down 5.1%, Hang Seng down 4.0%',           severity: 'high',     classification: 'signal', source: 'Reuters · 09:17',     impacts: [] },
  { id: 'n2',  fireAt: ist(9, 25),  flag: '📊', headline: 'NIFTY opens at 10,524 — gap-down 4.2%, broadest sell-off in 11 years',                severity: 'critical', classification: 'signal', source: 'NSE · 09:25',         impacts: [] },

  // Early signal: Italy lockdown
  { id: 'n3',  fireAt: ist(9, 32),  flag: '🇮🇹', headline: 'Italy extends lockdown to entire country — 60M residents under restriction',            severity: 'critical', classification: 'signal', source: 'BBC · 09:32',
    impacts: [{ symbol: 'INDIGO', pctImpact: -0.018 }, { symbol: 'TITAN', pctImpact: -0.010 }, { symbol: 'SUNPHARMA', pctImpact: +0.012 }] },

  // Noise — analyst opinion
  { id: 'n4',  fireAt: ist(9, 48),  flag: '💼', headline: 'Morgan Stanley: \"Indian aviation faces extended demand impact\" — recap',              severity: 'low',      classification: 'noise',  source: 'Bloomberg · 09:48',   impacts: [] },

  // Noise — recycled headline
  { id: 'n5',  fireAt: ist(10, 14), flag: '✈',  headline: 'IndiGo management memo: route review \"under consideration\" (yesterday\'s news)',     severity: 'low',      classification: 'noise',  source: 'CNBC TV-18 · 10:14',  impacts: [] },

  // Big signal — circuit breaker about to trigger
  { id: 'n6',  fireAt: ist(10, 30), flag: '⚠',  headline: 'Sensex breaches 1,800-point threshold — lower-circuit halt expected within minutes',  severity: 'critical', classification: 'signal', source: 'CNBC · 10:30',         impacts: [] },

  { id: 'n7',  fireAt: ist(10, 32), flag: '🛑', headline: 'TRADING HALTED — NIFTY breaches 5% lower circuit · 15-minute pause begins',           severity: 'critical', classification: 'signal', source: 'NSE · 10:32',         impacts: [] },

  { id: 'n8',  fireAt: ist(10, 38), flag: '⛽', headline: 'BRENT BREAKS BELOW $32 — Saudi-Russia OPEC+ collapse drives 31% intraday crash',        severity: 'critical', classification: 'signal', source: 'Reuters · 10:38',
    impacts: [{ symbol: 'RELIANCE', pctImpact: -0.035 }, { symbol: 'INDIGO', pctImpact: +0.022 }, { symbol: 'HDFCBANK', pctImpact: -0.012 }] },

  // Noise — SEBI memo
  { id: 'n9',  fireAt: ist(10, 47), flag: '📜', headline: 'SEBI: routine memo on enhanced disclosure for FII transactions',                       severity: 'low',      classification: 'noise',  source: 'SEBI · 10:47',         impacts: [] },

  // Resumption + signal
  { id: 'n10', fireAt: ist(10, 47), flag: '🔔', headline: 'Trading resumes — NIFTY now -6.1%, all sectoral indices in red',                       severity: 'high',     classification: 'signal', source: 'NSE · 10:47',         impacts: [] },

  // Pharma signal
  { id: 'n11', fireAt: ist(11, 12), flag: '💊', headline: 'Sun Pharma announces hydroxychloroquine donation programme — sector rotation accelerates', severity: 'medium', classification: 'signal', source: 'BSE Filing · 11:12',
    impacts: [{ symbol: 'SUNPHARMA', pctImpact: +0.018 }] },

  // Capitulation low — WHO signal
  { id: 'n12', fireAt: ist(11, 28), flag: '🦠', headline: 'WHO: pandemic declaration imminent — \"days, not weeks\"',                              severity: 'critical', classification: 'signal', source: 'WHO · 11:28',
    impacts: [{ symbol: 'INDIGO', pctImpact: -0.015 }, { symbol: 'TITAN', pctImpact: -0.012 }, { symbol: 'SUNPHARMA', pctImpact: +0.008 }] },

  // Noise — analyst opinion
  { id: 'n13', fireAt: ist(11, 50), flag: '💼', headline: 'Jefferies: \"Pharma now over-extended; rotation may pause\" — analyst caution',         severity: 'low',      classification: 'noise',  source: 'Bloomberg · 11:50',    impacts: [] },

  // Bounce begins
  { id: 'n14', fireAt: ist(12, 5),  flag: '🇺🇸', headline: 'Dow futures pare losses, off lows — circuit-breaker risk easing',                     severity: 'medium',   classification: 'signal', source: 'CNBC · 12:05',         impacts: [] },

  // Noise — rumour
  { id: 'n15', fireAt: ist(12, 28), flag: '💬', headline: 'Twitter rumour: \"RBI emergency cut likely\" — official source: \"no comment\"',         severity: 'low',      classification: 'noise',  source: 'Social · 12:28',        impacts: [] },

  // Banking signal
  { id: 'n16', fireAt: ist(13, 15), flag: '🏦', headline: 'YES Bank moratorium reports trigger renewed banking-sector selling',                    severity: 'high',     classification: 'signal', source: 'Mint · 13:15',
    impacts: [{ symbol: 'HDFCBANK', pctImpact: -0.014 }] },

  // IT signal
  { id: 'n17', fireAt: ist(13, 50), flag: '💻', headline: 'TCS issues investor letter: \"business continuity assured, USD/INR tailwind material\"',  severity: 'medium',   classification: 'signal', source: 'BSE Filing · 13:50',
    impacts: [{ symbol: 'TCS', pctImpact: +0.010 }] },

  // Noise — analyst piece
  { id: 'n18', fireAt: ist(14, 18), flag: '📰', headline: 'ET Markets opinion piece: \"Why this is NOT 2008\" — speculative analysis',             severity: 'low',      classification: 'noise',  source: 'Economic Times · 14:18', impacts: [] },

  // Late signal
  { id: 'n19', fireAt: ist(14, 42), flag: '⛽', headline: 'BRENT closes US session at $31.13 — second-worst single day in modern oil markets',     severity: 'high',     classification: 'signal', source: 'Reuters · 14:42',
    impacts: [{ symbol: 'RELIANCE', pctImpact: -0.012 }, { symbol: 'INDIGO', pctImpact: +0.010 }] },

  // EOD wrap-up signal
  { id: 'n20', fireAt: ist(15, 15), flag: '🔔', headline: 'Closing bell approaches — NIFTY heading for worst single-day percentage drop in 12 years', severity: 'high',     classification: 'signal', source: 'NSE · 15:15',         impacts: [] },
]

// ─── Circuit breakers ───────────────────────────────────────

export const COV20_CIRCUITS: CircuitBreakerEvent[] = [
  { fireAt: ist(10, 32), level: 5, haltMinutes: 15 },
]

// ─── ORUS reactive whispers ─────────────────────────────────

export const COV20_WHISPERS: OrusWhisper[] = [
  { fireAt: ist(9, 16),  text: 'Bell\'s rung. First 15 minutes is institutional auction noise — watch, don\'t trade.',                            severity: 'low' },
  { fireAt: ist(9, 33),  text: 'Italy lockdown was your INDIGO sensitivity warning materializing. Pharma is the textbook hedge — note the rotation.', severity: 'medium' },
  { fireAt: ist(10, 15), text: 'That \"under review\" headline is yesterday\'s news being recycled. Noise. Ignore it.',                            severity: 'low' },
  { fireAt: ist(10, 33), text: 'Circuit breaker. This is what panic looks like. When you come back, every screen will be redder than now.',         severity: 'high' },
  { fireAt: ist(10, 50), text: 'Resumption gap-down. Most retail averages down here and gets carried out. Hold cash if you have no edge.',          severity: 'high' },
  { fireAt: ist(11, 30), text: 'WHO pandemic declaration imminent — capitulation low likely forming. Look for divergences before buying.',          severity: 'high' },
  { fireAt: ist(12, 10), text: 'Counter-intuitive: airlines benefit from cheap oil. Note this — fundamentals tab told you the oil sensitivity.',    severity: 'medium' },
  { fireAt: ist(13, 18), text: 'Banking selling on YES Bank fears — sector contagion. HDFCBANK is the cleanest balance sheet but moves with the pack.', severity: 'medium' },
  { fireAt: ist(14, 0),  text: 'Mid-afternoon drift. Volume is half of opening — most institutions done positioning. Lower-conviction time.',        severity: 'low' },
  { fireAt: ist(14, 47), text: 'Last hour is dangerous — institutions square positions. You can hold or close — both are valid here.',              severity: 'medium' },
  { fireAt: ist(15, 20), text: '10 minutes to bell. Square anything you don\'t want to hold over the weekend.',                                     severity: 'medium' },
]
