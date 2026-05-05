import type { Scenario } from '@/types/scenario'
import { COV20_STOCKS } from './stocks'
import { COV20_MACRO }  from './macro'

export const COV20_SCENARIO: Scenario = {
  id: 'COV-20',
  title: 'Covid Day Zero',
  date: '09 March 2020',
  preMarketTime: '09:00 IST',
  startingWalletInr: 100000,
  stocks: COV20_STOCKS,
  macro: COV20_MACRO,
}

export { COV20_STOCKS, COV20_MACRO }
