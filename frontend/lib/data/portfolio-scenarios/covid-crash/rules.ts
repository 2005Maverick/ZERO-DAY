import type { CausalRule } from '@/types/portfolio'

export const COVID_RULES: CausalRule[] = [
  {
    id: 'oil-airline-inverse',
    name: 'Oil-Airline Inverse',
    shortRule: 'When crude oil shocks markets, airlines suffer — fuel is 40% of their cost.',
    example: 'March 9, 2020: Oil crashed 25%. IndiGo fell 10% that week.',
    triggerCondition: 'sold_indigo_before_oil_event',
  },
  {
    id: 'pharma-safe-haven',
    name: 'Pharma Safe Haven',
    shortRule: 'In health crises, pharma stocks surge. Medicine demand never falls.',
    example: 'Sun Pharma rose +5.4% on March 9, 2020 while Nifty fell 5.2%.',
    triggerCondition: 'bought_sunpharma_before_who_event',
  },
  {
    id: 'rate-bank-positive',
    name: 'Rate-Bank Positive',
    shortRule: 'When RBI injects liquidity, banks benefit first — lower cost of funds, better margins.',
    example: 'HDFC Bank rose 4% after RBI emergency liquidity announcement.',
    triggerCondition: 'bought_hdfcbank_before_rbi_event',
  },
  {
    id: 'diversification',
    name: 'Diversification',
    shortRule: 'Spreading capital across sectors reduces your risk when one sector collapses.',
    example: 'A portfolio with pharma + banking offset the airline and energy losses.',
    triggerCondition: 'diversified_across_4_or_more_sectors',
  },
  {
    id: 'flash-crash-recovery',
    name: 'Flash Crash Recovery',
    shortRule: 'Algorithmic flash crashes almost always recover. Panic selling locks in a false loss.',
    example: 'The 1:45 PM crash on March 9 recovered 97% within 90 seconds.',
    triggerCondition: 'held_through_flash_crash',
  },
  {
    id: 'volume-precedes-price',
    name: 'Volume Precedes Price',
    shortRule: 'Unusual volume before a price move = institutional positioning. Watch it.',
    example: 'Sun Pharma saw 3x normal volume before WHO announcement as institutions bought.',
    triggerCondition: 'noticed_volume_spike_on_sunpharma',
  },
]
