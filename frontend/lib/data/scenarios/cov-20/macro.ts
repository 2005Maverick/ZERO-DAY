import type { ScenarioMacro } from '@/types/scenario'

// ============================================================================
// COV-20 MACRO INTEL — world news, sector heatmap, indicators
// ============================================================================
// All values reflect Mar 6, 2020 close → pre-market state on Mar 9, 2020.
// ============================================================================

export const COV20_MACRO: ScenarioMacro = {
  worldNews: [
    {
      flag: '🇮🇹',
      headline: 'Italy locks down 16 million in north as cases surge past 7,000.',
      hoursAgo: 6,
      severity: 'critical',
    },
    {
      flag: '⛽',
      headline: 'Brent crude crashes 31% on Saudi-Russia OPEC+ collapse — biggest drop since 1991.',
      hoursAgo: 9,
      severity: 'critical',
    },
    {
      flag: '🦠',
      headline: 'WHO 48 hours from declaring COVID-19 a global pandemic, sources say.',
      hoursAgo: 12,
      severity: 'high',
    },
    {
      flag: '🇺🇸',
      headline: 'Dow Jones futures down 1,250 points pre-market — limit-down territory.',
      hoursAgo: 2,
      severity: 'critical',
    },
  ],

  sectorHeatmap: [
    { sector: 'airlines', emoji: '✈️', label: 'Airlines',  pctChange: -3.2 },
    { sector: 'pharma',   emoji: '💊', label: 'Pharma',    pctChange:  1.1 },
    { sector: 'banking',  emoji: '🏦', label: 'Banking',   pctChange: -0.8 },
    { sector: 'energy',   emoji: '⛽', label: 'Energy',    pctChange: -4.5 },
    { sector: 'luxury',   emoji: '💎', label: 'Luxury',    pctChange: -0.4 },
    { sector: 'it',       emoji: '💻', label: 'IT',        pctChange: -0.6 },
  ],

  indicators: [
    { label: 'BRENT',   value: '$34.36',   pctChange: -31.2 },
    { label: 'USD/INR', value: '₹74.12',   pctChange:   0.8 },
    { label: 'GOLD',    value: '$1,672',   pctChange:   1.2 },
    { label: 'VIX',     value: '41.94',    pctChange:  35.0 },
  ],
}
