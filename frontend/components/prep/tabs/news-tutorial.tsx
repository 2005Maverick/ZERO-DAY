'use client'

import { TutorialShell } from './fundamentals-tutorial'

interface Props { open: boolean; onClose: () => void }

const STEPS = [
  {
    id: 1, eyebrow: 'Foundation · 01 of 09',
    title: 'Why News Matters in Trading',
    targetId: null, dialogPos: 'center' as const,
    body: 'News doesn\'t move stocks — UNEXPECTED news does. The market constantly tries to predict the future and "prices in" what it expects. A stock only moves when reality differs from that expectation.',
    bullets: [
      'Earnings beat by 5%  →  small move  (already expected)',
      'Earnings beat by 30% →  big move (genuine surprise)',
      'Bad news that everyone knew  →  often "sell the news" recovery',
      'Bad news from a clear sky  →  the most violent moves',
    ],
    pairsWith: 'Read news in pairs: "what happened" + "what was expected." The gap is the trade.',
  },
  {
    id: 2, eyebrow: 'Sentiment · 02 of 09',
    title: 'Sentiment Score — The Quick Read',
    targetId: 'sentiment', dialogPos: 'left' as const,
    body: 'Each headline gets tagged bullish, bearish, or neutral. The mix tells you the prevailing tone of coverage in the last 24 hours.',
    bullets: [
      '67%+ bearish  →  story is moving against the stock',
      '67%+ bullish  →  positive narrative dominating',
      'Mixed (40-60% each side)  →  market hasn\'t made up its mind',
      'Sudden shift in sentiment  →  often precedes a price move',
    ],
    pairsWith: 'When sentiment swings hard one way, look at OBV: if money flow agrees, the move usually persists.',
  },
  {
    id: 3, eyebrow: 'Headlines · 03 of 09',
    title: 'Reading Individual Headlines',
    targetId: 'headlines', dialogPos: 'right' as const,
    body: 'Each headline is a "fact + tone" combination. The fact is what happened; the tone is how the outlet framed it. Read the fact first.',
    bullets: [
      'Source matters: Reuters, Bloomberg = factual; tabloids = tone-amplified',
      'Date freshness  →  newer = more priced-in already',
      'Repetition across outlets  →  story is "real" not opinion',
      'Always ask: was this expected? was it bigger than expected?',
    ],
    pairsWith: 'A bearish headline + price NOT falling = bullish (resilience). Bullish headline + price NOT rising = bearish (exhaustion).',
    example: 'INDIGO has 3 negative headlines in 24h — pandemic demand collapse + dual fuel/COVID shock + "darkest hour" framing. The stock is reflecting all of it.',
  },
  {
    id: 4, eyebrow: 'Volume · 04 of 09',
    title: 'Coverage Volume — How Loud Is It?',
    targetId: 'volume', dialogPos: 'right' as const,
    body: 'A spike in news coverage volume itself is a signal. When 3+ outlets converge on the same story in a short window, institutional desks are usually already moving.',
    bullets: [
      'Coverage spike → look at volume on the price chart that same day',
      'Many outlets, same angle  →  consensus building',
      'Many outlets, conflicting angles  →  noise, ignore',
      'Quiet stock suddenly making headlines  →  catalyst worth investigating',
    ],
  },
  {
    id: 5, eyebrow: 'Analysts · 05 of 09',
    title: 'Analyst Ratings — The "Smart Money" Read',
    targetId: 'analysts', dialogPos: 'left' as const,
    body: 'Sell-side analysts publish ratings (BUY / HOLD / SELL) plus price targets. The CONSENSUS — average of all analysts — moves the stock more than any single rating.',
    bullets: [
      '70%+ BUY  →  very bullish street consensus',
      '50%+ HOLD  →  market expects mediocrity',
      'Recent rating downgrade  →  often prelude to forecast cuts',
      'Target price > current  →  upside expected (but read the rationale)',
    ],
    pairsWith: 'Watch for ESTIMATE REVISIONS more than ratings. A downgrade with cut estimates is much worse than a rating-only downgrade.',
  },
  {
    id: 6, eyebrow: 'Insider · 06 of 09',
    title: 'Insider Activity — What Owners Know',
    targetId: 'insider', dialogPos: 'left' as const,
    body: 'Promoters, directors and senior management have to report when they buy or sell shares. Their net activity is a tell — they know the business.',
    bullets: [
      'Insiders BUYING  →  strong bullish signal (only one reason to buy: belief)',
      'Insiders SELLING  →  many reasons (estate, options, tax) — weaker signal',
      'CEO buying his own stock  →  one of the most reliable bullish signals',
      'Cluster of multiple insider sells in 30 days  →  warning',
    ],
    pairsWith: 'Insider buying + analyst upgrades = strongest "smart money agreement" signal.',
  },
  {
    id: 7, eyebrow: 'Bulk · 07 of 09',
    title: 'Bulk & Block Deals — Big Money Moves',
    targetId: 'bulk', dialogPos: 'right' as const,
    body: 'Trades over a certain size threshold (>0.5% of equity for "bulk", much larger for "block") are reported same-day. They reveal where institutions and FIIs are positioning.',
    bullets: [
      'Multiple FIIs buying in bulk  →  foreign money rotating IN',
      'DIIs (LIC, mutual funds) buying  →  domestic institutional confidence',
      'Single-counterparty block deal  →  pre-arranged, often promoter exit',
      'Off-market deals  →  least informative (purely structural)',
    ],
  },
  {
    id: 8, eyebrow: 'Sector · 08 of 09',
    title: 'Sector News — The Contagion Effect',
    targetId: 'sector', dialogPos: 'right' as const,
    body: 'When the WHOLE sector is making news, the individual stock often moves regardless of its own fundamentals. Sector contagion can override stock-specific signals for days.',
    bullets: [
      'Sector-wide bad news  →  even strong stocks sell off (correlation = 1)',
      'Sector-wide good news  →  even weak stocks rally (relief)',
      'After contagion fades, dispersion returns and quality reasserts',
      'Use sector contagion to BUY quality at sector-discounted prices',
    ],
    pairsWith: 'Cross-check the Sector tab\'s peer comparison: if the whole sector is down 15% and your stock is down 15%, it\'s a sector trade not a stock trade.',
  },
  {
    id: 9, eyebrow: 'Verdict · 09 of 09',
    title: 'Putting It Together — News Reading Verdict',
    targetId: 'verdict', dialogPos: 'above' as const,
    body: 'For every news event, ask FOUR questions: (1) Is this priced in? (2) Is it stock-specific or sector-wide? (3) Are insiders/institutions already moving? (4) What\'s the second-order effect?',
    bullets: [
      'Priced in + stock-specific + no insider activity  →  ignore, it\'s noise',
      'NOT priced in + sector-wide + institutions moving  →  high-conviction trade',
      'Priced in + insiders BUYING the dip  →  contrarian buy signal',
      'Sentiment opposite to price action  →  reversal often imminent',
    ],
    pairsWith: 'Always read News with one eye on the Chart and one on the Sector tab. News in isolation = lagging indicator. News + chart + sector = leading.',
  },
]

export function NewsTutorial({ open, onClose }: Props) {
  return <TutorialShell open={open} onClose={onClose} steps={STEPS} accent="#A855F7"/>
}
